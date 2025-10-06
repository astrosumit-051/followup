import 'reflect-metadata';
import { validate } from 'class-validator';
import { UpdateContactDto } from './update-contact.dto';
import { Priority } from '../enums/priority.enum';
import { Gender } from '../enums/gender.enum';

describe('UpdateContactDto', () => {
  describe('partial update behavior', () => {
    it('should pass with no fields provided (empty update)', async () => {
      const dto = new UpdateContactDto();
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with single field update', async () => {
      const dto = new UpdateContactDto();
      dto.name = 'Jane Doe';
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with multiple field updates', async () => {
      const dto = new UpdateContactDto();
      dto.name = 'Jane Doe';
      dto.email = 'jane@example.com';
      dto.priority = Priority.HIGH;
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with all fields provided', async () => {
      const dto = new UpdateContactDto();
      dto.name = 'Jane Doe';
      dto.email = 'jane@example.com';
      dto.phone = '+1234567890';
      dto.linkedInUrl = 'https://linkedin.com/in/janedoe';
      dto.company = 'Tech Corp';
      dto.industry = 'Technology';
      dto.role = 'CTO';
      dto.priority = Priority.HIGH;
      dto.gender = Gender.FEMALE;
      dto.birthday = new Date('1990-01-15');
      dto.notes = 'Important contact';
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('name field', () => {
    it('should pass with valid name', async () => {
      const dto = new UpdateContactDto();
      dto.name = 'Jane Doe';
      const errors = await validate(dto);
      const nameErrors = errors.filter((e) => e.property === 'name');
      expect(nameErrors).toHaveLength(0);
    });

    it('should fail when name is empty string', async () => {
      const dto = new UpdateContactDto();
      dto.name = '';
      const errors = await validate(dto);
      const nameErrors = errors.filter((e) => e.property === 'name');
      expect(nameErrors.length).toBeGreaterThan(0);
    });

    it('should fail when name is only whitespace', async () => {
      const dto = new UpdateContactDto();
      dto.name = '   ';
      const errors = await validate(dto);
      const nameErrors = errors.filter((e) => e.property === 'name');
      expect(nameErrors.length).toBeGreaterThan(0);
    });

    it('should fail when name exceeds 255 characters', async () => {
      const dto = new UpdateContactDto();
      dto.name = 'a'.repeat(256);
      const errors = await validate(dto);
      const nameErrors = errors.filter((e) => e.property === 'name');
      expect(nameErrors.length).toBeGreaterThan(0);
      expect(nameErrors[0].constraints).toHaveProperty('maxLength');
    });

    it('should pass with name at 255 character limit', async () => {
      const dto = new UpdateContactDto();
      dto.name = 'a'.repeat(255);
      const errors = await validate(dto);
      const nameErrors = errors.filter((e) => e.property === 'name');
      expect(nameErrors).toHaveLength(0);
    });
  });

  describe('email field', () => {
    it('should pass with valid email', async () => {
      const dto = new UpdateContactDto();
      dto.email = 'test@example.com';
      const errors = await validate(dto);
      const emailErrors = errors.filter((e) => e.property === 'email');
      expect(emailErrors).toHaveLength(0);
    });

    it('should fail when email is invalid format', async () => {
      const dto = new UpdateContactDto();
      dto.email = 'invalid-email';
      const errors = await validate(dto);
      const emailErrors = errors.filter((e) => e.property === 'email');
      expect(emailErrors.length).toBeGreaterThan(0);
      expect(emailErrors[0].constraints).toHaveProperty('isEmail');
    });
  });

  describe('phone field', () => {
    it('should pass with valid phone number', async () => {
      const dto = new UpdateContactDto();
      dto.phone = '+1 (555) 123-4567';
      const errors = await validate(dto);
      const phoneErrors = errors.filter((e) => e.property === 'phone');
      expect(phoneErrors).toHaveLength(0);
    });

    it('should fail when phone exceeds 50 characters', async () => {
      const dto = new UpdateContactDto();
      dto.phone = '1'.repeat(51);
      const errors = await validate(dto);
      const phoneErrors = errors.filter((e) => e.property === 'phone');
      expect(phoneErrors.length).toBeGreaterThan(0);
      expect(phoneErrors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('linkedInUrl field', () => {
    it('should pass with valid LinkedIn URL', async () => {
      const dto = new UpdateContactDto();
      dto.linkedInUrl = 'https://www.linkedin.com/in/johndoe';
      const errors = await validate(dto);
      const urlErrors = errors.filter((e) => e.property === 'linkedInUrl');
      expect(urlErrors).toHaveLength(0);
    });

    it('should fail when linkedInUrl is invalid format', async () => {
      const dto = new UpdateContactDto();
      dto.linkedInUrl = 'not-a-url';
      const errors = await validate(dto);
      const urlErrors = errors.filter((e) => e.property === 'linkedInUrl');
      expect(urlErrors.length).toBeGreaterThan(0);
      expect(urlErrors[0].constraints).toHaveProperty('isUrl');
    });
  });

  describe('company field', () => {
    it('should pass with valid company name', async () => {
      const dto = new UpdateContactDto();
      dto.company = 'Acme Corporation';
      const errors = await validate(dto);
      const companyErrors = errors.filter((e) => e.property === 'company');
      expect(companyErrors).toHaveLength(0);
    });

    it('should fail when company exceeds 255 characters', async () => {
      const dto = new UpdateContactDto();
      dto.company = 'a'.repeat(256);
      const errors = await validate(dto);
      const companyErrors = errors.filter((e) => e.property === 'company');
      expect(companyErrors.length).toBeGreaterThan(0);
      expect(companyErrors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('industry field', () => {
    it('should pass with valid industry', async () => {
      const dto = new UpdateContactDto();
      dto.industry = 'Technology';
      const errors = await validate(dto);
      const industryErrors = errors.filter((e) => e.property === 'industry');
      expect(industryErrors).toHaveLength(0);
    });

    it('should fail when industry exceeds 255 characters', async () => {
      const dto = new UpdateContactDto();
      dto.industry = 'a'.repeat(256);
      const errors = await validate(dto);
      const industryErrors = errors.filter((e) => e.property === 'industry');
      expect(industryErrors.length).toBeGreaterThan(0);
      expect(industryErrors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('role field', () => {
    it('should pass with valid role', async () => {
      const dto = new UpdateContactDto();
      dto.role = 'Chief Technology Officer';
      const errors = await validate(dto);
      const roleErrors = errors.filter((e) => e.property === 'role');
      expect(roleErrors).toHaveLength(0);
    });

    it('should fail when role exceeds 255 characters', async () => {
      const dto = new UpdateContactDto();
      dto.role = 'a'.repeat(256);
      const errors = await validate(dto);
      const roleErrors = errors.filter((e) => e.property === 'role');
      expect(roleErrors.length).toBeGreaterThan(0);
      expect(roleErrors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('priority field', () => {
    it('should pass with HIGH priority', async () => {
      const dto = new UpdateContactDto();
      dto.priority = Priority.HIGH;
      const errors = await validate(dto);
      const priorityErrors = errors.filter((e) => e.property === 'priority');
      expect(priorityErrors).toHaveLength(0);
    });

    it('should pass with MEDIUM priority', async () => {
      const dto = new UpdateContactDto();
      dto.priority = Priority.MEDIUM;
      const errors = await validate(dto);
      const priorityErrors = errors.filter((e) => e.property === 'priority');
      expect(priorityErrors).toHaveLength(0);
    });

    it('should pass with LOW priority', async () => {
      const dto = new UpdateContactDto();
      dto.priority = Priority.LOW;
      const errors = await validate(dto);
      const priorityErrors = errors.filter((e) => e.property === 'priority');
      expect(priorityErrors).toHaveLength(0);
    });

    it('should fail with invalid priority value', async () => {
      const dto = new UpdateContactDto();
      dto.priority = 'INVALID' as Priority;
      const errors = await validate(dto);
      const priorityErrors = errors.filter((e) => e.property === 'priority');
      expect(priorityErrors.length).toBeGreaterThan(0);
      expect(priorityErrors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('gender field', () => {
    it('should pass with MALE gender', async () => {
      const dto = new UpdateContactDto();
      dto.gender = Gender.MALE;
      const errors = await validate(dto);
      const genderErrors = errors.filter((e) => e.property === 'gender');
      expect(genderErrors).toHaveLength(0);
    });

    it('should pass with FEMALE gender', async () => {
      const dto = new UpdateContactDto();
      dto.gender = Gender.FEMALE;
      const errors = await validate(dto);
      const genderErrors = errors.filter((e) => e.property === 'gender');
      expect(genderErrors).toHaveLength(0);
    });

    it('should pass with OTHER gender', async () => {
      const dto = new UpdateContactDto();
      dto.gender = Gender.OTHER;
      const errors = await validate(dto);
      const genderErrors = errors.filter((e) => e.property === 'gender');
      expect(genderErrors).toHaveLength(0);
    });

    it('should pass with PREFER_NOT_TO_SAY gender', async () => {
      const dto = new UpdateContactDto();
      dto.gender = Gender.PREFER_NOT_TO_SAY;
      const errors = await validate(dto);
      const genderErrors = errors.filter((e) => e.property === 'gender');
      expect(genderErrors).toHaveLength(0);
    });

    it('should fail with invalid gender value', async () => {
      const dto = new UpdateContactDto();
      dto.gender = 'INVALID' as Gender;
      const errors = await validate(dto);
      const genderErrors = errors.filter((e) => e.property === 'gender');
      expect(genderErrors.length).toBeGreaterThan(0);
      expect(genderErrors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('birthday field', () => {
    it('should pass with valid Date object', async () => {
      const dto = new UpdateContactDto();
      dto.birthday = new Date('1990-05-15');
      const errors = await validate(dto);
      const birthdayErrors = errors.filter((e) => e.property === 'birthday');
      expect(birthdayErrors).toHaveLength(0);
    });

    it('should fail with invalid date', async () => {
      const dto = new UpdateContactDto();
      dto.birthday = 'not-a-date' as any;
      const errors = await validate(dto);
      const birthdayErrors = errors.filter((e) => e.property === 'birthday');
      expect(birthdayErrors.length).toBeGreaterThan(0);
      expect(birthdayErrors[0].constraints).toHaveProperty('isDate');
    });
  });

  describe('notes field', () => {
    it('should pass with valid notes', async () => {
      const dto = new UpdateContactDto();
      dto.notes = 'Met at tech conference. Interested in AI/ML collaboration.';
      const errors = await validate(dto);
      const notesErrors = errors.filter((e) => e.property === 'notes');
      expect(notesErrors).toHaveLength(0);
    });

    it('should fail when notes exceed 10,000 characters', async () => {
      const dto = new UpdateContactDto();
      dto.notes = 'a'.repeat(10001);
      const errors = await validate(dto);
      const notesErrors = errors.filter((e) => e.property === 'notes');
      expect(notesErrors.length).toBeGreaterThan(0);
      expect(notesErrors[0].constraints).toHaveProperty('maxLength');
    });

    it('should pass with notes at 10,000 character limit', async () => {
      const dto = new UpdateContactDto();
      dto.notes = 'a'.repeat(10000);
      const errors = await validate(dto);
      const notesErrors = errors.filter((e) => e.property === 'notes');
      expect(notesErrors).toHaveLength(0);
    });
  });

  describe('immutable fields', () => {
    it('should not have userId field (userId cannot be updated)', async () => {
      const dto = new UpdateContactDto();
      expect(dto).not.toHaveProperty('userId');
    });

    it('should not have id field (id cannot be updated)', async () => {
      const dto = new UpdateContactDto();
      expect(dto).not.toHaveProperty('id');
    });

    it('should not have createdAt field (createdAt cannot be updated)', async () => {
      const dto = new UpdateContactDto();
      expect(dto).not.toHaveProperty('createdAt');
    });
  });
});
