import { 
  Form, InsertForm, 
  Response, InsertResponse,
  User, InsertUser,
  users, forms, responses
} from "@shared/schema";
import { nanoid } from "nanoid";
import { db } from './db';
import { eq } from 'drizzle-orm';
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from './db';

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
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
}

// Use the database storage instead of in-memory storage
export const storage = new DatabaseStorage();
