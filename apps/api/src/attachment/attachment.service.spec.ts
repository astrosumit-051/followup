import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentService } from './attachment.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('AttachmentService', () => {
  let service: AttachmentService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        AWS_REGION: 'us-east-1',
        S3_BUCKET: 'test-bucket',
        AWS_ACCESS_KEY_ID: 'test-access-key',
        AWS_SECRET_ACCESS_KEY: 'test-secret-key',
      };
      return config[key];
    }),
  };

  const mockUserId = 'user-123';
  const mockFilename = 'document.pdf';
  const mockContentType = 'application/pdf';
  const mockFileSize = 10 * 1024 * 1024; // 10MB

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttachmentService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AttachmentService>(AttachmentService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generatePresignedUploadUrl', () => {
    it('should generate presigned URL for valid file', async () => {
      const result = await service.generatePresignedUploadUrl(
        mockUserId,
        mockFilename,
        mockContentType,
        mockFileSize,
      );

      expect(result).toHaveProperty('uploadUrl');
      expect(result).toHaveProperty('key');
      expect(result).toHaveProperty('expiresAt');
      expect(result.uploadUrl).toContain('test-bucket');
      expect(result.uploadUrl).toContain('X-Amz-Signature');
      expect(result.key).toContain(mockUserId);
      expect(result.key).toContain('.pdf');
    });

    it('should include userId in S3 key for organization', async () => {
      const result = await service.generatePresignedUploadUrl(
        mockUserId,
        mockFilename,
        mockContentType,
        mockFileSize,
      );

      expect(result.key).toMatch(/^user-123\/attachments\/[a-f0-9-]+\.pdf$/);
    });

    it('should set 15-minute expiry for presigned URL', async () => {
      const beforeTime = Date.now();
      const result = await service.generatePresignedUploadUrl(
        mockUserId,
        mockFilename,
        mockContentType,
        mockFileSize,
      );
      const afterTime = Date.now();

      const expiryTime = new Date(result.expiresAt).getTime();
      const expectedMinExpiry = beforeTime + 14 * 60 * 1000; // 14 minutes
      const expectedMaxExpiry = afterTime + 16 * 60 * 1000; // 16 minutes

      expect(expiryTime).toBeGreaterThanOrEqual(expectedMinExpiry);
      expect(expiryTime).toBeLessThanOrEqual(expectedMaxExpiry);
    });

    it('should throw BadRequestException for invalid file type', async () => {
      await expect(
        service.generatePresignedUploadUrl(mockUserId, 'script.exe', 'application/x-msdownload', mockFileSize),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.generatePresignedUploadUrl(mockUserId, 'script.exe', 'application/x-msdownload', mockFileSize),
      ).rejects.toThrow('File type not allowed');
    });

    it('should allow PDF files', async () => {
      await expect(
        service.generatePresignedUploadUrl(mockUserId, 'document.pdf', 'application/pdf', mockFileSize),
      ).resolves.toBeDefined();
    });

    it('should allow DOC files', async () => {
      await expect(
        service.generatePresignedUploadUrl(mockUserId, 'document.doc', 'application/msword', mockFileSize),
      ).resolves.toBeDefined();
    });

    it('should allow DOCX files', async () => {
      await expect(
        service.generatePresignedUploadUrl(
          mockUserId,
          'document.docx',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          mockFileSize,
        ),
      ).resolves.toBeDefined();
    });

    it('should allow XLS files', async () => {
      await expect(
        service.generatePresignedUploadUrl(mockUserId, 'spreadsheet.xls', 'application/vnd.ms-excel', mockFileSize),
      ).resolves.toBeDefined();
    });

    it('should allow XLSX files', async () => {
      await expect(
        service.generatePresignedUploadUrl(
          mockUserId,
          'spreadsheet.xlsx',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          mockFileSize,
        ),
      ).resolves.toBeDefined();
    });

    it('should allow PNG images', async () => {
      await expect(
        service.generatePresignedUploadUrl(mockUserId, 'image.png', 'image/png', mockFileSize),
      ).resolves.toBeDefined();
    });

    it('should allow JPEG images', async () => {
      await expect(
        service.generatePresignedUploadUrl(mockUserId, 'image.jpg', 'image/jpeg', mockFileSize),
      ).resolves.toBeDefined();
    });

    it('should throw BadRequestException for file size > 25MB', async () => {
      const oversizedFile = 26 * 1024 * 1024; // 26MB

      await expect(
        service.generatePresignedUploadUrl(mockUserId, mockFilename, mockContentType, oversizedFile),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.generatePresignedUploadUrl(mockUserId, mockFilename, mockContentType, oversizedFile),
      ).rejects.toThrow('File size exceeds 25MB limit');
    });

    it('should allow file size exactly 25MB', async () => {
      const exactLimit = 25 * 1024 * 1024; // 25MB

      await expect(
        service.generatePresignedUploadUrl(mockUserId, mockFilename, mockContentType, exactLimit),
      ).resolves.toBeDefined();
    });

    it('should throw BadRequestException for executable files', async () => {
      const executables = [
        { filename: 'script.exe', contentType: 'application/x-msdownload' },
        { filename: 'script.py', contentType: 'text/x-python' },
        { filename: 'script.sh', contentType: 'application/x-sh' },
        { filename: 'data.json', contentType: 'application/json' },
      ];

      for (const file of executables) {
        await expect(
          service.generatePresignedUploadUrl(mockUserId, file.filename, file.contentType, mockFileSize),
        ).rejects.toThrow(BadRequestException);
      }
    });
  });

  describe('deleteAttachment', () => {
    it('should delete attachment from S3', async () => {
      const mockKey = `${mockUserId}/attachments/test-file.pdf`;
      const mockDeleteCommand = jest.fn().mockResolvedValue({});

      jest.spyOn(service as any, 'deleteFromS3').mockImplementation(mockDeleteCommand);

      await service.deleteAttachment(mockUserId, mockKey);

      expect(mockDeleteCommand).toHaveBeenCalledWith(mockKey);
    });

    it('should throw ForbiddenException if user does not own attachment', async () => {
      const otherUserKey = 'other-user-id/attachments/test-file.pdf';

      await expect(service.deleteAttachment(mockUserId, otherUserKey)).rejects.toThrow(ForbiddenException);
      await expect(service.deleteAttachment(mockUserId, otherUserKey)).rejects.toThrow(
        'You do not have permission to delete this attachment',
      );
    });

    it('should allow deletion if user owns attachment', async () => {
      const userKey = `${mockUserId}/attachments/test-file.pdf`;
      const mockDeleteCommand = jest.fn().mockResolvedValue({});

      jest.spyOn(service as any, 'deleteFromS3').mockImplementation(mockDeleteCommand);

      await expect(service.deleteAttachment(mockUserId, userKey)).resolves.toBe(true);
    });
  });

  describe('cleanupOrphanedAttachments', () => {
    it('should identify attachments older than 30 days', () => {
      const now = new Date();
      const old = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000); // 31 days ago
      const recent = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000); // 29 days ago

      const isOrphaned = (service as any).isOrphanedAttachment.bind(service);

      expect(isOrphaned(old)).toBe(true);
      expect(isOrphaned(recent)).toBe(false);
    });

    it('should delete orphaned attachments from S3', async () => {
      const mockOrphanedKeys = ['user-1/attachments/old-file1.pdf', 'user-2/attachments/old-file2.pdf'];

      const mockListObjects = jest.fn().mockResolvedValue({
        Contents: mockOrphanedKeys.map(key => ({
          Key: key,
          LastModified: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000), // 31 days ago
        })),
      });

      const mockDeleteObjects = jest.fn().mockResolvedValue({});

      jest.spyOn(service as any, 'listS3Objects').mockImplementation(mockListObjects);
      jest.spyOn(service as any, 'deleteS3Objects').mockImplementation(mockDeleteObjects);

      const result = await service.cleanupOrphanedAttachments();

      expect(mockListObjects).toHaveBeenCalled();
      expect(mockDeleteObjects).toHaveBeenCalledWith(mockOrphanedKeys);
      expect(result.deletedCount).toBe(2);
    });

    it('should not delete recent attachments', async () => {
      const mockRecentKeys = [
        {
          Key: 'user-1/attachments/recent-file.pdf',
          LastModified: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000), // 29 days ago
        },
      ];

      const mockListObjects = jest.fn().mockResolvedValue({
        Contents: mockRecentKeys,
      });

      const mockDeleteObjects = jest.fn().mockResolvedValue({});

      jest.spyOn(service as any, 'listS3Objects').mockImplementation(mockListObjects);
      jest.spyOn(service as any, 'deleteS3Objects').mockImplementation(mockDeleteObjects);

      const result = await service.cleanupOrphanedAttachments();

      expect(mockDeleteObjects).not.toHaveBeenCalled();
      expect(result.deletedCount).toBe(0);
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extension from filename', () => {
      expect((service as any).getFileExtension('document.pdf')).toBe('.pdf');
      expect((service as any).getFileExtension('image.png')).toBe('.png');
      expect((service as any).getFileExtension('file.with.dots.xlsx')).toBe('.xlsx');
    });

    it('should return empty string for files without extension', () => {
      expect((service as any).getFileExtension('README')).toBe('');
    });
  });

  describe('isValidContentType', () => {
    it('should validate allowed content types', () => {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/png',
        'image/jpeg',
      ];

      for (const type of allowedTypes) {
        expect((service as any).isValidContentType(type)).toBe(true);
      }
    });

    it('should reject disallowed content types', () => {
      const disallowedTypes = [
        'application/x-msdownload',
        'text/x-python',
        'application/x-sh',
        'application/json',
        'text/html',
        'application/javascript',
      ];

      for (const type of disallowedTypes) {
        expect((service as any).isValidContentType(type)).toBe(false);
      }
    });
  });
});
