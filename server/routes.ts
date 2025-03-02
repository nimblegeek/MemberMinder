import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMemberSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for members
  
  // GET all members
  app.get("/api/members", async (_req: Request, res: Response) => {
    try {
      const members = await storage.getMembers();
      res.json(members);
    } catch (error) {
      console.error("Error fetching members:", error);
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  // GET a single member by ID
  app.get("/api/members/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid member ID" });
      }

      const member = await storage.getMember(id);
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }

      res.json(member);
    } catch (error) {
      console.error("Error fetching member:", error);
      res.status(500).json({ message: "Failed to fetch member" });
    }
  });

  // POST to create a new member
  app.post("/api/members", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const memberData = insertMemberSchema.parse(req.body);
      
      // Verify SSN
      const isVerified = await storage.verifySSN(memberData.ssn);
      
      // Create member with verification status
      const newMember = await storage.createMember({
        ...memberData,
        verified: isVerified
      });
      
      res.status(201).json({
        member: newMember,
        verificationResult: {
          verified: isVerified,
          message: isVerified 
            ? "SSN verification successful" 
            : "SSN verification pending"
        }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        // Handle validation errors
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationError.details 
        });
      }
      
      console.error("Error creating member:", error);
      res.status(500).json({ message: "Failed to create member" });
    }
  });

  // PATCH to update a member
  app.patch("/api/members/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid member ID" });
      }
      
      // Get existing member
      const existingMember = await storage.getMember(id);
      if (!existingMember) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      // Update member
      const updatedMember = await storage.updateMember(id, req.body);
      res.json(updatedMember);
    } catch (error) {
      console.error("Error updating member:", error);
      res.status(500).json({ message: "Failed to update member" });
    }
  });

  // GET filtered members (for reporting)
  app.get("/api/members/filter/verified", async (req: Request, res: Response) => {
    try {
      const verified = req.query.status === 'true';
      const members = await storage.getMembersByFilter({ verified });
      res.json(members);
    } catch (error) {
      console.error("Error fetching filtered members:", error);
      res.status(500).json({ message: "Failed to fetch filtered members" });
    }
  });

  // Mock SSN verification endpoint (for demonstration)
  app.post("/api/verify-ssn", async (req: Request, res: Response) => {
    try {
      const { ssn } = req.body;
      
      if (!ssn || typeof ssn !== 'string') {
        return res.status(400).json({ message: "SSN is required" });
      }
      
      // Validate SSN format
      if (!/^\d{3}-\d{2}-\d{4}$/.test(ssn)) {
        return res.status(400).json({ 
          message: "Invalid SSN format. Use XXX-XX-XXXX format." 
        });
      }
      
      const isVerified = await storage.verifySSN(ssn);
      res.json({ verified: isVerified });
    } catch (error) {
      console.error("Error verifying SSN:", error);
      res.status(500).json({ message: "Failed to verify SSN" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
