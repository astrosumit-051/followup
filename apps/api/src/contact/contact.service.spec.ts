import { Test, TestingModule } from '@nestjs/testing';
import { ContactService } from './contact.service';
import { PrismaClient } from '@relationhub/database';
import { ContactFilterInput } from './dto/contact-filter.input';
import { ContactPaginationInput } from './dto/contact-pagination.input';
import { Priority } from './enums/priority.enum';
import { Gender } from './enums/gender.enum';

describe('ContactService', () => {
  let service: ContactService;
  let prisma: PrismaClient;

  const mockPrismaClient = {
    contact: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        {
          provide: PrismaClient,
          useValue: mockPrismaClient,
        },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);
    prisma = module.get<PrismaClient>(PrismaClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    const userId = 'user-123';
    const contactId = 'contact-456';
    const mockContact = {
      id: contactId,
      userId,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      linkedInUrl: 'https://linkedin.com/in/johndoe',
      company: 'Tech Corp',
      industry: 'Technology',
      role: 'CTO',
      priority: Priority.MEDIUM,
      gender: Gender.MALE,
      birthday: new Date('1990-01-15'),
      profilePicture: null,
      notes: 'Important contact',
      lastContactedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return contact when user owns it', async () => {
      mockPrismaClient.contact.findFirst.mockResolvedValue(mockContact);

      const result = await service.findOne(contactId, userId);

      expect(result).toEqual(mockContact);
      expect(prisma.contact.findFirst).toHaveBeenCalledWith({
        where: {
          id: contactId,
          userId,
        },
      });
    });

    it('should return null when contact does not exist', async () => {
      mockPrismaClient.contact.findFirst.mockResolvedValue(null);

      const result = await service.findOne('nonexistent-id', userId);

      expect(result).toBeNull();
      expect(prisma.contact.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'nonexistent-id',
          userId,
        },
      });
    });

    it('should return null when contact belongs to different user', async () => {
      mockPrismaClient.contact.findFirst.mockResolvedValue(null);

      const result = await service.findOne(contactId, 'different-user-id');

      expect(result).toBeNull();
      expect(prisma.contact.findFirst).toHaveBeenCalledWith({
        where: {
          id: contactId,
          userId: 'different-user-id',
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      mockPrismaClient.contact.findFirst.mockRejectedValue(dbError);

      await expect(service.findOne(contactId, userId)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should validate sort field and throw BadRequestException for invalid field', async () => {
      await expect(
        service.findAll(userId, {}, {}, 'invalidField' as any, 'asc'),
      ).rejects.toThrow('Invalid sort field');
    });
  });

  describe('findAll', () => {
    const userId = 'user-123';
    const mockContacts = [
      {
        id: 'contact-1',
        userId,
        name: 'Alice Johnson',
        email: 'alice@techcorp.com',
        phone: '+1234567890',
        linkedInUrl: null,
        company: 'TechCorp',
        industry: 'Technology',
        role: 'CEO',
        priority: Priority.HIGH,
        gender: null,
        birthday: null,
        profilePicture: null,
        notes: null,
        lastContactedAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'contact-2',
        userId,
        name: 'Bob Smith',
        email: 'bob@designco.com',
        phone: '+1987654321',
        linkedInUrl: null,
        company: 'DesignCo',
        industry: 'Design',
        role: 'Designer',
        priority: Priority.MEDIUM,
        gender: null,
        birthday: null,
        profilePicture: null,
        notes: null,
        lastContactedAt: null,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      },
    ];

    it('should return paginated contacts for user', async () => {
      mockPrismaClient.contact.findMany.mockResolvedValue(mockContacts);
      mockPrismaClient.contact.count.mockResolvedValue(2);

      const result = await service.findAll(userId, {}, {});

      expect(result.nodes).toEqual(mockContacts);
      expect(result.totalCount).toBe(2);
      expect(result.pageInfo.hasNextPage).toBe(false);
    });

    it('should return empty array when user has no contacts', async () => {
      mockPrismaClient.contact.findMany.mockResolvedValue([]);
      mockPrismaClient.contact.count.mockResolvedValue(0);

      const result = await service.findAll(userId, {}, {});

      expect(result.nodes).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    it('should filter by priority correctly', async () => {
      const highPriorityContact = [mockContacts[0]];
      mockPrismaClient.contact.findMany.mockResolvedValue(highPriorityContact);
      mockPrismaClient.contact.count.mockResolvedValue(1);

      const filters: ContactFilterInput = { priority: Priority.HIGH };
      await service.findAll(userId, filters, {});

      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            priority: Priority.HIGH,
          }),
        }),
      );
    });

    it('should filter by company correctly', async () => {
      mockPrismaClient.contact.findMany.mockResolvedValue([mockContacts[0]]);
      mockPrismaClient.contact.count.mockResolvedValue(1);

      const filters: ContactFilterInput = { company: 'TechCorp' };
      await service.findAll(userId, filters, {});

      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            company: { contains: 'TechCorp', mode: 'insensitive' },
          }),
        }),
      );
    });

    it('should filter by industry correctly', async () => {
      mockPrismaClient.contact.findMany.mockResolvedValue([mockContacts[0]]);
      mockPrismaClient.contact.count.mockResolvedValue(1);

      const filters: ContactFilterInput = { industry: 'Technology' };
      await service.findAll(userId, filters, {});

      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            industry: { contains: 'Technology', mode: 'insensitive' },
          }),
        }),
      );
    });

    it('should search by name (case-insensitive)', async () => {
      mockPrismaClient.contact.findMany.mockResolvedValue([mockContacts[0]]);
      mockPrismaClient.contact.count.mockResolvedValue(1);

      const filters: ContactFilterInput = { search: 'alice' };
      await service.findAll(userId, filters, {});

      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            AND: expect.arrayContaining([
              expect.objectContaining({
                OR: expect.arrayContaining([
                  { name: { contains: 'alice', mode: 'insensitive' } },
                  { email: { contains: 'alice', mode: 'insensitive' } },
                  { company: { contains: 'alice', mode: 'insensitive' } },
                ]),
              }),
            ]),
          }),
        }),
      );
    });

    it('should search by email (case-insensitive)', async () => {
      mockPrismaClient.contact.findMany.mockResolvedValue([mockContacts[0]]);
      mockPrismaClient.contact.count.mockResolvedValue(1);

      const filters: ContactFilterInput = { search: 'techcorp.com' };
      await service.findAll(userId, filters, {});

      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            AND: expect.arrayContaining([
              expect.objectContaining({
                OR: expect.any(Array),
              }),
            ]),
          }),
        }),
      );
    });

    it('should search by company (case-insensitive)', async () => {
      mockPrismaClient.contact.findMany.mockResolvedValue([mockContacts[0]]);
      mockPrismaClient.contact.count.mockResolvedValue(1);

      const filters: ContactFilterInput = { search: 'tech' };
      await service.findAll(userId, filters, {});

      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            AND: expect.arrayContaining([
              expect.objectContaining({
                OR: expect.any(Array),
              }),
            ]),
          }),
        }),
      );
    });

    it('should combine multiple filters', async () => {
      mockPrismaClient.contact.findMany.mockResolvedValue([mockContacts[0]]);
      mockPrismaClient.contact.count.mockResolvedValue(1);

      const filters: ContactFilterInput = {
        priority: Priority.HIGH,
        company: 'TechCorp',
        industry: 'Technology',
      };
      await service.findAll(userId, filters, {});

      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            priority: Priority.HIGH,
            company: { contains: 'TechCorp', mode: 'insensitive' },
            industry: { contains: 'Technology', mode: 'insensitive' },
          }),
        }),
      );
    });

    it('should sort by name ascending', async () => {
      mockPrismaClient.contact.findMany.mockResolvedValue(mockContacts);
      mockPrismaClient.contact.count.mockResolvedValue(2);

      await service.findAll(userId, {}, { limit: 20 }, 'name', 'asc');

      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: 'asc' },
        }),
      );
    });

    it('should sort by createdAt descending (default)', async () => {
      mockPrismaClient.contact.findMany.mockResolvedValue(mockContacts);
      mockPrismaClient.contact.count.mockResolvedValue(2);

      await service.findAll(userId, {}, {});

      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should sort by lastContactedAt descending', async () => {
      mockPrismaClient.contact.findMany.mockResolvedValue(mockContacts);
      mockPrismaClient.contact.count.mockResolvedValue(2);

      await service.findAll(
        userId,
        {},
        { limit: 20 },
        'lastContactedAt',
        'desc',
      );

      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { lastContactedAt: 'desc' },
        }),
      );
    });

    it('should implement cursor-based pagination correctly', async () => {
      const cursor = 'contact-1';
      mockPrismaClient.contact.findMany.mockResolvedValue([mockContacts[1]]);
      mockPrismaClient.contact.count.mockResolvedValue(2);

      const pagination: ContactPaginationInput = { cursor, limit: 1 };
      await service.findAll(userId, {}, pagination);

      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: { id: cursor },
          skip: 1, // Skip the cursor itself
        }),
      );
    });

    it('should respect pagination limit (max 100)', async () => {
      mockPrismaClient.contact.findMany.mockResolvedValue(mockContacts);
      mockPrismaClient.contact.count.mockResolvedValue(2);

      const pagination: ContactPaginationInput = { limit: 150 };
      await service.findAll(userId, {}, pagination);

      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 101, // Enforced maximum (100) + 1 for hasNextPage detection
        }),
      );
    });

    it('should return correct pageInfo (hasNextPage, hasPreviousPage, cursors)', async () => {
      const manyContacts = Array.from({ length: 21 }, (_, i) => ({
        ...mockContacts[0],
        id: `contact-${i}`,
      }));
      // Mock returns 21 items (limit + 1 to detect hasNextPage)
      mockPrismaClient.contact.findMany.mockResolvedValue(manyContacts);
      mockPrismaClient.contact.count.mockResolvedValue(21);

      const pagination: ContactPaginationInput = { limit: 20 };
      const result = await service.findAll(userId, {}, pagination);

      expect(result.pageInfo.hasNextPage).toBe(true);
      expect(result.nodes.length).toBe(20); // Should return only 20, not 21
      expect(result.pageInfo.startCursor).toBe('contact-0');
      expect(result.pageInfo.endCursor).toBe('contact-19');
    });

    it('should return correct totalCount', async () => {
      mockPrismaClient.contact.findMany.mockResolvedValue(mockContacts);
      mockPrismaClient.contact.count.mockResolvedValue(42);

      const result = await service.findAll(userId, {}, { limit: 20 });

      expect(result.totalCount).toBe(42);
      expect(prisma.contact.count).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it('should only return users own contacts', async () => {
      mockPrismaClient.contact.findMany.mockResolvedValue(mockContacts);
      mockPrismaClient.contact.count.mockResolvedValue(2);

      await service.findAll(userId, {}, {});

      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
          }),
        }),
      );
    });
  });

  describe('create', () => {
    const userId = 'user-123';
    const createDto = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1234567890',
      company: 'Tech Corp',
    };

    const createdContact = {
      id: 'contact-789',
      userId,
      ...createDto,
      linkedInUrl: null,
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

    it('should create contact with all fields', async () => {
      const fullDto = {
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
        notes: 'Important contact',
      };

      mockPrismaClient.contact.create.mockResolvedValue({
        id: 'contact-123',
        userId,
        ...fullDto,
        profilePicture: null,
        lastContactedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(fullDto, userId);

      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(prisma.contact.create).toHaveBeenCalledWith({
        data: {
          ...fullDto,
          userId,
        },
      });
    });

    it('should create contact with only required fields (name)', async () => {
      const minimalDto = { name: 'John Doe' };

      mockPrismaClient.contact.create.mockResolvedValue({
        id: 'contact-456',
        userId,
        name: 'John Doe',
        email: null,
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
      });

      const result = await service.create(minimalDto, userId);

      expect(result).toBeDefined();
      expect(result.name).toBe('John Doe');
      expect(result.userId).toBe(userId);
    });

    it('should set userId from authenticated user', async () => {
      mockPrismaClient.contact.create.mockResolvedValue(createdContact);

      await service.create(createDto, userId);

      expect(prisma.contact.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ userId }),
      });
    });

    it('should set default priority to MEDIUM', async () => {
      mockPrismaClient.contact.create.mockResolvedValue(createdContact);

      const result = await service.create({ name: 'Test' }, userId);

      expect(result.priority).toBe(Priority.MEDIUM);
    });
  });

  describe('update', () => {
    const userId = 'user-123';
    const contactId = 'contact-456';
    const updateDto = {
      name: 'Updated Name',
      email: 'updated@example.com',
    };

    const existingContact = {
      id: contactId,
      userId,
      name: 'Original Name',
      email: 'original@example.com',
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
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    it('should update contact when user owns it', async () => {
      mockPrismaClient.contact.findFirst.mockResolvedValue(existingContact);
      mockPrismaClient.contact.update.mockResolvedValue({
        ...existingContact,
        ...updateDto,
        updatedAt: new Date(),
      });

      const result = await service.update(contactId, updateDto, userId);

      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Name');
      expect(prisma.contact.update).toHaveBeenCalledWith({
        where: { id: contactId },
        data: updateDto,
      });
    });

    it('should update only provided fields', async () => {
      const partialUpdate = { email: 'newemail@example.com' };
      mockPrismaClient.contact.findFirst.mockResolvedValue(existingContact);
      mockPrismaClient.contact.update.mockResolvedValue({
        ...existingContact,
        email: 'newemail@example.com',
        updatedAt: new Date(),
      });

      await service.update(contactId, partialUpdate, userId);

      expect(prisma.contact.update).toHaveBeenCalledWith({
        where: { id: contactId },
        data: partialUpdate,
      });
    });

    it('should throw NotFoundException when contact does not exist', async () => {
      mockPrismaClient.contact.findFirst.mockResolvedValue(null);

      await expect(
        service.update('nonexistent-id', updateDto, userId),
      ).rejects.toThrow('Contact with ID nonexistent-id not found');
    });

    it('should throw NotFoundException when user does not own contact', async () => {
      mockPrismaClient.contact.findFirst.mockResolvedValue(null);

      await expect(
        service.update(contactId, updateDto, 'different-user-id'),
      ).rejects.toThrow(`Contact with ID ${contactId} not found`);
    });
  });

  describe('delete', () => {
    const userId = 'user-123';
    const contactId = 'contact-456';

    const existingContact = {
      id: contactId,
      userId,
      name: 'John Doe',
      email: 'john@example.com',
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

    it('should delete contact when user owns it', async () => {
      mockPrismaClient.contact.findFirst.mockResolvedValue(existingContact);
      mockPrismaClient.contact.delete.mockResolvedValue(existingContact);

      const result = await service.delete(contactId, userId);

      expect(result).toBe(true);
      expect(prisma.contact.delete).toHaveBeenCalledWith({
        where: { id: contactId },
      });
    });

    it('should return true on successful deletion', async () => {
      mockPrismaClient.contact.findFirst.mockResolvedValue(existingContact);
      mockPrismaClient.contact.delete.mockResolvedValue(existingContact);

      const result = await service.delete(contactId, userId);

      expect(result).toBe(true);
    });

    it('should throw NotFoundException when contact does not exist', async () => {
      mockPrismaClient.contact.findFirst.mockResolvedValue(null);

      await expect(service.delete('nonexistent-id', userId)).rejects.toThrow(
        'Contact with ID nonexistent-id not found',
      );
    });

    it('should throw NotFoundException when user does not own contact', async () => {
      mockPrismaClient.contact.findFirst.mockResolvedValue(null);

      await expect(
        service.delete(contactId, 'different-user-id'),
      ).rejects.toThrow(`Contact with ID ${contactId} not found`);
    });
  });
});
