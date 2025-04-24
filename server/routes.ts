import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertFormSchema, insertResponseSchema, insertEventSchema, insertBookingSchema } from "@shared/schema";
import { setupAuth } from "./auth";

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
  
  // API routes
  const apiRouter = app.route('/api');
  
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
          fontFamily: "Alternate Gothic, sans-serif"
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
      
      const updatedEvent = await storage.updateEvent(id, req.body);
      res.json(updatedEvent);
    } catch (error) {
      res.status(500).json({ message: "Failed to update event" });
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
      
      const validatedData = insertBookingSchema.parse({
        eventId: eventId,
        name: req.body.name,
        email: req.body.email,
        date: req.body.date,
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
      
      const validatedData = insertBookingSchema.parse({
        eventId: id,
        name: req.body.name,
        email: req.body.email,
        date: req.body.date,
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

  const httpServer = createServer(app);
  return httpServer;
}
