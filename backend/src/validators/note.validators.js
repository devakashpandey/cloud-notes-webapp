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

        // Tags optional validation (array or comma-separated string)
        tags: z.any().optional(),

        //isPinned optional validation (boolean or string)
        isPinned: z.any().optional(),
    }),
});

export const updateNoteSchema = z.object({
    body: z.object({
        title: z.string().trim().min(1, "Title cannot be empty").max(120).optional(),

        description: z.string().trim().max(5000).optional(),

        tags: z.any().optional(),

        isPinned: z.any().optional(),
    }),
});
