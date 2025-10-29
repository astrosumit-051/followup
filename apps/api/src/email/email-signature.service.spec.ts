import { Test, TestingModule } from '@nestjs/testing';
import { EmailSignatureService } from './email-signature.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('EmailSignatureService', () => {
  let service: EmailSignatureService;
  let prisma: PrismaService;

  const mockPrismaService: any = {
    emailSignature: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    emailDraft: {
      updateMany: jest.fn(),
    },
  };

  // Add $transaction mock separately to avoid circular reference issues
  mockPrismaService.$transaction = jest.fn(async (callback: any) => {
    return callback(mockPrismaService);
  });

  const mockUserId = 'user-123';
  const mockSignatureId = 'signature-456';

  const mockTipTapJson = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Best regards,' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'John Doe' }],
      },
    ],
  };

  const mockSignature = {
    id: mockSignatureId,
    userId: mockUserId,
    name: 'Default Signature',
    contentJson: mockTipTapJson,
    contentHtml: '<p>Best regards,</p><p>John Doe</p>',
    isDefaultForFormal: false,
    isDefaultForCasual: false,
    isGlobalDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    usageCount: 5,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailSignatureService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EmailSignatureService>(EmailSignatureService);
    prisma = module.get<PrismaService>(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSignature', () => {
    const createInput = {
      name: 'Professional Signature',
      contentJson: mockTipTapJson,
      contentHtml: '<p>Best regards,</p><p>John Doe</p>',
      isDefaultForFormal: false,
      isDefaultForCasual: false,
      isGlobalDefault: false,
    };

    it('should create a new signature', async () => {
      mockPrismaService.emailSignature.count.mockResolvedValue(3);
      mockPrismaService.emailSignature.create.mockResolvedValue(mockSignature);

      const result = await service.createSignature(mockUserId, createInput);

      expect(prisma.emailSignature.count).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
      expect(prisma.emailSignature.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          name: createInput.name,
          contentJson: createInput.contentJson,
          contentHtml: createInput.contentHtml,
          isDefaultForFormal: false,
          isDefaultForCasual: false,
          isGlobalDefault: false,
          usageCount: 0,
        },
      });
      expect(result).toEqual(mockSignature);
    });

    it('should throw BadRequestException if user already has 10 signatures', async () => {
      mockPrismaService.emailSignature.count.mockResolvedValue(10);

      await expect(
        service.createSignature(mockUserId, createInput),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.createSignature(mockUserId, createInput),
      ).rejects.toThrow('You cannot have more than 10 signatures');
    });

    it('should unset other global defaults when creating new global default', async () => {
      mockPrismaService.emailSignature.count.mockResolvedValue(3);
      mockPrismaService.emailSignature.create.mockResolvedValue({
        ...mockSignature,
        isGlobalDefault: true,
      });

      await service.createSignature(mockUserId, {
        ...createInput,
        isGlobalDefault: true,
      });

      expect(prisma.emailSignature.updateMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          isGlobalDefault: true,
        },
        data: {
          isGlobalDefault: false,
        },
      });
    });

    it('should unset other formal defaults when creating new formal default', async () => {
      mockPrismaService.emailSignature.count.mockResolvedValue(3);
      mockPrismaService.emailSignature.create.mockResolvedValue(mockSignature);

      await service.createSignature(mockUserId, {
        ...createInput,
        isDefaultForFormal: true,
      });

      expect(prisma.emailSignature.updateMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          isDefaultForFormal: true,
        },
        data: {
          isDefaultForFormal: false,
        },
      });
    });

    it('should unset other casual defaults when creating new casual default', async () => {
      mockPrismaService.emailSignature.count.mockResolvedValue(3);
      mockPrismaService.emailSignature.create.mockResolvedValue(mockSignature);

      await service.createSignature(mockUserId, {
        ...createInput,
        isDefaultForCasual: true,
      });

      expect(prisma.emailSignature.updateMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          isDefaultForCasual: true,
        },
        data: {
          isDefaultForCasual: false,
        },
      });
    });
  });

  describe('updateSignature', () => {
    const updateInput = {
      name: 'Updated Signature',
      contentJson: mockTipTapJson,
      contentHtml: '<p>Updated content</p>',
      isDefaultForFormal: true,
      isDefaultForCasual: false,
      isGlobalDefault: false,
    };

    it('should update an existing signature', async () => {
      mockPrismaService.emailSignature.findUnique.mockResolvedValue(mockSignature);
      mockPrismaService.emailSignature.update.mockResolvedValue({
        ...mockSignature,
        ...updateInput,
      });

      const result = await service.updateSignature(mockUserId, mockSignatureId, updateInput);

      expect(prisma.emailSignature.update).toHaveBeenCalledWith({
        where: { id: mockSignatureId },
        data: {
          name: updateInput.name,
          contentJson: updateInput.contentJson,
          contentHtml: updateInput.contentHtml,
          isDefaultForFormal: updateInput.isDefaultForFormal,
          isDefaultForCasual: updateInput.isDefaultForCasual,
          isGlobalDefault: updateInput.isGlobalDefault,
        },
      });
      expect(result).toEqual({ ...mockSignature, ...updateInput });
    });

    it('should throw NotFoundException if signature does not exist', async () => {
      mockPrismaService.emailSignature.findUnique.mockResolvedValue(null);

      await expect(
        service.updateSignature(mockUserId, mockSignatureId, updateInput),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if signature does not belong to user', async () => {
      mockPrismaService.emailSignature.findUnique.mockResolvedValue({
        ...mockSignature,
        userId: 'other-user-id',
      });

      await expect(
        service.updateSignature(mockUserId, mockSignatureId, updateInput),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should unset other defaults when updating to default', async () => {
      mockPrismaService.emailSignature.findUnique.mockResolvedValue(mockSignature);
      mockPrismaService.emailSignature.update.mockResolvedValue({
        ...mockSignature,
        isDefaultForFormal: true,
      });

      await service.updateSignature(mockUserId, mockSignatureId, {
        ...updateInput,
        isDefaultForFormal: true,
      });

      expect(prisma.emailSignature.updateMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          isDefaultForFormal: true,
          id: { not: mockSignatureId },
        },
        data: {
          isDefaultForFormal: false,
        },
      });
    });
  });

  describe('listSignatures', () => {
    const mockSignatures = [
      { ...mockSignature, name: 'A Signature' },
      { ...mockSignature, name: 'B Signature' },
      { ...mockSignature, name: 'C Signature' },
    ];

    it('should return all signatures sorted alphabetically by name', async () => {
      mockPrismaService.emailSignature.findMany.mockResolvedValue(mockSignatures);

      const result = await service.listSignatures(mockUserId);

      expect(prisma.emailSignature.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(mockSignatures);
    });

    it('should return empty array if user has no signatures', async () => {
      mockPrismaService.emailSignature.findMany.mockResolvedValue([]);

      const result = await service.listSignatures(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('getSignatureById', () => {
    it('should return signature by ID', async () => {
      mockPrismaService.emailSignature.findUnique.mockResolvedValue(mockSignature);

      const result = await service.getSignatureById(mockUserId, mockSignatureId);

      expect(prisma.emailSignature.findUnique).toHaveBeenCalledWith({
        where: { id: mockSignatureId },
      });
      expect(result).toEqual(mockSignature);
    });

    it('should throw NotFoundException if signature does not exist', async () => {
      mockPrismaService.emailSignature.findUnique.mockResolvedValue(null);

      await expect(
        service.getSignatureById(mockUserId, mockSignatureId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if signature does not belong to user', async () => {
      mockPrismaService.emailSignature.findUnique.mockResolvedValue({
        ...mockSignature,
        userId: 'other-user-id',
      });

      await expect(
        service.getSignatureById(mockUserId, mockSignatureId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteSignature', () => {
    it('should delete signature and set drafts signatureId to null', async () => {
      mockPrismaService.emailSignature.findUnique.mockResolvedValue(mockSignature);
      mockPrismaService.emailDraft.updateMany.mockResolvedValue({ count: 2 });
      mockPrismaService.emailSignature.delete.mockResolvedValue(mockSignature);

      const result = await service.deleteSignature(mockUserId, mockSignatureId);

      expect(prisma.emailDraft.updateMany).toHaveBeenCalledWith({
        where: { signatureId: mockSignatureId },
        data: { signatureId: null },
      });
      expect(prisma.emailSignature.delete).toHaveBeenCalledWith({
        where: { id: mockSignatureId },
      });
      expect(result).toBe(true);
    });

    it('should throw NotFoundException if signature does not exist', async () => {
      mockPrismaService.emailSignature.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteSignature(mockUserId, mockSignatureId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if signature does not belong to user', async () => {
      mockPrismaService.emailSignature.findUnique.mockResolvedValue({
        ...mockSignature,
        userId: 'other-user-id',
      });

      await expect(
        service.deleteSignature(mockUserId, mockSignatureId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getDefaultSignature', () => {
    it('should return formal default signature when context is FORMAL', async () => {
      const formalSignature = { ...mockSignature, isDefaultForFormal: true };
      mockPrismaService.emailSignature.findFirst.mockResolvedValue(formalSignature);

      const result = await service.getDefaultSignature(mockUserId, 'FORMAL');

      expect(prisma.emailSignature.findFirst).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          isDefaultForFormal: true,
        },
      });
      expect(result).toEqual(formalSignature);
    });

    it('should return casual default signature when context is CASUAL', async () => {
      const casualSignature = { ...mockSignature, isDefaultForCasual: true };
      mockPrismaService.emailSignature.findFirst.mockResolvedValue(casualSignature);

      const result = await service.getDefaultSignature(mockUserId, 'CASUAL');

      expect(prisma.emailSignature.findFirst).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          isDefaultForCasual: true,
        },
      });
      expect(result).toEqual(casualSignature);
    });

    it('should fallback to global default if formal default not found', async () => {
      const globalSignature = { ...mockSignature, isGlobalDefault: true };
      mockPrismaService.emailSignature.findFirst
        .mockResolvedValueOnce(null) // No formal default
        .mockResolvedValueOnce(globalSignature); // Global default

      const result = await service.getDefaultSignature(mockUserId, 'FORMAL');

      expect(prisma.emailSignature.findFirst).toHaveBeenNthCalledWith(1, {
        where: {
          userId: mockUserId,
          isDefaultForFormal: true,
        },
      });
      expect(prisma.emailSignature.findFirst).toHaveBeenNthCalledWith(2, {
        where: {
          userId: mockUserId,
          isGlobalDefault: true,
        },
      });
      expect(result).toEqual(globalSignature);
    });

    it('should fallback to global default if casual default not found', async () => {
      const globalSignature = { ...mockSignature, isGlobalDefault: true };
      mockPrismaService.emailSignature.findFirst
        .mockResolvedValueOnce(null) // No casual default
        .mockResolvedValueOnce(globalSignature); // Global default

      const result = await service.getDefaultSignature(mockUserId, 'CASUAL');

      expect(result).toEqual(globalSignature);
    });

    it('should return null if no default signatures exist', async () => {
      mockPrismaService.emailSignature.findFirst
        .mockResolvedValueOnce(null) // No formal default
        .mockResolvedValueOnce(null); // No global default

      const result = await service.getDefaultSignature(mockUserId, 'FORMAL');

      expect(result).toBeNull();
    });

    it('should return global default when context is not specified', async () => {
      const globalSignature = { ...mockSignature, isGlobalDefault: true };
      mockPrismaService.emailSignature.findFirst.mockResolvedValue(globalSignature);

      const result = await service.getDefaultSignature(mockUserId);

      expect(prisma.emailSignature.findFirst).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          isGlobalDefault: true,
        },
      });
      expect(result).toEqual(globalSignature);
    });
  });
});
