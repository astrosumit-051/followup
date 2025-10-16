import { Test, TestingModule } from '@nestjs/testing';
import { EmailDraftService } from './email-draft.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { DraftSortField, SortOrder } from './dto/pagination.input';

describe('EmailDraftService', () => {
  let service: EmailDraftService;
  let prisma: PrismaService;

  const mockPrismaService = {
    emailDraft: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    contact: {
      findUnique: jest.fn(),
    },
    emailSignature: {
      findFirst: jest.fn(),
    },
  };

  const mockUserId = 'user-123';
  const mockContactId = 'contact-456';
  const mockDraftId = 'draft-789';
  const mockSignatureId = 'signature-101';

  const mockTipTapJson = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Hi John,' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Looking forward to our meeting.' }],
      },
    ],
  };

  const mockDraft = {
    id: mockDraftId,
    userId: mockUserId,
    contactId: mockContactId,
    subject: 'Follow up',
    bodyJson: mockTipTapJson,
    bodyHtml: '<p>Hi John,</p><p>Looking forward to our meeting.</p>',
    attachments: [],
    signatureId: mockSignatureId,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSyncedAt: new Date(),
    user: { id: mockUserId, email: 'test@example.com' },
    contact: { id: mockContactId, name: 'John Doe' },
    signature: { id: mockSignatureId, name: 'Default Signature' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailDraftService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EmailDraftService>(EmailDraftService);
    prisma = module.get<PrismaService>(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('autoSaveDraft', () => {
    const updateInput = {
      subject: 'Follow up',
      bodyJson: mockTipTapJson,
      bodyHtml: '<p>Hi John,</p><p>Looking forward to our meeting.</p>',
      attachments: [],
      signatureId: mockSignatureId,
      lastSyncedAt: new Date(),
    };

    it('should create a new draft if none exists', async () => {
      mockPrismaService.contact.findUnique.mockResolvedValue({
        id: mockContactId,
        userId: mockUserId,
      });
      mockPrismaService.emailDraft.findUnique.mockResolvedValue(null);
      mockPrismaService.emailDraft.create.mockResolvedValue(mockDraft);

      const result = await service.autoSaveDraft(mockUserId, mockContactId, updateInput);

      expect(prisma.contact.findUnique).toHaveBeenCalledWith({
        where: { id: mockContactId },
      });
      expect(prisma.emailDraft.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          contactId: mockContactId,
          subject: updateInput.subject,
          bodyJson: updateInput.bodyJson,
          bodyHtml: updateInput.bodyHtml,
          attachments: updateInput.attachments,
          signatureId: updateInput.signatureId,
          lastSyncedAt: updateInput.lastSyncedAt,
        },
        include: {
          user: true,
          contact: true,
          signature: true,
        },
      });
      expect(result).toEqual(mockDraft);
    });

    it('should update existing draft', async () => {
      const existingDraft = { ...mockDraft, subject: 'Old subject' };
      mockPrismaService.contact.findUnique.mockResolvedValue({
        id: mockContactId,
        userId: mockUserId,
      });
      mockPrismaService.emailDraft.findUnique.mockResolvedValue(existingDraft);
      mockPrismaService.emailDraft.update.mockResolvedValue(mockDraft);

      const result = await service.autoSaveDraft(mockUserId, mockContactId, updateInput);

      expect(prisma.emailDraft.update).toHaveBeenCalledWith({
        where: {
          userId_contactId: {
            userId: mockUserId,
            contactId: mockContactId,
          },
        },
        data: {
          subject: updateInput.subject,
          bodyJson: updateInput.bodyJson,
          bodyHtml: updateInput.bodyHtml,
          attachments: updateInput.attachments,
          signatureId: updateInput.signatureId,
          lastSyncedAt: expect.any(Date),
        },
        include: {
          user: true,
          contact: true,
          signature: true,
        },
      });
      expect(result).toEqual(mockDraft);
    });

    it('should throw ForbiddenException if contact does not belong to user', async () => {
      mockPrismaService.contact.findUnique.mockResolvedValue({
        id: mockContactId,
        userId: 'other-user-id',
      });

      await expect(
        service.autoSaveDraft(mockUserId, mockContactId, updateInput),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if contact does not exist', async () => {
      mockPrismaService.contact.findUnique.mockResolvedValue(null);

      await expect(
        service.autoSaveDraft(mockUserId, mockContactId, updateInput),
      ).rejects.toThrow(NotFoundException);
    });

    it('should detect conflict if lastSyncedAt is older than existing draft', async () => {
      const existingDraft = {
        ...mockDraft,
        lastSyncedAt: new Date('2025-10-15T12:00:00Z'),
      };
      const oldSyncTime = new Date('2025-10-15T11:00:00Z');
      mockPrismaService.contact.findUnique.mockResolvedValue({
        id: mockContactId,
        userId: mockUserId,
      });
      mockPrismaService.emailDraft.findUnique.mockResolvedValue(existingDraft);

      await expect(
        service.autoSaveDraft(mockUserId, mockContactId, {
          ...updateInput,
          lastSyncedAt: oldSyncTime,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should handle undefined signatureId (set to null)', async () => {
      mockPrismaService.contact.findUnique.mockResolvedValue({
        id: mockContactId,
        userId: mockUserId,
      });
      mockPrismaService.emailDraft.findUnique.mockResolvedValue(null);
      mockPrismaService.emailDraft.create.mockResolvedValue({
        ...mockDraft,
        signatureId: null,
      });

      const inputWithoutSignature = { ...updateInput, signatureId: undefined };
      await service.autoSaveDraft(mockUserId, mockContactId, inputWithoutSignature);

      expect(prisma.emailDraft.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          signatureId: null,
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('getDraftByContact', () => {
    it('should return draft for specified contact', async () => {
      mockPrismaService.contact.findUnique.mockResolvedValue({
        id: mockContactId,
        userId: mockUserId,
      });
      mockPrismaService.emailDraft.findUnique.mockResolvedValue(mockDraft);

      const result = await service.getDraftByContact(mockUserId, mockContactId);

      expect(prisma.contact.findUnique).toHaveBeenCalledWith({
        where: { id: mockContactId },
      });
      expect(prisma.emailDraft.findUnique).toHaveBeenCalledWith({
        where: {
          userId_contactId: {
            userId: mockUserId,
            contactId: mockContactId,
          },
        },
        include: {
          user: true,
          contact: true,
          signature: true,
        },
      });
      expect(result).toEqual(mockDraft);
    });

    it('should return null if no draft exists', async () => {
      mockPrismaService.contact.findUnique.mockResolvedValue({
        id: mockContactId,
        userId: mockUserId,
      });
      mockPrismaService.emailDraft.findUnique.mockResolvedValue(null);

      const result = await service.getDraftByContact(mockUserId, mockContactId);

      expect(result).toBeNull();
    });

    it('should throw ForbiddenException if contact does not belong to user', async () => {
      mockPrismaService.contact.findUnique.mockResolvedValue({
        id: mockContactId,
        userId: 'other-user-id',
      });

      await expect(
        service.getDraftByContact(mockUserId, mockContactId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if contact does not exist', async () => {
      mockPrismaService.contact.findUnique.mockResolvedValue(null);

      await expect(
        service.getDraftByContact(mockUserId, mockContactId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('listDrafts', () => {
    const mockDrafts = [mockDraft];
    const defaultPagination = { skip: 0, take: 10 };

    it('should return paginated list of drafts sorted by UPDATED_AT DESC', async () => {
      mockPrismaService.emailDraft.findMany.mockResolvedValue(mockDrafts);
      mockPrismaService.emailDraft.count.mockResolvedValue(1);

      const result = await service.listDrafts(mockUserId, defaultPagination, DraftSortField.UPDATED_AT, SortOrder.DESC);

      expect(prisma.emailDraft.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        skip: 0,
        take: 10,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: true,
          contact: true,
          signature: true,
        },
      });
      expect(prisma.emailDraft.count).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
      expect(result).toEqual({
        edges: mockDrafts,
        pageInfo: {
          hasNextPage: false,
          total: 1,
        },
      });
    });

    it('should sort by CREATED_AT ASC', async () => {
      mockPrismaService.emailDraft.findMany.mockResolvedValue(mockDrafts);
      mockPrismaService.emailDraft.count.mockResolvedValue(1);

      await service.listDrafts(mockUserId, defaultPagination, DraftSortField.CREATED_AT, SortOrder.ASC);

      expect(prisma.emailDraft.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'asc' },
        include: expect.any(Object),
      });
    });

    it('should sort by CONTACT_NAME', async () => {
      mockPrismaService.emailDraft.findMany.mockResolvedValue(mockDrafts);
      mockPrismaService.emailDraft.count.mockResolvedValue(1);

      await service.listDrafts(mockUserId, defaultPagination, DraftSortField.CONTACT_NAME, SortOrder.ASC);

      expect(prisma.emailDraft.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        skip: 0,
        take: 10,
        orderBy: { contact: { name: 'asc' } },
        include: expect.any(Object),
      });
    });

    it('should indicate hasNextPage when more results exist', async () => {
      mockPrismaService.emailDraft.findMany.mockResolvedValue(Array(10).fill(mockDraft));
      mockPrismaService.emailDraft.count.mockResolvedValue(15);

      const result = await service.listDrafts(mockUserId, defaultPagination, DraftSortField.UPDATED_AT, SortOrder.DESC);

      expect(result.pageInfo.hasNextPage).toBe(true);
      expect(result.pageInfo.total).toBe(15);
    });

    it('should return empty list when no drafts exist', async () => {
      mockPrismaService.emailDraft.findMany.mockResolvedValue([]);
      mockPrismaService.emailDraft.count.mockResolvedValue(0);

      const result = await service.listDrafts(mockUserId, defaultPagination, DraftSortField.UPDATED_AT, SortOrder.DESC);

      expect(result).toEqual({
        edges: [],
        pageInfo: {
          hasNextPage: false,
          total: 0,
        },
      });
    });
  });

  describe('deleteDraft', () => {
    it('should delete draft successfully', async () => {
      mockPrismaService.contact.findUnique.mockResolvedValue({
        id: mockContactId,
        userId: mockUserId,
      });
      mockPrismaService.emailDraft.findUnique.mockResolvedValue(mockDraft);
      mockPrismaService.emailDraft.delete.mockResolvedValue(mockDraft);

      const result = await service.deleteDraft(mockUserId, mockContactId);

      expect(prisma.emailDraft.delete).toHaveBeenCalledWith({
        where: {
          userId_contactId: {
            userId: mockUserId,
            contactId: mockContactId,
          },
        },
      });
      expect(result).toBe(true);
    });

    it('should return false if draft does not exist', async () => {
      mockPrismaService.contact.findUnique.mockResolvedValue({
        id: mockContactId,
        userId: mockUserId,
      });
      mockPrismaService.emailDraft.findUnique.mockResolvedValue(null);

      const result = await service.deleteDraft(mockUserId, mockContactId);

      expect(prisma.emailDraft.delete).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should throw ForbiddenException if contact does not belong to user', async () => {
      mockPrismaService.contact.findUnique.mockResolvedValue({
        id: mockContactId,
        userId: 'other-user-id',
      });

      await expect(
        service.deleteDraft(mockUserId, mockContactId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if contact does not exist', async () => {
      mockPrismaService.contact.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteDraft(mockUserId, mockContactId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should delete draft with attachments (S3 cleanup deferred to background job)', async () => {
      const draftWithAttachments = {
        ...mockDraft,
        attachments: [
          {
            key: 'attachments/user-123/draft-789/file.pdf',
            filename: 'file.pdf',
            size: 1024,
            contentType: 'application/pdf',
            s3Url: 'https://s3.amazonaws.com/bucket/key',
          },
        ],
      };
      mockPrismaService.contact.findUnique.mockResolvedValue({
        id: mockContactId,
        userId: mockUserId,
      });
      mockPrismaService.emailDraft.findUnique.mockResolvedValue(draftWithAttachments);
      mockPrismaService.emailDraft.delete.mockResolvedValue(draftWithAttachments);

      const result = await service.deleteDraft(mockUserId, mockContactId);

      expect(result).toBe(true);
      // Note: S3 cleanup will be handled by background job in future implementation
    });
  });
});
