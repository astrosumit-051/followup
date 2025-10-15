import { Email } from './email.entity';
import { EmailStatus, TemplateType } from '../enums';

describe('Email Entity', () => {
  it('should be defined', () => {
    expect(Email).toBeDefined();
  });

  it('should instantiate correctly', () => {
    const email = new Email();
    expect(email).toBeInstanceOf(Email);
  });

  it('should accept valid EmailStatus enum values', () => {
    const email = new Email();

    email.status = EmailStatus.DRAFT;
    expect(email.status).toBe(EmailStatus.DRAFT);

    email.status = EmailStatus.SCHEDULED;
    expect(email.status).toBe(EmailStatus.SCHEDULED);

    email.status = EmailStatus.SENT;
    expect(email.status).toBe(EmailStatus.SENT);

    email.status = EmailStatus.FAILED;
    expect(email.status).toBe(EmailStatus.FAILED);

    email.status = EmailStatus.CANCELLED;
    expect(email.status).toBe(EmailStatus.CANCELLED);
  });

  it('should accept valid TemplateType enum values', () => {
    const email = new Email();

    email.templateType = TemplateType.FORMAL;
    expect(email.templateType).toBe(TemplateType.FORMAL);

    email.templateType = TemplateType.CASUAL;
    expect(email.templateType).toBe(TemplateType.CASUAL);

    email.templateType = TemplateType.CUSTOM;
    expect(email.templateType).toBe(TemplateType.CUSTOM);

    email.templateType = TemplateType.AI_GENERATED;
    expect(email.templateType).toBe(TemplateType.AI_GENERATED);

    email.templateType = TemplateType.TEMPLATE_BASED;
    expect(email.templateType).toBe(TemplateType.TEMPLATE_BASED);
  });

  it('should allow setting all fields with valid data', () => {
    const email = new Email();
    const now = new Date();

    email.id = '123e4567-e89b-12d3-a456-426614174000';
    email.userId = '123e4567-e89b-12d3-a456-426614174001';
    email.contactId = '123e4567-e89b-12d3-a456-426614174002';
    email.subject = 'Follow-up on our meeting';
    email.body = 'Hi John, it was great meeting you...';
    email.bodyHtml = '<p>Hi John, it was great meeting you...</p>';
    email.status = EmailStatus.SENT;
    email.templateType = TemplateType.AI_GENERATED;
    email.providerId = 'openai/gpt-4-turbo';
    email.tokensUsed = 500;
    email.generatedAt = now;
    email.sentAt = now;
    email.createdAt = now;
    email.updatedAt = now;

    expect(email.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(email.userId).toBe('123e4567-e89b-12d3-a456-426614174001');
    expect(email.contactId).toBe('123e4567-e89b-12d3-a456-426614174002');
    expect(email.subject).toBe('Follow-up on our meeting');
    expect(email.body).toBe('Hi John, it was great meeting you...');
    expect(email.bodyHtml).toBe('<p>Hi John, it was great meeting you...</p>');
    expect(email.status).toBe(EmailStatus.SENT);
    expect(email.templateType).toBe(TemplateType.AI_GENERATED);
    expect(email.providerId).toBe('openai/gpt-4-turbo');
    expect(email.tokensUsed).toBe(500);
    expect(email.generatedAt).toBe(now);
    expect(email.sentAt).toBe(now);
    expect(email.createdAt).toBe(now);
    expect(email.updatedAt).toBe(now);
  });
});
