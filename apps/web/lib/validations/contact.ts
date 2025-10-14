import { z } from "zod";

/**
 * Contact Validation Schemas
 *
 * These schemas mirror the backend validation rules from CreateContactDto and UpdateContactDto
 * to provide client-side validation before submitting to the GraphQL API.
 *
 * Validation Rules (matching backend):
 * - name: Required, 1-255 characters, cannot be only whitespace
 * - email: Optional, valid email format
 * - phone: Optional, max 50 characters
 * - linkedInUrl: Optional, valid URL format
 * - company: Optional, max 255 characters
 * - industry: Optional, max 255 characters
 * - role: Optional, max 255 characters
 * - priority: Optional, one of HIGH, MEDIUM, LOW
 * - gender: Optional, one of MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY
 * - birthday: Optional, valid Date
 * - notes: Optional, max 10,000 characters
 */

// Enums matching GraphQL schema
export const PriorityEnum = z.enum(["HIGH", "MEDIUM", "LOW"]);
export type Priority = z.infer<typeof PriorityEnum>;

export const GenderEnum = z.enum([
  "MALE",
  "FEMALE",
  "OTHER",
  "PREFER_NOT_TO_SAY",
]);
export type Gender = z.infer<typeof GenderEnum>;

/**
 * CreateContactInput Zod Schema
 *
 * Used for creating new contacts.
 * Matches CreateContactDto validation rules from backend.
 */
export const createContactSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be less than 255 characters")
    .regex(/\S/, "Name cannot be only whitespace")
    .trim(),

  email: z.string().email("Invalid email format").or(z.literal("")).optional(),

  phone: z
    .string()
    .max(50, "Phone must be less than 50 characters")
    .or(z.literal(""))
    .optional(),

  linkedInUrl: z
    .string()
    .url("Invalid URL format")
    .or(z.literal(""))
    .optional(),

  company: z
    .string()
    .max(255, "Company must be less than 255 characters")
    .or(z.literal(""))
    .optional(),

  industry: z
    .string()
    .max(255, "Industry must be less than 255 characters")
    .or(z.literal(""))
    .optional(),

  role: z
    .string()
    .max(255, "Role must be less than 255 characters")
    .or(z.literal(""))
    .optional(),

  priority: PriorityEnum.optional(),

  gender: GenderEnum.optional(),

  birthday: z
    .date({
      message: "Invalid date",
    })
    .optional()
    .nullable(),

  notes: z
    .string()
    .max(10000, "Notes must be less than 10,000 characters")
    .or(z.literal(""))
    .optional(),

  profilePicture: z
    .string()
    .url("Invalid URL format")
    .or(z.literal(""))
    .optional(),

  lastContactedAt: z
    .string()
    .datetime({ message: "Invalid datetime format" })
    .or(z.literal(""))
    .optional(),
});

/**
 * UpdateContactInput Zod Schema
 *
 * Used for updating existing contacts.
 * All fields are optional since partial updates are allowed.
 * Matches UpdateContactDto validation rules from backend.
 */
export const updateContactSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be less than 255 characters")
    .regex(/\S/, "Name cannot be only whitespace")
    .trim()
    .optional(),

  email: z
    .string()
    .email("Invalid email format")
    .or(z.literal(""))
    .nullable()
    .optional(),

  phone: z
    .string()
    .max(50, "Phone must be less than 50 characters")
    .or(z.literal(""))
    .nullable()
    .optional(),

  linkedInUrl: z
    .string()
    .url("Invalid URL format")
    .or(z.literal(""))
    .nullable()
    .optional(),

  company: z
    .string()
    .max(255, "Company must be less than 255 characters")
    .or(z.literal(""))
    .nullable()
    .optional(),

  industry: z
    .string()
    .max(255, "Industry must be less than 255 characters")
    .or(z.literal(""))
    .nullable()
    .optional(),

  role: z
    .string()
    .max(255, "Role must be less than 255 characters")
    .or(z.literal(""))
    .nullable()
    .optional(),

  priority: PriorityEnum.optional().nullable(),

  gender: GenderEnum.optional().nullable(),

  birthday: z
    .date({
      message: "Invalid date",
    })
    .optional()
    .nullable(),

  notes: z
    .string()
    .max(10000, "Notes must be less than 10,000 characters")
    .or(z.literal(""))
    .nullable()
    .optional(),

  profilePicture: z
    .string()
    .url("Invalid URL format")
    .or(z.literal(""))
    .nullable()
    .optional(),

  lastContactedAt: z
    .string()
    .datetime("Invalid datetime format")
    .or(z.literal(""))
    .nullable()
    .optional(),
});

// Export TypeScript types from Zod schemas
export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;

/**
 * ContactFilterInput Zod Schema
 *
 * Used for filtering contact list queries.
 * All fields are optional.
 */
export const contactFilterSchema = z.object({
  search: z
    .string()
    .max(255, "Search query must be less than 255 characters")
    .optional(),

  priority: PriorityEnum.optional(),

  company: z
    .string()
    .max(255, "Company filter must be less than 255 characters")
    .optional(),

  industry: z
    .string()
    .max(255, "Industry filter must be less than 255 characters")
    .optional(),

  role: z
    .string()
    .max(255, "Role filter must be less than 255 characters")
    .optional(),
});

export type ContactFilterInput = z.infer<typeof contactFilterSchema>;

/**
 * ContactPaginationInput Zod Schema
 *
 * Used for cursor-based pagination.
 * Matches backend ContactPaginationInput validation.
 */
export const contactPaginationSchema = z.object({
  cursor: z.string().uuid("Cursor must be a valid UUID").optional(),

  limit: z
    .number()
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .optional()
    .default(20),
});

export type ContactPaginationInput = z.infer<typeof contactPaginationSchema>;

/**
 * Helper function to transform empty strings to undefined
 * Useful for optional fields in forms
 */
export const transformEmptyToUndefined = <T>(value: T): T | undefined => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }
  return value;
};
