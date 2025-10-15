import { validate } from 'class-validator';
import { FindEmailsInput } from './find-emails.input';
import { EmailStatus } from '../enums';

describe('FindEmailsInput', () => {
  it('should be defined', () => {
    expect(FindEmailsInput).toBeDefined();
  });

  it('should pass validation with no fields (all optional)', async () => {
    const input = new FindEmailsInput();

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with contactId filter', async () => {
    const input = new FindEmailsInput();
    input.contactId = '123e4567-e89b-12d3-a456-426614174000';

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with status filter', async () => {
    const input = new FindEmailsInput();
    input.status = EmailStatus.SENT;

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid status', async () => {
    const input = new FindEmailsInput();
    (input as any).status = 'INVALID_STATUS';

    const errors = await validate(input);
    expect(errors.length).toBeGreaterThan(0);
    const statusError = errors.find((e) => e.property === 'status');
    expect(statusError).toBeDefined();
    expect(statusError?.constraints).toHaveProperty('isEnum');
  });

  it('should pass validation with skip pagination', async () => {
    const input = new FindEmailsInput();
    input.skip = 0;

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when skip is negative', async () => {
    const input = new FindEmailsInput();
    input.skip = -1;

    const errors = await validate(input);
    expect(errors.length).toBeGreaterThan(0);
    const skipError = errors.find((e) => e.property === 'skip');
    expect(skipError).toBeDefined();
    expect(skipError?.constraints).toHaveProperty('min');
  });

  it('should pass validation with take pagination', async () => {
    const input = new FindEmailsInput();
    input.take = 10;

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when take is less than 1', async () => {
    const input = new FindEmailsInput();
    input.take = 0;

    const errors = await validate(input);
    expect(errors.length).toBeGreaterThan(0);
    const takeError = errors.find((e) => e.property === 'take');
    expect(takeError).toBeDefined();
    expect(takeError?.constraints).toHaveProperty('min');
  });

  it('should fail validation when take exceeds 100', async () => {
    const input = new FindEmailsInput();
    input.take = 101;

    const errors = await validate(input);
    expect(errors.length).toBeGreaterThan(0);
    const takeError = errors.find((e) => e.property === 'take');
    expect(takeError).toBeDefined();
    expect(takeError?.constraints).toHaveProperty('max');
  });

  it('should pass validation with all fields', async () => {
    const input = new FindEmailsInput();
    input.contactId = '123e4567-e89b-12d3-a456-426614174000';
    input.status = EmailStatus.DRAFT;
    input.skip = 0;
    input.take = 20;

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with contactId and pagination only', async () => {
    const input = new FindEmailsInput();
    input.contactId = '123e4567-e89b-12d3-a456-426614174000';
    input.skip = 10;
    input.take = 50;

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with status and pagination only', async () => {
    const input = new FindEmailsInput();
    input.status = EmailStatus.SENT;
    input.skip = 0;
    input.take = 100;

    const errors = await validate(input);
    expect(errors.length).toBe(0);
  });
});
