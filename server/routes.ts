import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertFormSchema, insertResponseSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = app.route('/api');
  
  // Forms
  app.get("/api/forms", async (req, res) => {
    // In a real app, we'd get the user ID from the session
    const userId = 1; // Demo user
    const forms = await storage.getForms(userId);
    res.json(forms);
  });

  app.get("/api/forms/:id", async (req, res) => {
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
      
      const validatedData = insertFormSchema.parse({
        ...req.body,
        userId
      });
      
      const form = await storage.createForm(validatedData);
      res.status(201).json(form);
    } catch (error) {
      if (error instanceof z.ZodError) {
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
