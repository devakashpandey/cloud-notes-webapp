// schemas/note.schema.ts
import { z } from 'zod';

export const noteSchema = z.object({
    title: z.string().min(1, "Title cannot be empty").max(100, "Title is too long"),
    description: z.string().max(1000, "Description too long").optional(),
});

export type NoteInput = z.infer<typeof noteSchema>;
