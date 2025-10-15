import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Get or create a test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@relationhub.com' },
    update: {},
    create: {
      email: 'test@relationhub.com',
      supabaseId: 'test-supabase-id',
      name: 'Test User',
      provider: 'email',
    },
  });

  console.log('✅ Created/found test user:', testUser.email);

  // Get or create test contacts
  const contact1 = await prisma.contact.create({
    data: {
      userId: testUser.id,
      name: 'John Doe',
      email: 'john.doe@example.com',
      company: 'Tech Corp',
      industry: 'Technology',
      role: 'Software Engineer',
      priority: 'HIGH',
      gender: 'MALE',
    },
  });

  const contact2 = await prisma.contact.create({
    data: {
      userId: testUser.id,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      company: 'Design Studio',
      industry: 'Design',
      role: 'Product Designer',
      priority: 'MEDIUM',
      gender: 'FEMALE',
    },
  });

  console.log('✅ Created test contacts');

  // Create default email signature
  const defaultSignature = await prisma.emailSignature.create({
    data: {
      userId: testUser.id,
      name: 'Default Signature',
      contentJson: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Best regards,' }
            ]
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Test User' }
            ]
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'test@relationhub.com' }
            ]
          }
        ]
      },
      contentHtml: '<p>Best regards,</p><p>Test User</p><p>test@relationhub.com</p>',
      isGlobalDefault: true,
      isDefaultForFormal: false,
      isDefaultForCasual: false,
    },
  });

  // Create formal signature
  const formalSignature = await prisma.emailSignature.create({
    data: {
      userId: testUser.id,
      name: 'Formal Signature',
      contentJson: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Sincerely,' }
            ]
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Test User' },
              { type: 'hardBreak' },
              { type: 'text', text: 'Professional Title' },
              { type: 'hardBreak' },
              { type: 'text', text: 'RelationHub' },
              { type: 'hardBreak' },
              { type: 'text', text: 'test@relationhub.com | +1-555-0100' }
            ]
          }
        ]
      },
      contentHtml: '<p>Sincerely,</p><p>Test User<br>Professional Title<br>RelationHub<br>test@relationhub.com | +1-555-0100</p>',
      isGlobalDefault: false,
      isDefaultForFormal: true,
      isDefaultForCasual: false,
    },
  });

  // Create casual signature
  const casualSignature = await prisma.emailSignature.create({
    data: {
      userId: testUser.id,
      name: 'Casual Signature',
      contentJson: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Cheers,' }
            ]
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Test' }
            ]
          }
        ]
      },
      contentHtml: '<p>Cheers,</p><p>Test</p>',
      isGlobalDefault: false,
      isDefaultForFormal: false,
      isDefaultForCasual: true,
    },
  });

  console.log('✅ Created email signatures');

  // Create sample email draft
  const draft1 = await prisma.emailDraft.create({
    data: {
      userId: testUser.id,
      contactId: contact1.id,
      subject: 'Follow up on our conversation',
      bodyJson: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Hi John,' }
            ]
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'I wanted to follow up on our conversation from last week...' }
            ]
          }
        ]
      },
      bodyHtml: '<p>Hi John,</p><p>I wanted to follow up on our conversation from last week...</p>',
      attachments: [],
      signatureId: defaultSignature.id,
      lastSyncedAt: new Date(),
    },
  });

  const draft2 = await prisma.emailDraft.create({
    data: {
      userId: testUser.id,
      contactId: contact2.id,
      subject: 'Project collaboration opportunity',
      bodyJson: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Hi Jane,' }
            ]
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'I have an exciting project collaboration opportunity...' }
            ]
          }
        ]
      },
      bodyHtml: '<p>Hi Jane,</p><p>I have an exciting project collaboration opportunity...</p>',
      attachments: [],
      signatureId: formalSignature.id,
      lastSyncedAt: new Date(),
    },
  });

  console.log('✅ Created email drafts');

  // Create sample email template
  const template1 = await prisma.emailTemplate.create({
    data: {
      userId: testUser.id,
      name: 'Introduction Template',
      subject: 'Introduction and potential collaboration',
      body: 'Hi {{firstName}},\\n\\nI hope this email finds you well...',
      bodyJson: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Hi {{firstName}},' }
            ]
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'I hope this email finds you well...' }
            ]
          }
        ]
      },
      bodyHtml: '<p>Hi {{firstName}},</p><p>I hope this email finds you well...</p>',
      templateType: 'CUSTOM',
      isDefault: false,
      isUserCreated: true,
      category: 'introduction',
      usageCount: 0,
    },
  });

  console.log('✅ Created email template');

  // Create sample conversation history
  const conversationHistory = await prisma.conversationHistory.create({
    data: {
      userId: testUser.id,
      contactId: contact1.id,
      content: 'Subject: Initial contact\\n\\nHi John, nice to meet you!',
      direction: 'SENT',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
  });

  console.log('✅ Created conversation history');

  console.log('\\n🎉 Database seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
