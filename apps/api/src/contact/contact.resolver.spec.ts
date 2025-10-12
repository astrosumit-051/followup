import { Test, TestingModule } from '@nestjs/testing';
import { ContactResolver } from './contact.resolver';
import { ContactService } from './contact.service';
import { Priority } from './enums/priority.enum';
import { Gender } from './enums/gender.enum';
import { ContactSortField } from './enums/contact-sort-field.enum';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ContactFilterInput } from './dto/contact-filter.input';
import { ContactPaginationInput } from './dto/contact-pagination.input';

// Mock the AuthGuard to avoid jose/Supabase dependencies in tests
jest.mock('../auth/auth.guard', () => ({
  AuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockResolvedValue(true),
  })),
}));

describe('ContactResolver', () => {
  let resolver: ContactResolver;
  let service: ContactService;

  const mockUser = {
    id: 'user-123',
    supabaseId: 'supabase-user-123',
    email: 'test@example.com',
    name: 'Test User',
    profilePicture: null,
    provider: 'email',
    role: 'authenticated',
  };

  const mockContact = {
    id: 'contact-456',
    userId: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    linkedInUrl: 'https://linkedin.com/in/johndoe',
    company: 'Tech Corp',
    industry: 'Technology',
    role: 'CTO',
    priority: Priority.HIGH,
    gender: Gender.MALE,
    birthday: new Date('1990-01-15'),
    profilePicture: null,
    notes: 'Important contact',
    lastContactedAt: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockContactService = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactResolver,
        {
          provide: ContactService,
          useValue: mockContactService,
        },
      ],
    }).compile();

    resolver = module.get<ContactResolver>(ContactResolver);
    service = module.get<ContactService>(ContactService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('contact query (single contact retrieval)', () => {
    it('should return contact when found and owned by user', async () => {
      mockContactService.findOne.mockResolvedValue(mockContact);

      const result = await resolver.findOne(mockUser, 'contact-456');

      expect(result).toEqual(mockContact);
      expect(service.findOne).toHaveBeenCalledWith('contact-456', 'user-123');
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return null when contact not found', async () => {
      mockContactService.findOne.mockResolvedValue(null);

      const result = await resolver.findOne(mockUser, 'nonexistent-id');

      expect(result).toBeNull();
      expect(service.findOne).toHaveBeenCalledWith('nonexistent-id', 'user-123');
    });

    it('should return null when contact belongs to different user', async () => {
      mockContactService.findOne.mockResolvedValue(null);

      const result = await resolver.findOne(mockUser, 'contact-789');

      expect(result).toBeNull();
      expect(service.findOne).toHaveBeenCalledWith('contact-789', 'user-123');
    });

    it('should call service with correct user ID from @CurrentUser decorator', async () => {
      const differentUser = { ...mockUser, id: 'user-999' };
      mockContactService.findOne.mockResolvedValue(null);

      await resolver.findOne(differentUser, 'contact-456');

      expect(service.findOne).toHaveBeenCalledWith('contact-456', 'user-999');
    });
  });

  describe('contacts query (list with pagination)', () => {
    const mockContactConnection = {
      nodes: [mockContact],
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: 'cursor-start',
        endCursor: 'cursor-end',
      },
      totalCount: 10,
    };

    it('should return paginated contacts with default parameters', async () => {
      mockContactService.findAll.mockResolvedValue(mockContactConnection);

      const result = await resolver.findAll(
        mockUser,
        undefined,
        undefined,
        ContactSortField.CREATED_AT,
        'desc',
      );

      expect(result).toEqual(mockContactConnection);
      expect(service.findAll).toHaveBeenCalledWith(
        'user-123',
        {},
        {},
        ContactSortField.CREATED_AT,
        'desc',
      );
    });

    it('should return contacts with priority filter', async () => {
      const filters: ContactFilterInput = { priority: Priority.HIGH };
      mockContactService.findAll.mockResolvedValue(mockContactConnection);

      const result = await resolver.findAll(
        mockUser,
        filters,
        undefined,
        ContactSortField.CREATED_AT,
        'desc',
      );

      expect(result).toEqual(mockContactConnection);
      expect(service.findAll).toHaveBeenCalledWith(
        'user-123',
        filters,
        {},
        ContactSortField.CREATED_AT,
        'desc',
      );
    });

    it('should return contacts with company filter', async () => {
      const filters: ContactFilterInput = { company: 'Tech Corp' };
      mockContactService.findAll.mockResolvedValue(mockContactConnection);

      const result = await resolver.findAll(
        mockUser,
        filters,
        undefined,
        ContactSortField.CREATED_AT,
        'desc',
      );

      expect(service.findAll).toHaveBeenCalledWith(
        'user-123',
        filters,
        {},
        ContactSortField.CREATED_AT,
        'desc',
      );
    });

    it('should return contacts with search query', async () => {
      const filters: ContactFilterInput = { search: 'john' };
      mockContactService.findAll.mockResolvedValue(mockContactConnection);

      const result = await resolver.findAll(
        mockUser,
        filters,
        undefined,
        ContactSortField.CREATED_AT,
        'desc',
      );

      expect(service.findAll).toHaveBeenCalledWith(
        'user-123',
        filters,
        {},
        ContactSortField.CREATED_AT,
        'desc',
      );
    });

    it('should return contacts with pagination cursor', async () => {
      const pagination: ContactPaginationInput = {
        cursor: 'cursor-abc',
        limit: 20,
      };
      mockContactService.findAll.mockResolvedValue(mockContactConnection);

      const result = await resolver.findAll(
        mockUser,
        undefined,
        pagination,
        ContactSortField.CREATED_AT,
        'desc',
      );

      expect(service.findAll).toHaveBeenCalledWith(
        'user-123',
        {},
        pagination,
        ContactSortField.CREATED_AT,
        'desc',
      );
    });

    it('should return contacts with custom sort', async () => {
      mockContactService.findAll.mockResolvedValue(mockContactConnection);

      const result = await resolver.findAll(
        mockUser,
        undefined,
        undefined,
        ContactSortField.NAME,
        'asc',
      );

      expect(service.findAll).toHaveBeenCalledWith(
        'user-123',
        {},
        {},
        ContactSortField.NAME,
        'asc',
      );
    });

    it('should return contacts with multiple filters and pagination', async () => {
      const filters: ContactFilterInput = {
        priority: Priority.HIGH,
        company: 'Tech Corp',
        search: 'john',
      };
      const pagination: ContactPaginationInput = {
        cursor: 'cursor-xyz',
        limit: 10,
      };
      mockContactService.findAll.mockResolvedValue(mockContactConnection);

      const result = await resolver.findAll(
        mockUser,
        filters,
        pagination,
        ContactSortField.NAME,
        'asc',
      );

      expect(service.findAll).toHaveBeenCalledWith(
        'user-123',
        filters,
        pagination,
        ContactSortField.NAME,
        'asc',
      );
    });

    it('should return empty list when no contacts found', async () => {
      const emptyConnection = {
        nodes: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      };
      mockContactService.findAll.mockResolvedValue(emptyConnection);

      const result = await resolver.findAll(mockUser);

      expect(result).toEqual(emptyConnection);
      expect(result.nodes).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it('should handle pagination edge case (last page)', async () => {
      const lastPageConnection = {
        ...mockContactConnection,
        pageInfo: {
          ...mockContactConnection.pageInfo,
          hasNextPage: false,
        },
      };
      mockContactService.findAll.mockResolvedValue(lastPageConnection);

      const result = await resolver.findAll(mockUser);

      expect(result.pageInfo.hasNextPage).toBe(false);
    });
  });

  describe('createContact mutation', () => {
    const createInput: CreateContactDto = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1987654321',
      linkedInUrl: 'https://linkedin.com/in/janesmith',
      company: 'StartupXYZ',
      industry: 'Finance',
      role: 'CEO',
      priority: Priority.HIGH,
      gender: Gender.FEMALE,
      birthday: new Date('1985-05-20'),
      notes: 'Met at conference',
    };

    const createdContact = {
      id: 'contact-new',
      userId: 'user-123',
      ...createInput,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create contact with all fields', async () => {
      mockContactService.create.mockResolvedValue(createdContact);

      const result = await resolver.createContact(mockUser, createInput);

      expect(result).toEqual(createdContact);
      expect(service.create).toHaveBeenCalledWith(createInput, 'user-123');
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it('should create contact with minimal required fields only', async () => {
      const minimalInput: CreateContactDto = {
        name: 'Bob Johnson',
        email: 'bob@example.com',
      };
      const minimalContact = {
        id: 'contact-minimal',
        userId: 'user-123',
        ...minimalInput,
        phone: null,
        linkedInUrl: null,
        company: null,
        industry: null,
        role: null,
        priority: Priority.MEDIUM,
        gender: null,
        birthday: null,
        profilePicture: null,
        notes: null,
        lastContactedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockContactService.create.mockResolvedValue(minimalContact);

      const result = await resolver.createContact(mockUser, minimalInput);

      expect(result).toEqual(minimalContact);
      expect(service.create).toHaveBeenCalledWith(minimalInput, 'user-123');
    });

    it('should inject current user ID from @CurrentUser decorator', async () => {
      const differentUser = { ...mockUser, id: 'user-different' };
      const contactForDifferentUser = {
        ...createdContact,
        userId: 'user-different',
      };
      mockContactService.create.mockResolvedValue(contactForDifferentUser);

      await resolver.createContact(differentUser, createInput);

      expect(service.create).toHaveBeenCalledWith(createInput, 'user-different');
    });

    it('should create contact with HIGH priority', async () => {
      const highPriorityInput = { ...createInput, priority: Priority.HIGH };
      const highPriorityContact = { ...createdContact, priority: Priority.HIGH };
      mockContactService.create.mockResolvedValue(highPriorityContact);

      const result = await resolver.createContact(mockUser, highPriorityInput);

      expect(result.priority).toBe(Priority.HIGH);
    });

    it('should create contact with LOW priority', async () => {
      const lowPriorityInput = { ...createInput, priority: Priority.LOW };
      const lowPriorityContact = { ...createdContact, priority: Priority.LOW };
      mockContactService.create.mockResolvedValue(lowPriorityContact);

      const result = await resolver.createContact(mockUser, lowPriorityInput);

      expect(result.priority).toBe(Priority.LOW);
    });
  });

  describe('updateContact mutation with authorization', () => {
    const updateInput: UpdateContactDto = {
      name: 'John Doe Updated',
      priority: Priority.LOW,
      notes: 'Updated notes',
    };

    const updatedContact = {
      ...mockContact,
      ...updateInput,
      updatedAt: new Date(),
    };

    it('should update contact when user owns it', async () => {
      mockContactService.update.mockResolvedValue(updatedContact);

      const result = await resolver.updateContact(
        mockUser,
        'contact-456',
        updateInput,
      );

      expect(result).toEqual(updatedContact);
      expect(service.update).toHaveBeenCalledWith(
        'contact-456',
        updateInput,
        'user-123',
      );
      expect(service.update).toHaveBeenCalledTimes(1);
    });

    it('should update single field', async () => {
      const singleFieldUpdate: UpdateContactDto = { name: 'New Name' };
      const singleFieldUpdatedContact = {
        ...mockContact,
        name: 'New Name',
        updatedAt: new Date(),
      };
      mockContactService.update.mockResolvedValue(singleFieldUpdatedContact);

      const result = await resolver.updateContact(
        mockUser,
        'contact-456',
        singleFieldUpdate,
      );

      expect(result.name).toBe('New Name');
      expect(service.update).toHaveBeenCalledWith(
        'contact-456',
        singleFieldUpdate,
        'user-123',
      );
    });

    it('should update multiple fields', async () => {
      const multiFieldUpdate: UpdateContactDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
        phone: '+1111111111',
        priority: Priority.HIGH,
      };
      mockContactService.update.mockResolvedValue({
        ...mockContact,
        ...multiFieldUpdate,
        updatedAt: new Date(),
      });

      const result = await resolver.updateContact(
        mockUser,
        'contact-456',
        multiFieldUpdate,
      );

      expect(service.update).toHaveBeenCalledWith(
        'contact-456',
        multiFieldUpdate,
        'user-123',
      );
    });

    it('should enforce user ownership in service layer', async () => {
      mockContactService.update.mockResolvedValue(updatedContact);

      await resolver.updateContact(mockUser, 'contact-456', updateInput);

      // Verify userId is passed to service for ownership check
      expect(service.update).toHaveBeenCalledWith(
        'contact-456',
        updateInput,
        'user-123',
      );
    });

    it('should inject correct user ID from @CurrentUser decorator', async () => {
      const differentUser = { ...mockUser, id: 'user-different' };
      mockContactService.update.mockResolvedValue({
        ...updatedContact,
        userId: 'user-different',
      });

      await resolver.updateContact(differentUser, 'contact-456', updateInput);

      expect(service.update).toHaveBeenCalledWith(
        'contact-456',
        updateInput,
        'user-different',
      );
    });

    it('should update priority from HIGH to LOW', async () => {
      const priorityUpdate: UpdateContactDto = { priority: Priority.LOW };
      mockContactService.update.mockResolvedValue({
        ...mockContact,
        priority: Priority.LOW,
      });

      const result = await resolver.updateContact(
        mockUser,
        'contact-456',
        priorityUpdate,
      );

      expect(result.priority).toBe(Priority.LOW);
    });

    it('should update and clear optional fields', async () => {
      const updateWithEmptyFields: UpdateContactDto = {
        company: 'New Company',
      };
      mockContactService.update.mockResolvedValue({
        ...mockContact,
        company: 'New Company',
        phone: null,
        linkedInUrl: null,
      });

      const result = await resolver.updateContact(
        mockUser,
        'contact-456',
        updateWithEmptyFields,
      );

      expect(result.company).toBe('New Company');
      // Service layer can set fields to null even if DTO doesn't specify them
      expect(service.update).toHaveBeenCalledWith(
        'contact-456',
        updateWithEmptyFields,
        'user-123',
      );
    });
  });

  describe('deleteContact mutation with cascade', () => {
    it('should delete contact when user owns it', async () => {
      mockContactService.delete.mockResolvedValue(true);

      const result = await resolver.deleteContact(mockUser, 'contact-456');

      expect(result).toBe(true);
      expect(service.delete).toHaveBeenCalledWith('contact-456', 'user-123');
      expect(service.delete).toHaveBeenCalledTimes(1);
    });

    it('should enforce user ownership in service layer', async () => {
      mockContactService.delete.mockResolvedValue(true);

      await resolver.deleteContact(mockUser, 'contact-456');

      // Verify userId is passed to service for ownership check
      expect(service.delete).toHaveBeenCalledWith('contact-456', 'user-123');
    });

    it('should inject correct user ID from @CurrentUser decorator', async () => {
      const differentUser = { ...mockUser, id: 'user-different' };
      mockContactService.delete.mockResolvedValue(true);

      await resolver.deleteContact(differentUser, 'contact-789');

      expect(service.delete).toHaveBeenCalledWith('contact-789', 'user-different');
    });

    it('should handle cascade deletion (service layer responsibility)', async () => {
      // Note: Cascade behavior is tested in service layer
      // Resolver just delegates to service
      mockContactService.delete.mockResolvedValue(true);

      const result = await resolver.deleteContact(mockUser, 'contact-456');

      expect(result).toBe(true);
      expect(service.delete).toHaveBeenCalledWith('contact-456', 'user-123');
    });

    it('should return true on successful deletion', async () => {
      mockContactService.delete.mockResolvedValue(true);

      const result = await resolver.deleteContact(mockUser, 'contact-456');

      expect(result).toBe(true);
    });

    it('should allow deletion of contact with null optional fields', async () => {
      mockContactService.delete.mockResolvedValue(true);

      const result = await resolver.deleteContact(mockUser, 'contact-minimal');

      expect(result).toBe(true);
      expect(service.delete).toHaveBeenCalledWith('contact-minimal', 'user-123');
    });
  });

  describe('resolver integration with service layer', () => {
    it('should pass through service errors for unauthorized access', async () => {
      const unauthorizedError = new Error('Contact not found or unauthorized');
      mockContactService.findOne.mockRejectedValue(unauthorizedError);

      await expect(resolver.findOne(mockUser, 'contact-456')).rejects.toThrow(
        'Contact not found or unauthorized',
      );
    });

    it('should pass through service errors for validation failures', async () => {
      const validationError = new Error('Invalid email format');
      mockContactService.create.mockRejectedValue(validationError);

      const invalidInput: CreateContactDto = {
        name: 'Test',
        email: 'invalid-email',
      };

      await expect(
        resolver.createContact(mockUser, invalidInput),
      ).rejects.toThrow('Invalid email format');
    });

    it('should handle service layer not found errors on update', async () => {
      const notFoundError = new Error('Contact not found');
      mockContactService.update.mockRejectedValue(notFoundError);

      await expect(
        resolver.updateContact(mockUser, 'nonexistent-id', { name: 'Test' }),
      ).rejects.toThrow('Contact not found');
    });

    it('should handle service layer not found errors on delete', async () => {
      const notFoundError = new Error('Contact not found');
      mockContactService.delete.mockRejectedValue(notFoundError);

      await expect(
        resolver.deleteContact(mockUser, 'nonexistent-id'),
      ).rejects.toThrow('Contact not found');
    });

    it('should handle database errors on findAll', async () => {
      const dbError = new Error('Database connection failed');
      mockContactService.findAll.mockRejectedValue(dbError);

      await expect(
        resolver.findAll(mockUser),
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle duplicate email errors on create', async () => {
      const duplicateError = new Error('Email already exists for this user');
      mockContactService.create.mockRejectedValue(duplicateError);

      const duplicateInput: CreateContactDto = {
        name: 'John Doe',
        email: 'existing@example.com',
      };

      await expect(
        resolver.createContact(mockUser, duplicateInput),
      ).rejects.toThrow('Email already exists for this user');
    });

    it('should handle duplicate email errors on update', async () => {
      const duplicateError = new Error('Email already exists for this user');
      mockContactService.update.mockRejectedValue(duplicateError);

      await expect(
        resolver.updateContact(mockUser, 'contact-456', { email: 'duplicate@example.com' }),
      ).rejects.toThrow('Email already exists for this user');
    });

    it('should handle database errors on delete', async () => {
      const dbError = new Error('Database error during deletion');
      mockContactService.delete.mockRejectedValue(dbError);

      await expect(
        resolver.deleteContact(mockUser, 'contact-456'),
      ).rejects.toThrow('Database error during deletion');
    });

    it('should handle undefined filters in findAll', async () => {
      const mockConnection = {
        nodes: [mockContact],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 1,
      };
      mockContactService.findAll.mockResolvedValue(mockConnection);

      const result = await resolver.findAll(
        mockUser,
        undefined,
        undefined,
        undefined,
        undefined,
      );

      expect(service.findAll).toHaveBeenCalledWith(
        'user-123',
        {},
        {},
        undefined,
        'desc',
      );
      expect(result).toEqual(mockConnection);
    });

    it('should handle null sortOrder and use default', async () => {
      const mockConnection = {
        nodes: [mockContact],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 1,
      };
      mockContactService.findAll.mockResolvedValue(mockConnection);

      await resolver.findAll(
        mockUser,
        undefined,
        undefined,
        ContactSortField.NAME,
        null as any,
      );

      expect(service.findAll).toHaveBeenCalledWith(
        'user-123',
        {},
        {},
        ContactSortField.NAME,
        'desc',
      );
    });
  });
});
