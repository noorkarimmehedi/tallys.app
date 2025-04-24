import { 
  Form, InsertForm, 
  Response, InsertResponse,
  User, InsertUser 
} from "@shared/schema";
import { nanoid } from "nanoid";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private forms: Map<number, Form>;
  private responses: Map<number, Response>;
  private userIdCounter: number;
  private formIdCounter: number;
  private responseIdCounter: number;

  constructor() {
    this.users = new Map();
    this.forms = new Map();
    this.responses = new Map();
    this.userIdCounter = 1;
    this.formIdCounter = 1;
    this.responseIdCounter = 1;
    
    // Add demo user
    this.createUser({
      username: "demo",
      password: "password"
    }).then(user => {
      // Create a demo form with sections
      this.createForm({
        userId: user.id,
        title: "Customer Information Form",
        published: true,
        shortId: "demo-form",
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
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Form methods
  async getForms(userId: number): Promise<Form[]> {
    return Array.from(this.forms.values()).filter(
      (form) => form.userId === userId
    );
  }

  async getForm(id: number): Promise<Form | undefined> {
    return this.forms.get(id);
  }

  async getFormByShortId(shortId: string): Promise<Form | undefined> {
    return Array.from(this.forms.values()).find(
      (form) => form.shortId === shortId
    );
  }

  async createForm(insertForm: InsertForm): Promise<Form> {
    const id = this.formIdCounter++;
    const shortId = insertForm.shortId || nanoid(10);
    const form: Form = { 
      ...insertForm, 
      id, 
      shortId,
      views: 0,
      published: insertForm.published || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.forms.set(id, form);
    return form;
  }

  async updateForm(id: number, updates: Partial<Form>): Promise<Form | undefined> {
    const form = this.forms.get(id);
    if (!form) return undefined;
    
    const updatedForm = { ...form, ...updates, updatedAt: new Date() };
    this.forms.set(id, updatedForm);
    return updatedForm;
  }

  async deleteForm(id: number): Promise<boolean> {
    return this.forms.delete(id);
  }

  async incrementFormViews(id: number): Promise<boolean> {
    const form = this.forms.get(id);
    if (!form) return false;
    
    form.views = (form.views || 0) + 1;
    this.forms.set(id, form);
    return true;
  }

  // Response methods
  async getFormResponses(formId: number): Promise<Response[]> {
    return Array.from(this.responses.values()).filter(
      (response) => response.formId === formId
    );
  }

  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const id = this.responseIdCounter++;
    const response: Response = { 
      ...insertResponse, 
      id,
      createdAt: new Date()
    };
    this.responses.set(id, response);
    return response;
  }
}

export const storage = new MemStorage();
