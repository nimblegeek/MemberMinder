import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import createMemoryStore from "memorystore";
import type { Member } from "@shared/schema";

const MemoryStore = createMemoryStore(session);

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      displayName: string;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Mock users for demonstration
const users = new Map<number, Express.User & { password: string }>();
users.set(1, {
  id: 1,
  username: "admin",
  displayName: "Administrator",
  password: "e0f68134ddf3c83ae96070a136a030180eea6b5c1cabc191f4db3f6dd9b248b0ba6cd7946d7ee6c88e3ebf76aea04a4071c4c6e8f41998ed6d0f2d0a73af7798.5bbc9416ef40c96c7acced0afebfd060", // password: "admin123"
});

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: "member-registry-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Set up passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      // Find user by username
      const user = Array.from(users.values()).find(u => u.username === username);
      
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      
      const isValid = await comparePasswords(password, user.password);
      
      if (isValid) {
        // Don't include password in the user object passed on
        const { password, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } else {
        return done(null, false, { message: "Incorrect password" });
      }
    })
  );

  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser((id: number, done) => {
    const user = users.get(id as number);
    if (!user) {
      return done(new Error(`User with ID ${id} not found`));
    }
    
    const { password, ...userWithoutPassword } = user;
    done(null, userWithoutPassword);
  });

  // Login route
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: any) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  // Logout route
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Get current user route
  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}