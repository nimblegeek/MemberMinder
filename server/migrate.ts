import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { sql } from "drizzle-orm";
import { users, members } from "../shared/schema";

const { Pool } = pg;

async function main() {
  console.log("Starting database migration...");
  
  try {
    // Connect to PostgreSQL
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL 
    });
    
    const db = drizzle(pool);
    
    // Create schema if not exists
    await db.execute(sql`CREATE SCHEMA IF NOT EXISTS public`);
    
    // Create tables based on schema
    console.log("Creating users table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        display_name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log("Creating members table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        ssn TEXT NOT NULL UNIQUE,
        dob TEXT NOT NULL,
        address JSONB NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        date_added TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log("Migration completed successfully!");
    
    // Close the pool
    await pool.end();
    
    console.log("Database connection closed.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main();