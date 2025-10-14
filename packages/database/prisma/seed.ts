import { PrismaClient, Priority, Gender, EmailStatus, TemplateType, Direction, ActivityType } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create test users
  const user1 = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      name: 'John Doe',
      profilePicture: null,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      profilePicture: null,
    },
  });

  console.log('Created users:', { user1: user1.email, user2: user2.email });

  // Create tags for user1
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { userId_name: { userId: user1.id, name: 'Work' } },
      update: {},
      create: { userId: user1.id, name: 'Work', color: '#3B82F6' },
    }),
    prisma.tag.upsert({
      where: { userId_name: { userId: user1.id, name: 'Personal' } },
      update: {},
      create: { userId: user1.id, name: 'Personal', color: '#10B981' },
    }),
    prisma.tag.upsert({
      where: { userId_name: { userId: user1.id, name: 'Networking' } },
      update: {},
      create: { userId: user1.id, name: 'Networking', color: '#F59E0B' },
    }),
    prisma.tag.upsert({
      where: { userId_name: { userId: user1.id, name: 'Client' } },
      update: {},
      create: { userId: user1.id, name: 'Client', color: '#EF4444' },
    }),
    prisma.tag.upsert({
      where: { userId_name: { userId: user1.id, name: 'Mentor' } },
      update: {},
      create: { userId: user1.id, name: 'Mentor', color: '#8B5CF6' },
    }),
  ]);

  console.log(`Created ${tags.length} tags for user1`);

  // Create contacts for user1
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        userId: user1.id,
        name: 'Alice Johnson',
        email: 'alice.johnson@techcorp.com',
        phone: '+1-555-0101',
        company: 'TechCorp Inc.',
        industry: 'Technology',
        role: 'Senior Software Engineer',
        priority: Priority.HIGH,
        gender: Gender.FEMALE,
        birthday: new Date('1990-03-15'),
        linkedInUrl: 'https://linkedin.com/in/alicejohnson',
        notes: 'Met at tech conference. Very interested in AI/ML projects.',
        lastContactedAt: new Date('2025-09-20'),
      },
    }),
    prisma.contact.create({
      data: {
        userId: user1.id,
        name: 'Bob Williams',
        email: 'bob@startup.io',
        phone: '+1-555-0102',
        company: 'Startup.io',
        industry: 'Technology',
        role: 'Founder & CEO',
        priority: Priority.HIGH,
        gender: Gender.MALE,
        birthday: new Date('1985-07-22'),
        linkedInUrl: 'https://linkedin.com/in/bobwilliams',
        notes: 'Potential investor for our product. Follow up monthly.',
        lastContactedAt: new Date('2025-10-01'),
      },
    }),
    prisma.contact.create({
      data: {
        userId: user1.id,
        name: 'Carol Martinez',
        email: 'carol.martinez@consulting.com',
        phone: '+1-555-0103',
        company: 'Global Consulting',
        industry: 'Consulting',
        role: 'Managing Partner',
        priority: Priority.MEDIUM,
        gender: Gender.FEMALE,
        birthday: new Date('1978-11-08'),
        notes: 'Interested in collaboration opportunities.',
        lastContactedAt: new Date('2025-08-15'),
      },
    }),
    prisma.contact.create({
      data: {
        userId: user1.id,
        name: 'David Chen',
        email: 'david.chen@university.edu',
        company: 'University Research Lab',
        industry: 'Education',
        role: 'Professor',
        priority: Priority.LOW,
        gender: Gender.MALE,
        notes: 'Research collaboration potential.',
        lastContactedAt: new Date('2025-07-10'),
      },
    }),
    prisma.contact.create({
      data: {
        userId: user1.id,
        name: 'Eva Rodriguez',
        email: 'eva@designstudio.com',
        phone: '+1-555-0105',
        company: 'Design Studio',
        industry: 'Design',
        role: 'Creative Director',
        priority: Priority.MEDIUM,
        gender: Gender.FEMALE,
        birthday: new Date('1992-05-30'),
        notes: 'Great design portfolio. Consider for future projects.',
      },
    }),
  ]);

  console.log(`Created ${contacts.length} contacts for user1`);

  // Create contact-tag relationships
  await prisma.contactTag.createMany({
    data: [
      { contactId: contacts[0].id, tagId: tags[0].id }, // Alice - Work
      { contactId: contacts[0].id, tagId: tags[2].id }, // Alice - Networking
      { contactId: contacts[1].id, tagId: tags[0].id }, // Bob - Work
      { contactId: contacts[1].id, tagId: tags[3].id }, // Bob - Client
      { contactId: contacts[2].id, tagId: tags[3].id }, // Carol - Client
      { contactId: contacts[3].id, tagId: tags[4].id }, // David - Mentor
      { contactId: contacts[4].id, tagId: tags[0].id }, // Eva - Work
    ],
    skipDuplicates: true,
  });

  console.log('Created contact-tag relationships');

  // Create sent emails
  const sentEmails = await Promise.all([
    prisma.email.create({
      data: {
        userId: user1.id,
        contactId: contacts[0].id,
        subject: 'Great meeting you at the conference!',
        body: 'Hi Alice, it was wonderful meeting you at the AI conference last week. I was really impressed by your insights on LLM applications in enterprise software.\n\nWould love to continue our conversation about potential collaboration opportunities. Are you available for a quick call next week?\n\nBest regards,\nJohn',
        bodyHtml: '<p>Hi Alice, it was wonderful meeting you at the AI conference last week. I was really impressed by your insights on LLM applications in enterprise software.</p><p>Would love to continue our conversation about potential collaboration opportunities. Are you available for a quick call next week?</p><p>Best regards,<br>John</p>',
        status: EmailStatus.SENT,
        templateType: TemplateType.CASUAL,
        sentAt: new Date('2025-09-20T10:30:00Z'),
        openedAt: new Date('2025-09-20T14:22:00Z'),
      },
    }),
    prisma.email.create({
      data: {
        userId: user1.id,
        contactId: contacts[1].id,
        subject: 'Follow-up on our coffee chat',
        body: 'Hi Bob, thanks for taking the time to chat about potential collaboration opportunities last week. I really enjoyed learning more about Startup.io and your vision for the product.\n\nAs discussed, I\'m attaching our latest pitch deck. I think there are some great synergies between our platforms.\n\nLet me know if you\'d like to schedule a follow-up call to discuss next steps.\n\nBest,\nJohn',
        bodyHtml: '<p>Hi Bob, thanks for taking the time to chat about potential collaboration opportunities last week. I really enjoyed learning more about Startup.io and your vision for the product.</p><p>As discussed, I\'m attaching our latest pitch deck. I think there are some great synergies between our platforms.</p><p>Let me know if you\'d like to schedule a follow-up call to discuss next steps.</p><p>Best,<br>John</p>',
        status: EmailStatus.SENT,
        templateType: TemplateType.CASUAL,
        sentAt: new Date('2025-10-01T09:00:00Z'),
        openedAt: new Date('2025-10-01T11:15:00Z'),
        repliedAt: new Date('2025-10-01T15:30:00Z'),
      },
    }),
  ]);

  console.log('Created sent emails');

  // Create email templates for user1
  const emailTemplates = await Promise.all([
    prisma.emailTemplate.create({
      data: {
        userId: user1.id,
        name: 'Conference Follow-up',
        subject: 'Great connecting at {event_name}!',
        body: 'Hi {contact_name},\n\nIt was wonderful connecting with you at {event_name}. I really enjoyed our conversation about {topic}.\n\nI\'d love to continue the discussion and explore potential collaboration opportunities. Would you be available for a quick call in the coming weeks?\n\nLooking forward to staying in touch!\n\nBest regards,\n{your_name}',
        bodyHtml: '<p>Hi {contact_name},</p><p>It was wonderful connecting with you at {event_name}. I really enjoyed our conversation about {topic}.</p><p>I\'d love to continue the discussion and explore potential collaboration opportunities. Would you be available for a quick call in the coming weeks?</p><p>Looking forward to staying in touch!</p><p>Best regards,<br>{your_name}</p>',
        category: 'follow-up',
        isDefault: true,
        usageCount: 5,
      },
    }),
    prisma.emailTemplate.create({
      data: {
        userId: user1.id,
        name: 'Introduction Request',
        subject: 'Quick introduction to {contact_name}',
        body: 'Hi {contact_name},\n\nI hope this email finds you well. I came across your profile and was impressed by your work in {industry}.\n\nI\'m currently working on {project_description}, and I believe your expertise could be incredibly valuable. Would you be open to a brief conversation to explore potential synergies?\n\nI understand you\'re busy, so I\'d be happy to work around your schedule.\n\nBest regards,\n{your_name}',
        bodyHtml: '<p>Hi {contact_name},</p><p>I hope this email finds you well. I came across your profile and was impressed by your work in {industry}.</p><p>I\'m currently working on {project_description}, and I believe your expertise could be incredibly valuable. Would you be open to a brief conversation to explore potential synergies?</p><p>I understand you\'re busy, so I\'d be happy to work around your schedule.</p><p>Best regards,<br>{your_name}</p>',
        category: 'introduction',
        isDefault: false,
        usageCount: 3,
      },
    }),
    prisma.emailTemplate.create({
      data: {
        userId: user1.id,
        name: 'Thank You Note',
        subject: 'Thank you for {occasion}',
        body: 'Dear {contact_name},\n\nI wanted to take a moment to express my sincere gratitude for {reason}. Your {contribution} has been invaluable, and I truly appreciate your support.\n\nLooking forward to our continued collaboration.\n\nWarm regards,\n{your_name}',
        bodyHtml: '<p>Dear {contact_name},</p><p>I wanted to take a moment to express my sincere gratitude for {reason}. Your {contribution} has been invaluable, and I truly appreciate your support.</p><p>Looking forward to our continued collaboration.</p><p>Warm regards,<br>{your_name}</p>',
        category: 'thank-you',
        isDefault: false,
        usageCount: 7,
      },
    }),
    prisma.emailTemplate.create({
      data: {
        userId: user1.id,
        name: 'Monthly Check-in',
        subject: 'Checking in - {month}',
        body: 'Hi {contact_name},\n\nI hope you\'re doing well! I wanted to reach out for our monthly check-in and see how things are progressing with {project_or_topic}.\n\nAny updates on your end? I\'d love to hear what you\'ve been working on lately.\n\nLet me know if you\'re available for a quick call this week.\n\nBest,\n{your_name}',
        bodyHtml: '<p>Hi {contact_name},</p><p>I hope you\'re doing well! I wanted to reach out for our monthly check-in and see how things are progressing with {project_or_topic}.</p><p>Any updates on your end? I\'d love to hear what you\'ve been working on lately.</p><p>Let me know if you\'re available for a quick call this week.</p><p>Best,<br>{your_name}</p>',
        category: 'follow-up',
        isDefault: false,
        usageCount: 12,
      },
    }),
  ]);

  console.log(`Created ${emailTemplates.length} email templates`);

  // Create AI-generated draft emails
  const draftEmails = await Promise.all([
    prisma.email.create({
      data: {
        userId: user1.id,
        contactId: contacts[2].id,
        subject: 'Following Up on Our Collaboration Discussion',
        body: 'Dear Carol,\n\nI hope this message finds you well. I wanted to follow up on our previous conversation regarding potential collaboration opportunities between our organizations.\n\nGiven your extensive experience in the consulting industry and Global Consulting\'s track record of successful partnerships, I believe there could be significant synergies between our respective offerings.\n\nWould you be available for a call next week to discuss this further? I am flexible with timing and happy to work around your schedule.\n\nI look forward to hearing from you.\n\nBest regards,\nJohn Doe',
        bodyHtml: '<p>Dear Carol,</p><p>I hope this message finds you well. I wanted to follow up on our previous conversation regarding potential collaboration opportunities between our organizations.</p><p>Given your extensive experience in the consulting industry and Global Consulting\'s track record of successful partnerships, I believe there could be significant synergies between our respective offerings.</p><p>Would you be available for a call next week to discuss this further? I am flexible with timing and happy to work around your schedule.</p><p>I look forward to hearing from you.</p><p>Best regards,<br>John Doe</p>',
        status: EmailStatus.DRAFT,
        templateType: TemplateType.FORMAL,
        providerId: 'openai/gpt-4-turbo',
        tokensUsed: 287,
        generatedAt: new Date('2025-10-10T14:30:00Z'),
      },
    }),
    prisma.email.create({
      data: {
        userId: user1.id,
        contactId: contacts[3].id,
        subject: 'Hey David! Quick question about your research',
        body: 'Hey David,\n\nHope you\'re having a great week! I\'ve been following your recent work on machine learning applications in education, and it\'s really fascinating stuff.\n\nI\'m working on a project that might benefit from your insights. Got 15 minutes for a quick chat sometime this week? Coffee\'s on me if you\'re on campus!\n\nCheers,\nJohn',
        bodyHtml: '<p>Hey David,</p><p>Hope you\'re having a great week! I\'ve been following your recent work on machine learning applications in education, and it\'s really fascinating stuff.</p><p>I\'m working on a project that might benefit from your insights. Got 15 minutes for a quick chat sometime this week? Coffee\'s on me if you\'re on campus!</p><p>Cheers,<br>John</p>',
        status: EmailStatus.DRAFT,
        templateType: TemplateType.CASUAL,
        providerId: 'anthropic/claude-3.5-sonnet',
        tokensUsed: 195,
        generatedAt: new Date('2025-10-10T15:45:00Z'),
      },
    }),
    prisma.email.create({
      data: {
        userId: user1.id,
        contactId: contacts[4].id,
        subject: 'Exploring Design Collaboration Opportunities',
        body: 'Hi Eva,\n\nI hope you\'re doing well! I came across Design Studio\'s portfolio recently, and I was really impressed by your work on the TechFlow rebranding project.\n\nWe\'re currently looking to refresh our product\'s visual identity, and I think your design approach would be a perfect fit. Would you be interested in discussing a potential collaboration?\n\nI\'d love to set up a call to share more details about the project and hear your thoughts.\n\nLooking forward to connecting!\n\nBest,\nJohn',
        bodyHtml: '<p>Hi Eva,</p><p>I hope you\'re doing well! I came across Design Studio\'s portfolio recently, and I was really impressed by your work on the TechFlow rebranding project.</p><p>We\'re currently looking to refresh our product\'s visual identity, and I think your design approach would be a perfect fit. Would you be interested in discussing a potential collaboration?</p><p>I\'d love to set up a call to share more details about the project and hear your thoughts.</p><p>Looking forward to connecting!</p><p>Best,<br>John</p>',
        status: EmailStatus.DRAFT,
        templateType: TemplateType.CASUAL,
        providerId: 'openai/gpt-4-turbo',
        tokensUsed: 223,
        generatedAt: new Date('2025-10-10T16:20:00Z'),
      },
    }),
  ]);

  console.log(`Created ${draftEmails.length} AI-generated draft emails`);

  // Create conversation history entries
  await prisma.conversationHistory.createMany({
    data: [
      {
        userId: user1.id,
        contactId: contacts[0].id,
        emailId: sentEmails[0].id,
        content: 'Subject: Great meeting you at the conference!\n\nHi Alice, it was wonderful meeting you at the AI conference last week. I was really impressed by your insights on LLM applications in enterprise software.\n\nWould love to continue our conversation about potential collaboration opportunities. Are you available for a quick call next week?\n\nBest regards,\nJohn',
        direction: Direction.SENT,
        timestamp: new Date('2025-09-20T10:30:00Z'),
        metadata: { opened: true, openedAt: '2025-09-20T14:22:00Z' },
      },
      {
        userId: user1.id,
        contactId: contacts[1].id,
        emailId: sentEmails[1].id,
        content: 'Subject: Follow-up on our coffee chat\n\nHi Bob, thanks for taking the time to chat about potential collaboration opportunities last week. I really enjoyed learning more about Startup.io and your vision for the product.\n\nAs discussed, I\'m attaching our latest pitch deck. I think there are some great synergies between our platforms.\n\nLet me know if you\'d like to schedule a follow-up call to discuss next steps.\n\nBest,\nJohn',
        direction: Direction.SENT,
        timestamp: new Date('2025-10-01T09:00:00Z'),
        metadata: { opened: true, openedAt: '2025-10-01T11:15:00Z', replied: true, repliedAt: '2025-10-01T15:30:00Z' },
      },
      {
        userId: user1.id,
        contactId: contacts[1].id,
        content: 'Subject: Re: Follow-up on our coffee chat\n\nHi John,\n\nThanks for sending over the pitch deck! I reviewed it with my team, and we\'re definitely interested in exploring this further.\n\nHow about we schedule a call for next Tuesday at 2 PM? I\'ll bring our CTO along to discuss technical integration possibilities.\n\nBest,\nBob',
        direction: Direction.RECEIVED,
        timestamp: new Date('2025-10-01T15:30:00Z'),
        metadata: { inbound: true },
      },
      {
        userId: user1.id,
        contactId: contacts[0].id,
        content: 'Subject: Coffee meeting notes - AI project collaboration\n\nMeeting with Alice Johnson on 2025-09-18.\n\nDiscussed:\n- Her current work on LLM fine-tuning for enterprise applications\n- Potential integration with our platform\n- Timeline: Q1 2026 for pilot project\n- Next steps: Technical feasibility assessment\n\nAction items:\n- Alice to share technical requirements by end of month\n- Schedule follow-up call in 2 weeks',
        direction: Direction.SENT,
        timestamp: new Date('2025-09-18T16:00:00Z'),
        metadata: { type: 'meeting_notes' },
      },
    ],
  });

  console.log('Created conversation history entries');

  // Create activities
  await prisma.activity.createMany({
    data: [
      {
        userId: user1.id,
        contactId: contacts[0].id,
        type: ActivityType.EMAIL_SENT,
        description: 'Sent follow-up email after conference',
        occurredAt: new Date('2025-09-20T10:30:00Z'),
      },
      {
        userId: user1.id,
        contactId: contacts[0].id,
        type: ActivityType.MEETING,
        description: 'Coffee meeting to discuss AI project collaboration',
        occurredAt: new Date('2025-09-18T15:00:00Z'),
      },
      {
        userId: user1.id,
        contactId: contacts[1].id,
        type: ActivityType.EMAIL_SENT,
        description: 'Follow-up email sent',
        occurredAt: new Date('2025-10-01T09:00:00Z'),
      },
      {
        userId: user1.id,
        contactId: contacts[1].id,
        type: ActivityType.CALL,
        description: 'Initial phone call to introduce product',
        occurredAt: new Date('2025-09-25T14:00:00Z'),
      },
    ],
  });

  console.log('Created activities');

  // Create reminders
  await prisma.reminder.createMany({
    data: [
      {
        userId: user1.id,
        contactId: contacts[0].id,
        title: 'Follow up on AI project proposal',
        dueDate: new Date('2025-10-15'),
        completed: false,
      },
      {
        userId: user1.id,
        contactId: contacts[1].id,
        title: 'Schedule investor pitch meeting',
        dueDate: new Date('2025-10-20'),
        completed: false,
      },
      {
        userId: user1.id,
        contactId: contacts[2].id,
        title: 'Send quarterly update',
        dueDate: new Date('2025-10-10'),
        completed: true,
        completedAt: new Date('2025-10-09'),
      },
    ],
  });

  console.log('Created reminders');

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
