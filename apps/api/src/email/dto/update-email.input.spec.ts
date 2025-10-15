import { validate } from 'class-validator';
import { UpdateEmailInput } from './update-email.input';
import { EmailStatus, TemplateType } from '../enums';

describe('UpdateEmailInput', () => {
  it('should be defined', () => {
    expect(UpdateEmailInput).toBeDefined();
  });

  it('should pass validation with only id field (other fields optional)', async () => {
    const input = new UpdateEmailInput();
    input.id = 'email-123';

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with subject field', async () => {
    const input = new UpdateEmailInput();
    input.id = 'email-123';
    input.subject = 'Updated subject';

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when subject is empty string', async () => {
    const input = new UpdateEmailInput();
    input.subject = '';

    const errors = await validate(input);
    expect(errors.length).toBeGreaterThan(0);
    const subjectError = errors.find((e) => e.property === 'subject');
    expect(subjectError).toBeDefined();
    expect(subjectError?.constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation when subject exceeds max length', async () => {
    const input = new UpdateEmailInput();
    input.subject = 'a'.repeat(501); // Exceeds 500 char limit

    const errors = await validate(input);
    expect(errors.length).toBeGreaterThan(0);
    const subjectError = errors.find((e) => e.property === 'subject');
    expect(subjectError).toBeDefined();
    expect(subjectError?.constraints).toHaveProperty('maxLength');
  });

  it('should pass validation with body field', async () => {
    const input = new UpdateEmailInput();
    input.id = 'email-123';
    input.body = 'Updated email body content...';

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when body is empty string', async () => {
    const input = new UpdateEmailInput();
    input.body = '';

    const errors = await validate(input);
    expect(errors.length).toBeGreaterThan(0);
    const bodyError = errors.find((e) => e.property === 'body');
    expect(bodyError).toBeDefined();
    expect(bodyError?.constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation when body exceeds max length', async () => {
    const input = new UpdateEmailInput();
    input.body = 'a'.repeat(50001); // Exceeds 50000 char limit

    const errors = await validate(input);
    expect(errors.length).toBeGreaterThan(0);
    const bodyError = errors.find((e) => e.property === 'body');
    expect(bodyError).toBeDefined();
    expect(bodyError?.constraints).toHaveProperty('maxLength');
  });

  it('should pass validation with optional bodyHtml', async () => {
    const input = new UpdateEmailInput();
    input.id = 'email-123';
    input.bodyHtml = '<p>Updated HTML content</p>';

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with valid EmailStatus', async () => {
    const input = new UpdateEmailInput();
    input.id = 'email-123';
    input.status = EmailStatus.SCHEDULED;

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid EmailStatus', async () => {
    const input = new UpdateEmailInput();
    (input as any).status = 'INVALID_STATUS';

    const errors = await validate(input);
    expect(errors.length).toBeGreaterThan(0);
    const statusError = errors.find((e) => e.property === 'status');
    expect(statusError).toBeDefined();
    expect(statusError?.constraints).toHaveProperty('isEnum');
  });

  it('should pass validation with valid TemplateType', async () => {
    const input = new UpdateEmailInput();
    input.id = 'email-123';
    input.templateType = TemplateType.CUSTOM;

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with multiple fields', async () => {
    const input = new UpdateEmailInput();
    input.id = 'email-123';
    input.subject = 'Updated subject';
    input.body = 'Updated body content...';
    input.bodyHtml = '<p>Updated HTML</p>';
    input.status = EmailStatus.DRAFT;
    input.templateType = TemplateType.AI_GENERATED;

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });
});
