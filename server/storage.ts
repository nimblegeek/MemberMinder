import { members, type Member, type InsertMember } from "@shared/schema";

export interface IStorage {
  getMembers(): Promise<Member[]>;
  getMember(id: number): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: number, member: Partial<Member>): Promise<Member | undefined>;
  verifySSN(ssn: string): Promise<boolean>;
  getMembersByFilter(filter: { verified?: boolean }): Promise<Member[]>;
}

export class MemStorage implements IStorage {
  private members: Map<number, Member>;
  private currentId: number;

  constructor() {
    this.members = new Map();
    this.currentId = 1;
  }

  async getMembers(): Promise<Member[]> {
    return Array.from(this.members.values());
  }

  async getMember(id: number): Promise<Member | undefined> {
    return this.members.get(id);
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const id = this.currentId++;
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
}

// Create and export a storage instance
export const storage = new MemStorage();
