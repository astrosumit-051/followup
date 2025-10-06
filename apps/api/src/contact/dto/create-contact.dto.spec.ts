import 'reflect-metadata';
import { validate } from 'class-validator';
import { CreateContactDto } from './create-contact.dto';
import { Priority } from '../enums/priority.enum';
import { Gender } from '../enums/gender.enum';

describe('CreateContactDto', () => {
  describe('name field', () => {
    it('should pass with valid name', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';

      const errors = await validate(dto);
      const nameErrors = errors.filter((e) => e.property === 'name');

      expect(nameErrors).toHaveLength(0);
    });

    it('should fail when name is missing', async () => {
      const dto = new CreateContactDto();
      // name not set

      const errors = await validate(dto);
      const nameErrors = errors.filter((e) => e.property === 'name');

      expect(nameErrors.length).toBeGreaterThan(0);
      expect(nameErrors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when name is empty string', async () => {
      const dto = new CreateContactDto();
      dto.name = '';

      const errors = await validate(dto);
      const nameErrors = errors.filter((e) => e.property === 'name');

      expect(nameErrors.length).toBeGreaterThan(0);
      expect(nameErrors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when name is only whitespace', async () => {
      const dto = new CreateContactDto();
      dto.name = '   ';

      const errors = await validate(dto);
      const nameErrors = errors.filter((e) => e.property === 'name');

      expect(nameErrors.length).toBeGreaterThan(0);
    });

    it('should fail when name exceeds 255 characters', async () => {
      const dto = new CreateContactDto();
      dto.name = 'a'.repeat(256);

      const errors = await validate(dto);
      const nameErrors = errors.filter((e) => e.property === 'name');

      expect(nameErrors.length).toBeGreaterThan(0);
      expect(nameErrors[0].constraints).toHaveProperty('maxLength');
    });

    it('should pass with name at 255 character limit', async () => {
      const dto = new CreateContactDto();
      dto.name = 'a'.repeat(255);

      const errors = await validate(dto);
      const nameErrors = errors.filter((e) => e.property === 'name');

      expect(nameErrors).toHaveLength(0);
    });
  });

  describe('email field', () => {
    it('should pass with valid email', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.email = 'john@example.com';

      const errors = await validate(dto);
      const emailErrors = errors.filter((e) => e.property === 'email');

      expect(emailErrors).toHaveLength(0);
    });

    it('should pass when email is undefined (optional)', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      // email not set

      const errors = await validate(dto);
      const emailErrors = errors.filter((e) => e.property === 'email');

      expect(emailErrors).toHaveLength(0);
    });

    it('should fail when email is invalid format', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.email = 'invalid-email';

      const errors = await validate(dto);
      const emailErrors = errors.filter((e) => e.property === 'email');

      expect(emailErrors.length).toBeGreaterThan(0);
      expect(emailErrors[0].constraints).toHaveProperty('isEmail');
    });

    it('should fail when email is missing @ symbol', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.email = 'johnexample.com';

      const errors = await validate(dto);
      const emailErrors = errors.filter((e) => e.property === 'email');

      expect(emailErrors.length).toBeGreaterThan(0);
    });

    it('should fail when email is missing domain', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.email = 'john@';

      const errors = await validate(dto);
      const emailErrors = errors.filter((e) => e.property === 'email');

      expect(emailErrors.length).toBeGreaterThan(0);
    });
  });

  describe('phone field', () => {
    it('should pass with valid phone number', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.phone = '+1-555-123-4567';

      const errors = await validate(dto);
      const phoneErrors = errors.filter((e) => e.property === 'phone');

      expect(phoneErrors).toHaveLength(0);
    });

    it('should pass when phone is undefined (optional)', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      // phone not set

      const errors = await validate(dto);
      const phoneErrors = errors.filter((e) => e.property === 'phone');

      expect(phoneErrors).toHaveLength(0);
    });

    it('should fail when phone exceeds 50 characters', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.phone = '1'.repeat(51);

      const errors = await validate(dto);
      const phoneErrors = errors.filter((e) => e.property === 'phone');

      expect(phoneErrors.length).toBeGreaterThan(0);
      expect(phoneErrors[0].constraints).toHaveProperty('maxLength');
    });

    it('should pass with phone at 50 character limit', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.phone = '1'.repeat(50);

      const errors = await validate(dto);
      const phoneErrors = errors.filter((e) => e.property === 'phone');

      expect(phoneErrors).toHaveLength(0);
    });
  });

  describe('linkedInUrl field', () => {
    it('should pass with valid LinkedIn URL', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.linkedInUrl = 'https://linkedin.com/in/johndoe';

      const errors = await validate(dto);
      const urlErrors = errors.filter((e) => e.property === 'linkedInUrl');

      expect(urlErrors).toHaveLength(0);
    });

    it('should pass when linkedInUrl is undefined (optional)', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      // linkedInUrl not set

      const errors = await validate(dto);
      const urlErrors = errors.filter((e) => e.property === 'linkedInUrl');

      expect(urlErrors).toHaveLength(0);
    });

    it('should fail when linkedInUrl is invalid format', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.linkedInUrl = 'not-a-url';

      const errors = await validate(dto);
      const urlErrors = errors.filter((e) => e.property === 'linkedInUrl');

      expect(urlErrors.length).toBeGreaterThan(0);
      expect(urlErrors[0].constraints).toHaveProperty('isUrl');
    });

    it('should pass with http URL', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.linkedInUrl = 'http://linkedin.com/in/johndoe';

      const errors = await validate(dto);
      const urlErrors = errors.filter((e) => e.property === 'linkedInUrl');

      expect(urlErrors).toHaveLength(0);
    });
  });

  describe('company field', () => {
    it('should pass with valid company name', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.company = 'Acme Corporation';

      const errors = await validate(dto);
      const companyErrors = errors.filter((e) => e.property === 'company');

      expect(companyErrors).toHaveLength(0);
    });

    it('should pass when company is undefined (optional)', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      // company not set

      const errors = await validate(dto);
      const companyErrors = errors.filter((e) => e.property === 'company');

      expect(companyErrors).toHaveLength(0);
    });

    it('should fail when company exceeds 255 characters', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.company = 'a'.repeat(256);

      const errors = await validate(dto);
      const companyErrors = errors.filter((e) => e.property === 'company');

      expect(companyErrors.length).toBeGreaterThan(0);
      expect(companyErrors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('industry field', () => {
    it('should pass with valid industry', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.industry = 'Technology';

      const errors = await validate(dto);
      const industryErrors = errors.filter((e) => e.property === 'industry');

      expect(industryErrors).toHaveLength(0);
    });

    it('should pass when industry is undefined (optional)', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      // industry not set

      const errors = await validate(dto);
      const industryErrors = errors.filter((e) => e.property === 'industry');

      expect(industryErrors).toHaveLength(0);
    });

    it('should fail when industry exceeds 255 characters', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.industry = 'a'.repeat(256);

      const errors = await validate(dto);
      const industryErrors = errors.filter((e) => e.property === 'industry');

      expect(industryErrors.length).toBeGreaterThan(0);
      expect(industryErrors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('role field', () => {
    it('should pass with valid role', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.role = 'Software Engineer';

      const errors = await validate(dto);
      const roleErrors = errors.filter((e) => e.property === 'role');

      expect(roleErrors).toHaveLength(0);
    });

    it('should pass when role is undefined (optional)', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      // role not set

      const errors = await validate(dto);
      const roleErrors = errors.filter((e) => e.property === 'role');

      expect(roleErrors).toHaveLength(0);
    });

    it('should fail when role exceeds 255 characters', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.role = 'a'.repeat(256);

      const errors = await validate(dto);
      const roleErrors = errors.filter((e) => e.property === 'role');

      expect(roleErrors.length).toBeGreaterThan(0);
      expect(roleErrors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('priority field', () => {
    it('should pass with HIGH priority', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.priority = Priority.HIGH;

      const errors = await validate(dto);
      const priorityErrors = errors.filter((e) => e.property === 'priority');

      expect(priorityErrors).toHaveLength(0);
    });

    it('should pass with MEDIUM priority', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.priority = Priority.MEDIUM;

      const errors = await validate(dto);
      const priorityErrors = errors.filter((e) => e.property === 'priority');

      expect(priorityErrors).toHaveLength(0);
    });

    it('should pass with LOW priority', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.priority = Priority.LOW;

      const errors = await validate(dto);
      const priorityErrors = errors.filter((e) => e.property === 'priority');

      expect(priorityErrors).toHaveLength(0);
    });

    it('should pass when priority is undefined (optional, defaults to MEDIUM in database)', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      // priority not set

      const errors = await validate(dto);
      const priorityErrors = errors.filter((e) => e.property === 'priority');

      expect(priorityErrors).toHaveLength(0);
    });

    it('should fail with invalid priority value', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.priority = 'INVALID' as Priority;

      const errors = await validate(dto);
      const priorityErrors = errors.filter((e) => e.property === 'priority');

      expect(priorityErrors.length).toBeGreaterThan(0);
      expect(priorityErrors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('gender field', () => {
    it('should pass with MALE gender', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.gender = Gender.MALE;

      const errors = await validate(dto);
      const genderErrors = errors.filter((e) => e.property === 'gender');

      expect(genderErrors).toHaveLength(0);
    });

    it('should pass with FEMALE gender', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.gender = Gender.FEMALE;

      const errors = await validate(dto);
      const genderErrors = errors.filter((e) => e.property === 'gender');

      expect(genderErrors).toHaveLength(0);
    });

    it('should pass with OTHER gender', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.gender = Gender.OTHER;

      const errors = await validate(dto);
      const genderErrors = errors.filter((e) => e.property === 'gender');

      expect(genderErrors).toHaveLength(0);
    });

    it('should pass with PREFER_NOT_TO_SAY gender', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.gender = Gender.PREFER_NOT_TO_SAY;

      const errors = await validate(dto);
      const genderErrors = errors.filter((e) => e.property === 'gender');

      expect(genderErrors).toHaveLength(0);
    });

    it('should pass when gender is undefined (optional)', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      // gender not set

      const errors = await validate(dto);
      const genderErrors = errors.filter((e) => e.property === 'gender');

      expect(genderErrors).toHaveLength(0);
    });

    it('should fail with invalid gender value', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.gender = 'INVALID' as Gender;

      const errors = await validate(dto);
      const genderErrors = errors.filter((e) => e.property === 'gender');

      expect(genderErrors.length).toBeGreaterThan(0);
      expect(genderErrors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('birthday field', () => {
    it('should pass with valid Date object', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.birthday = new Date('1990-01-15');

      const errors = await validate(dto);
      const birthdayErrors = errors.filter((e) => e.property === 'birthday');

      expect(birthdayErrors).toHaveLength(0);
    });

    it('should pass when birthday is undefined (optional)', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      // birthday not set

      const errors = await validate(dto);
      const birthdayErrors = errors.filter((e) => e.property === 'birthday');

      expect(birthdayErrors).toHaveLength(0);
    });

    it('should fail with invalid date', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.birthday = 'not-a-date' as any;

      const errors = await validate(dto);
      const birthdayErrors = errors.filter((e) => e.property === 'birthday');

      expect(birthdayErrors.length).toBeGreaterThan(0);
      expect(birthdayErrors[0].constraints).toHaveProperty('isDate');
    });
  });

  describe('notes field', () => {
    it('should pass with valid notes', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.notes = 'Met at tech conference. Interested in AI/ML.';

      const errors = await validate(dto);
      const notesErrors = errors.filter((e) => e.property === 'notes');

      expect(notesErrors).toHaveLength(0);
    });

    it('should pass when notes is undefined (optional)', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      // notes not set

      const errors = await validate(dto);
      const notesErrors = errors.filter((e) => e.property === 'notes');

      expect(notesErrors).toHaveLength(0);
    });

    it('should fail when notes exceed 10,000 characters', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.notes = 'a'.repeat(10001);

      const errors = await validate(dto);
      const notesErrors = errors.filter((e) => e.property === 'notes');

      expect(notesErrors.length).toBeGreaterThan(0);
      expect(notesErrors[0].constraints).toHaveProperty('maxLength');
    });

    it('should pass with notes at 10,000 character limit', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.notes = 'a'.repeat(10000);

      const errors = await validate(dto);
      const notesErrors = errors.filter((e) => e.property === 'notes');

      expect(notesErrors).toHaveLength(0);
    });
  });

  describe('complete validation', () => {
    it('should pass with all valid fields', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';
      dto.email = 'john@example.com';
      dto.phone = '+1-555-123-4567';
      dto.linkedInUrl = 'https://linkedin.com/in/johndoe';
      dto.company = 'Acme Corp';
      dto.industry = 'Technology';
      dto.role = 'Software Engineer';
      dto.priority = Priority.HIGH;
      dto.gender = Gender.MALE;
      dto.birthday = new Date('1990-01-15');
      dto.notes = 'Met at tech conference';

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should pass with only required field (name)', async () => {
      const dto = new CreateContactDto();
      dto.name = 'John Doe';

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });
});
