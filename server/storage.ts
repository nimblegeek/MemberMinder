import { members, type Member, type InsertMember, type User, type InsertUser, users } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

// Create memory store for sessions
const MemoryStore = createMemoryStore(session);

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
    const member: Member = { ...insertMember, id, dateAdded };
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
    // Mock SSN verification - simulate API call to IRS database
    // In a real app, this would connect to an actual verification service
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
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
}

// Create and export a storage instance
export const storage = new MemStorage();
