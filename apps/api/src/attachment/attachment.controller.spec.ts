import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentController } from './attachment.controller';
import { AttachmentService } from './attachment.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

// Mock the auth module to avoid jose import issues
jest.mock('../auth/auth.guard', () => ({
  AuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: () => true,
  })),
}));

describe('AttachmentController', () => {
  let controller: AttachmentController;
  let attachmentService: AttachmentService;

  const mockAttachmentService = {
    generatePresignedUploadUrl: jest.fn(),
    deleteAttachment: jest.fn(),
  };

  const mockUserId = 'user-123';
  const mockFilename = 'resume.pdf';
  const mockContentType = 'application/pdf';
  const mockFileSize = 2 * 1024 * 1024; // 2MB
  const mockKey = `${mockUserId}/attachments/uuid-123.pdf`;
  const mockUploadUrl = `https://s3.amazonaws.com/bucket/${mockKey}?signature=xyz`;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttachmentController],
      providers: [
        {
          provide: AttachmentService,
          useValue: mockAttachmentService,
        },
      ],
    }).compile();

    controller = module.get<AttachmentController>(AttachmentController);
    attachmentService = module.get<AttachmentService>(AttachmentService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /api/attachments/presigned-url', () => {
    const mockPresignedResponse = {
      uploadUrl: mockUploadUrl,
      key: mockKey,
      expiresAt: new Date('2025-10-15T13:15:00Z'),
    };

    it('should generate presigned URL for valid file upload', async () => {
      mockAttachmentService.generatePresignedUploadUrl.mockResolvedValue(mockPresignedResponse);

      const result = await controller.generatePresignedUrl(
        { supabaseId: mockUserId, email: 'test@example.com', role: 'user' },
        {
          filename: mockFilename,
          contentType: mockContentType,
          fileSize: mockFileSize,
        },
      );

      expect(mockAttachmentService.generatePresignedUploadUrl).toHaveBeenCalledWith(
        mockUserId,
        mockFilename,
        mockContentType,
        mockFileSize,
      );
      expect(result).toEqual(mockPresignedResponse);
    });

    it('should throw BadRequestException for invalid file type', async () => {
      const error = new BadRequestException('File type not allowed');
      mockAttachmentService.generatePresignedUploadUrl.mockRejectedValue(error);

      await expect(
        controller.generatePresignedUrl(
          { supabaseId: mockUserId, email: 'test@example.com', role: 'user' },
          {
            filename: 'script.exe',
            contentType: 'application/x-msdownload',
            fileSize: mockFileSize,
          },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for file size exceeding 25MB', async () => {
      const largeFileSize = 26 * 1024 * 1024; // 26MB
      const error = new BadRequestException('File size exceeds 25MB limit');
      mockAttachmentService.generatePresignedUploadUrl.mockRejectedValue(error);

      await expect(
        controller.generatePresignedUrl(
          { supabaseId: mockUserId, email: 'test@example.com', role: 'user' },
          {
            filename: mockFilename,
            contentType: mockContentType,
            fileSize: largeFileSize,
          },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle missing filename', async () => {
      const error = new BadRequestException('Filename is required');
      mockAttachmentService.generatePresignedUploadUrl.mockRejectedValue(error);

      await expect(
        controller.generatePresignedUrl(
          { supabaseId: mockUserId, email: 'test@example.com', role: 'user' },
          {
            filename: '',
            contentType: mockContentType,
            fileSize: mockFileSize,
          },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle missing content type', async () => {
      const error = new BadRequestException('Content type is required');
      mockAttachmentService.generatePresignedUploadUrl.mockRejectedValue(error);

      await expect(
        controller.generatePresignedUrl(
          { supabaseId: mockUserId, email: 'test@example.com', role: 'user' },
          {
            filename: mockFilename,
            contentType: '',
            fileSize: mockFileSize,
          },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle invalid file size (0 bytes)', async () => {
      const error = new BadRequestException('File size must be greater than 0');
      mockAttachmentService.generatePresignedUploadUrl.mockRejectedValue(error);

      await expect(
        controller.generatePresignedUrl(
          { supabaseId: mockUserId, email: 'test@example.com', role: 'user' },
          {
            filename: mockFilename,
            contentType: mockContentType,
            fileSize: 0,
          },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle negative file size', async () => {
      const error = new BadRequestException('File size must be greater than 0');
      mockAttachmentService.generatePresignedUploadUrl.mockRejectedValue(error);

      await expect(
        controller.generatePresignedUrl(
          { supabaseId: mockUserId, email: 'test@example.com', role: 'user' },
          {
            filename: mockFilename,
            contentType: mockContentType,
            fileSize: -100,
          },
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('DELETE /api/attachments/:key', () => {
    it('should successfully delete attachment owned by user', async () => {
      mockAttachmentService.deleteAttachment.mockResolvedValue(true);

      const result = await controller.deleteAttachment({ supabaseId: mockUserId, email: 'test@example.com', role: 'user' }, mockKey);

      expect(mockAttachmentService.deleteAttachment).toHaveBeenCalledWith(mockUserId, mockKey);
      expect(result).toEqual({
        success: true,
        message: 'Attachment deleted successfully',
      });
    });

    it('should throw ForbiddenException when deleting attachment owned by another user', async () => {
      const error = new ForbiddenException('You do not have permission to delete this attachment');
      mockAttachmentService.deleteAttachment.mockRejectedValue(error);

      await expect(
        controller.deleteAttachment({ supabaseId: mockUserId, email: 'test@example.com', role: 'user' }, 'other-user/attachments/file.pdf'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for invalid S3 key format', async () => {
      const error = new BadRequestException('Invalid S3 key format');
      mockAttachmentService.deleteAttachment.mockRejectedValue(error);

      await expect(controller.deleteAttachment({ supabaseId: mockUserId, email: 'test@example.com', role: 'user' }, 'invalid-key')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle empty key parameter', async () => {
      const error = new BadRequestException('S3 key is required');
      mockAttachmentService.deleteAttachment.mockRejectedValue(error);

      await expect(controller.deleteAttachment({ supabaseId: mockUserId, email: 'test@example.com', role: 'user' }, '')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle S3 deletion errors', async () => {
      const error = new Error('S3 deletion failed');
      mockAttachmentService.deleteAttachment.mockRejectedValue(error);

      await expect(controller.deleteAttachment({ supabaseId: mockUserId, email: 'test@example.com', role: 'user' }, mockKey)).rejects.toThrow(error);
    });

    it('should handle non-existent attachment', async () => {
      const error = new BadRequestException('Attachment not found');
      mockAttachmentService.deleteAttachment.mockRejectedValue(error);

      await expect(
        controller.deleteAttachment({ supabaseId: mockUserId, email: 'test@example.com', role: 'user' }, `${mockUserId}/attachments/nonexistent.pdf`),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
