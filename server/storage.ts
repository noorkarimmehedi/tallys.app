import { 
  Form, InsertForm, 
  Response, InsertResponse,
  User, InsertUser,
  Event, InsertEvent,
  Booking, InsertBooking,
  users, forms, responses, events, bookings
} from "@shared/schema";
import { nanoid } from "nanoid";
import { db } from './db';
import { eq, and, gte, lte, inArray, sql } from 'drizzle-orm';
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from './db';

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByIdentifier(identifier: string): Promise<User | undefined>;
  getUserByFirebaseId(firebaseId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createOrUpdateFirebaseUser(firebaseData: { 
    firebaseId: string; 
    email: string; 
    displayName?: string; 
    photoURL?: string; 
  }): Promise<User>;
  
  // Form
  getForms(userId: number): Promise<Form[]>;
  getForm(id: number): Promise<Form | undefined>;
  getFormByShortId(shortId: string): Promise<Form | undefined>;
  createForm(form: InsertForm): Promise<Form>;
  updateForm(id: number, form: Partial<Form>): Promise<Form | undefined>;
  deleteForm(id: number): Promise<boolean>;
  incrementFormViews(id: number): Promise<boolean>;
  
  // Response
  getFormResponses(formId: number): Promise<Response[]>;
  createResponse(response: InsertResponse): Promise<Response>;
  
  // Event
  getEvents(userId: number): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  getEventByShortId(shortId: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Booking
  getEventBookings(eventId: number): Promise<Booking[]>;
  getBookingsByDate(eventIds: number[], date: Date): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  
  // Session store for authentication
  sessionStore: any; // Using any to avoid the type issue with session.SessionStore
}

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Using any type to avoid the session.SessionStore typing issue

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
    
    // Create sample data if the database is empty
    this.seedDatabase();
  }
  
  private async seedDatabase() {
    // Check if users table is empty
    const existingUsers = await db.select().from(users);
    if (existingUsers.length === 0) {
      console.log("Seeding database with initial data...");
      
      // Create demo user
      const [demoUser] = await db.insert(users).values({
        username: "demo",
        email: "demo@example.com",
        password: "password"
      }).returning();
      
      // Create a sample form
      await db.insert(forms).values({
        userId: demoUser.id,
        title: "Customer Information Form",
        shortId: "demo-form",
        published: true,
        views: 0,
        questions: [
          {
            id: "q1",
            type: "shortText",
            title: "First Name",
            required: true,
            sectionId: "personal"
          },
          {
            id: "q2",
            type: "shortText",
            title: "Last Name",
            required: true,
            sectionId: "personal"
          },
          {
            id: "q3",
            type: "email",
            title: "Email Address",
            required: true,
            sectionId: "contact"
          },
          {
            id: "q4",
            type: "shortText",
            title: "Phone Number",
            required: false,
            sectionId: "contact"
          },
          {
            id: "q5",
            type: "shortText",
            title: "Street Address",
            required: true,
            sectionId: "address"
          },
          {
            id: "q6",
            type: "shortText",
            title: "City",
            required: true,
            sectionId: "address"
          },
          {
            id: "q7",
            type: "shortText",
            title: "Zip/Postal Code",
            required: true,
            sectionId: "address"
          },
          {
            id: "q8",
            type: "paragraph",
            title: "Additional Comments",
            required: false
          }
        ],
        sections: [
          {
            id: "personal",
            title: "Personal Information",
            description: "Please provide your name",
            icon: "user"
          },
          {
            id: "contact",
            title: "Contact Information",
            description: "How can we reach you?",
            icon: "mail"
          },
          {
            id: "address",
            title: "Address Information",
            description: "Where do you live?",
            icon: "map"
          }
        ],
        theme: {
          backgroundColor: "#ffffff",
          textColor: "#000000",
          primaryColor: "#000000",
          fontFamily: "Alternate Gothic"
        }
      });
      
      console.log("Database seeded successfully");
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async getUserByIdentifier(identifier: string): Promise<User | undefined> {
    // Check if the identifier is an email (contains @)
    const isEmail = identifier.includes('@');
    
    if (isEmail) {
      return this.getUserByEmail(identifier);
    } else {
      return this.getUserByUsername(identifier);
    }
  }

  async getUserByFirebaseId(firebaseId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseId, firebaseId));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async createOrUpdateFirebaseUser(firebaseData: { 
    firebaseId: string; 
    email: string; 
    displayName?: string; 
    photoURL?: string; 
  }): Promise<User> {
    // Check if the user already exists by Firebase ID
    const existingUserByFirebaseId = await this.getUserByFirebaseId(firebaseData.firebaseId);
    if (existingUserByFirebaseId) {
      // Update existing user
      const [updatedUser] = await db
        .update(users)
        .set({
          displayName: firebaseData.displayName || existingUserByFirebaseId.displayName,
          photoURL: firebaseData.photoURL || existingUserByFirebaseId.photoURL,
          lastLogin: new Date()
        })
        .where(eq(users.id, existingUserByFirebaseId.id))
        .returning();
        
      return updatedUser;
    }
    
    // Check if user exists by email
    const existingUserByEmail = await this.getUserByEmail(firebaseData.email);
    if (existingUserByEmail) {
      // Link existing account with Firebase
      const [updatedUser] = await db
        .update(users)
        .set({
          firebaseId: firebaseData.firebaseId,
          displayName: firebaseData.displayName || existingUserByEmail.displayName,
          photoURL: firebaseData.photoURL || existingUserByEmail.photoURL,
          lastLogin: new Date()
        })
        .where(eq(users.id, existingUserByEmail.id))
        .returning();
        
      return updatedUser;
    }
    
    // Create a new user
    // Generate a username from email if needed
    const username = firebaseData.email.split('@')[0] + '-' + 
      Math.random().toString(36).substring(2, 7);
      
    const [newUser] = await db
      .insert(users)
      .values({
        username: username,
        email: firebaseData.email,
        firebaseId: firebaseData.firebaseId,
        displayName: firebaseData.displayName,
        photoURL: firebaseData.photoURL,
        lastLogin: new Date()
      })
      .returning();
      
    return newUser;
  }

  // Form methods
  async getForms(userId: number): Promise<Form[]> {
    return db.select().from(forms).where(eq(forms.userId, userId));
  }

  async getForm(id: number): Promise<Form | undefined> {
    const [form] = await db.select().from(forms).where(eq(forms.id, id));
    return form;
  }

  async getFormByShortId(shortId: string): Promise<Form | undefined> {
    const [form] = await db.select().from(forms).where(eq(forms.shortId, shortId));
    return form;
  }

  async createForm(insertForm: InsertForm): Promise<Form> {
    // Generate a shortId if one is not provided
    const formData = {
      ...insertForm,
      shortId: insertForm.shortId || `form-${nanoid(8)}`,
      published: insertForm.published || false
    };
    
    // Convert the form data to match the expected schema
    const [form] = await db.insert(forms).values({
      userId: formData.userId,
      title: formData.title,
      shortId: formData.shortId,
      description: formData.description || '',
      questions: formData.questions || [],
      sections: formData.sections || [],
      theme: formData.theme || {},
      published: formData.published || false,
      views: formData.views || 0
    }).returning();
    
    return form;
  }

  async updateForm(id: number, updates: Partial<Form>): Promise<Form | undefined> {
    const [updatedForm] = await db
      .update(forms)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(forms.id, id))
      .returning();
    
    return updatedForm;
  }

  async deleteForm(id: number): Promise<boolean> {
    const result = await db.delete(forms).where(eq(forms.id, id));
    return !!result;
  }

  async incrementFormViews(id: number): Promise<boolean> {
    const form = await this.getForm(id);
    if (!form) return false;
    
    const [updatedForm] = await db
      .update(forms)
      .set({ views: (form.views || 0) + 1 })
      .where(eq(forms.id, id))
      .returning();
    
    return !!updatedForm;
  }

  // Response methods
  async getFormResponses(formId: number): Promise<Response[]> {
    return db.select().from(responses).where(eq(responses.formId, formId));
  }

  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const [response] = await db.insert(responses).values(insertResponse).returning();
    return response;
  }
  
  // Event methods
  async getEvents(userId: number): Promise<Event[]> {
    return db.select().from(events).where(eq(events.userId, userId));
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async getEventByShortId(shortId: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.shortId, shortId));
    return event;
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    // Generate a shortId if one is not provided
    const eventData = {
      ...insertEvent,
      shortId: insertEvent.shortId || `event-${nanoid(8)}`,
      published: insertEvent.published || false
    };
    
    const [event] = await db.insert(events).values({
      userId: eventData.userId,
      title: eventData.title,
      description: eventData.description || '',
      shortId: eventData.shortId,
      duration: eventData.duration,
      location: eventData.location || '',
      published: eventData.published || false,
      availableTimes: eventData.availableTimes || []
    }).returning();
    
    return event;
  }

  async updateEvent(id: number, updates: Partial<Event>): Promise<Event | undefined> {
    try {
      console.log("Updating event with ID:", id);
      console.log("Event updates:", JSON.stringify(updates, null, 2));
      
      // First get the existing event to preserve important data
      const [existingEvent] = await db
        .select()
        .from(events)
        .where(eq(events.id, id));
      
      if (!existingEvent) {
        console.log("Event not found with ID:", id);
        return undefined;
      }
      
      // Make sure we preserve the theme structure properly
      const updatedTheme = updates.theme ? {
        backgroundColor: updates.theme.backgroundColor || existingEvent.theme?.backgroundColor || '#ffffff',
        textColor: updates.theme.textColor || existingEvent.theme?.textColor || '#000000',
        primaryColor: updates.theme.primaryColor || existingEvent.theme?.primaryColor || '#3b82f6',
        fontFamily: updates.theme.fontFamily || existingEvent.theme?.fontFamily || 'Inter, sans-serif',
        logoUrl: updates.theme.logoUrl !== undefined ? updates.theme.logoUrl : existingEvent.theme?.logoUrl
      } : existingEvent.theme;
      
      console.log("Updating event with theme:", JSON.stringify(updatedTheme, null, 2));
      
      // Create the update data with the properly merged theme
      const updateData = {
        ...updates,
        theme: updatedTheme,
        updatedAt: new Date()
      };
      
      const [updatedEvent] = await db
        .update(events)
        .set(updateData)
        .where(eq(events.id, id))
        .returning();
      
      console.log("Updated event:", JSON.stringify(updatedEvent, null, 2));
      return updatedEvent;
    } catch (error) {
      console.error("Error updating event:", error);
      return undefined;
    }
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return !!result;
  }
  
  // Booking methods
  async getEventBookings(eventId: number): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.eventId, eventId));
  }
  
  async getBookingsByDate(eventIds: number[], date: Date): Promise<Booking[]> {
    // Format the date to ISO string (YYYY-MM-DD) to ensure timezone consistency
    const dateStr = date.toISOString().split('T')[0];
    console.log(`Finding bookings for date: ${dateStr}`);
    
    // Query bookings for the given date and event IDs
    const dateBookings = await db
      .select({
        booking: bookings,
        event: {
          title: events.title,
          duration: events.duration
        }
      })
      .from(bookings)
      .innerJoin(events, eq(bookings.eventId, events.id))
      .where(
        and(
          inArray(bookings.eventId, eventIds),
          // Use the SQL function to extract the date part for comparison
          // to avoid timezone issues
          sql`DATE(${bookings.date}) = ${dateStr}`
        )
      );
    
    console.log(`Found ${dateBookings.length} bookings for date ${dateStr}`);
    
    // Transform the results to include event details
    return dateBookings.map(item => ({
      ...item.booking,
      eventTitle: item.event.title,
      eventDuration: item.event.duration
    }));
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(insertBooking).returning();
    return booking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    
    return updatedBooking;
  }
}

// Use the database storage instead of in-memory storage
export const storage = new DatabaseStorage();
