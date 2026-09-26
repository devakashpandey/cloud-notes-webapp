# ☁️ CloudNotes — Comprehensive Full Stack Documentation & Architecture Guide

> A production-grade, full-stack Notes application built entirely from scratch using **Node.js/Express** on the backend and **Next.js 16 (React 19 + TypeScript)** on the frontend. This document provides a complete technical breakdown of **every library used (what, why, where, and how)**, the full **system architecture**, and an **in-depth end-to-end API lifecycle walk-through with Redis Caching and Socket.IO Real-Time Synchronization**.

---

## 📖 Table of Contents ---------->>

1. [Project Overview](#-project-overview)
2. [Deep-Dive Library Breakdown (What, Why, Where, How)](#-deep-dive-library-breakdown)
   - [Backend Libraries](#backend-libraries)
   - [Frontend Libraries](#frontend-libraries)
3. [End-to-End API Flow Walkthrough (Create Note with Cache Invalidation & Real-Time Sync)](#-end-to-end-api-flow-walkthrough)
   - [Architectural Flow Diagram](#architectural-flow-diagram)
   - [Step 1: Frontend Form Submission & Client Validation](#step-1-frontend-form-submission--client-validation)
   - [Step 2: Network Layer & HTTP Request with Interceptors](#step-2-network-layer--http-request-with-interceptors)
   - [Step 3: Backend Security & Middleware Pipeline](#step-3-backend-security--middleware-pipeline)
   - [Step 4: Controller Execution (DB, Media Storage, Cache Invalidation, Realtime Broadcast)](#step-4-controller-execution)
   - [Step 5: Real-Time WebSockets Sync Across Devices](#step-5-real-time-websockets-sync-across-devices)
   - [Step 6: Subsequent Read API Flow (Redis Cache-Aside Pattern)](#step-6-subsequent-read-api-flow-redis-cache-aside-pattern)
4. [Architecture & Data Flow Diagram](#-architecture--data-flow-diagram)
5. [Complete Project Folder Structure](#-complete-project-folder-structure)
6. [Backend — Engineering From Scratch](#-backend--engineering-from-scratch)
   - [Phase 1: Express Server & Middleware Architecture](#phase-1-express-server--middleware-architecture)
   - [Phase 2: Database Modeling & Indexing (MongoDB + Mongoose)](#phase-2-database-modeling--indexing-mongodb--mongoose)
   - [Phase 3: Dual-Token JWT Authentication System](#phase-3-dual-token-jwt-authentication-system)
   - [Phase 4: Notes Engine & Media Upload Pipeline](#phase-4-notes-engine--media-upload-pipeline)
   - [Phase 5: Query Engine (Search, Filter, Sort, Pagination)](#phase-5-query-engine-search-filter-sort-pagination)
   - [Phase 6: In-Memory Caching Architecture (Redis / Upstash)](#phase-6-in-memory-caching-architecture-redis--upstash)
   - [Phase 7: Real-Time Synchronization Engine (Socket.IO)](#phase-7-real-time-synchronization-engine-socketio)
   - [Phase 8: Transactional Email Infrastructure (Brevo HTTP API)](#phase-8-transactional-email-infrastructure-brevo-http-api)
   - [Phase 9: Security Hardening & Global Error Handling](#phase-9-security-hardening--global-error-handling)
7. [Frontend — Engineering From Scratch](#-frontend--engineering-from-scratch)
   - [Phase 1: Next.js 16 App Router & Route Groups](#phase-1-nextjs-16-app-router--route-groups)
   - [Phase 2: API Client & Auto-Token-Refresh Interceptor](#phase-2-api-client--auto-token-refresh-interceptor)
   - [Phase 3: Global State Architecture (Zustand)](#phase-3-global-state-architecture-zustand)
   - [Phase 4: Forms & Client-Side Schema Validation](#phase-4-forms--client-side-schema-validation)
   - [Phase 5: Dashboard, Search & Filter System](#phase-5-dashboard-search--filter-system)
   - [Phase 6: Real-Time Client Socket Integration](#phase-6-real-time-client-socket-integration)
   - [Phase 7: Profile Management & Media Updates](#phase-7-profile-management--media-updates)
   - [Phase 8: Theme System (Dark / Light Mode)](#phase-8-theme-system-dark--light-mode)
8. [Features Checklist](#-features-checklist)
9. [Complete API Endpoints Reference](#-complete-api-endpoints-reference)
10. [Environment Variables Specification](#-environment-variables-specification)
11. [How To Run Locally](#-how-to-run-locally)
12. [Production Deployment Guide (Frontend + Backend + Real-Time Sync)](#-production-deployment-guide)
13. [Key Learnings & Interview Takeaways](#-key-learnings--interview-takeaways)

---

## 1. 🎯 Project Overview -------------->>

**CloudNotes** is a production-grade notes management platform engineered from zero to demonstrate modern full-stack web architecture. It addresses critical production challenges:

- **Security & Identity**: Dual-token JWT (Access + Refresh tokens stored in `httpOnly` secure cookies), password hashing via bcrypt, rate limiting, and email verification links.
- **Performance & Latency**: Redis-backed cache-aside querying layer (~2ms read responses), compound and text indexing on MongoDB.
- **Real-Time Collaboration**: Event-driven WebSocket synchronization using Socket.IO with isolated user rooms, updating all active tabs and devices without page reloads.
- **Media Processing**: Multipart file streaming via Multer with Cloudinary cloud storage and automated temporary disk cleanup.
- **Modern Frontend Architecture**: Next.js 16 App Router, Zustand reactive global store, optimistic UI updates, responsive Tailwind CSS v4 styling, and accessible modal workflows.

---

## 2. 🛠 Deep-Dive Library Breakdown ---------->>

Every single library in this project was selected for a specific architectural purpose. Below is the detailed inventory covering **what** each library is, **why** it was chosen, **where** it is implemented in the codebase, and **how** it works.

### Backend Libraries

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     BACKEND DEPENDENCIES                                               │
├──────────────────────┬───────────────────────────┬─────────────────────────────────┬───────────────────┤
│ Package Name         │ Purpose / Why Used        │ Where Implemented               │ Implementation    │
├──────────────────────┼───────────────────────────┼─────────────────────────────────┼───────────────────┤
│ express (v5)         │ Web framework & REST API  │ backend/src/app.js, server.js   │ Routes, Middleware│
│ mongoose             │ MongoDB ODM & Schema ORM  │ backend/src/models/*, db/db.js  │ Schemas, Indexes  │
│ redis (Upstash)      │ Sub-millisecond Caching   │ backend/src/services/redis*     │ Cache-aside & TTL │
│ socket.io            │ Bidirectional WebSockets  │ backend/src/socket/socket.js    │ Rooms, Broadcasts │
│ jsonwebtoken         │ Stateless Token Auth      │ backend/src/middleware/auth*    │ Sign & Verify JWT │
│ bcryptjs             │ Salted Password Hashing   │ backend/src/models/user.model.js│ Pre-save Hooks    │
│ multer               │ Multipart/form-data upload│ backend/src/middleware/multer*  │ Disk Storage      │
│ cloudinary           │ Cloud Media Storage       │ backend/src/services/cloudinary*│ Upload & Optimize │
│ Brevo HTTP API       │ Transactional Email (REST)│ backend/src/services/email*     │ fetch() API calls │
│ zod                  │ Schema Request Validation │ backend/src/validators/*        │ Request Middleware│
│ helmet               │ HTTP Security Headers     │ backend/src/app.js              │ App-level Header  │
│ cors                 │ Cross-Origin Whitelisting │ backend/src/app.js              │ Credentials CORS  │
│ express-rate-limit   │ DDoS & Brute-force Guard  │ backend/src/middleware/rate*    │ IP Request Limiter│
│ cookie-parser        │ Parse HTTP Cookie Headers │ backend/src/app.js              │ req.cookies Access│
│ dotenv               │ Environment Secrets Config│ backend/server.js               │ process.env Setup │
└──────────────────────┴───────────────────────────┴─────────────────────────────────┴───────────────────┘
```

#### 1. `express` (v5)
- **Why**: Industry-standard Node.js web framework providing minimal, fast HTTP server capabilities, dynamic route handling, and middleware composition.
- **Where**: `backend/src/app.js` and `backend/server.js`.
- **How Implemented**: Express app instance initialized in `app.js`, configured with middleware pipelines, mounted with REST routes (`/api/v1/auth`, `/api/v1/notes`, `/api/v1/user`), and wrapped by Node's native `http.createServer(app)` in `server.js` to allow Socket.IO coexistence.

#### 2. `mongoose`
- **Why**: Object Data Modeling (ODM) library for MongoDB that enforces strict schema validation, type casting, index definitions, and model hooks.
- **Where**: `backend/src/db/db.js`, `backend/src/models/user.model.js`, and `backend/src/models/note.model.js`.
- **How Implemented**:
  - `db/db.js`: Establishes resilient database connections using `mongoose.connect(process.env.MONGO_URI)`.
  - `models/note.model.js`: Defines fields, sets up compound indexes `{ user: 1, isPinned: -1, createdAt: -1 }` for instant sorted queries, and text indexes for search.
  - `models/user.model.js`: Defines pre-save middleware for auto-hashing passwords and instance methods for token generation.

#### 3. `redis` (`@redis/client` / Upstash Redis)
- **Why**: Ultra-fast in-memory data store used to cache expensive MongoDB query responses (search, filters, pagination) and offload database load.
- **Where**: `backend/src/db/redis.js` and `backend/src/services/redisCache.service.js`.
- **How Implemented**:
  - `db/redis.js`: Connects to Upstash Redis using TLS (`rediss://`).
  - `redisCache.service.js`: Provides reusable utilities:
    - `getCache(key)`: Fetches and `JSON.parse`s cached data.
    - `setCache(key, data, ttl)`: Stores serialized data with automated expiration (e.g. 1800s / 30 mins).
    - `invalidatePattern(pattern)`: Scans matching keys with `redisClient.keys(pattern)` and bulk deletes them with `redisClient.del(keys)`.
    - `invalidateUserNotesCache(userId)`: Employs wildcard pattern `notes:${userId}:*` to purge all cached filter views whenever a user adds, edits, deletes, or pins a note.

#### 4. `socket.io`
- **Why**: Real-time event-driven engine providing bidirectional WebSocket communication with automatic HTTP long-polling fallback.
- **Where**: `backend/src/socket/socket.js`, `backend/server.js`, and controllers (`note.controller.js`).
- **How Implemented**:
  - `initSocket(httpServer)`: Binds Socket.IO server to the HTTP server with CORS enabled.
  - Socket Authentication Middleware: Intercepts connection handshake, parses cookies via `cookie` package, extracts and verifies the JWT `accessToken`, attaches `socket.user = user`.
  - Room Isolation: Connected sockets automatically join an isolated room `socket.join("user:" + userId)`.
  - Broadcasting: Controllers invoke `getIO().to("user:" + userId).emit("note:created", note)` to notify other active tabs/devices instantly.

#### 5. `jsonwebtoken` (JWT)
- **Why**: Industry standard for stateless, cryptographically signed authentication tokens.
- **Where**: `backend/src/models/user.model.js`, `backend/src/middleware/auth.middleware.js`, and `backend/src/socket/socket.js`.
- **How Implemented**:
  - Issues short-lived **Access Tokens** (`15m`) carrying `{ _id, email, username }`.
  - Issues long-lived **Refresh Tokens** (`10d`) carrying `{ _id }` stored in the database for session management.
  - `verifyJWT` middleware extracts token from cookies (`req.cookies.accessToken`) or authorization header (`Bearer <token>`), verifies the signature, and attaches user info to `req.user`.

#### 6. `bcryptjs`
- **Why**: Cryptographic one-way hashing function designed with configurable work factors (salt rounds) to protect passwords against rainbow table attacks.
- **Where**: `backend/src/models/user.model.js`.
- **How Implemented**:
  - `userSchema.pre("save")`: Intercepts modifications to the `password` field and executes `bcrypt.hash(this.password, 10)`.
  - `userSchema.methods.isPasswordCorrect`: Uses `bcrypt.compare(enteredPassword, this.password)` during login.

#### 7. `multer`
- **Why**: Middleware for handling `multipart/form-data`, primarily used for uploading image files to the server.
- **Where**: `backend/src/middleware/multer.middleware.js` and routes (`note.routes.js`, `user.route.js`).
- **How Implemented**: Configured with `multer.diskStorage` to save incoming file streams to a local buffer directory (`public/temp/`) with unique filenames before transferring to Cloudinary.

#### 8. `cloudinary`
- **Why**: End-to-end cloud image management for CDN delivery, on-the-fly resizing, format optimization, and secure deletion.
- **Where**: `backend/src/services/cloudinary.service.js`.
- **How Implemented**:
  - `uploadOnCloudinary(localFilePath)`: Uploads local disk files to Cloudinary bucket, returns secure URL and `public_id`, and safely deletes the temporary local file via `fs.unlinkSync()`.
  - `deleteFromCloudinary(publicId)`: Invoked during note/avatar deletion to remove obsolete cloud media.

#### 9. Brevo HTTP API (Transactional Email)
- **Why**: Cloud hosting platforms like Render block outbound SMTP ports (587/465), causing `ETIMEDOUT` connection errors when using Nodemailer with Gmail SMTP or Brevo SMTP. The Brevo HTTP API sends emails over HTTPS (port 443), which is never blocked by any hosting provider.
- **Where**: `backend/src/services/email.service.js`.
- **How Implemented**: Uses Node.js native `fetch()` to call Brevo's REST API (`https://api.brevo.com/v3/smtp/email`) with an API key for authentication. Provides async functions to dispatch formatted HTML emails for account verification, password resets, and welcome onboarding.
- **Migration Journey**: Initially used `nodemailer` + Gmail SMTP → Gmail blocked on cloud IPs → Switched to Brevo SMTP → Render blocked SMTP ports (Connection timeout / `ETIMEDOUT`) → Final solution: Brevo HTTP API over HTTPS.

  ```
  Evolution of Email Service:
  ❌ Nodemailer + Gmail SMTP    → Gmail blocks cloud server IPs
  ❌ Nodemailer + Brevo SMTP    → Render blocks SMTP ports (587/465) → ETIMEDOUT
  ✅ Brevo HTTP API (fetch)     → Works on all platforms (uses HTTPS port 443)
  ```

#### 10. `zod`
- **Why**: TypeScript-first schema declaration and validation library for validating incoming request payloads at the boundary.
- **Where**: `backend/src/validators/*` and `backend/src/middleware/validate.middleware.js`.
- **How Implemented**: `validate(schema)` middleware passes `req.body`, `req.query`, or `req.params` into `schema.parseAsync()`. Throws a structured `ApiError(400)` with granular field errors on mismatch before controller code ever runs.

#### 11. `helmet` & `cors`
- **Why**:
  - `helmet`: Sets HTTP response headers (Content-Security-Policy, X-Frame-Options, X-XSS-Protection) to guard against common web vulnerabilities.
  - `cors`: Regulates cross-origin requests, restricting access exclusively to `process.env.CLIENT_URL` with `credentials: true` for cookie transmission.
- **Where**: `backend/src/app.js`.

#### 12. `express-rate-limit`
- **Why**: Prevents denial-of-service (DoS) attacks and brute-force credential stuffing.
- **Where**: `backend/src/middleware/rateLimiter.middleware.js` and `backend/src/app.js`.
- **How Implemented**:
  - Global Limiter: 200 requests per 15-minute window for standard endpoints.
  - Auth Limiter: 20 requests per 15-minute window applied specifically to `/api/v1/auth/*` routes.

---

###  Frontend Libraries

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     FRONTEND DEPENDENCIES                                              │
├──────────────────────┬───────────────────────────┬─────────────────────────────────┬───────────────────┤
│ Package Name         │ Purpose / Why Used        │ Where Implemented               │ Implementation    │
├──────────────────────┼───────────────────────────┼─────────────────────────────────┼───────────────────┤
│ next (v16)           │ React Framework & Routing │ frontend/app/*                  │ App Router Layouts│
│ react (v19)          │ Component-based UI        │ frontend/components/*           │ Hooks, State, JSX │
│ typescript           │ End-to-end Type Safety    │ frontend/types/*                │ Strict Interfaces │
│ tailwindcss (v4)     │ Utility-First Styling     │ frontend/app/globals.css        │ Responsive Design │
│ zustand              │ Global State Management   │ frontend/store/*                │ Central Reactive  │
│ axios                │ HTTP Client with Handlers │ frontend/lib/axios.ts           │ Auto-Refresh Token│
│ react-hook-form      │ High-performance Forms    │ frontend/components/notes/*     │ Minimal Re-renders│
│ @hookform/resolvers  │ Connect Zod with RHF      │ frontend/components/notes/*     │ Form Validation   │
│ zod                  │ Client Schema Validation  │ frontend/schemas/*              │ Shared Schemas    │
│ socket.io-client     │ Real-time Event Client    │ frontend/services/socket*, hooks│ WebSocket Manager │
│ next-themes          │ Dark/Light Theme Provider │ frontend/components/themes/*    │ Theme Persistence │
│ react-hot-toast      │ Visual Feedback Alerts    │ frontend/components/Toast*      │ Toast Triggers    │
│ lucide-react         │ Modern SVG Icons          │ frontend/components/*           │ UI Iconography    │
└──────────────────────┴───────────────────────────┴─────────────────────────────────┴───────────────────┘
```

#### 1. `next` (v16 App Router) & `react` (v19)
- **Why**: Modern server-and-client React framework providing zero-config routing, nested layouts, streaming rendering, and search engine optimization.
- **Where**: `frontend/app/*` and `frontend/components/*`.
- **How Implemented**: Uses Route Groups `(auth)` and `(main)` to separate layout styling. Main layout hosts global providers (`ThemeProvider`, `ToastProvider`, `AuthInitializer`, `SocketListener`).

#### 2. `zustand`
- **Why**: Minimal, lightning-fast state management without Context boilerplate or Redux ceremony.
- **Where**: `frontend/store/useAuthStore.ts` and `frontend/store/useNotesStore.ts`.
- **How Implemented**:
  - `useAuthStore`: Holds authenticated `user`, auth status, profile fetching, and session hydration.
  - `useNotesStore`: Holds active `notes` array, pagination metrics, tag lists, and real-time socket event mutators (`handleRealtimeCreated`, `handleRealtimeDeleted`). Supports optimistic UI updates for pin toggling.

#### 3. `axios`
- **Why**: Promise-based HTTP client featuring interceptor pipelines, timeout management, and automatic JSON transformation.
- **Where**: `frontend/lib/axios.ts` and `frontend/services/*`.
- **How Implemented**: Custom Axios instance with `withCredentials: true`. Configured with a response interceptor that catches `401 Unauthorized` responses, executes a silent token refresh via `/auth/refresh-access-token` (queued through a shared `refreshPromise` to prevent race conditions), and replays the original failed request.

#### 4. `react-hook-form` & `@hookform/resolvers` & `zod`
- **Why**: Uncontrolled form architecture that minimizes component re-renders while validating inputs against schema declarations.
- **Where**: `frontend/schemas/*` and form components (e.g. `CreateNoteModal.tsx`, `ProfileEditForm.tsx`, auth pages).
- **How Implemented**: Connects Zod schemas to form fields via `zodResolver(createNoteSchema)`. Provides instant client-side validation errors before network requests are dispatched.

#### 5. `socket.io-client`
- **Why**: Client-side library to maintain active WebSocket connections, receive server broadcasts, and trigger UI updates.
- **Where**: `frontend/services/socket.service.ts`, `frontend/hooks/useSocketEvents.ts`, and `frontend/components/socket/SocketListener.tsx`.
- **How Implemented**:
  - `socket.service.ts`: Singleton client created with `autoConnect: false` and `withCredentials: true`.
  - `useSocketEvents.ts`: Listens for `note:created` and `note:deleted` events and feeds payloads into Zustand store actions.
  - `SocketListener.tsx`: Mounts inside `(main)/layout.tsx` to ensure real-time events are listened to throughout the authenticated dashboard experience.

---

## 3. 🚀 End-to-End API Flow Walkthrough ------------->>

### Scenario: Creating a Note with Image, Real-Time Sync, and Redis Cache Invalidation

This step-by-step walk-through traces the complete journey of an API request across the entire full-stack architecture.

### Architectural Flow Diagram

```
[ FRONTEND ]                                                    [ BACKEND ]
 User Submits Form in CreateNoteModal
        │
        ▼ (Client Validation: Zod + React Hook Form)
 Packaging FormData (Title, Desc, Tags, File)
        │
        ▼ (Axios POST withCredentials /api/v1/notes/create-note)
        │
════════╪═══════════════════════════════════════════════════════════╪═════════════════════════════════════
        │                                                           ▼
        │                                              [ Middleware Pipeline ]
        │                                              1. Helmet Security Headers
        │                                              2. CORS Origin Check
        │                                              3. Rate Limiter Guard
        │                                              4. Multer Disk Storage (public/temp)
        │                                              5. VerifyJWT Auth Middleware (req.cookies)
        │                                              6. Zod Server Validation
        │                                                           │
        │                                                           ▼
        │                                              [ note.controller.createNewNote ]
        │                                              1. Upload image to Cloudinary & delete temp file
        │                                              2. Parse & normalize tags
        │                                              3. Insert new note in MongoDB Atlas
        │                                                           │
        │                                                           ├──► [ Redis Cache Invalidation ]
        │                                                           │    Purge keys matching "notes:userId:*"
        │                                                           │
        │                                                           └──► [ Socket.IO Server Broadcast ]
        │                                                                Emit "note:created" to room "user:userId"
        │                                                           │
        │                                                           ▼
        │                                              Send HTTP 201 ApiResponse back to caller
        │
════════╪═══════════════════════════════════════════════════════════╪═════════════════════════════════════
        │                                                           │
        │◄──────────────────────────────────────────────────────────┘ (WebSocket Event: "note:created")
        │
[ ALL OPEN TABS / DEVICES ]
 SocketListener / useSocketEvents catches "note:created"
        │
        ▼
 Zustand useNotesStore.handleRealtimeCreated(newNote)
        │
        ▼
 UI State updates instantly without refreshing the page!
```

---

### Step 1: Frontend Form Submission & Client Validation
1. The user opens `CreateNoteModal.tsx`, fills in **Title**, **Description**, **Tags** (e.g. `work, urgent`), and selects an **Image file**.
2. **React Hook Form** intercepts the submit event and invokes **Zod resolver** (`note.schema.ts`):
   ```typescript
   export const createNoteSchema = z.object({
     title: z.string().min(1, "Title is required").max(100),
     description: z.string().max(2000).optional(),
     tags: z.string().optional(),
     image: z.any().optional(),
   });
   ```
3. If invalid, field-level error messages display instantly. If valid, form data is converted into a standard `FormData` instance to support file streaming:
   ```typescript
   const formData = new FormData();
   formData.append("title", data.title);
   formData.append("description", data.description || "");
   formData.append("tags", data.tags || "");
   if (imageFile) formData.append("image", imageFile);
   ```

---

### Step 2: Network Layer & HTTP Request with Interceptors
1. The frontend invokes `createNoteApi(formData)` from `frontend/services/notes.api.ts`.
2. The request travels through the configured **Axios instance** (`frontend/lib/axios.ts`):
   ```typescript
   const axiosInstance = axios.create({
     baseURL: process.env.NEXT_PUBLIC_API_URL, // http://localhost:8000/api/v1
     withCredentials: true,                    // Sends httpOnly accessToken cookie
     timeout: 10000,
   });
   ```
3. The browser automatically attaches the `accessToken` cookie to the HTTP request headers.

---

### Step 3: Backend Security & Middleware Pipeline
The request reaches `backend/src/app.js` and traverses the middleware sequence:
1. **Helmet**: Attaches secure HTTP response headers.
2. **CORS**: Validates that the request origin matches `http://localhost:3000` and allows credentials.
3. **Rate Limiter**: Verifies the client IP has not exceeded rate limits.
4. **Multer Middleware** (`multer.middleware.js`):
   - Detects `multipart/form-data` with field `"image"`.
   - Streams the binary data and saves it locally in `public/temp/` with a unique timestamp filename.
   - Attaches file metadata to `req.file`.
5. **VerifyJWT Middleware** (`auth.middleware.js`):
   - Reads `req.cookies.accessToken`.
   - Verifies cryptographic signature using `process.env.ACCESS_TOKEN_SECRET`.
   - Queries MongoDB `User.findById(decoded._id)` and attaches the user document to `req.user`.
6. **Validation Middleware** (`validate.middleware.js`):
   - Validates `req.body` against backend Zod schema `createNoteValidator`.

---

### Step 4: Controller Execution
Execution enters `createNewNote` inside `backend/src/controllers/note.controller.js`:

```javascript
export const createNewNote = asyncHandler(async (req, res) => {
    const { title, description, tags } = req.body;
    const userId = req.user._id;

    // 1. Upload media to Cloudinary (if file exists)
    const localFilePath = req.file?.path;
    let uploadedFile = null;
    if (localFilePath) {
        uploadedFile = await uploadOnCloudinary(localFilePath); // cleans up local disk file
    }

    // 2. Persist in MongoDB
    const note = await Note.create({
        title,
        description,
        imageUrl: uploadedFile?.secure_url || "",
        imagePublicId: uploadedFile?.public_id || "",
        tags: parseTags(tags),
        user: userId,
    });

    // 3. Invalidate Redis cache for this user
    await invalidateUserNotesCache(userId);

    // 4. Real-time broadcast to user's WebSocket room
    try {
        getIO().to(`user:${userId}`).emit("note:created", note);
    } catch (socketErr) {
        console.error("[Socket.io Emit Error]:", socketErr.message);
    }

    // 5. Send standardized HTTP response
    return res.status(201).json(new ApiResponse(201, note, "Note created successfully"));
});
```

#### Why Cache Invalidation is Critical Here:
- Prior to creating this note, the user may have cached query results in Redis (e.g. `notes:userId:{"page":1,"limit":9}`).
- If we do not invalidate the cache, subsequent `GET /notes` requests will return stale cached data that does not include the newly created note.
- `invalidateUserNotesCache(userId)` executes `invalidatePattern("notes:" + userId + ":*")`, which finds and purges all cached query variations for that user.

---

### Step 5: Real-Time WebSockets Sync Across Devices
1. When the backend executes `getIO().to("user:" + userId).emit("note:created", note)`, Socket.IO locates all socket connections belonging to room `user:userId`.
2. Every open browser tab, mobile browser, or active session of that user receives the `"note:created"` payload.
3. On the frontend, `useSocketEvents` (`frontend/hooks/useSocketEvents.ts`) captures the event:
   ```typescript
   const onNoteCreated = (note: Note) => {
       handleRealtimeCreated(note);
   };
   socket.on("note:created", onNoteCreated);
   ```
4. Zustand store (`frontend/store/useNotesStore.ts`) mutates the state:
   ```typescript
   handleRealtimeCreated: (newNote: Note) => {
     set((state) => {
       const exists = state.notes.some((cn) => cn._id === newNote._id);
       if (exists) return state; // Guard against duplicates

       return {
         notes: [newNote, ...state.notes],
         pagination: state.pagination
           ? { ...state.pagination, totalNotes: state.pagination.totalNotes + 1 }
           : null,
       };
     });
   }
   ```
5. The `NoteGrid.tsx` component automatically re-renders with the new note displayed at the top with a smooth entrance animation.

---

### Step 6: Subsequent Read API Flow (Redis Cache-Aside Pattern)
When the user or another component requests notes via `GET /api/v1/notes/get-notes?page=1&limit=9`:

```
Client GET /notes?page=1&limit=9
             │
             ▼
Construct unique Cache Key: "notes:userId:{\"page\":1,\"limit\":9,...}"
             │
             ▼
Check Redis: `getCache(cacheKey)`
             │
     ┌───────┴───────┐
     ▼               ▼
[ CACHE HIT ⚡ ]   [ CACHE MISS 🐢 ]
Return cached data  Query MongoDB (filters, sort, skip, limit, count)
in ~2 milliseconds  Store in Redis: `setCache(cacheKey, payload, 1800)`
                    Return fresh data to client
```

---

## 4. 🏗 Architecture & Data Flow Diagram ------------>>

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT BROWSER                                    │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │                    Next.js 16 (App Router + React 19)                      │  │
│  │  ┌───────────────┐   ┌─────────────────┐   ┌────────────────────────────┐  │  │
│  │  │ (auth) Pages  │   │  (main) Pages   │   │     Global Components      │  │  │
│  │  │ Login/Register│   │  Dashboard/Grid │   │ ThemeToggle, Toast, Header │  │  │
│  │  └───────┬───────┘   └────────┬────────┘   └─────────────┬──────────────┘  │  │
│  │          │                    │                          │                 │  │
│  │          ▼                    ▼                          ▼                 │  │
│  │  ┌──────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                       Zustand Reactive Store                         │  │  │
│  │  │     useAuthStore (User Session) │ useNotesStore (Notes State & Sync) │  │  │
│  │  └──────────────────┬───────────────────────────┬───────────────────────┘  │  │
│  │                     │                           │                          │  │
│  │                     ▼                           ▼                          │  │
│  │  ┌─────────────────────────────────────┐  ┌─────────────────────────────┐  │  │
│  │  │       Axios HTTP Client             │  │   Socket.IO Client          │  │  │
│  │  │ (Interceptors + Auto Token Refresh) │  │  (useSocketEvents Hook)     │  │  │
│  │  └──────────────────┬──────────────────┘  └─────────────▲───────────────┘  │  │
│  └─────────────────────┼───────────────────────────────────┼──────────────────┘  │
└────────────────────────┼───────────────────────────────────┼─────────────────────┘
                         │ HTTP REST (Cookies)               │ WebSockets
                         ▼                                   │
┌────────────────────────────────────────────────────────────┼─────────────────────┐
│                             BACKEND RUNTIME (Node.js)      │                     │
│  ┌─────────────────────────────────────────────────────────┼──────────────────┐  │
│  │                         Express.js v5 Web Server        │                  │  │
│  │  ┌──────────────────────────────────────────────────────┼───────────────┐  │  │
│  │  │                      Middleware Pipeline             │               │  │  │
│  │  │  Helmet ➔ CORS ➔ Parsers ➔ Rate Limiter ➔ VerifyJWT ➔ Zod Validation │  │  │
│  │  └──────────────────────────────┬───────────────────────────────────────┘  │  │
│  │                                 │                                          │  │
│  │                                 ▼                                          │  │
│  │  ┌──────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                         Controllers & Services                       │  │  │
│  │  │  auth.controller │ note.controller │ user.controller │ email.service │  │  │
│  │  └───────────┬──────────────────┬───────────────────┬───────────────┬───┘  │  │
│  └──────────────┼──────────────────┼───────────────────┼───────────────┼──────┘  │
│                 │                  │                   │               │         │
│                 ▼                  ▼                   ▼               ▼         │
│         ┌──────────────┐   ┌───────────────┐   ┌───────────────┐ ┌─────────────┐ │
│         │   MongoDB    │   │ Redis Upstash │   │  Cloudinary   │ │  Socket.IO  │ │
│         │ (Mongoose)   │   │ (Cache-Aside) │   │ (Media CDN)   │ │  (Realtime) ├─┘
│         │ Users, Notes │   │ Fast Read TTL │   │ Image Hosting │ │  User Rooms │
│         └──────────────┘   └───────────────┘   └───────────────┘ └─────────────┘
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. 📂 Complete Project Folder Structure ------------>>

```
full-stack-project/
├── backend/
│   ├── server.js                        # Bootstraps HTTP + Socket.IO + Mongo + Redis
│   ├── package.json                     # Backend dependencies and scripts
│   ├── .env                             # Backend environment secrets
│   ├── public/temp/                     # Temporary buffer for Multer disk uploads
│   └── src/
│       ├── app.js                       # Express app configuration & middleware pipeline
│       ├── db/
│       │   ├── db.js                    # Mongoose connection logic
│       │   └── redis.js                 # Upstash Redis client connection
│       ├── models/
│       │   ├── user.model.js            # User Schema, bcrypt hooks, token methods
│       │   └── note.model.js            # Note Schema, compound & text indexes
│       ├── controllers/
│       │   ├── auth.controller.js       # Register, login, refresh tokens, email verify
│       │   ├── note.controller.js       # Notes CRUD, pagination, caching, socket emit
│       │   └── user.controller.js       # Profile querying and avatar updates
│       ├── routes/
│       │   ├── index.js                 # Unified root router
│       │   ├── auth.routes.js           # Auth route definitions
│       │   ├── note.routes.js           # Note CRUD route definitions
│       │   └── user.route.js            # User profile route definitions
│       ├── middleware/
│       │   ├── auth.middleware.js       # VerifyJWT authentication guard
│       │   ├── validate.middleware.js   # Zod request validation wrapper
│       │   ├── multer.middleware.js     # Disk storage file upload engine
│       │   ├── rateLimiter.middleware.js# Global & auth rate limiters
│       │   └── error.middleware.js      # Global error handling middleware
│       ├── services/
│       │   ├── auth.service.js          # Token generator helper
│       │   ├── cloudinary.service.js    # Cloudinary upload and destroy utilities
│       │   ├── email.service.js         # Brevo HTTP API email dispatcher (previously Nodemailer)
│       │   └── redisCache.service.js    # Cache-aside helper (get, set, invalidate)
│       ├── validators/
│       │   ├── auth.validators.js       # Auth request Zod schemas
│       │   ├── note.validators.js       # Note request Zod schemas
│       │   └── user.validators.js       # User profile Zod schemas
│       ├── utils/
│       │   ├── ApiError.js              # Standardized application error class
│       │   ├── ApiResponse.js           # Standardized JSON response envelope
│       │   ├── asyncHandler.js          # Wrapper eliminating try-catch boilerplate
│       │   └── cookieOptions.js         # Secure httpOnly cookie configuration
│       └── socket/
│           └── socket.js                # Socket.IO initialization and JWT auth
│
├── frontend/
│   ├── package.json                     # Frontend dependencies and scripts
│   ├── next.config.ts                   # Next.js compiler & image domain config
│   ├── tsconfig.json                    # TypeScript strict mode rules
│   ├── postcss.config.mjs               # PostCSS configuration for Tailwind
│   ├── app/
│   │   ├── layout.tsx                   # Root HTML layout with providers
│   │   ├── globals.css                  # Global Tailwind CSS variables
│   │   ├── error.tsx                    # Error boundary
│   │   ├── (auth)/                      # Auth route group (isolated layout)
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── verify-email/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   ├── reset-password/[token]/page.tsx
│   │   │   └── change-password/page.tsx
│   │   └── (main)/                      # Main application route group
│   │       ├── layout.tsx               # Main layout (Header, SocketListener, Footer)
│   │       ├── page.tsx                 # Dashboard / Note Grid / Landing View
│   │       └── (protected)/
│   │           ├── layout.tsx           # Route guard wrapper
│   │           └── profile/page.tsx     # User profile management page
│   ├── components/
│   │   ├── Header.tsx                   # Navbar with search, theme switch, user avatar
│   │   ├── Footer.tsx                   # App footer
│   │   ├── SearchBar.tsx                # Debounced search bar input
│   │   ├── LoadingSpinner.tsx           # Universal spinner component
│   │   ├── GuestLandingView.tsx         # Hero section for unauthenticated visitors
│   │   ├── DetailNotePage.tsx           # Full-screen note inspection view
│   │   ├── Toast.tsx & ToastProvider.tsx# Toast feedback system
│   │   ├── auth/
│   │   │   ├── AuthInitializer.tsx      # Session hydration on mount
│   │   │   └── ProtectedRoute.tsx       # Auth guard redirect component
│   │   ├── notes/
│   │   │   ├── NoteGrid.tsx             # Responsive CSS grid of notes
│   │   │   ├── NoteCard.tsx             # Note display card with actions
│   │   │   ├── CreateNoteModal.tsx      # Add / Edit note modal form
│   │   │   ├── DeleteModal.tsx          # Confirmation modal for note removal
│   │   │   ├── PaginationControls.tsx   # Page navigation button controls
│   │   │   └── TagFilterBar.tsx         # Tag filter pills
│   │   ├── profile/
│   │   │   ├── ProfileView.tsx          # Profile display card
│   │   │   └── ProfileEditForm.tsx      # Username & avatar edit form
│   │   ├── socket/
│   │   │   └── SocketListener.tsx       # Real-time event listener component
│   │   └── themes/
│   │       ├── ThemeToggle.tsx          # Dark / Light theme switcher button
│   │       └── ThemeProvider.tsx        # Next-themes wrapper
│   ├── store/
│   │   ├── useAuthStore.ts              # Zustand store for user identity & tokens
│   │   └── useNotesStore.ts             # Zustand store for notes CRUD & real-time sync
│   ├── services/
│   │   ├── auth.api.ts                  # Axios calls for authentication
│   │   ├── notes.api.ts                 # Axios calls for note operations
│   │   ├── user.api.ts                  # Axios calls for user profile
│   │   └── socket.service.ts            # Socket.IO client instance singleton
│   ├── schemas/
│   │   ├── auth.schema.ts               # Frontend Zod validation schemas
│   │   └── note.schema.ts               # Frontend note Zod validation schemas
│   ├── hooks/
│   │   ├── useQueryParams.ts            # Syncs search, tag, page with URL params
│   │   └── useSocketEvents.ts           # Binds socket events to Zustand actions
│   ├── types/
│   │   ├── auth.ts                      # TypeScript auth definitions
│   │   ├── note.ts                      # TypeScript note & pagination definitions
│   │   └── user.ts                      # TypeScript user profile definitions
│   └── lib/
│       └── axios.ts                     # Custom Axios instance with interceptors
```

---

## 6. ⚙️ Backend — Engineering From Scratch ------------>>

### Phase 1: Express Server & Middleware Architecture
- **Server Separation**: `app.js` configures routes and middleware, while `server.js` handles startup and attaches database connections, Redis, and Socket.IO to the native HTTP server.
- **Middleware Execution Order**:
  1. `helmet()` — Security headers.
  2. `cors({ origin: process.env.CLIENT_URL, credentials: true })` — Cross-origin access.
  3. `express.json({ limit: "16kb" })` & `express.urlencoded({ extended: true, limit: "16kb" })` — Body parsing.
  4. `cookieParser()` — Cookie extraction for `req.cookies`.
  5. `rateLimiter` — DoS mitigation.
  6. API Routes mounted under `/api/v1`.
  7. `errorHandler` — Global error interceptor.

---

### Phase 2: Database Modeling & Indexing (MongoDB + Mongoose)
- **User Schema**:
  - Indexed `username` and `email` fields for $O(1)$ lookups.
  - Pre-save password hashing via `bcrypt.hash`.
  - Helper methods: `generateAccessToken`, `generateRefreshToken`, `generateEmailVerificationToken`, and `generatePasswordResetToken`.
- **Note Schema**:
  - Fields: `title`, `description`, `imageUrl`, `imagePublicId`, `tags`, `isPinned`, and `user` (ref: User).
  - **Compound Index**: `{ user: 1, isPinned: -1, createdAt: -1 }` guarantees sub-millisecond retrieval of user notes sorted with pinned notes first.
  - **Text Index**: `{ title: "text", description: "text" }` enables full-text search capability.

---

### Phase 3: Dual-Token JWT Authentication System
- **Access Token (15 min)**: Stored in a secure, `httpOnly` cookie. Sent automatically with every API request.
- **Refresh Token (10 days)**: Stored in a separate `httpOnly` cookie and persisted in MongoDB `User.refreshToken`.
- **Silent Refresh**: When the access token expires, the client's Axios interceptor calls `POST /api/v1/auth/refresh-access-token`. The server validates the refresh token against the DB and issues a new access token without logging out the user.

---

### Phase 4: Notes Engine & Media Upload Pipeline
1. Client uploads an image using `multipart/form-data`.
2. Multer stores the file temporarily in `public/temp/`.
3. Cloudinary service uploads the file and obtains a CDN URL.
4. Local file is immediately removed from disk using `fs.unlinkSync()`.
5. Note document is saved with `imageUrl` and `imagePublicId`.
6. Deleting a note triggers `deleteFromCloudinary(note.imagePublicId)` to prevent orphaned cloud assets.

---

### Phase 5: Query Engine (Search, Filter, Sort, Pagination)
The `getNotes` controller handles dynamic querying:
- **Search**: Case-insensitive regex across title and description (`$or: [{ title: regex }, { description: regex }]`).
- **Tag Filtering**: Matches exact tags (`tags: tag.toLowerCase()`).
- **Pin Prioritization**: Always sorts pinned notes to top (`isPinned: -1`).
- **Pagination**: Converts `page` and `limit` to `skip = (page - 1) * limit`.
- **Concurrency**: Executes `Promise.all([Note.find(...), Note.countDocuments(...), Note.distinct("tags", ...)])` in parallel for optimal database throughput.

---

### Phase 6: In-Memory Caching Architecture (Redis / Upstash)
- **Key Generation**: Creates deterministic cache keys based on query parameters:
  `notes:{userId}:{"search":"","tag":"work","page":1,"limit":9}`
- **Cache-Aside Flow**:
  - `GET` requests check Redis first. On a hit, response time drops from ~80ms to ~2ms.
  - On a cache miss, data is read from MongoDB and written to Redis with a 30-minute TTL (`1800s`).
- **Cache Invalidation**: On write operations (`create`, `update`, `delete`, `togglePin`), `invalidateUserNotesCache(userId)` executes a pattern purge (`notes:{userId}:*`) to guarantee data freshness.

---

### Phase 7: Real-Time Synchronization Engine (Socket.IO)
- **Handshake Authentication**: Socket.IO middleware parses cookies from `socket.handshake.headers.cookie`, validates the JWT token, and attaches `socket.user`.
- **Room Isolation**: Clients join private rooms: `socket.join("user:" + userId)`.
- **Event Dispatching**: Whenever note mutations succeed, the backend broadcasts:
  - `note:created` -> Emitted on note creation.
  - `note:deleted` -> Emitted on note removal (`{ id: noteId }`).
  - `note:pinned` -> Emitted on pin status change.

---

### Phase 8: Transactional Email Infrastructure (Brevo HTTP API)
- **Email Verification**: Sends a 24-hour verification token to verify ownership upon registration.
- **Password Reset**: Dispatches a 15-minute cryptographically secure reset link.
- **Welcome Email**: Automatically sent once email verification succeeds.
- **Why Brevo HTTP API (not SMTP)?**: Cloud platforms like Render block outbound SMTP ports (587/465). Using Brevo's REST API over HTTPS (port 443) bypasses this restriction entirely.
- **Architecture**:
  ```
  auth.controller.js → sendVerificationEmail() → sendEmail()
                                                     ↓
                                              fetch('https://api.brevo.com/v3/smtp/email')
                                                     ↓ (HTTPS - Port 443, never blocked)
                                              Brevo delivers email to user's inbox
  ```
- **Key Requirement**: Sender email must be verified in Brevo Dashboard (Settings → Senders, domains, IPs). Brevo also requires one-time IP authorization when API is first called from a new server IP.

---

### Phase 9: Security Hardening & Global Error Handling
- **`ApiError` Class**: Extends JavaScript's native `Error` with HTTP status codes, structured error arrays, and stack traces.
- **`ApiResponse` Envelope**: Formats all JSON responses into `{ statusCode, data, message, success }`.
- **`asyncHandler` Wrapper**: Wraps asynchronous controllers in `(req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)`, eliminating try-catch duplication.
- **Global Error Middleware**: Intercepts unhandled exceptions and returns standardized error envelopes without exposing internal stack traces.

---

## 7. 🎨 Frontend — Engineering From Scratch ------------>>

### Phase 1: Next.js 16 App Router & Route Groups
- `app/(auth)/*`: Login, register, email verification, and password recovery pages sharing a centered card layout.
- `app/(main)/*`: Dashboard, note grid, header, and search filters.
- `app/(main)/(protected)/*`: Route-guarded pages such as `/profile`.

---

### Phase 2: API Client & Auto-Token-Refresh Interceptor
Located in `frontend/lib/axios.ts`:
- Sets up an Axios response interceptor listening for `401 Unauthorized`.
- Uses a shared `refreshPromise` singleton to prevent multiple concurrent refresh calls.
- On refresh success, replays the original failed requests. On failure, clears local state and redirects to `/login`.

---

### Phase 3: Global State Architecture (Zustand)
- **`useAuthStore`**: Stores `user` entity, `isAuthenticated` status, profile fetchers, and session hydration from cookies.
- **`useNotesStore`**: Stores `notes` list, pagination state, active tag filters, and real-time socket mutators.
- **Optimistic Updates**: Pin toggle updates local UI state immediately and rolls back if the network request fails.

---

### Phase 4: Forms & Client-Side Schema Validation
- Uses **React Hook Form** paired with **Zod** resolvers.
- Validates field constraints, password strengths, and email formats with instant user feedback before submitting network requests.

---

### Phase 5: Dashboard, Search & Filter System
- `useQueryParams` hook synchronizes user inputs (search keywords, tag selections, active page) with browser URL query parameters.
- Allows bookmarks, browser back/forward navigation, and shareable filtered views.

---

### Phase 6: Real-Time Client Socket Integration
- `socket.service.ts`: Manages the Socket.IO client connection.
- `useSocketEvents.ts`: Listens for `note:created` and `note:deleted` events.
- Appends newly created notes to the top of the Zustand store and removes deleted notes instantly across all active tabs.

---

### Phase 7: Profile Management & Media Updates
- Allows updating username, email, and avatar image.
- Sends updated avatar as `FormData` to `/api/v1/update-user-avatar` and syncs the new profile state across the entire UI.

---

### Phase 8: Theme System (Dark / Light Mode)
- Built using `next-themes` with Tailwind CSS variables.
- Persists user theme preference in `localStorage` with zero flash of unstyled content (FOUC).

---

## 8. ✅ Features Checklist ------------->>

### Authentication & Security
- [x] User registration with avatar upload
- [x] Email verification (24-hour expiry link)
- [x] Login with JWT (Access + Refresh tokens)
- [x] Auto token refresh via Axios interceptor
- [x] Logout (clears cookies + disconnects socket)
- [x] Change password (authenticated)
- [x] Forgot password (email reset link)
- [x] Reset password (15-minute expiry link)
- [x] Welcome email after verification
- [x] Protected routes (frontend + backend)
- [x] Rate limiting (global + auth-specific)
- [x] Helmet security headers & CORS origin whitelist
- [x] Zod validation on both frontend & backend

### Notes Management
- [x] Create notes with title, description, tags, and image
- [x] Edit notes (update any field including image)
- [x] Delete notes (with Cloudinary image cleanup)
- [x] Pin/Unpin notes (pinned always appear first)
- [x] Search notes by title or description (regex & text index)
- [x] Filter notes by tags
- [x] Sort notes (by date or title, ascending/descending)
- [x] Pagination with dynamic page controls

### Real-Time & WebSockets
- [x] Live note creation across tabs/devices
- [x] Live note deletion across tabs/devices
- [x] Socket.IO with JWT cookie authentication
- [x] User-specific WebSocket room isolation

### Performance & Caching
- [x] Redis caching on notes queries (30-min TTL)
- [x] Smart cache invalidation on write operations
- [x] MongoDB compound & text indexes
- [x] Optimistic UI updates (pin toggle)
- [x] Parallel database queries with `Promise.all`

### User Experience
- [x] Dark/Light theme toggle with persistence
- [x] Responsive layout (mobile & desktop friendly)
- [x] Toast notifications (`react-hot-toast`)
- [x] Loading skeleton and spinner states
- [x] Error boundary handler
- [x] Guest landing page view
- [x] Session persistence across page reloads

---

## 9. 🔗 Complete API Endpoints Reference ------------>>

### Auth Routes — `/api/v1/auth`
| Method | Endpoint | Auth Required | Rate Limited | Description |
|---|---|---|---|---|
| POST | `/register` | No | Yes (20 / 15m) | Register user with optional avatar |
| POST | `/login` | No | Yes (20 / 15m) | Login and receive `httpOnly` cookies |
| POST | `/logout` | No | No | Clear authentication cookies |
| POST | `/change-password` | Yes (JWT) | No | Update password with old password verification |
| POST | `/refresh-access-token` | No (Cookie) | No | Issues new access token via refresh token |
| GET | `/verify-email/:token` | No | Yes (20 / 15m) | Verifies email via cryptographic token |
| POST | `/forgot-password` | No | Yes (20 / 15m) | Sends password reset email |
| POST | `/reset-password/:token` | No | Yes (20 / 15m) | Resets password with valid reset token |

### Notes Routes — `/api/v1/notes`
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/create-note` | Yes (JWT) | Create note (supports `multipart/form-data`) |
| GET | `/get-notes` | Yes (JWT) | Fetch notes (search, filter, sort, paginate, cached) |
| PATCH | `/:id` | Yes (JWT) | Update note details or replace image |
| DELETE | `/:id` | Yes (JWT) | Delete note and destroy Cloudinary image |
| PATCH | `/:id/pin` | Yes (JWT) | Toggle note pinned status |

### User Routes — `/api/v1`
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | `/get-user-profile` | Yes (JWT) | Fetch authenticated user profile |
| PATCH | `/update-user-details` | Yes (JWT) | Update username and email |
| PATCH | `/update-user-avatar` | Yes (JWT) | Upload and update user avatar |

---

## 10. 🔐 Environment Variables Specification ------------>>

### Backend (`backend/.env`)
```env
# Server
PORT=8000
NODE_ENV=development

# MongoDB Atlas
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/cloudnotes?retryWrites=true&w=majority

# JWT Secrets
ACCESS_TOKEN_SECRET=your_super_secret_access_token_key_here
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_here
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary CDN
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Brevo Email Configuration (HTTP API — SMTP ports blocked on Render)
BREVO_API_KEY=xkeysib-your_brevo_api_key_here
SMTP_FROM_EMAIL=your_verified_sender_email@gmail.com
SMTP_FROM_NAME=CloudNotes

# Upstash Redis
REDIS_URL=rediss://default:your_redis_password@your_host.upstash.io:6379

# Client Origin
CLIENT_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
```

---

## 11. 🚀 How To Run Locally ------------>>

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB Atlas** database instance (or local MongoDB)
- **Cloudinary** account credentials
- **Brevo** account with verified sender email and API key (free tier: 300 emails/day)
- **Upstash Redis** database instance (or local Redis)

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd full-stack-project
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env and configure variables
cp .env.example .env

# Create temp upload directory
mkdir -p public/temp

# Start development server
npm run dev
# Backend starts on http://localhost:8000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Create .env.local
cp .env.local.example .env.local

# Start Next.js development server
npm run dev
# Frontend starts on http://localhost:3000
```

---

## 12. 🌐 Production Deployment Guide ------------>>

Deploying a modern full-stack application with **WebSockets, Redis caching, and cross-origin cookies** requires specific production architecture to ensure everything works seamlessly.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              PRODUCTION DEPLOYMENT TOPOLOGY                            │
│                                                                                        │
│   [ Frontend (Next.js 16) ]               [ Backend Web Service (Node.js + Sockets) ]  │
│      Hosted on: VERCEL                                Hosted on: RENDER / RAILWAY      │
│   URL: https://cloudnotes.vercel.app              URL: https://api.cloudnotes.com      │
│               │                                                   │                    │
│               │──── REST API (HTTP + Cookies: SameSite=None) ────►│                    │
│               │◄─── WebSocket (WSS bidirectional stream) ────────►│                    │
│                                                                   │                    │
│                                      ┌────────────────────────────┴─────────────┐      │
│                                      ▼                            ▼             ▼      │
│                             [ MongoDB Atlas ]             [ Upstash Redis ] [ Cloudinary]
│                             (Database Cluster)            (In-Memory Cache) (Media CDN) │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### ☁️ Recommended Deployment Platforms

| Component | Recommended Platform | Why? | Free Tier Available? |
|---|---|---|---|
| **Frontend** | **Vercel** | Native support for Next.js App Router, global edge CDN, automatic SSL & CI/CD from Git | ✅ Yes |
| **Backend** | **Render** or **Railway** | Supports long-running persistent Node.js processes & WebSocket connections required by Socket.IO | ✅ Yes |
| **Database** | **MongoDB Atlas** | Fully managed MongoDB cluster in cloud with automated backups | ✅ Yes (M0 Free Tier) |
| **Cache** | **Upstash Redis** | Serverless/Managed Redis with low latency and TLS support | ✅ Yes (10k requests/day) |
| **Media CDN** | **Cloudinary** | Global image transformation and CDN delivery | ✅ Yes (Free tier) |
| **Email** | **Brevo HTTP API** | Reliable transactional email delivery via HTTPS (SMTP blocked on Render) | ✅ Yes (300/day free) |

---

### 📋 Step-by-Step Deployment Walkthrough

#### Step 1: Prepare Cloud Databases & Services
1. **MongoDB Atlas**:
   - Go to **Network Access** → Click **Add IP Address** → Choose **Allow Access from Anywhere (`0.0.0.0/0`)** (Required for dynamic cloud IP servers like Render/Vercel).
   - Go to **Database Access** → Create a user with read/write permissions.
   - Click **Connect** → Choose **Drivers (Node.js)** → Copy your connection string (`MONGO_URI`).
2. **Upstash Redis**:
   - Create a Redis database in Upstash console.
   - Copy the `REDIS_URL` connection string (starts with `rediss://...`).
3. **Cloudinary**:
   - Note down `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
4. **Brevo (Email Service)**:
   - Sign up at [brevo.com](https://brevo.com) (free — 300 emails/day).
   - Go to **Settings → Senders, domains, IPs** → Add and verify your sender email address.
   - Go to **Settings → SMTP & API → API keys & MCP** tab → Generate an API key (starts with `xkeysib-`).
   - **Important**: On first API call from a new server IP, Brevo sends a verification email to authorize the IP. Click "Yes, authorize" — this is a one-time step.

---

#### Step 2: Deploy Backend to Render (or Railway)

1. **Push your code to GitHub** (Ensure `.env` and `node_modules` are in `.gitignore`).
2. Log in to [Render.com](https://render.com) and click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Configure the service settings:
   - **Name**: `cloudnotes-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Under **Environment Variables**, add all backend secrets:
   ```env
   NODE_ENV=production
   PORT=8000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/cloudnotes?retryWrites=true&w=majority
   ACCESS_TOKEN_SECRET=your_super_strong_production_access_secret
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_SECRET=your_super_strong_production_refresh_secret
   REFRESH_TOKEN_EXPIRY=10d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   BREVO_API_KEY=xkeysib-your_brevo_api_key_here
   SMTP_FROM_EMAIL=your_verified_sender@gmail.com
   SMTP_FROM_NAME=CloudNotes
   REDIS_URL=rediss://default:your_redis_key@your_host.upstash.io:6379
   CLIENT_URL=https://cloudnotes-frontend.vercel.app
   ```
6. Click **Deploy Web Service**.
7. Once deployed, copy your live backend URL (e.g. `https://cloudnotes-backend.onrender.com`).

---

#### Step 3: Deploy Frontend to Vercel

1. Log in to [Vercel.com](https://vercel.com) and click **Add New...** → **Project**.
2. Select your GitHub repository.
3. In project configuration:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click `Edit` and select `frontend`.
4. Under **Environment Variables**, add:
   ```env
   NEXT_PUBLIC_API_URL=https://cloudnotes-backend.onrender.com/api/v1
   NEXT_PUBLIC_SOCKET_URL=https://cloudnotes-backend.onrender.com
   ```
5. Click **Deploy**.
6. Vercel will build and assign a production URL (e.g. `https://cloudnotes-frontend.vercel.app`).

---

#### Step 4: Sync Backend CORS & Cookies with Production Frontend URL
1. Go back to your **Render Backend Dashboard** → **Environment Variables**.
2. Update `CLIENT_URL` with your exact live Vercel URL:
   ```env
   CLIENT_URL=https://cloudnotes-frontend.vercel.app
   ```
3. Save changes — Render will automatically redeploy with the updated CORS whitelist.

---

### ⚠️ Critical Production Gotchas & Synchronization Rules

When running a decoupled full-stack app across two different cloud domains (e.g. `vercel.app` & `onrender.com`), you must understand these 4 critical production mechanisms:

#### 1. 🍪 Cross-Origin `httpOnly` Cookies (`SameSite=None; Secure`)
- **Problem**: In local development, frontend (`localhost:3000`) and backend (`localhost:8000`) are on the same domain (`localhost`). In production, `vercel.app` and `onrender.com` are **third-party cross-site domains**.
- **Rule**: In production, your cookies **MUST** have:
  ```javascript
  // backend/src/utils/cookieOptions.js
  export const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",     // HTTPS only in prod
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // "none" allows cross-domain cookies
      maxAge: 10 * 24 * 60 * 60 * 1000,
  };
  ```
- If `sameSite` is `lax` in production across different domains, browsers will reject the cookies and authentication will fail!

#### 2. ⚡ Real-Time Socket.IO Synchronization (WSS Protocol)
- **Problem**: Next.js Serverless Functions do not support persistent WebSocket connections.
- **Why Render/Railway?**: Render runs a stateful Node.js container with long-lived WebSocket connections (`wss://`).
- **Client Configuration**:
  ```typescript
  // frontend/services/socket.service.ts
  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      withCredentials: true,
      transports: ["websocket", "polling"], // prioritize websocket, fallback to polling
  });
  ```

#### 3. ⏰ Render Free-Tier Keep-Alive (Spin-down Prevention)
- Render's free tier spins down (sleeps) after 15 minutes of inactivity, causing a 30-50 second cold start delay.
- **Solution**: Set up a free ping monitor (e.g., [UptimeRobot](https://uptimerobot.com) or [cron-job.org](https://cron-job.org)) to ping your backend health route every 10 minutes:
  `GET https://cloudnotes-backend.onrender.com/health`
- **Health Endpoint**: A lightweight `/health` endpoint returning `{"status":"ok"}` was added in `app.js` specifically for keep-alive pings (avoids large HTML responses that cause cron-job "output too large" errors).

#### 4. 📧 SMTP Port Blocking on Cloud Platforms
- **Problem**: Render (and most free-tier cloud platforms) block outbound SMTP connections on ports 587 and 465 to prevent spam. This causes `ETIMEDOUT` errors when using Nodemailer with any SMTP provider (Gmail, Brevo, SendGrid, etc.).
- **Solution**: Use email provider's **HTTP/REST API** instead of SMTP. Brevo's API (`https://api.brevo.com/v3/smtp/email`) sends emails over HTTPS (port 443), which is never blocked.
- **One-Time IP Authorization**: When Brevo detects an API call from a new server IP, it sends a security email asking you to authorize the IP. This is a one-time step per server.

#### 5. 🖼️ Next.js Image Optimization Domain Whitelisting
- When images are loaded from Cloudinary CDN on Next.js, configure `next.config.ts`:
  ```typescript
  // frontend/next.config.ts
  const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'res.cloudinary.com',
          pathname: '/**',
        },
      ],
    },
  };
  export default nextConfig;
  ```

---

## 13. 📚 Key Learnings & Engineering Mastery ------------>>

Building this application from scratch provided deep, hands-on mastery over production full-stack engineering challenges. Below is a detailed breakdown of **what we learned, why we used it, and how each concept solves real-world problems**.

---

### 🧠 Backend Engineering Learnings

#### 1. Strict Express Middleware Pipeline & Lifecycle
- **What We Learned**: Express middleware functions execute in exact sequential order. A misplaced parser or authentication guard can break the request cycle or expose security vulnerabilities.
- **What We Used**: `helmet()`, `cors()`, `express.json()`, `cookieParser()`, `rateLimiter`, `verifyJWT`, `validate()`, and a centralized `errorHandler`.
- **Key Takeaway**:
  ```
  Security (Helmet, CORS) ➔ Parsers (Body, Cookie) ➔ Rate Limiters ➔ Auth (VerifyJWT) ➔ Validation (Zod) ➔ Controller ➔ Error Handler (4 params)
  ```
- Global error-handling middleware **must accept 4 arguments** `(err, req, res, next)` and sit at the very end of `app.js` to catch all forwarded errors.

#### 2. Dual-Token JWT Authentication with httpOnly Cookies
- **What We Learned**: Storing JWT tokens in browser `localStorage` leaves applications vulnerable to Cross-Site Scripting (XSS) attacks. Using dual tokens balances security with a seamless user experience.
- **What We Used**: `jsonwebtoken`, `cookieOptions`, `cookie-parser`.
- **Implementation Strategy**:
  - **Access Token (15m)**: Short expiration minimizes the damage window if a token is compromised.
  - **Refresh Token (10d)**: Stored in a secure `httpOnly` cookie and hashed/stored in MongoDB to allow remote session revocation.
  - **Silent Refresh**: The client automatically requests a fresh access token without forcing the user to log in again.

#### 3. Database Modeling & High-Performance Indexing (MongoDB + Mongoose)
- **What We Learned**: Without database indexes, MongoDB performs full collection scans ($O(N)$ complexity), creating massive bottlenecks under load.
- **What We Used**: `mongoose` Schema, Compound Indexes, Text Indexes, Pre-save Hooks.
- **Implementation Strategy**:
  - **Compound Index**: `{ user: 1, isPinned: -1, createdAt: -1 }` guarantees queries sorted by pinned notes and date execute in $O(\log N)$ time.
  - **Text Index**: `{ title: "text", description: "text" }` enables fast, indexed keyword search.
  - **Concurrency**: Used `Promise.all([Note.find(), Note.countDocuments(), Note.distinct("tags")])` to execute parallel database queries, cutting response times by ~60%.

#### 4. Sub-Millisecond In-Memory Caching (Redis / Upstash)
- **What We Learned**: Database queries with complex filters, regex searches, and pagination are expensive. Redis caching offloads repeated reads from MongoDB.
- **What We Used**: `@redis/client` connecting via TLS to Upstash Redis.
- **Implementation Strategy**:
  - **Cache-Aside Pattern**: On `GET /notes`, compute a deterministic key `notes:{userId}:{queryParams}`. If found in Redis (HIT ⚡ ~2ms), return instantly; if not (MISS 🐢), query MongoDB and store in Redis with a 30-minute TTL (`1800s`).
  - **Pattern-Based Invalidation**: On write operations (`create`, `update`, `delete`, `pin`), execute `invalidatePattern("notes:" + userId + ":*")` to immediately clear stale cached queries for that user.

#### 5. Real-Time Event-Driven Architecture (Socket.IO)
- **What We Learned**: Polling APIs for real-time updates creates excessive server load. WebSockets provide persistent, low-latency bidirectional communication.
- **What We Used**: `socket.io` server attached to native Node `http.Server`.
- **Implementation Strategy**:
  - Handshake authentication extracts and validates the JWT from `socket.handshake.headers.cookie`.
  - Sockets automatically join private rooms (`user:{userId}`).
  - Mutations broadcast events (`note:created`, `note:deleted`, `note:pinned`) exclusively to that user's active devices and tabs.

#### 6. Multi-Step Media Pipeline (Multer + Cloudinary)
- **What We Learned**: Processing file uploads directly in server memory can cause memory leaks and server crashes under high concurrent load.
- **What We Used**: `multer.diskStorage`, `cloudinary` SDK, `fs.unlinkSync`.
- **Implementation Strategy**:
  - Stream incoming files to a temporary disk buffer (`public/temp/`).
  - Upload from disk to Cloudinary cloud CDN with automated resizing and format optimization.
  - Clean up the local temporary file in a `finally` block to prevent disk bloat.
  - Delete old Cloudinary media via `public_id` when notes or user avatars are deleted.

#### 7. Clean Code & Asynchronous Error Handling
- **What We Learned**: Writing manual `try-catch` blocks inside every controller creates repetitive boilerplate and inconsistent error responses.
- **What We Used**: Custom `ApiError` class, `ApiResponse` class, and `asyncHandler` Higher-Order Function.
- **Implementation Strategy**:
  ```javascript
  export const asyncHandler = (requestHandler) => {
      return (req, res, next) => {
          Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
      };
  };
  ```

#### 8. Fail-Fast Input Validation at the Boundary (Zod)
- **What We Learned**: Relying solely on database validation allows malformed payloads to waste server compute and clutter controllers.
- **What We Used**: `zod` schemas executed inside validation middleware (`validate.middleware.js`).
- **Implementation Strategy**: Validates `req.body`, `req.query`, and `req.params` against strict schemas before controllers run, returning structured field-level error messages.

#### 9. API Security Hardening & Rate Limiting
- **What We Learned**: Public APIs are vulnerable to automated bot scraping, credential stuffing, and brute-force attacks.
- **What We Used**: `express-rate-limit`, `helmet`, `bcryptjs`.
- **Implementation Strategy**:
  - Tiered rate limiting: 200 requests/15m globally, restricted to 20 requests/15m on sensitive auth routes (`/register`, `/login`, `/forgot-password`).
  - Password hashing with bcrypt using 10 salt rounds and pre-save model hooks.

#### 10. Cryptographic Token Generation & Email Delivery (Brevo HTTP API)
- **What We Learned**: Sensitive tokens (email verification, password resets) should never be stored in plain text in the database. Additionally, cloud platforms block SMTP ports — making traditional Nodemailer + SMTP setups unusable in production.
- **What We Used**: Node's native `crypto.randomBytes`, SHA-256 hashing, Brevo HTTP API via `fetch()`.
- **Implementation Strategy**: Generate an unhashed token for the email link, hash it with SHA-256 before saving to MongoDB, and verify matching hashes upon receipt.
- **Email Delivery Evolution & Debugging Journey**:
  1. **Attempt 1 — Nodemailer + Gmail SMTP**: Gmail blocks connections from cloud server IPs (Render, AWS, etc.) to prevent spam. Emails silently failed with no error logs.
  2. **Attempt 2 — Nodemailer + Brevo SMTP**: Brevo SMTP worked locally, but Render's free tier blocks outbound connections on ports 587/465. Error: `ETIMEDOUT`, code: `CONN`.
  3. **Final Solution — Brevo HTTP API**: Switched to Brevo's REST API (`https://api.brevo.com/v3/smtp/email`) using native `fetch()`. HTTPS uses port 443 which is never blocked by any hosting provider.
- **Key Dev Terms Learned**:
  - **Nodemailer** = Email Client Library (npm package — the "vehicle")
  - **Gmail SMTP / Brevo / SendGrid / Resend** = Email Service Provider / ESP (the "fuel")
  - **SMTP** = Simple Mail Transfer Protocol (port 587/465) — blocked on many cloud platforms
  - **HTTP API** = REST-based email sending over HTTPS (port 443) — universally supported

---

### 🎨 Frontend Engineering Learnings

#### 1. Next.js 16 App Router & Route Group Architecture
- **What We Learned**: Route groups `(auth)` and `(main)` allow sharing distinct layouts (e.g. centered auth cards vs dashboard with header/footer/socket listeners) without adding extra URL path segments.
- **What We Used**: Next.js 16 App Router, nested layouts, loading skeletons, error boundaries.

#### 2. Minimalist Global State Management (Zustand)
- **What We Learned**: Redux requires extensive boilerplate (reducers, actions, dispatchers), while React Context causes unnecessary re-renders across the component tree.
- **What We Used**: `zustand` stores (`useAuthStore`, `useNotesStore`).
- **Implementation Strategy**:
  - Encapsulated async actions (`fetchNotes`, `togglePin`, `login`, `fetchProfile`).
  - Real-time socket handlers (`handleRealtimeCreated`, `handleRealtimeDeleted`) that mutate state immutably and trigger localized re-renders.

#### 3. Enterprise Axios Interceptor with Silent Token Refresh Queue
- **What We Learned**: When multiple parallel API calls fail with `401 Unauthorized`, making concurrent refresh requests causes token race conditions.
- **What We Used**: `axios` instance with response interceptors and a shared `refreshPromise` lock.
- **Implementation Strategy**:
  - Catches `401` errors.
  - Queues pending requests behind a single `refreshPromise`.
  - Calls `/auth/refresh-access-token`. Once refreshed, all queued requests replay automatically without user interruption.

#### 4. High-Performance Form Handling (React Hook Form + Zod)
- **What We Learned**: Controlled React inputs re-render on every keystroke, degrading performance in complex modal forms.
- **What We Used**: `react-hook-form`, `@hookform/resolvers/zod`, `zod`.
- **Implementation Strategy**: Uses uncontrolled inputs registered with React Hook Form. Validates synchronously against Zod schemas matching backend constraints.

#### 5. Optimistic UI Updates for Instant Responsiveness
- **What We Learned**: Waiting for server network round-trips for simple user actions (like pinning a note) makes the UI feel sluggish.
- **What We Used**: Zustand state manipulation with rollback on error.
- **Implementation Strategy**:
  - When the user clicks the Pin button, the note's `isPinned` state flips in the UI immediately.
  - If the backend request fails, the store rolls back to the previous state and displays an error toast.

#### 6. Real-Time Client WebSockets Integration (Socket.IO Client)
- **What We Learned**: Opening new socket connections on every component mount creates memory leaks and duplicate listeners.
- **What We Used**: `socket.io-client` singleton with `useSocketEvents` custom hook.
- **Implementation Strategy**:
  - Connection is lazily initialized once authenticated.
  - Event listeners are attached in `useEffect` and cleaned up with `socket.off()` in the cleanup return function.

#### 7. URL Query Parameter Synchronization (`useQueryParams`)
- **What We Learned**: Storing search filters, selected tags, and pagination solely in component state means users lose their view when refreshing or sharing URLs.
- **What We Used**: Next.js `useRouter`, `usePathname`, `useSearchParams`.
- **Implementation Strategy**: Custom hook that synchronizes search terms, tag filters, and page numbers with URL parameters (`?search=node&tag=backend&page=2`), enabling browser history navigation and bookmarking.

#### 8. Client-Side Authentication Guards & Session Recovery
- **What We Learned**: Serverless page reloads need seamless session hydration from cookies without flashing unauthenticated screens.
- **What We Used**: `AuthInitializer` and `ProtectedRoute` components.
- **Implementation Strategy**:
  - `AuthInitializer` checks for active sessions on app boot.
  - `ProtectedRoute` displays a loading spinner during verification and smoothly redirects unauthenticated visitors to `/login`.

#### 9. Accessible Dynamic Theming (Dark / Light Mode)
- **What We Learned**: Theme toggling without proper synchronization causes a Flash of Unstyled Content (FOUC).
- **What We Used**: `next-themes` with Tailwind CSS v4 CSS variables.
- **Implementation Strategy**: Theme preference is stored in `localStorage` and applied to the root `<html>` element before hydration to prevent visual flickering.

#### 10. End-to-End TypeScript Type Safety
- **What We Learned**: Untyped API responses lead to runtime `TypeError: undefined is not an object` bugs.
- **What We Used**: Strict TypeScript interfaces for `User`, `Note`, `PaginationData`, `ApiResponse`, and form payloads.
- **Implementation Strategy**: Full type safety from backend DTOs to API services, Zustand store state, and React component props.

---

## 👨‍💻 Author

**Akash Pandey**  
*Full Stack Developer* — Built with ❤️ as a comprehensive full-stack learning project.
