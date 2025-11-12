# Backend Troubleshooting Guide

## Error: "Server did not start"

This error occurs when the backend server fails to initialize. Here are the most common causes and solutions:

### 1. Prisma Client Not Generated ⚠️ (MOST COMMON)

**Symptom:** Backend fails to start with import errors or "Cannot find module '@prisma/client'"

**Solution:**
```bash
# Generate Prisma Client
bunx prisma generate
```

**Why it happens:** The Prisma Client needs to be generated from your schema before it can be used.

### 2. Missing .env File

**Symptom:** Warnings about DATABASE_URL not configured

**Solution:**
```bash
# Copy the example environment file
cp env.example .env

# Edit .env and configure your database URL
# Example for local PostgreSQL:
# DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
```

### 3. Database Not Running

**Symptom:** "Database connection FAILED" messages

**Solution:**
```bash
# If using PostgreSQL locally:
# On macOS with Homebrew:
brew services start postgresql

# On Linux:
sudo systemctl start postgresql

# On Windows: Start PostgreSQL from Services

# Or use a cloud database service like:
# - Supabase (https://supabase.com)
# - Railway (https://railway.app)
# - Neon (https://neon.tech)
```

### 4. Database Migrations Not Run

**Symptom:** Database connected but queries fail

**Solution:**
```bash
# Run migrations to create database tables
bunx prisma migrate dev
```

### 5. Missing Dependencies

**Symptom:** Module import errors

**Solution:**
```bash
# Install all dependencies
bun install
```

## Complete Setup Steps (Fresh Start)

If you're setting up the backend for the first time, follow these steps in order:

```bash
# 1. Install dependencies
bun install

# 2. Create .env file
cp env.example .env

# 3. Edit .env and add your database URL
# Use any text editor to edit the .env file
# Example: DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"

# 4. Generate Prisma Client
bunx prisma generate

# 5. Run database migrations
bunx prisma migrate dev

# 6. Start the server
bun run start
```

## Checking Backend Status

Run this command to check your backend configuration:

```bash
node check-backend.js
```

This will tell you exactly what's missing or misconfigured.

## Quick Database Setup Options

### Option A: Local PostgreSQL (Recommended for Development)

1. Install PostgreSQL:
   - **macOS:** `brew install postgresql`
   - **Ubuntu/Debian:** `sudo apt install postgresql`
   - **Windows:** Download from https://www.postgresql.org/download/

2. Create a database:
```bash
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE eventos_app;
CREATE USER eventos_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE eventos_app TO eventos_user;
\q
```

3. Update .env:
```
DATABASE_URL="postgresql://eventos_user:your_password@localhost:5432/eventos_app?schema=public"
```

### Option B: Cloud Database (Easiest)

**Supabase (Free tier available):**
1. Go to https://supabase.com
2. Create a new project
3. Go to Settings > Database
4. Copy the "Connection string" (Direct connection / Session pooler)
5. Paste it in your .env as DATABASE_URL

**Railway (Free tier available):**
1. Go to https://railway.app
2. Create new project > Add PostgreSQL
3. Click on PostgreSQL > Connect
4. Copy the DATABASE_URL
5. Paste it in your .env

## Common Error Messages

### "Cannot find module '@prisma/client'"
**Fix:** Run `bunx prisma generate`

### "PrismaClient is unable to be run in the browser"
**Fix:** This is a backend-only library. Make sure you're not importing it in frontend code.

### "Can't reach database server"
**Fix:** 
1. Check if your database is running
2. Verify DATABASE_URL is correct in .env
3. Check firewall settings if using cloud database

### "The table does not exist"
**Fix:** Run `bunx prisma migrate dev`

### "Invalid DATABASE_URL"
**Fix:** Make sure your DATABASE_URL follows this format:
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
```

## Still Having Issues?

1. Check the backend logs in the Rork console
2. Verify all environment variables are set correctly
3. Make sure you've run `bunx prisma generate` after any schema changes
4. Try restarting the development server

## Backend Status Indicators

When the backend starts successfully, you should see:
```
==================================================
🚀 BACKEND SERVER STARTING
==================================================
📦 Environment: development
🔧 Database URL configured: true
💾 Database connected: true
🔐 JWT Secret configured: true

✅ All systems ready!
==================================================
```

If you see warnings or errors, follow the suggestions in the output.
