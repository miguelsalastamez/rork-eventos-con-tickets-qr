# 🔥 RORK BACKEND NOT STARTING - CRITICAL ISSUE

## Problem
Backend at `https://tickets-92loqsix46yuo4fa4rjne.rork.app` returns "snapshot not found"

## Root Cause
The Rork backend deployment is failing because **Prisma Client is not being generated** during the build process.

## Why This Happens
1. This project uses Prisma ORM with PostgreSQL
2. Prisma requires running `prisma generate` to create the Prisma Client before the backend can start
3. Rork's build system doesn't automatically run `prisma generate` 
4. Without the generated client, the backend fails to build/start

## Solution (Requires Rork Platform Support)

### Option 1: Add postinstall script (RECOMMENDED)
Add this to `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

This ensures Prisma Client is generated after every `npm install` / `bun install`.

### Option 2: Manual fix in Rork backend build
Rork's backend build process needs to run:
```bash
prisma generate
```
Before starting the Hono server.

### Option 3: Pre-commit Prisma Client
Generate Prisma Client locally and commit it to the repo:
```bash
bunx prisma generate
```
Then commit the `node_modules/.prisma` folder (not recommended, but might work as workaround)

## Current Configuration
- ✅ DATABASE_URL: Configured with Supabase PostgreSQL
- ✅ Prisma Schema: Valid at `prisma/schema.prisma`  
- ✅ Backend Code: Valid Hono + tRPC server
- ❌ Prisma Client: NOT generated in Rork deployment
- ❌ Backend Status: Not starting ("snapshot not found")

## Verification
After fix, the backend should:
1. Start successfully at `https://tickets-92loqsix46yuo4fa4rjne.rork.app`
2. Return `{"status":"ok","message":"API is running","database":"connected"}` at root endpoint
3. Show these logs on startup:
   ```
   ✅ @prisma/client available
   ✅ DATABASE_URL configured
   ✅ Prisma Client initialized successfully
   ✅ All systems ready!
   ```

## Contact
This is a Rork platform-specific issue. The app code is correct but Rork's backend deployment needs to support Prisma.

**Please contact Rork support or check if there's a way to configure the backend build process.**
