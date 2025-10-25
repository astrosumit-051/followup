import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import type { SupabaseClient } from "@supabase/supabase-js";

// Import functions to test
import {
  getContact,
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  type Contact,
  type ContactConnection,
} from "./contacts";

// Mock fetch
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Create mock Supabase client
const mockGetSession = jest.fn();
const mockSupabaseClient = {
  auth: {
    getSession: mockGetSession,
  },
} as unknown as SupabaseClient;

describe("Contact API Functions", () => {
  const mockAccessToken = "mock-jwt-token";
  const mockSession = {
    access_token: mockAccessToken,
    token_type: "bearer",
    expires_in: 3600,
    refresh_token: "mock-refresh-token",
    user: {
      id: "user-123",
      email: "test@example.com",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default successful session mock
    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
  });

  const mockContact: Contact = {
    id: "contact-123",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1-234-567-8900",
    linkedInUrl: "https://linkedin.com/in/johndoe",
    company: "Acme Corp",
    industry: "Technology",
    role: "Software Engineer",
    priority: "HIGH",
    gender: "MALE",
    birthday: "1990-01-01",
    profilePicture: "https://example.com/photo.jpg",
    notes: "Met at conference",
    lastContactedAt: "2025-01-01T00:00:00Z",
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  };

  describe("getContact", () => {
    it("should fetch contact by ID", async () => {
      const mockGraphqlResponse = { data: { contact: mockContact } };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => mockGraphqlResponse,
        } as Response,
      );

      const result = await getContact("contact-123", mockSupabaseClient);

      expect(result).toEqual(mockContact);
    });

    it("should return null when contact not found", async () => {
      const mockGraphqlResponse = { data: { contact: null } };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => mockGraphqlResponse,
        } as Response,
      );

      const result = await getContact("non-existent", mockSupabaseClient);

      expect(result).toBeNull();
    });

    it("should throw error on request failure", async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: false,
          statusText: "Network error",
          json: async () => ({ errors: [{ message: "Network error" }] }),
        } as Response,
      );

      await expect(
        getContact("contact-123", mockSupabaseClient),
      ).rejects.toThrow("Network error");
    });
  });

  describe("getContacts", () => {
    it("should fetch contacts with default parameters", async () => {
      const mockConnection: ContactConnection = {
        nodes: [mockContact],
        edges: [{ cursor: "cursor-1", node: { id: mockContact.id } }],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: "cursor-1",
          endCursor: "cursor-1",
        },
        totalCount: 1,
      };

      const mockGraphqlResponse = { data: { contacts: mockConnection } };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => mockGraphqlResponse,
        } as Response,
      );

      const result = await getContacts(undefined, mockSupabaseClient);

      expect(result).toEqual(mockConnection);
    });

    it("should fetch contacts with filters", async () => {
      const mockConnection: ContactConnection = {
        nodes: [mockContact],
        edges: [{ cursor: "cursor-1", node: { id: mockContact.id } }],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: "cursor-1",
          endCursor: "cursor-1",
        },
        totalCount: 1,
      };

      const mockGraphqlResponse = { data: { contacts: mockConnection } };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => mockGraphqlResponse,
        } as Response,
      );

      const filters = { priority: "HIGH" as const, company: "Acme Corp" };
      const result = await getContacts({ filters }, mockSupabaseClient);

      expect(result).toEqual(mockConnection);
    });

    it("should fetch contacts with pagination", async () => {
      const mockConnection: ContactConnection = {
        nodes: [],
        edges: [],
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: "cursor-20",
        },
        totalCount: 100,
      };

      const mockGraphqlResponse = { data: { contacts: mockConnection } };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => mockGraphqlResponse,
        } as Response,
      );

      const pagination = { limit: 20, cursor: undefined };
      const result = await getContacts({ pagination }, mockSupabaseClient);

      expect(result.pageInfo.hasNextPage).toBe(true);
      expect(result.totalCount).toBe(100);
    });

    it("should fetch contacts with sorting", async () => {
      const mockConnection: ContactConnection = {
        nodes: [mockContact],
        edges: [{ cursor: "cursor-1", node: { id: mockContact.id } }],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: "cursor-1",
          endCursor: "cursor-1",
        },
        totalCount: 1,
      };

      const mockGraphqlResponse = { data: { contacts: mockConnection } };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => mockGraphqlResponse,
        } as Response,
      );

      const result = await getContacts(
        {
          sortBy: "NAME",
          sortOrder: "asc",
        },
        mockSupabaseClient,
      );

      expect(result).toEqual(mockConnection);
    });
  });

  describe("createContact", () => {
    it("should create a new contact", async () => {
      const input = {
        name: "Jane Doe",
        email: "jane@example.com",
        priority: "MEDIUM" as const,
      };

      const mockGraphqlResponse = {
        data: {
          createContact: { ...mockContact, ...input, id: "new-contact-id" },
        },
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => mockGraphqlResponse,
        } as Response,
      );

      const result = await createContact(input, mockSupabaseClient);

      expect(result.id).toBe("new-contact-id");
      expect(result.name).toBe("Jane Doe");
    });

    it("should throw error on validation failure", async () => {
      const input = {
        name: "Jane Doe",
      };

      const mockGraphqlResponse = {
        errors: [{ message: "Validation error: email is required" }],
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => mockGraphqlResponse,
        } as Response,
      );

      await expect(createContact(input, mockSupabaseClient)).rejects.toThrow(
        "Validation error",
      );
    });
  });

  describe("updateContact", () => {
    it("should update existing contact", async () => {
      const input = {
        name: "John Updated",
        priority: "LOW" as const,
      };

      const mockGraphqlResponse = {
        data: {
          updateContact: { ...mockContact, ...input },
        },
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => mockGraphqlResponse,
        } as Response,
      );

      const result = await updateContact(
        "contact-123",
        input,
        mockSupabaseClient,
      );

      expect(result.name).toBe("John Updated");
      expect(result.priority).toBe("LOW");
    });

    it("should throw error when contact not found", async () => {
      const input = { name: "Updated Name" };

      const mockGraphqlResponse = {
        errors: [{ message: "Contact not found" }],
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => mockGraphqlResponse,
        } as Response,
      );

      await expect(
        updateContact("non-existent", input, mockSupabaseClient),
      ).rejects.toThrow("Contact not found");
    });

    it("should handle partial updates", async () => {
      const input = { email: "newemail@example.com" };

      const mockGraphqlResponse = {
        data: {
          updateContact: { ...mockContact, email: "newemail@example.com" },
        },
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => mockGraphqlResponse,
        } as Response,
      );

      const result = await updateContact(
        "contact-123",
        input,
        mockSupabaseClient,
      );

      expect(result.email).toBe("newemail@example.com");
      expect(result.name).toBe(mockContact.name); // Unchanged
    });
  });

  describe("deleteContact", () => {
    it("should delete contact", async () => {
      const mockGraphqlResponse = {
        data: { deleteContact: true },
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => mockGraphqlResponse,
        } as Response,
      );

      const result = await deleteContact("contact-123", mockSupabaseClient);

      expect(result).toBe(true);
    });

    it("should throw error when contact not found", async () => {
      const mockGraphqlResponse = {
        errors: [{ message: "Contact not found" }],
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => mockGraphqlResponse,
        } as Response,
      );

      await expect(
        deleteContact("non-existent", mockSupabaseClient),
      ).rejects.toThrow("Contact not found");
    });

    it("should throw error on authorization failure", async () => {
      const mockGraphqlResponse = {
        errors: [{ message: "Unauthorized" }],
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => mockGraphqlResponse,
        } as Response,
      );

      await expect(
        deleteContact("contact-123", mockSupabaseClient),
      ).rejects.toThrow("Unauthorized");
    });
  });
});
