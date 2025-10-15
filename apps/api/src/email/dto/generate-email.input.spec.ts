import { validate } from 'class-validator';
import { GenerateEmailInput } from './generate-email.input';

describe('GenerateEmailInput', () => {
  it('should be defined', () => {
    expect(GenerateEmailInput).toBeDefined();
  });

  it('should pass validation with valid required fields', async () => {
    const input = new GenerateEmailInput();
    input.contactId = '123e4567-e89b-12d3-a456-426614174000';

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when contactId is missing', async () => {
    const input = new GenerateEmailInput();

    const errors = await validate(input);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('contactId');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation when contactId is not a string', async () => {
    const input = new GenerateEmailInput();
    (input as any).contactId = 123;

    const errors = await validate(input);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('contactId');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should pass validation with optional additionalContext', async () => {
    const input = new GenerateEmailInput();
    input.contactId = '123e4567-e89b-12d3-a456-426614174000';
    input.additionalContext = 'We met at the tech conference last week. Follow up about the AI project.';

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when additionalContext exceeds max length', async () => {
    const input = new GenerateEmailInput();
    input.contactId = '123e4567-e89b-12d3-a456-426614174000';
    input.additionalContext = 'a'.repeat(5001); // Exceeds 5000 char limit

    const errors = await validate(input);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('additionalContext');
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });

  it('should pass validation with optional includeConversationHistory', async () => {
    const input = new GenerateEmailInput();
    input.contactId = '123e4567-e89b-12d3-a456-426614174000';
    input.includeConversationHistory = true;

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when includeConversationHistory is not boolean', async () => {
    const input = new GenerateEmailInput();
    input.contactId = '123e4567-e89b-12d3-a456-426614174000';
    (input as any).includeConversationHistory = 'yes';

    const errors = await validate(input);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('includeConversationHistory');
    expect(errors[0].constraints).toHaveProperty('isBoolean');
  });

  it('should pass validation with all optional fields set', async () => {
    const input = new GenerateEmailInput();
    input.contactId = '123e4567-e89b-12d3-a456-426614174000';
    input.additionalContext = 'Met at conference, discuss AI collaboration';
    input.includeConversationHistory = true;

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });
});
