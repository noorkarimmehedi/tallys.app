import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertFormSchema, insertResponseSchema, insertEventSchema, insertBookingSchema } from "@shared/schema";
import { setupAuth } from "./auth";
import fileUpload from "express-fileupload";
import path from "path";
import fs from "fs";
import { 
  createTrialSubscription, 
  createPaymentSubscription, 
  cancelSubscription, 
  reactivateSubscription,
  handleStripeWebhook
} from "./stripe-service";
import Stripe from "stripe";

// Middleware to check if a user is authenticated
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // Setup file upload middleware
  app.use(fileUpload({
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max file size
    createParentPath: true, // Create the uploads directory if it doesn't exist
    abortOnLimit: true,
    responseOnLimit: "File size limit has been reached (2MB)",
    useTempFiles: true,
    tempFileDir: '/tmp/'
  }));
  
  // Make sure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Serve static files from public/uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));
  
  // API routes
  const apiRouter = app.route('/api');
  
  // File upload endpoint
  app.post('/api/upload', isAuthenticated, async (req, res) => {
    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ message: 'No files were uploaded' });
      }
      
      const file = req.files.file as fileUpload.UploadedFile;
      
      // Check file type (allow only images)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ 
          message: 'Invalid file type. Only JPG, PNG, GIF, and SVG files are allowed'
        });
      }
      
      // Generate a unique filename
      const timestamp = Date.now();
      const fileExtension = path.extname(file.name);
      const fileName = `logo_${timestamp}${fileExtension}`;
      const uploadPath = path.join(uploadsDir, fileName);
      
      // Move the file to the uploads directory
      await file.mv(uploadPath);
      
      // Return the file URL
      const fileUrl = `/uploads/${fileName}`;
      res.json({
        message: 'File uploaded successfully',
        fileUrl
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({
        message: 'Failed to upload file'
      });
    }
  });
  
  // Forms - authenticated routes
  app.get("/api/forms", isAuthenticated, async (req, res) => {
    const userId = req.user!.id; 
    const forms = await storage.getForms(userId);
    res.json(forms);
  });

  app.get("/api/forms/:id", isAuthenticated, async (req, res) => {
    // Special case for 'new' form ID
    if (req.params.id === 'new') {
      const userId = req.user!.id;
      // Return a template for a new form
      return res.json({
        id: 0,
        userId: userId,
        title: "New Form",
        shortId: "",
        description: "",
        questions: [
          {
            id: "q1",
            type: "shortText",
            title: "What's your name?",
            required: true,
            options: []
          }
        ],
        theme: {
          backgroundColor: "#ffffff",
          textColor: "#000000",
          primaryColor: "#0070f3",
          fontFamily: "Alternate Gothic, sans-serif",
          logoUrl: null
        },
        published: false,
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid form ID" });
    }
    
    const form = await storage.getForm(id);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }
    
    // Check if the form belongs to the authenticated user
    if (form.userId !== req.user!.id) {
      return res.status(403).json({ message: "You do not have permission to access this form" });
    }
    
    res.json(form);
  });

  app.post("/api/forms", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      console.log("POST /api/forms - Request body:", JSON.stringify(req.body, null, 2));
      
      // Add default shortId if missing
      const formData = {
        ...req.body,
        userId,
        shortId: req.body.shortId || `form-${Date.now().toString(36)}`
      };
      
      const validatedData = insertFormSchema.parse(formData);
      
      const form = await storage.createForm(validatedData);
      console.log("Form created successfully:", form.id);
      res.status(201).json(form);
    } catch (error) {
      console.error("Error creating form:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ message: "Invalid form data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create form" });
    }
  });

  app.patch("/api/forms/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid form ID" });
    }
    
    try {
      const form = await storage.getForm(id);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      // Check if the form belongs to the authenticated user
      if (form.userId !== req.user!.id) {
        return res.status(403).json({ message: "You do not have permission to modify this form" });
      }
      
      const updatedForm = await storage.updateForm(id, req.body);
      res.json(updatedForm);
    } catch (error) {
      res.status(500).json({ message: "Failed to update form" });
    }
  });

  app.delete("/api/forms/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid form ID" });
    }
    
    // Check if the form exists and belongs to the user
    const form = await storage.getForm(id);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }
    
    if (form.userId !== req.user!.id) {
      return res.status(403).json({ message: "You do not have permission to delete this form" });
    }
    
    const success = await storage.deleteForm(id);
    if (!success) {
      return res.status(404).json({ message: "Form not found" });
    }
    
    res.status(204).end();
  });

  // Form published URL
  app.get("/api/f/:shortId", async (req, res) => {
    const { shortId } = req.params;
    
    const form = await storage.getFormByShortId(shortId);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }
    
    if (!form.published) {
      return res.status(403).json({ message: "Form is not published" });
    }
    
    await storage.incrementFormViews(form.id);
    res.json(form);
  });

  // Form responses
  app.get("/api/forms/:id/responses", isAuthenticated, async (req, res) => {
    // Special case for 'new' form ID
    if (req.params.id === 'new') {
      return res.json([]);
    }
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid form ID" });
    }
    
    const form = await storage.getForm(id);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }
    
    // Check if the form belongs to the authenticated user
    if (form.userId !== req.user!.id) {
      return res.status(403).json({ message: "You do not have permission to access this form's responses" });
    }
    
    const responses = await storage.getFormResponses(id);
    res.json(responses);
  });

  app.post("/api/forms/:id/responses", async (req, res) => {
    // Special case for 'new' form ID - just return a mock success response
    if (req.params.id === 'new') {
      return res.status(201).json({
        id: 0,
        formId: 0,
        answers: req.body.answers,
        createdAt: new Date().toISOString()
      });
    }
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid form ID" });
    }
    
    try {
      const form = await storage.getForm(id);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      if (!form.published) {
        return res.status(403).json({ message: "Form is not published" });
      }
      
      const validatedData = insertResponseSchema.parse({
        formId: id,
        answers: req.body.answers
      });
      
      const response = await storage.createResponse(validatedData);
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid response data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit response" });
    }
  });

  // Events API Routes
  app.get("/api/events", isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    const events = await storage.getEvents(userId);
    res.json(events);
  });

  // Get event by shortId (public route)
  app.get("/api/events/by-shortid/:shortId", async (req, res) => {
    const shortId = req.params.shortId;
    
    const event = await storage.getEventByShortId(shortId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    // Make sure the event is published
    if (!event.published) {
      return res.status(403).json({ message: "This event is not currently available" });
    }
    
    res.json(event);
  });
  
  app.get("/api/events/:id", isAuthenticated, async (req, res) => {
    // Special case for 'new' event ID
    if (req.params.id === 'new') {
      const userId = req.user!.id;
      // Return a template for a new event
      return res.json({
        id: 0,
        userId: userId,
        title: "New Event",
        description: "",
        shortId: "",
        duration: 30,
        location: "",
        published: false,
        availableTimes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    
    const event = await storage.getEvent(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    // Check if the event belongs to the authenticated user
    if (event.userId !== req.user!.id) {
      return res.status(403).json({ message: "You do not have permission to access this event" });
    }
    
    res.json(event);
  });

  app.post("/api/events", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Add default shortId if missing
      const eventData = {
        ...req.body,
        userId,
        shortId: req.body.shortId || `event-${Date.now().toString(36)}`
      };
      
      const validatedData = insertEventSchema.parse(eventData);
      
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.patch("/api/events/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    
    try {
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if the event belongs to the authenticated user
      if (event.userId !== req.user!.id) {
        return res.status(403).json({ message: "You do not have permission to modify this event" });
      }
      
      console.log("Event update request body:", JSON.stringify(req.body, null, 2));
      console.log("Existing event theme:", JSON.stringify(event.theme, null, 2));
      
      // Make sure theme data is properly structured before updating
      const updateData = {
        ...req.body,
        theme: req.body.theme ? {
          backgroundColor: req.body.theme.backgroundColor || '#ffffff',
          textColor: req.body.theme.textColor || '#000000',
          primaryColor: req.body.theme.primaryColor || '#3b82f6',
          fontFamily: req.body.theme.fontFamily || 'Inter, sans-serif',
          logoUrl: req.body.theme.logoUrl || undefined
        } : event.theme
      };
      
      console.log("Processed update data:", JSON.stringify(updateData, null, 2));
      
      const updatedEvent = await storage.updateEvent(id, updateData);
      console.log("Updated event returned:", JSON.stringify(updatedEvent, null, 2));
      
      res.json(updatedEvent);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });
  
  // Special endpoint just for updating event logo
  app.patch("/api/events/:id/logo", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    
    try {
      // Get the current event
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if the event belongs to the authenticated user
      if (event.userId !== req.user!.id) {
        return res.status(403).json({ message: "You do not have permission to modify this event" });
      }
      
      // Extract the logo URL from the request
      const { logoUrl } = req.body;
      console.log("Received logo URL update request:", logoUrl);
      
      if (!logoUrl) {
        return res.status(400).json({ message: "Logo URL is required" });
      }
      
      // Create a new theme object preserving other theme values
      const updatedTheme = {
        backgroundColor: event.theme?.backgroundColor || '#ffffff',
        textColor: event.theme?.textColor || '#000000',
        primaryColor: event.theme?.primaryColor || '#3b82f6',
        fontFamily: event.theme?.fontFamily || 'Inter, sans-serif',
        logoUrl: logoUrl
      };
      
      console.log("Updating event theme with:", JSON.stringify(updatedTheme, null, 2));
      
      // Update just the theme part of the event
      const updatedEvent = await storage.updateEvent(id, { 
        theme: updatedTheme 
      });
      
      if (!updatedEvent) {
        return res.status(500).json({ message: "Failed to update event" });
      }
      
      console.log("Event logo updated successfully:", JSON.stringify(updatedEvent.theme, null, 2));
      res.json(updatedEvent);
    } catch (error) {
      console.error("Error updating event logo:", error);
      res.status(500).json({ message: "Failed to update event logo" });
    }
  });

  app.delete("/api/events/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    
    // Check if the event exists and belongs to the user
    const event = await storage.getEvent(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    if (event.userId !== req.user!.id) {
      return res.status(403).json({ message: "You do not have permission to delete this event" });
    }
    
    const success = await storage.deleteEvent(id);
    if (!success) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    res.status(204).end();
  });

  // Event published URL
  app.get("/api/e/:shortId", async (req, res) => {
    const { shortId } = req.params;
    
    const event = await storage.getEventByShortId(shortId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    if (!event.published) {
      return res.status(403).json({ message: "Event is not published" });
    }
    
    res.json(event);
  });

  // Bookings
  // Get bookings for a specific date
  app.get("/api/bookings/date/:date", isAuthenticated, async (req, res) => {
    try {
      const dateParam = req.params.date;
      // Parse the date from the URL param (format: YYYY-MM-DD)
      const date = new Date(dateParam);
      
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const userId = req.user!.id;
      
      // Get all user's events
      const userEvents = await storage.getEvents(userId);
      const eventIds = userEvents.map(event => event.id);
      
      if (eventIds.length === 0) {
        return res.json([]);
      }
      
      // Query bookings for these events on the specified date
      const bookings = await storage.getBookingsByDate(eventIds, date);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings by date:", error);
      res.status(500).json({ message: "Failed to get bookings" });
    }
  });
  
  app.get("/api/events/:id/bookings", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    
    const event = await storage.getEvent(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    // Check if the event belongs to the authenticated user
    if (event.userId !== req.user!.id) {
      return res.status(403).json({ message: "You do not have permission to access this event's bookings" });
    }
    
    const bookings = await storage.getEventBookings(id);
    res.json(bookings);
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const eventId = req.body.eventId;
      if (!eventId) {
        return res.status(400).json({ message: "Event ID is required" });
      }
      
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      if (!event.published) {
        return res.status(403).json({ message: "Event is not published" });
      }
      
      // Handle the date properly to avoid timezone issues
      let dateValue;
      try {
        // Check if we're receiving a formatted date string (YYYY-MM-DD) or an ISO string
        if (req.body.date && typeof req.body.date === 'string') {
          // If it's already in YYYY-MM-DD format
          if (/^\d{4}-\d{2}-\d{2}$/.test(req.body.date)) {
            // Parse without timezone conversion by appending time
            const isoString = `${req.body.date}T${req.body.time || '00:00'}:00.000Z`;
            dateValue = new Date(isoString);
            
            // Debug log
            console.log(`Parsed date from YYYY-MM-DD: ${req.body.date} -> ${dateValue.toISOString()}`);
          } else {
            // It's probably an ISO string, handle normally
            dateValue = new Date(req.body.date);
            console.log(`Parsed date from ISO: ${req.body.date} -> ${dateValue.toISOString()}`);
          }
        } else if (req.body.date instanceof Date) {
          dateValue = req.body.date;
        } else {
          throw new Error('Invalid date format');
        }
        
        if (isNaN(dateValue.getTime())) {
          throw new Error('Invalid date format');
        }
      } catch (e) {
        console.error('Date parsing error:', e);
        return res.status(400).json({ 
          message: "Invalid date format", 
          error: "Please provide a valid date"
        });
      }
      
      // Log detailed date information for debugging
      const debugDateInfo = {
        originalDate: req.body.date,
        parsedDate: dateValue.toISOString(),
        parsedDateLocal: dateValue.toString(),
        utcComponents: {
          year: dateValue.getUTCFullYear(),
          month: dateValue.getUTCMonth() + 1, // months are 0-indexed
          day: dateValue.getUTCDate()
        },
        localComponents: {
          year: dateValue.getFullYear(),
          month: dateValue.getMonth() + 1, // months are 0-indexed
          day: dateValue.getDate()
        }
      };
      console.log('Booking date debug:', JSON.stringify(debugDateInfo, null, 2));
      
      // Use the original date string if it was a valid YYYY-MM-DD format
      // This prevents timezone issues where the day gets shifted
      const dateToStore = (typeof req.body.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.body.date))
        ? req.body.date 
        : dateValue;
      
      console.log(`Final date to store: ${typeof dateToStore === 'string' ? dateToStore : dateToStore.toISOString()}`);
      
      const validatedData = insertBookingSchema.parse({
        eventId: eventId,
        name: req.body.name,
        email: req.body.email,
        date: dateToStore, // Use the properly formatted date
        time: req.body.time,
        status: 'confirmed'
      });
      
      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });
  
  app.post("/api/events/:id/bookings", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    
    try {
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      if (!event.published) {
        return res.status(403).json({ message: "Event is not published" });
      }
      
      // Handle the date properly to avoid timezone issues
      let dateValue;
      try {
        // Check if we're receiving a formatted date string (YYYY-MM-DD) or an ISO string
        if (req.body.date && typeof req.body.date === 'string') {
          // If it's already in YYYY-MM-DD format
          if (/^\d{4}-\d{2}-\d{2}$/.test(req.body.date)) {
            // Use the date string directly to avoid timezone issues
            dateValue = req.body.date;
            console.log(`Using direct date string: ${dateValue}`);
          } else {
            // It's probably an ISO string, parse it
            dateValue = new Date(req.body.date);
            console.log(`Parsed date from ISO: ${req.body.date} -> ${dateValue.toISOString()}`);
          }
        } else if (req.body.date instanceof Date) {
          dateValue = req.body.date;
        } else {
          throw new Error('Invalid date format');
        }
        
        // If it's a Date object, validate it
        if (dateValue instanceof Date && isNaN(dateValue.getTime())) {
          throw new Error('Invalid date format');
        }
      } catch (e) {
        console.error('Date parsing error:', e);
        return res.status(400).json({ 
          message: "Invalid date format", 
          error: "Please provide a valid date"
        });
      }
      
      // Log the date we're using for booking
      console.log(`Creating booking for date: ${typeof dateValue === 'string' ? dateValue : (dateValue as Date).toISOString()}`);
      
      const validatedData = insertBookingSchema.parse({
        eventId: id,
        name: req.body.name,
        email: req.body.email,
        date: dateValue, // Use either the string date or Date object
        time: req.body.time,
        status: 'confirmed'
      });
      
      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.patch("/api/bookings/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }
    
    try {
      // Validate that the user owns the event that this booking belongs to
      const booking = await storage.updateBookingStatus(id, req.body.status);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });
  
  // Subscription routes
  app.post('/api/subscription/trial', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { email, username } = req.user!;
      
      if (!email) {
        return res.status(400).json({ message: 'User email is required' });
      }
      
      const result = await createTrialSubscription(userId, email, username);
      res.json(result);
    } catch (error: any) {
      console.error('Error creating trial subscription:', error);
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post('/api/subscription/payment', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      const result = await createPaymentSubscription(userId);
      res.json(result);
    } catch (error: any) {
      console.error('Error creating payment subscription:', error);
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post('/api/subscription/cancel', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      const result = await cancelSubscription(userId);
      res.json({ success: result });
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post('/api/subscription/reactivate', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      const result = await reactivateSubscription(userId);
      res.json({ success: result });
    } catch (error: any) {
      console.error('Error reactivating subscription:', error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Stripe webhook endpoint
  app.post('/api/webhook/stripe', express.raw({type: 'application/json'}), async (req, res) => {
    const signature = req.headers['stripe-signature'];
    
    if (!process.env.STRIPE_WEBHOOK_SECRET || !signature) {
      return res.status(400).json({ message: 'Missing Stripe webhook secret or signature' });
    }
    
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        apiVersion: '2023-08-16',
      });
      
      const event = stripe.webhooks.constructEvent(
        req.body.toString(),
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      
      await handleStripeWebhook(event);
      
      res.json({ received: true });
    } catch (error: any) {
      console.error('Error handling Stripe webhook:', error);
      res.status(400).json({ message: `Webhook Error: ${error.message}` });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
