import { PrismaClient, Priority, Gender, EmailProvider, ActivityType } from '../src/generated/client';

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

  // Create emails
  await prisma.email.createMany({
    data: [
      {
        userId: user1.id,
        contactId: contacts[0].id,
        subject: 'Great meeting you at the conference!',
        body: 'Hi Alice, it was wonderful meeting you at the AI conference last week...',
        sentAt: new Date('2025-09-20T10:30:00Z'),
        openedAt: new Date('2025-09-20T14:22:00Z'),
        provider: EmailProvider.GMAIL,
      },
      {
        userId: user1.id,
        contactId: contacts[1].id,
        subject: 'Follow-up on our coffee chat',
        body: 'Hi Bob, thanks for taking the time to chat about potential collaboration...',
        sentAt: new Date('2025-10-01T09:00:00Z'),
        openedAt: new Date('2025-10-01T11:15:00Z'),
        clickedAt: new Date('2025-10-01T11:18:00Z'),
        provider: EmailProvider.GMAIL,
      },
    ],
  });

  console.log('Created emails');

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
