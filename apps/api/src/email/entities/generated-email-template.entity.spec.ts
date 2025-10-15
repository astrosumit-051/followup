import { GeneratedEmailTemplate, EmailVariant } from './generated-email-template.entity';

describe('EmailVariant', () => {
  it('should be defined', () => {
    expect(EmailVariant).toBeDefined();
  });

  it('should instantiate correctly', () => {
    const variant = new EmailVariant();
    expect(variant).toBeInstanceOf(EmailVariant);
  });

  it('should allow setting all fields with valid data', () => {
    const variant = new EmailVariant();

    variant.subject = 'Follow-up on our meeting';
    variant.body = 'Hi John,\n\nIt was great meeting you at the conference...';
    variant.bodyHtml = '<p>Hi John,</p><p>It was great meeting you at the conference...</p>';

    expect(variant.subject).toBe('Follow-up on our meeting');
    expect(variant.body).toBe('Hi John,\n\nIt was great meeting you at the conference...');
    expect(variant.bodyHtml).toBe('<p>Hi John,</p><p>It was great meeting you at the conference...</p>');
  });
});

describe('GeneratedEmailTemplate', () => {
  it('should be defined', () => {
    expect(GeneratedEmailTemplate).toBeDefined();
  });

  it('should instantiate correctly', () => {
    const template = new GeneratedEmailTemplate();
    expect(template).toBeInstanceOf(GeneratedEmailTemplate);
  });

  it('should allow setting formal variant', () => {
    const template = new GeneratedEmailTemplate();
    const formal = new EmailVariant();

    formal.subject = 'Follow-up: Professional Networking';
    formal.body = 'Dear John,\n\nI hope this message finds you well...';
    formal.bodyHtml = '<p>Dear John,</p><p>I hope this message finds you well...</p>';

    template.formal = formal;

    expect(template.formal).toBe(formal);
    expect(template.formal.subject).toBe('Follow-up: Professional Networking');
    expect(template.formal.body).toContain('Dear John');
  });

  it('should allow setting casual variant', () => {
    const template = new GeneratedEmailTemplate();
    const casual = new EmailVariant();

    casual.subject = 'Great meeting you!';
    casual.body = 'Hey John,\n\nAwesome meeting you at the conference...';
    casual.bodyHtml = '<p>Hey John,</p><p>Awesome meeting you at the conference...</p>';

    template.casual = casual;

    expect(template.casual).toBe(casual);
    expect(template.casual.subject).toBe('Great meeting you!');
    expect(template.casual.body).toContain('Hey John');
  });

  it('should allow setting all fields with valid data', () => {
    const template = new GeneratedEmailTemplate();
    const now = new Date();

    const formal = new EmailVariant();
    formal.subject = 'Follow-up: Professional Networking';
    formal.body = 'Dear John, I hope this message finds you well...';
    formal.bodyHtml = '<p>Dear John, I hope this message finds you well...</p>';

    const casual = new EmailVariant();
    casual.subject = 'Great meeting you!';
    casual.body = 'Hey John, Awesome meeting you at the conference...';
    casual.bodyHtml = '<p>Hey John, Awesome meeting you at the conference...</p>';

    template.formal = formal;
    template.casual = casual;
    template.providerId = 'openai/gpt-4-turbo';
    template.tokensUsed = 500;
    template.generatedAt = now;
    template.contactId = '123e4567-e89b-12d3-a456-426614174002';

    expect(template.formal).toBe(formal);
    expect(template.casual).toBe(casual);
    expect(template.providerId).toBe('openai/gpt-4-turbo');
    expect(template.tokensUsed).toBe(500);
    expect(template.generatedAt).toBe(now);
    expect(template.contactId).toBe('123e4567-e89b-12d3-a456-426614174002');
  });

  it('should track token usage', () => {
    const template = new GeneratedEmailTemplate();

    template.tokensUsed = 250;
    expect(template.tokensUsed).toBe(250);

    template.tokensUsed = 1000;
    expect(template.tokensUsed).toBe(1000);
  });

  it('should track provider information', () => {
    const template = new GeneratedEmailTemplate();

    template.providerId = 'openai/gpt-4-turbo';
    expect(template.providerId).toBe('openai/gpt-4-turbo');

    template.providerId = 'anthropic/claude-3-opus';
    expect(template.providerId).toBe('anthropic/claude-3-opus');

    template.providerId = 'x.ai/grok-2';
    expect(template.providerId).toBe('x.ai/grok-2');
  });

  it('should have both formal and casual variants', () => {
    const template = new GeneratedEmailTemplate();

    const formal = new EmailVariant();
    formal.subject = 'Formal Subject';
    formal.body = 'Formal body...';

    const casual = new EmailVariant();
    casual.subject = 'Casual Subject';
    casual.body = 'Casual body...';

    template.formal = formal;
    template.casual = casual;

    expect(template.formal.subject).toBe('Formal Subject');
    expect(template.casual.subject).toBe('Casual Subject');
    expect(template.formal.subject).not.toBe(template.casual.subject);
  });
});
