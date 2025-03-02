import { members, type Member, type InsertMember, type User, type InsertUser, users } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, desc } from "drizzle-orm";
import pg from "pg";
import ConnectPgSimple from "connect-pg-simple";

const { Pool } = pg;
const MemoryStore = createMemoryStore(session);

// Set up PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Set up the Drizzle ORM
const db = drizzle(pool);

// PostgreSQL session store
const PostgresSessionStore = ConnectPgSimple(session);

export interface IStorage {
  // Member operations
  getMembers(): Promise<Member[]>;
  getMember(id: number): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: number, member: Partial<Member>): Promise<Member | undefined>;
  verifySSN(ssn: string): Promise<boolean>;
  getMembersByFilter(filter: { verified?: boolean }): Promise<Member[]>;
  
  // User authentication operations
  getUserByUsername(username: string): Promise<User | undefined>;
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Session store
  sessionStore: session.Store;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private members: Map<number, Member>;
  private users: Map<number, User>;
  private memberId: number;
  private userId: number;
  public sessionStore: session.Store;

  constructor() {
    this.members = new Map();
    this.users = new Map();
    this.memberId = 1;
    this.userId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  async getMembers(): Promise<Member[]> {
    return Array.from(this.members.values());
  }

  async getMember(id: number): Promise<Member | undefined> {
    return this.members.get(id);
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const id = this.memberId++;
    const dateAdded = new Date();
    const member = { 
      ...insertMember, 
      id, 
      dateAdded,
      verified: insertMember.verified || null 
    };
    this.members.set(id, member);
    return member;
  }

  async updateMember(id: number, memberUpdate: Partial<Member>): Promise<Member | undefined> {
    const member = this.members.get(id);
    if (!member) return undefined;
    
    const updatedMember = { ...member, ...memberUpdate };
    this.members.set(id, updatedMember);
    return updatedMember;
  }

  async verifySSN(ssn: string): Promise<boolean> {
    // Mock SSN verification - simulate API call to verification service
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate random success/failure to simulate verification
        // 70% chance of success
        const isVerified = Math.random() > 0.3;
        resolve(isVerified);
      }, 1000); // simulate network latency
    });
  }

  async getMembersByFilter(filter: { verified?: boolean }): Promise<Member[]> {
    const members = Array.from(this.members.values());
    
    if (filter.verified !== undefined) {
      return members.filter(member => member.verified === filter.verified);
    }
    
    return members;
  }

  // User authentication methods
  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = Array.from(this.users.values());
    return users.find(user => user.username === username);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date();
    const user = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
}

// Database storage implementation using PostgreSQL and Drizzle ORM
export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  async getMembers(): Promise<Member[]> {
    return await db.select().from(members).orderBy(desc(members.dateAdded));
  }

  async getMember(id: number): Promise<Member | undefined> {
    const results = await db.select().from(members).where(eq(members.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const result = await db.insert(members).values({
      ...insertMember,
      verified: insertMember.verified || false
    }).returning();
    
    return result[0];
  }

  async updateMember(id: number, memberUpdate: Partial<Member>): Promise<Member | undefined> {
    const results = await db.update(members)
      .set(memberUpdate)
      .where(eq(members.id, id))
      .returning();
    
    return results.length > 0 ? results[0] : undefined;
  }

  async verifySSN(ssn: string): Promise<boolean> {
    // Mock SSN verification - simulate API call to verification service
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate random success/failure to simulate verification
        // 70% chance of success
        const isVerified = Math.random() > 0.3;
        resolve(isVerified);
      }, 1000); // simulate network latency
    });
  }

  async getMembersByFilter(filter: { verified?: boolean }): Promise<Member[]> {
    if (filter.verified !== undefined) {
      return await db.select().from(members).where(eq(members.verified, filter.verified));
    }
    
    return await db.select().from(members);
  }

  // User authentication methods
  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results.length > 0 ? results[0] : undefined;
  }

  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      ...insertUser
    }).returning();
    
    return result[0];
  }
}

// Create and export a storage instance
// Switch from MemStorage to DatabaseStorage
export const storage = new DatabaseStorage();