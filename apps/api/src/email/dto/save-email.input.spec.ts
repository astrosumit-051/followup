import { validate } from 'class-validator';
import { SaveEmailInput } from './save-email.input';
import { EmailStatus, TemplateType } from '../enums';

describe('SaveEmailInput', () => {
  it('should be defined', () => {
    expect(SaveEmailInput).toBeDefined();
  });

  it('should pass validation with valid required fields', async () => {
    const input = new SaveEmailInput();
    input.contactId = '123e4567-e89b-12d3-a456-426614174000';
    input.subject = 'Follow-up on our meeting';
    input.body = 'Hi John, it was great meeting you...';

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when contactId is missing', async () => {
    const input = new SaveEmailInput();
    input.subject = 'Test';
    input.body = 'Test body';

    const errors = await validate(input);
    expect(errors.length).toBeGreaterThan(0);
    const contactIdError = errors.find((e) => e.property === 'contactId');
    expect(contactIdError).toBeDefined();
    expect(contactIdError?.constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation when subject is missing', async () => {
    const input = new SaveEmailInput();
    input.contactId = '123e4567-e89b-12d3-a456-426614174000';
    input.body = 'Test body';

    const errors = await validate(input);
    expect(errors.length).toBeGreaterThan(0);
    const subjectError = errors.find((e) => e.property === 'subject');
    expect(subjectError).toBeDefined();
    expect(subjectError?.constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation when body is missing', async () => {
    const input = new SaveEmailInput();
    input.contactId = '123e4567-e89b-12d3-a456-426614174000';
    input.subject = 'Test';

    const errors = await validate(input);
    expect(errors.length).toBeGreaterThan(0);
    const bodyError = errors.find((e) => e.property === 'body');
    expect(bodyError).toBeDefined();
    expect(bodyError?.constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation when subject exceeds max length', async () => {
    const input = new SaveEmailInput();
    input.contactId = '123e4567-e89b-12d3-a456-426614174000';
    input.subject = 'a'.repeat(501); // Exceeds 500 char limit
    input.body = 'Test body';

    const errors = await validate(input);
    expect(errors.length).toBeGreaterThan(0);
    const subjectError = errors.find((e) => e.property === 'subject');
    expect(subjectError).toBeDefined();
    expect(subjectError?.constraints).toHaveProperty('maxLength');
  });

  it('should fail validation when body exceeds max length', async () => {
    const input = new SaveEmailInput();
    input.contactId = '123e4567-e89b-12d3-a456-426614174000';
    input.subject = 'Test';
    input.body = 'a'.repeat(50001); // Exceeds 50000 char limit

    const errors = await validate(input);
    expect(errors.length).toBeGreaterThan(0);
    const bodyError = errors.find((e) => e.property === 'body');
    expect(bodyError).toBeDefined();
    expect(bodyError?.constraints).toHaveProperty('maxLength');
  });

  it('should pass validation with optional EmailStatus', async () => {
    const input = new SaveEmailInput();
    input.contactId = '123e4567-e89b-12d3-a456-426614174000';
    input.subject = 'Test';
    input.body = 'Test body';
    input.status = EmailStatus.DRAFT;

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid EmailStatus', async () => {
    const input = new SaveEmailInput();
    input.contactId = '123e4567-e89b-12d3-a456-426614174000';
    input.subject = 'Test';
    input.body = 'Test body';
    (input as any).status = 'INVALID_STATUS';

    const errors = await validate(input);
    expect(errors.length).toBeGreaterThan(0);
    const statusError = errors.find((e) => e.property === 'status');
    expect(statusError).toBeDefined();
    expect(statusError?.constraints).toHaveProperty('isEnum');
  });

  it('should pass validation with optional TemplateType', async () => {
    const input = new SaveEmailInput();
    input.contactId = '123e4567-e89b-12d3-a456-426614174000';
    input.subject = 'Test';
    input.body = 'Test body';
    input.templateType = TemplateType.AI_GENERATED;

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with optional providerId', async () => {
    const input = new SaveEmailInput();
    input.contactId = '123e4567-e89b-12d3-a456-426614174000';
    input.subject = 'Test';
    input.body = 'Test body';
    input.providerId = 'openai/gpt-4-turbo';

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with optional tokensUsed', async () => {
    const input = new SaveEmailInput();
    input.contactId = '123e4567-e89b-12d3-a456-426614174000';
    input.subject = 'Test';
    input.body = 'Test body';
    input.tokensUsed = 500;

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when tokensUsed is negative', async () => {
    const input = new SaveEmailInput();
    input.contactId = '123e4567-e89b-12d3-a456-426614174000';
    input.subject = 'Test';
    input.body = 'Test body';
    input.tokensUsed = -100;

    const errors = await validate(input);
    expect(errors.length).toBeGreaterThan(0);
    const tokensError = errors.find((e) => e.property === 'tokensUsed');
    expect(tokensError).toBeDefined();
    expect(tokensError?.constraints).toHaveProperty('min');
  });

  it('should pass validation with all optional fields set', async () => {
    const input = new SaveEmailInput();
    input.contactId = '123e4567-e89b-12d3-a456-426614174000';
    input.subject = 'Follow-up on our meeting';
    input.body = 'Hi John, it was great meeting you...';
    input.bodyHtml = '<p>Hi John, it was great meeting you...</p>';
    input.status = EmailStatus.SCHEDULED;
    input.templateType = TemplateType.AI_GENERATED;
    input.providerId = 'openai/gpt-4-turbo';
    input.tokensUsed = 500;

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });
});
