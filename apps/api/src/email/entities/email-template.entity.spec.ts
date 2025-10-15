import { EmailTemplate } from './email-template.entity';

describe('EmailTemplate Entity', () => {
  it('should be defined', () => {
    expect(EmailTemplate).toBeDefined();
  });

  it('should instantiate correctly', () => {
    const template = new EmailTemplate();
    expect(template).toBeInstanceOf(EmailTemplate);
  });

  it('should allow setting all fields with valid data', () => {
    const template = new EmailTemplate();
    const now = new Date();

    template.id = '123e4567-e89b-12d3-a456-426614174000';
    template.userId = '123e4567-e89b-12d3-a456-426614174001';
    template.name = 'Follow-up Template';
    template.subject = 'Following up on {topic}';
    template.body = 'Hi {name}, I wanted to follow up...';
    template.bodyHtml = '<p>Hi {name}, I wanted to follow up...</p>';
    template.isDefault = true;
    template.category = 'follow-up';
    template.usageCount = 5;
    template.createdAt = now;
    template.updatedAt = now;

    expect(template.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(template.userId).toBe('123e4567-e89b-12d3-a456-426614174001');
    expect(template.name).toBe('Follow-up Template');
    expect(template.subject).toBe('Following up on {topic}');
    expect(template.body).toBe('Hi {name}, I wanted to follow up...');
    expect(template.bodyHtml).toBe('<p>Hi {name}, I wanted to follow up...</p>');
    expect(template.isDefault).toBe(true);
    expect(template.category).toBe('follow-up');
    expect(template.usageCount).toBe(5);
    expect(template.createdAt).toBe(now);
    expect(template.updatedAt).toBe(now);
  });

  it('should support default value for isDefault field', () => {
    const template = new EmailTemplate();
    template.isDefault = false;
    expect(template.isDefault).toBe(false);
  });

  it('should track usage count', () => {
    const template = new EmailTemplate();
    template.usageCount = 0;
    expect(template.usageCount).toBe(0);

    template.usageCount = 10;
    expect(template.usageCount).toBe(10);

    template.usageCount = 100;
    expect(template.usageCount).toBe(100);
  });
});
