import { describe, it, expect } from "@jest/globals";
import {
  createContactSchema,
  updateContactSchema,
  contactFilterSchema,
  contactPaginationSchema,
  PriorityEnum,
  GenderEnum,
  type CreateContactInput,
} from "./contact";

describe("Contact Validation Schemas", () => {
  describe("createContactSchema", () => {
    describe("name field", () => {
      it("should accept valid name", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe("John Doe");
        }
      });

      it("should trim whitespace from name", () => {
        const result = createContactSchema.safeParse({
          name: "  John Doe  ",
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe("John Doe");
        }
      });

      it("should reject empty name", () => {
        const result = createContactSchema.safeParse({
          name: "",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const errorMessages = result.error.issues.map((e) => e.message);
          expect(
            errorMessages.some((msg) => msg.includes("Name is required")),
          ).toBe(true);
        }
      });

      it("should reject whitespace-only name", () => {
        const result = createContactSchema.safeParse({
          name: "   ",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const errorMessages = result.error.issues.map((e) => e.message);
          expect(
            errorMessages.some((msg) =>
              msg.includes("cannot be only whitespace"),
            ),
          ).toBe(true);
        }
      });

      it("should reject name longer than 255 characters", () => {
        const result = createContactSchema.safeParse({
          name: "a".repeat(256),
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const errorMessages = result.error.issues.map((e) => e.message);
          expect(
            errorMessages.some((msg) =>
              msg.includes("less than 255 characters"),
            ),
          ).toBe(true);
        }
      });

      it("should accept name with exactly 255 characters", () => {
        const result = createContactSchema.safeParse({
          name: "a".repeat(255),
        });
        expect(result.success).toBe(true);
      });
    });

    describe("email field", () => {
      it("should accept valid email", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
          email: "john.doe@example.com",
        });
        expect(result.success).toBe(true);
      });

      it("should accept empty string for email", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
          email: "",
        });
        expect(result.success).toBe(true);
      });

      it("should accept undefined email", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
        });
        expect(result.success).toBe(true);
      });

      it("should reject invalid email format", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
          email: "invalid-email",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const errorMessages = result.error.issues.map((e) => e.message);
          expect(
            errorMessages.some((msg) => msg.includes("Invalid email format")),
          ).toBe(true);
        }
      });
    });

    describe("phone field", () => {
      it("should accept valid phone number", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
          phone: "+1-234-567-8900",
        });
        expect(result.success).toBe(true);
      });

      it("should accept empty string for phone", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
          phone: "",
        });
        expect(result.success).toBe(true);
      });

      it("should reject phone longer than 50 characters", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
          phone: "1".repeat(51),
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const errorMessages = result.error.issues.map((e) => e.message);
          expect(
            errorMessages.some((msg) =>
              msg.includes("less than 50 characters"),
            ),
          ).toBe(true);
        }
      });
    });

    describe("linkedInUrl field", () => {
      it("should accept valid LinkedIn URL", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
          linkedInUrl: "https://linkedin.com/in/johndoe",
        });
        expect(result.success).toBe(true);
      });

      it("should accept empty string for linkedInUrl", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
          linkedInUrl: "",
        });
        expect(result.success).toBe(true);
      });

      it("should reject invalid URL format", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
          linkedInUrl: "not-a-url",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const errorMessages = result.error.issues.map((e) => e.message);
          expect(
            errorMessages.some((msg) => msg.includes("Invalid URL format")),
          ).toBe(true);
        }
      });
    });

    describe("priority field", () => {
      it("should accept HIGH priority", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
          priority: "HIGH",
        });
        expect(result.success).toBe(true);
      });

      it("should accept MEDIUM priority", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
          priority: "MEDIUM",
        });
        expect(result.success).toBe(true);
      });

      it("should accept LOW priority", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
          priority: "LOW",
        });
        expect(result.success).toBe(true);
      });

      it("should reject invalid priority", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
          priority: "INVALID",
        });
        expect(result.success).toBe(false);
      });

      it("should accept undefined priority", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
        });
        expect(result.success).toBe(true);
      });
    });

    describe("gender field", () => {
      it("should accept MALE gender", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
          gender: "MALE",
        });
        expect(result.success).toBe(true);
      });

      it("should accept FEMALE gender", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
          gender: "FEMALE",
        });
        expect(result.success).toBe(true);
      });

      it("should accept OTHER gender", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
          gender: "OTHER",
        });
        expect(result.success).toBe(true);
      });

      it("should accept PREFER_NOT_TO_SAY gender", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
          gender: "PREFER_NOT_TO_SAY",
        });
        expect(result.success).toBe(true);
      });

      it("should reject invalid gender", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
          gender: "INVALID",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("birthday field", () => {
      it("should accept valid date", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
          birthday: new Date("1990-01-01"),
        });
        expect(result.success).toBe(true);
      });

      it("should accept null birthday", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
          birthday: null,
        });
        expect(result.success).toBe(true);
      });

      it("should reject invalid date format", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
          birthday: "invalid-date",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const errorMessages = result.error.issues.map((e) => e.message);
          expect(
            errorMessages.some((msg) => msg.includes("expected date")),
          ).toBe(true);
        }
      });
    });

    describe("notes field", () => {
      it("should accept valid notes", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
          notes: "Met at conference",
        });
        expect(result.success).toBe(true);
      });

      it("should accept empty string for notes", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
          notes: "",
        });
        expect(result.success).toBe(true);
      });

      it("should reject notes longer than 10,000 characters", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
          notes: "a".repeat(10001),
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const errorMessages = result.error.issues.map((e) => e.message);
          expect(
            errorMessages.some((msg) =>
              msg.includes("less than 10,000 characters"),
            ),
          ).toBe(true);
        }
      });

      it("should accept notes with exactly 10,000 characters", () => {
        const result = createContactSchema.safeParse({
          name: "John Doe",
          notes: "a".repeat(10000),
        });
        expect(result.success).toBe(true);
      });
    });

    describe("complete valid contact", () => {
      it("should accept contact with all valid fields", () => {
        const validContact: CreateContactInput = {
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "+1-234-567-8900",
          linkedInUrl: "https://linkedin.com/in/johndoe",
          company: "Acme Corp",
          industry: "Technology",
          role: "Software Engineer",
          priority: "HIGH",
          gender: "MALE",
          birthday: new Date("1990-01-01"),
          notes: "Met at tech conference 2024",
        };

        const result = createContactSchema.safeParse(validContact);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("updateContactSchema", () => {
    it("should accept partial updates", () => {
      const result = updateContactSchema.safeParse({
        name: "Updated Name",
      });
      expect(result.success).toBe(true);
    });

    it("should accept empty object (no updates)", () => {
      const result = updateContactSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should accept null values for optional fields", () => {
      const result = updateContactSchema.safeParse({
        email: null,
        phone: null,
        company: null,
      });
      expect(result.success).toBe(true);
    });

    it("should validate name if provided", () => {
      const result = updateContactSchema.safeParse({
        name: "   ",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.issues.map((e) => e.message);
        expect(
          errorMessages.some((msg) =>
            msg.includes("cannot be only whitespace"),
          ),
        ).toBe(true);
      }
    });

    it("should validate email format if provided", () => {
      const result = updateContactSchema.safeParse({
        email: "invalid-email",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.issues.map((e) => e.message);
        expect(
          errorMessages.some((msg) => msg.includes("Invalid email format")),
        ).toBe(true);
      }
    });
  });

  describe("contactFilterSchema", () => {
    it("should accept valid filter with search", () => {
      const result = contactFilterSchema.safeParse({
        search: "John",
      });
      expect(result.success).toBe(true);
    });

    it("should accept valid filter with priority", () => {
      const result = contactFilterSchema.safeParse({
        priority: "HIGH",
      });
      expect(result.success).toBe(true);
    });

    it("should accept valid filter with company", () => {
      const result = contactFilterSchema.safeParse({
        company: "Acme Corp",
      });
      expect(result.success).toBe(true);
    });

    it("should accept empty filter object", () => {
      const result = contactFilterSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should reject search longer than 255 characters", () => {
      const result = contactFilterSchema.safeParse({
        search: "a".repeat(256),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("contactPaginationSchema", () => {
    it("should accept valid UUID cursor", () => {
      const result = contactPaginationSchema.safeParse({
        cursor: "123e4567-e89b-12d3-a456-426614174000",
      });
      expect(result.success).toBe(true);
    });

    it("should accept valid limit", () => {
      const result = contactPaginationSchema.safeParse({
        limit: 50,
      });
      expect(result.success).toBe(true);
    });

    it("should default limit to 20", () => {
      const result = contactPaginationSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20);
      }
    });

    it("should reject non-UUID cursor", () => {
      const result = contactPaginationSchema.safeParse({
        cursor: "not-a-uuid",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.issues.map((e) => e.message);
        expect(errorMessages.some((msg) => msg.includes("valid UUID"))).toBe(
          true,
        );
      }
    });

    it("should reject limit less than 1", () => {
      const result = contactPaginationSchema.safeParse({
        limit: 0,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.issues.map((e) => e.message);
        expect(errorMessages.some((msg) => msg.includes("at least 1"))).toBe(
          true,
        );
      }
    });

    it("should reject limit greater than 100", () => {
      const result = contactPaginationSchema.safeParse({
        limit: 101,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.issues.map((e) => e.message);
        expect(
          errorMessages.some((msg) => msg.includes("cannot exceed 100")),
        ).toBe(true);
      }
    });

    it("should reject non-integer limit", () => {
      const result = contactPaginationSchema.safeParse({
        limit: 10.5,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.issues.map((e) => e.message);
        expect(
          errorMessages.some((msg) => msg.includes("must be an integer")),
        ).toBe(true);
      }
    });
  });

  describe("PriorityEnum", () => {
    it("should accept HIGH", () => {
      const result = PriorityEnum.safeParse("HIGH");
      expect(result.success).toBe(true);
    });

    it("should accept MEDIUM", () => {
      const result = PriorityEnum.safeParse("MEDIUM");
      expect(result.success).toBe(true);
    });

    it("should accept LOW", () => {
      const result = PriorityEnum.safeParse("LOW");
      expect(result.success).toBe(true);
    });

    it("should reject invalid value", () => {
      const result = PriorityEnum.safeParse("INVALID");
      expect(result.success).toBe(false);
    });
  });

  describe("GenderEnum", () => {
    it("should accept all valid gender values", () => {
      const validGenders = ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"];
      validGenders.forEach((gender) => {
        const result = GenderEnum.safeParse(gender);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid gender value", () => {
      const result = GenderEnum.safeParse("INVALID");
      expect(result.success).toBe(false);
    });
  });
});
