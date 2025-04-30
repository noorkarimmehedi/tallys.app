import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as UserType } from "@shared/schema";
import { verifyFirebaseToken, firebaseInitialized } from "./firebase-admin";

declare global {
  namespace Express {
    // Define the User interface
    interface User extends UserType {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Firebase authentication middleware that handles Authorization header tokens
export async function verifyFirebaseAuthToken(req: Request, res: Response, next: NextFunction) {
  // Skip if Firebase is not initialized
  if (!firebaseInitialized) {
    return next();
  }
  
  // Check for Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No Authorization header found or not Bearer token');
    return next(); // No token, proceed to next middleware
  }

  // Extract the token
  const idToken = authHeader.split('Bearer ')[1];
  if (!idToken) {
    console.log('No ID token found in Authorization header');
    return next();
  }

  try {
    // Verify the token
    const decodedToken = await verifyFirebaseToken(idToken);
    if (!decodedToken) {
      console.log('Token verification failed');
      return next();
    }

    console.log('Firebase token verified for user:', decodedToken.email);

    // Create or update user in our database
    const user = await storage.createOrUpdateFirebaseUser({
      firebaseId: decodedToken.uid,
      email: decodedToken.email || '',
      displayName: decodedToken.name,
      photoURL: decodedToken.picture
    });

    console.log('User created or updated in database:', user.id);

    // Log the user in
    req.login(user, (err) => {
      if (err) {
        console.error('Error logging in Firebase user:', err);
      }
      console.log('User logged in successfully:', user.id);
      next();
    });
  } catch (error) {
    console.error('Error in Firebase auth middleware:', error);
    next();
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "tallys-forms-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Try to get user by either username or email
        const user = await storage.getUserByIdentifier(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(req.body.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  // Firebase token authentication endpoint
  app.post("/api/firebase-auth", async (req, res, next) => {
    try {
      console.log('Processing Firebase authentication request');
      
      // Check if Firebase Admin is initialized
      if (!firebaseInitialized) {
        console.log('Firebase Admin not initialized');
        return res.status(503).json({ 
          message: "Firebase authentication is not available at this time"
        });
      }
      
      const { idToken } = req.body;
      if (!idToken) {
        console.log('No idToken provided in request body');
        return res.status(400).json({ message: "ID token is required" });
      }
      
      console.log('Verifying Firebase token');
      // Verify the token
      const decodedToken = await verifyFirebaseToken(idToken);
      if (!decodedToken) {
        console.log('Token verification failed');
        return res.status(401).json({ message: "Invalid or expired Firebase token" });
      }
      
      console.log('Token verified for user:', decodedToken.email);
      
      // Create or update user in our database
      const user = await storage.createOrUpdateFirebaseUser({
        firebaseId: decodedToken.uid,
        email: decodedToken.email || '',
        displayName: decodedToken.name,
        photoURL: decodedToken.picture
      });
      
      console.log('User created or updated with ID:', user.id);
      
      // Log the user in with Passport.js
      req.login(user, (err) => {
        if (err) {
          console.error('Error in req.login:', err);
          return next(err);
        }
        console.log('User successfully logged in via req.login:', user.id);
        
        // Check session data
        console.log('Session after login:', req.session.id, 
          req.isAuthenticated() ? 'Authenticated' : 'Not authenticated');
        
        res.status(200).json(user);
      });
    } catch (error) {
      console.error('Error in Firebase authentication:', error);
      res.status(500).json({ message: "Authentication error" });
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Use Firebase middleware before checking authentication
  app.use(verifyFirebaseAuthToken);

  app.get("/api/user", (req, res) => {
    console.log('GET /api/user - Session ID:', req.session.id);
    console.log('GET /api/user - Authenticated:', req.isAuthenticated());
    console.log('GET /api/user - Session passport:', req.session.passport);
    
    if (!req.isAuthenticated()) {
      console.log('GET /api/user - Authentication check failed');
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    console.log('GET /api/user - User is authenticated, returning user data for ID:', req.user?.id);
    res.json(req.user);
  });
  
  // Update user password
  app.put("/api/user/password", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      const isPasswordValid = await comparePasswords(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update user's password
      await storage.updateUser(req.user!.id, { password: hashedPassword });
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });
  
  // Update user profile
  app.put("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const { name, email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if email already exists for a different user
      if (email !== user.email) {
        const existingUserWithEmail = await storage.getUserByEmail(email);
        if (existingUserWithEmail && existingUserWithEmail.id !== user.id) {
          return res.status(400).json({ message: "Email already in use by another account" });
        }
      }
      
      // Update user profile
      const updatedUser = await storage.updateUser(req.user!.id, {
        email,
        displayName: name || user.displayName,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
}