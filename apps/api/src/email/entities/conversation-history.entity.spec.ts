import { ConversationHistory } from './conversation-history.entity';
import { Direction } from '../enums';

describe('ConversationHistory Entity', () => {
  it('should be defined', () => {
    expect(ConversationHistory).toBeDefined();
  });

  it('should instantiate correctly', () => {
    const history = new ConversationHistory();
    expect(history).toBeInstanceOf(ConversationHistory);
  });

  it('should accept valid Direction enum values', () => {
    const history = new ConversationHistory();

    history.direction = Direction.SENT;
    expect(history.direction).toBe(Direction.SENT);

    history.direction = Direction.RECEIVED;
    expect(history.direction).toBe(Direction.RECEIVED);
  });

  it('should allow setting all fields with valid data', () => {
    const history = new ConversationHistory();
    const now = new Date();
    const metadata = {
      opened: true,
      clickedLinks: ['https://example.com'],
      userAgent: 'Mozilla/5.0',
    };

    history.id = '123e4567-e89b-12d3-a456-426614174000';
    history.userId = '123e4567-e89b-12d3-a456-426614174001';
    history.contactId = '123e4567-e89b-12d3-a456-426614174002';
    history.emailId = '123e4567-e89b-12d3-a456-426614174003';
    history.content = 'Subject: Follow-up\n\nHi John, it was great meeting you...';
    history.direction = Direction.SENT;
    history.timestamp = now;
    history.metadata = metadata;

    expect(history.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(history.userId).toBe('123e4567-e89b-12d3-a456-426614174001');
    expect(history.contactId).toBe('123e4567-e89b-12d3-a456-426614174002');
    expect(history.emailId).toBe('123e4567-e89b-12d3-a456-426614174003');
    expect(history.content).toBe('Subject: Follow-up\n\nHi John, it was great meeting you...');
    expect(history.direction).toBe(Direction.SENT);
    expect(history.timestamp).toBe(now);
    expect(history.metadata).toEqual(metadata);
  });

  it('should support metadata as JSON object', () => {
    const history = new ConversationHistory();

    // Simple metadata
    history.metadata = { opened: true };
    expect(history.metadata).toEqual({ opened: true });

    // Complex metadata
    const complexMetadata = {
      opened: true,
      openedAt: '2025-10-14T10:00:00Z',
      clicks: [
        { url: 'https://example.com', timestamp: '2025-10-14T10:05:00Z' },
        { url: 'https://example.com/page', timestamp: '2025-10-14T10:10:00Z' },
      ],
      device: {
        type: 'desktop',
        browser: 'Chrome',
        os: 'macOS',
      },
    };

    history.metadata = complexMetadata;
    expect(history.metadata).toEqual(complexMetadata);
  });

  it('should track conversation direction correctly', () => {
    const sentHistory = new ConversationHistory();
    sentHistory.direction = Direction.SENT;
    expect(sentHistory.direction).toBe('SENT');

    const receivedHistory = new ConversationHistory();
    receivedHistory.direction = Direction.RECEIVED;
    expect(receivedHistory.direction).toBe('RECEIVED');
  });
});
