import { validate } from 'class-validator';
import { UpdateProfileDto } from './update-profile.dto';

describe('UpdateProfileDto Validation', () => {
  describe('name field validation', () => {
    it('should accept valid name with letters and spaces', async () => {
      const dto = new UpdateProfileDto();
      dto.name = 'John Doe';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept valid name with hyphens', async () => {
      const dto = new UpdateProfileDto();
      dto.name = 'Mary-Jane Watson';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept valid name with apostrophes', async () => {
      const dto = new UpdateProfileDto();
      dto.name = "O'Brien";

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept valid name with periods', async () => {
      const dto = new UpdateProfileDto();
      dto.name = 'Dr. Smith Jr.';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept valid name with accented characters', async () => {
      const dto = new UpdateProfileDto();
      dto.name = 'María García';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept valid name with numbers', async () => {
      const dto = new UpdateProfileDto();
      dto.name = 'User123';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject name with only spaces', async () => {
      const dto = new UpdateProfileDto();
      dto.name = '   ';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('should reject empty string name', async () => {
      const dto = new UpdateProfileDto();
      dto.name = '';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should reject name exceeding 100 characters', async () => {
      const dto = new UpdateProfileDto();
      dto.name = 'A'.repeat(101);

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should reject name with special characters (XSS attempt)', async () => {
      const dto = new UpdateProfileDto();
      dto.name = '<script>alert("XSS")</script>';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('should reject name with SQL injection attempt', async () => {
      const dto = new UpdateProfileDto();
      dto.name = "'; DROP TABLE users; --";

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('should reject name with control characters', async () => {
      const dto = new UpdateProfileDto();
      dto.name = 'John\x00Doe'; // Null byte injection

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('should reject name with newline characters', async () => {
      const dto = new UpdateProfileDto();
      dto.name = 'John\nDoe';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('should reject non-string name', async () => {
      const dto = new UpdateProfileDto();
      (dto as any).name = 12345;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should allow undefined name (optional field)', async () => {
      const dto = new UpdateProfileDto();
      // name is undefined

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('profilePicture field validation', () => {
    it('should accept valid HTTPS URL', async () => {
      const dto = new UpdateProfileDto();
      dto.profilePicture = 'https://example.com/avatar.jpg';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept valid Google Cloud Storage URL', async () => {
      const dto = new UpdateProfileDto();
      dto.profilePicture = 'https://storage.googleapis.com/bucket/profile-123.png';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept valid AWS S3 URL', async () => {
      const dto = new UpdateProfileDto();
      dto.profilePicture = 'https://s3.amazonaws.com/bucket/avatar.jpg';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject HTTP URL (must be HTTPS)', async () => {
      const dto = new UpdateProfileDto();
      dto.profilePicture = 'http://example.com/avatar.jpg';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('should reject URL without protocol', async () => {
      const dto = new UpdateProfileDto();
      dto.profilePicture = 'example.com/avatar.jpg';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('should reject file:// protocol (file URI attack)', async () => {
      const dto = new UpdateProfileDto();
      dto.profilePicture = 'file:///etc/passwd';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('should reject javascript: protocol (XSS attack)', async () => {
      const dto = new UpdateProfileDto();
      dto.profilePicture = 'javascript:alert("XSS")';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('should reject data: protocol (data URI injection)', async () => {
      const dto = new UpdateProfileDto();
      dto.profilePicture = 'data:text/html,<script>alert("XSS")</script>';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('should reject URL exceeding 2048 characters', async () => {
      const dto = new UpdateProfileDto();
      const longPath = 'a'.repeat(2040);
      dto.profilePicture = `https://example.com/${longPath}`;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should reject invalid URL format', async () => {
      const dto = new UpdateProfileDto();
      dto.profilePicture = 'not-a-url';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('should reject malformed URL', async () => {
      const dto = new UpdateProfileDto();
      dto.profilePicture = 'https://';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('should reject non-string profile picture', async () => {
      const dto = new UpdateProfileDto();
      (dto as any).profilePicture = 12345;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('should allow undefined profilePicture (optional field)', async () => {
      const dto = new UpdateProfileDto();
      // profilePicture is undefined

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('combined field validation', () => {
    it('should accept both fields with valid values', async () => {
      const dto = new UpdateProfileDto();
      dto.name = 'John Doe';
      dto.profilePicture = 'https://example.com/avatar.jpg';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept only name field', async () => {
      const dto = new UpdateProfileDto();
      dto.name = 'John Doe';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept only profilePicture field', async () => {
      const dto = new UpdateProfileDto();
      dto.profilePicture = 'https://example.com/avatar.jpg';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept empty DTO (all fields optional)', async () => {
      const dto = new UpdateProfileDto();

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject both fields when invalid', async () => {
      const dto = new UpdateProfileDto();
      dto.name = '<script>alert("XSS")</script>';
      dto.profilePicture = 'javascript:alert("XSS")';

      const errors = await validate(dto);
      expect(errors.length).toBe(2); // Both fields should fail validation
    });
  });
});
