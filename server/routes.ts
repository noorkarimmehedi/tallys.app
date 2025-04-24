import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertFormSchema, insertResponseSchema } from "@shared/schema";
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

  app.get("/api/forms/:id", async (req, res) => {
    // Special case for 'new' form ID
    if (req.params.id === 'new') {
      // Return a template for a new form
      return res.json({
        id: 0,
        userId: 1,
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
    
    res.json(form);
  });

  app.post("/api/forms", async (req, res) => {
    try {
      // In a real app, we'd get the user ID from the session
      const userId = 1; // Demo user
      
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

  app.patch("/api/forms/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid form ID" });
    }
    
    try {
      const form = await storage.getForm(id);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      const updatedForm = await storage.updateForm(id, req.body);
      res.json(updatedForm);
    } catch (error) {
      res.status(500).json({ message: "Failed to update form" });
    }
  });

  app.delete("/api/forms/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid form ID" });
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
  app.get("/api/forms/:id/responses", async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
