# 🟠 Phase 3: Production Best Practices & Security Master Plan

Yeh implementation document aapke project (**`backend`**) ko enterprise-grade, secure, aur production-ready banane ke liye banaya gaya hai. Aap ise step-by-step follow karke manually implement kar sakte hain.

---

## 📑 Index
1. [Architecture & Overview](#1-architecture--overview)
2. [Dependencies Installation](#2-dependencies-installation)
3. [Step 1: Standard Utilities & Global Error Handling](#3-step-1-standard-utilities--global-error-handling)
4. [Step 2: Zod Input Validation (Server-side)](#4-step-2-zod-input-validation-server-side)
5. [Step 3: Security, Helmet & Rate Limiting](#5-step-3-security-helmet--rate-limiting)
6. [Step 4: Refactoring Controllers & Routes](#6-step-4-refactoring-controllers--routes)
7. [Step 5: Testing & Verification Guide](#7-step-5-testing--verification-guide)

---

## 1. Architecture & Overview

### 🎯 Objective:
Abhi tak backend me:
- Request validation controllers ke andar manual `if-else` se ho rahi thi.
- Error handling har function me alag `try-catch` se ho rahi thi jisme status code mismatch (e.g. `400` vs `401`) ka risk tha.
- Rate limiting na hone se brute-force login attacks aur DoS ka risk tha.
- HTTP security headers missing the (`helmet`).

### 🏗️ Target Flow:
```
Client / Frontend
  │
  ▼
[1] Helmet Security Headers
  │
  ▼
[2] Rate Limiter Middleware
  │
  ▼
[3] Body & Cookie Parsers
  │
  ▼
[4] Zod Validation Middleware (req.body / req.params)
  │
  ▼
[5] Auth Middleware (VerifyJWT)
  │
  ▼
[6] Controller (wrapped with asyncHandler)
  ├── Success ──► new ApiResponse(200, data, message)
  └── Error   ──► throw new ApiError(statusCode, message)
                    │
                    ▼
              [7] Global Error Middleware (Clean JSON Response)
```

---

## 2. Dependencies Installation

Backend folder ke terminal me ye 3 packages install karein:

```bash
cd "/Users/akashpandey04/Desktop/Web Development/Full Stack Practice /full-stack-project/backend"
npm install zod helmet express-rate-limit
```

### Packages ka Kaam:
1. **`zod`**: TypeScript-first schema declaration & validation library.
2. **`helmet`**: 15+ standard HTTP security headers automatically inject karta hai.
3. **`express-rate-limit`**: DDoS aur brute-force attacks se bachane ke liye IP-based throttling lagata hai.

---

## 3. Step 1: Standard Utilities & Global Error Handling

### 📁 1.1 `backend/src/utils/ApiError.js`
> **Kyu chahiye:** Standard custom error class jo JavaScript ke native `Error` ko extend karti hai. Isse hum controller me `throw new ApiError(404, "User not found")` likh sakte hain.

Create file `backend/src/utils/ApiError.js`:

```javascript
class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
```

---

### 📁 1.2 `backend/src/utils/ApiResponse.js`
> **Kyu chahiye:** Poore backend me har API response ka structure identical rakhta hai taaki frontend ko hamesha `{ success, statusCode, data, message }` mile.

Create file `backend/src/utils/ApiResponse.js`:

```javascript
class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}

export { ApiResponse };
```

---

### 📁 1.3 `backend/src/utils/asyncHandler.js`
> **Kyu chahiye:** Controllers me repetitive `try { ... } catch (error) { ... }` ko replace karta hai. Jo bhi error aayega, ye automatically usko Express ke global error handler me forward kar dega.

Create file `backend/src/utils/asyncHandler.js`:

```javascript
export const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};
```

---

### 📁 1.4 `backend/src/middleware/error.middleware.js`
> **Kyu chahiye:** Global safety net jo poore application me aane wale errors ko format karke JSON response deta hai (server hang ya crash hone se bachata hai).

Create file `backend/src/middleware/error.middleware.js`:

```javascript
import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
    let error = err;

    // Agar error custom ApiError nahi hai (e.g. Mongoose, JWT, Zod error), toh use convert karein
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal Server Error";
        error = new ApiError(statusCode, message, error?.errors || [], err.stack);
    }

    const response = {
        success: false,
        statusCode: error.statusCode,
        message: error.message,
        errors: error.errors,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
    };

    return res.status(error.statusCode).json(response);
};
```

---

## 4. Step 2: Zod Input Validation (Server-side)

### 📁 2.1 `backend/src/middleware/validate.middleware.js`
> **Kyu chahiye:** Ye generic middleware route par lagta hai. Ye `req.body`, `req.query`, aur `req.params` ko Zod schema ke sath check karta hai. Agar input galat hai toh controller tak jaane hi nahi deta, wahi se `400 Bad Request` return kar deta hai.

Create file `backend/src/middleware/validate.middleware.js`:

```javascript
import { ApiError } from "../utils/ApiError.js";

export const validate = (schema) => (req, res, next) => {
    try {
        const parsed = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        // Validated & trimmed sanitized data re-assign karein
        if (parsed.body) req.body = parsed.body;
        if (parsed.query) req.query = parsed.query;
        if (parsed.params) req.params = parsed.params;

        next();
    } catch (error) {
        const errorMessages = error.errors?.map((err) => ({
            field: err.path.slice(1).join("."),
            message: err.message,
        })) || [];

        return next(new ApiError(400, errorMessages[0]?.message || "Validation Error", errorMessages));
    }
};
```

---

### 📁 2.2 `backend/src/validators/auth.validator.js`
> **Kyu chahiye:** Auth endpoints (`register`, `login`, `change-password`) ke rules define karta hai.

Create directory `backend/src/validators` and file `backend/src/validators/auth.validator.js`:

```javascript
import { z } from "zod";

export const registerSchema = z.object({
    body: z.object({
        username: z
            .string({ required_error: "Username is required" })
            .trim()
            .min(3, "Username must be at least 3 characters")
            .max(30, "Username cannot exceed 30 characters"),
        email: z
            .string({ required_error: "Email is required" })
            .trim()
            .email("Invalid email address"),
        password: z
            .string({ required_error: "Password is required" })
            .min(6, "Password must be at least 6 characters"),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().trim().email("Invalid email format").optional(),
        username: z.string().trim().optional(),
        password: z.string().min(1, "Password is required"),
    }).refine((data) => data.email || data.username, {
        message: "Email or Username is required",
        path: ["email"],
    }),
});

export const changePasswordSchema = z.object({
    body: z.object({
        oldPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(6, "New password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Confirm password is required"),
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "New password and Confirm password do not match",
        path: ["confirmPassword"],
    }),
});
```

---

### 📁 2.3 `backend/src/validators/note.validator.js`
> **Kyu chahiye:** Notes create aur update ke input ko sanitize aur limit karta hai.

Create file `backend/src/validators/note.validator.js`:

```javascript
import { z } from "zod";

export const createNoteSchema = z.object({
    body: z.object({
        title: z
            .string({ required_error: "Title is required" })
            .trim()
            .min(1, "Title cannot be empty")
            .max(120, "Title cannot exceed 120 characters"),
        description: z
            .string()
            .trim()
            .max(5000, "Description cannot exceed 5000 characters")
            .optional(),
    }),
});

export const updateNoteSchema = z.object({
    body: z.object({
        title: z.string().trim().min(1, "Title cannot be empty").max(120).optional(),
        description: z.string().trim().max(5000).optional(),
    }),
});
```

---

### 📁 2.4 `backend/src/validators/user.validator.js`
> **Kyu chahiye:** User profile update validation.

Create file `backend/src/validators/user.validator.js`:

```javascript
import { z } from "zod";

export const updateUserDetailsSchema = z.object({
    body: z.object({
        username: z.string().trim().min(3, "Username must be at least 3 characters").max(30).optional(),
        email: z.string().trim().email("Invalid email address").optional(),
    }).refine((data) => data.username || data.email, {
        message: "At least one field (username or email) is required to update",
    }),
});
```

---

## 5. Step 3: Security, Helmet & Rate Limiting

### 📁 3.1 `backend/src/middleware/rateLimiter.middleware.js`
> **Kyu chahiye:** Bots aur attackers ko block karta hai jo continuous requests bhej kar server down karne ya brute-force login karne ki koshish karte hain.

Create file `backend/src/middleware/rateLimiter.middleware.js`:

```javascript
import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";

// 1. General Limiter: Pure API ke liye (15 min me 200 requests per IP)
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        next(new ApiError(429, "Too many requests from this IP, please try again after 15 minutes."));
    },
});

// 2. Strict Auth Limiter: Login / Register brute-force attacks rokne ke liye (15 min me 20 attempts)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        next(new ApiError(429, "Too many authentication attempts. Please try again after 15 minutes."));
    },
});
```

---

### 📁 3.2 Update `backend/src/app.js`
> **Kyu chahiye:** Helmet, CORS, Body Parsers, Rate Limiter, Routes, aur Global Error Handler ko sahi order me execute karta hai.

Modify file `backend/src/app.js`:

```javascript
import express from "express";
import mainRouter from "./routes/index.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { globalLimiter } from "./middleware/rateLimiter.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

export const app = express();

// 1. Helmet Security Headers (Sabse pehle load hona chahiye)
app.use(helmet());

// 2. CORS Setup (Credentials allow karne ke sath)
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
}));

// 3. Request Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// 4. Global API Rate Limiter
app.use("/api/v1", globalLimiter);

// 5. App Routes
app.use("/api/v1", mainRouter);

// 6. Global Error Handling Middleware (Hamesha sabse LAST me hona zaroori hai!)
app.use(errorHandler);
```

---

## 6. Step 4: Refactoring Controllers & Routes

Ab hum routes me validators connect karenge aur controllers ko modern `asyncHandler` + `ApiResponse` standard me clean karenge.

---

### 📁 4.1 Update `backend/src/routes/auth.routes.js`
Modify file `backend/src/routes/auth.routes.js`:

```javascript
import { Router } from "express";
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    changePassword, 
    refreshAccessToken 
} from "../controllers/auth.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { VerifyJWT } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { 
    registerSchema, 
    loginSchema, 
    changePasswordSchema 
} from "../validators/auth.validator.js";
import { authLimiter } from "../middleware/rateLimiter.middleware.js";

const router = Router();

router.post("/register", authLimiter, upload.single("avatar"), validate(registerSchema), registerUser);
router.post("/login", authLimiter, validate(loginSchema), loginUser);
router.post("/logout", logoutUser);
router.post("/change-password", VerifyJWT, validate(changePasswordSchema), changePassword);
router.post("/refresh-access-token", refreshAccessToken);

export default router;
```

---

### 📁 4.2 Update `backend/src/routes/note.routes.js`
Modify file `backend/src/routes/note.routes.js`:

```javascript
import { Router } from "express";
import {
    createNewNote,
    deleteNote,
    getNotes,
    updateNote,
} from "../controllers/note.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { VerifyJWT } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createNoteSchema, updateNoteSchema } from "../validators/note.validator.js";

const router = Router();

router.route("/create-note").post(VerifyJWT, upload.single("image"), validate(createNoteSchema), createNewNote);
router.route("/get-notes").get(VerifyJWT, getNotes);
router.route("/:id").delete(VerifyJWT, deleteNote);
router.route("/:id").patch(VerifyJWT, upload.single("image"), validate(updateNoteSchema), updateNote);

export default router;
```

---

### 📁 4.3 Update `backend/src/routes/user.route.js`
Modify file `backend/src/routes/user.route.js`:

```javascript
import { Router } from "express";
import { getProfile, updateUserAvatar, updateUserDetails } from "../controllers/user.controller.js";
import { VerifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { updateUserDetailsSchema } from "../validators/user.validator.js";

const router = Router();

router.get("/get-user-profile", VerifyJWT, getProfile);
router.patch("/update-user-details", VerifyJWT, validate(updateUserDetailsSchema), updateUserDetails);
router.patch("/update-user-avatar", VerifyJWT, upload.single("avatar"), updateUserAvatar);

export default router;
```

---

### 📁 4.4 Refactored `backend/src/controllers/auth.controller.js`
Modify file `backend/src/controllers/auth.controller.js`:

```javascript
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../services/cloudinary.js";
import { accessTokenCookieOptions, refreshTokenCookieOptions } from "../utils/cookieOptions.js";
import jwt from "jsonwebtoken";
import { generateAccessAndRefreshTokens } from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// 1. REGISTER USER
export const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existingUser) {
        throw new ApiError(400, "User with this email or username already exists");
    }

    let avatarUrl = "";
    let avatarPublicId = "";

    if (req.file) {
        const avatar = await uploadOnCloudinary(req.file.path, "avatars");
        if (avatar) {
            avatarUrl = avatar.secure_url;
            avatarPublicId = avatar.public_id;
        }
    }

    const newUser = await User.create({
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatarUrl,
        avatarPublicId: avatarPublicId,
    });

    const createdUser = await User.findById(newUser._id).select("-password");

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User created successfully")
    );
});

// 2. LOGIN USER
export const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    const user = await User.findOne({
        $or: [
            ...(email ? [{ email }] : []),
            ...(username ? [{ username: username.toLowerCase() }] : []),
        ]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Password! Please try again");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    return res
        .status(200)
        .cookie("accessToken", accessToken, accessTokenCookieOptions)
        .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
        .json(
            new ApiResponse(
                200,
                {
                    _id: user._id,
                    email: user.email,
                    username: user.username,
                    avatar: user.avatar,
                },
                "User logged in successfully"
            )
        );
});

// 3. LOGOUT USER
export const logoutUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .clearCookie("accessToken", accessTokenCookieOptions)
        .clearCookie("refreshToken", refreshTokenCookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// 4. CHANGE PASSWORD
export const changePassword = asyncHandler(async (req, res) => {
    const currentPassword = req.body.currentPassword || req.body.oldPassword;
    const { newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(currentPassword);
    if (!isPasswordValid) {
        throw new ApiError(401, "Current password is wrong");
    }

    user.password = newPassword;
    await user.save();

    return res
        .status(200)
        .clearCookie("accessToken", accessTokenCookieOptions)
        .json(new ApiResponse(200, {}, "Password changed successfully. Please login again."));
});

// 5. REFRESH ACCESS TOKEN
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is missing");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await User.findById(decodedToken?._id);
    if (!user || user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is expired or has been used");
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

    return res
        .status(200)
        .cookie("accessToken", accessToken, accessTokenCookieOptions)
        .cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions)
        .json(
            new ApiResponse(
                200,
                {},
                "Access token refreshed successfully"
            )
        );
});
```

---

## 7. Step 5: Testing & Verification Guide

Jab aap ye charo steps implement kar lein, toh verify karne ke liye:

1. **Test Zod Validation (Postman se Invalid Input)**:
   - `POST http://localhost:8000/api/v1/auth/register` par invalid body bhejein:
     ```json
     { "username": "ab", "email": "wrong-email", "password": "123" }
     ```
   - Response me `400 Bad Request` ke sath specific error messages aane chahiye.

2. **Test Rate Limiter**:
   - `POST http://localhost:8000/api/v1/auth/login` par continuously 20+ baar request hit karein.
   - 20 requests ke baad `429 Too Many Requests` ka standard error aana chahiye.

3. **Test Security Headers (Helmet)**:
   - Browser DevTools -> Network Tab -> Response Headers me check karein:
     - `X-Powered-By: Express` hide ho chuka hoga.
     - `X-Content-Type-Options: nosniff` aur `X-Frame-Options: SAMEORIGIN` add ho chuke honge.

4. **Test Global Error Handling**:
   - Kisi endpoint par invalid Mongo ID pass karein. Backend HTML error page ke bajaye clean JSON error return karega.
