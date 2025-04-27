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

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
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
    return next(); // No token, proceed to next middleware
  }

  // Extract the token
  const idToken = authHeader.split('Bearer ')[1];
  if (!idToken) {
    return next();
  }

  try {
    // Verify the token
    const decodedToken = await verifyFirebaseToken(idToken);
    if (!decodedToken) {
      return next();
    }

    // Create or update user in our database
    const user = await storage.createOrUpdateFirebaseUser({
      firebaseId: decodedToken.uid,
      email: decodedToken.email || '',
      displayName: decodedToken.name,
      photoURL: decodedToken.picture
    });

    // Log the user in
    req.login(user, (err) => {
      if (err) {
        console.error('Error logging in Firebase user:', err);
      }
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
      // Check if Firebase Admin is initialized
      if (!firebaseInitialized) {
        return res.status(503).json({ 
          message: "Firebase authentication is not available at this time"
        });
      }
      
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ message: "ID token is required" });
      }
      
      // Verify the token
      const decodedToken = await verifyFirebaseToken(idToken);
      if (!decodedToken) {
        return res.status(401).json({ message: "Invalid or expired Firebase token" });
      }
      
      // Create or update user in our database
      const user = await storage.createOrUpdateFirebaseUser({
        firebaseId: decodedToken.uid,
        email: decodedToken.email || '',
        displayName: decodedToken.name,
        photoURL: decodedToken.picture
      });
      
      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
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
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    res.json(req.user);
  });
}