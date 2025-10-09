import { PrismaClient, Priority, Gender } from '@prisma/client';

const prisma = new PrismaClient();

export interface SeedContactData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  linkedInUrl?: string;
  company?: string;
  industry?: string;
  role?: string;
  priority: Priority;
  gender?: Gender;
  birthday?: Date;
  profilePicture?: string;
  notes?: string;
  lastContactedAt?: Date;
}

/**
 * Seed contacts for testing
 * @param userSupabaseId - The Supabase user ID (from auth)
 * @returns Array of created contact IDs
 */
export async function seedContacts(userSupabaseId: string): Promise<string[]> {
  console.log(`🌱 Seeding contacts for user with Supabase ID: ${userSupabaseId}`);

  // First, find the User in the database by supabaseId
  const user = await prisma.user.findUnique({
    where: { supabaseId: userSupabaseId },
  });

  if (!user) {
    throw new Error(`User with supabaseId ${userSupabaseId} not found in database`);
  }

  console.log(`✅ Found user in database: ${user.email} (ID: ${user.id})`);

  // Test contact data with known IDs that tests can reference
  const testContacts: SeedContactData[] = [
    {
      id: 'test-contact-123', // Matches contact-detail.spec.ts mock data
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1 (555) 123-4567',
      linkedInUrl: 'https://linkedin.com/in/janesmith',
      company: 'Tech Corp',
      industry: 'Technology',
      role: 'Senior Software Engineer',
      priority: Priority.HIGH,
      gender: Gender.FEMALE,
      birthday: new Date('1990-05-15'),
      profilePicture: 'https://example.com/profile-pictures/jane-smith.jpg',
      notes: 'Met at tech conference in 2024.\nInterested in AI and machine learning.',
      lastContactedAt: new Date('2025-01-01T10:00:00Z'),
    },
    {
      id: 'test-contact-john-doe',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 234-5678',
      linkedInUrl: 'https://linkedin.com/in/johndoe',
      company: 'StartupHub',
      industry: 'Technology',
      role: 'CTO',
      priority: Priority.HIGH,
      gender: Gender.MALE,
      birthday: new Date('1988-03-20'),
      notes: 'Potential collaboration opportunity for AI projects.',
      lastContactedAt: new Date('2024-12-15T14:00:00Z'),
    },
    {
      id: 'test-contact-sarah-johnson',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+1 (555) 345-6789',
      company: 'Acme Corp',
      industry: 'Finance',
      role: 'VP of Engineering',
      priority: Priority.MEDIUM,
      gender: Gender.FEMALE,
      notes: 'Follow up about partnership opportunities.',
      lastContactedAt: new Date('2024-11-20T09:00:00Z'),
    },
    {
      id: 'test-contact-michael-brown',
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      phone: '+1 (555) 456-7890',
      linkedInUrl: 'https://linkedin.com/in/michaelbrown',
      company: 'Innovation Labs',
      industry: 'Technology',
      role: 'Product Manager',
      priority: Priority.MEDIUM,
      gender: Gender.MALE,
      birthday: new Date('1992-08-10'),
      notes: 'Interested in our product roadmap.',
    },
    {
      id: 'test-contact-emily-davis',
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      phone: '+1 (555) 567-8901',
      company: 'Design Studio',
      industry: 'Design',
      role: 'Creative Director',
      priority: Priority.LOW,
      gender: Gender.FEMALE,
      notes: 'Potential design collaboration.',
      lastContactedAt: new Date('2024-10-05T11:00:00Z'),
    },
    {
      id: 'test-contact-robert-wilson',
      name: 'Robert Wilson',
      email: 'robert.wilson@example.com',
      phone: '+1 (555) 678-9012',
      linkedInUrl: 'https://linkedin.com/in/robertwilson',
      company: 'Enterprise Solutions',
      industry: 'Software',
      role: 'Sales Manager',
      priority: Priority.LOW,
      gender: Gender.MALE,
      birthday: new Date('1985-11-25'),
      notes: 'Sales contact for enterprise deals.',
    },
    {
      id: 'test-contact-lisa-anderson',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@example.com',
      company: 'Marketing Pro',
      industry: 'Marketing',
      role: 'Marketing Director',
      priority: Priority.MEDIUM,
      notes: 'Marketing collaboration opportunities.',
      lastContactedAt: new Date('2024-12-01T13:00:00Z'),
    },
    {
      id: 'test-contact-david-martinez',
      name: 'David Martinez',
      email: 'david.martinez@example.com',
      phone: '+1 (555) 789-0123',
      linkedInUrl: 'https://linkedin.com/in/davidmartinez',
      company: 'Cloud Services Inc',
      industry: 'Technology',
      role: 'DevOps Engineer',
      priority: Priority.HIGH,
      gender: Gender.MALE,
      notes: 'Infrastructure expertise.',
    },
    {
      id: 'test-contact-jennifer-taylor',
      name: 'Jennifer Taylor',
      email: 'jennifer.taylor@example.com',
      phone: '+1 (555) 890-1234',
      company: 'Legal Advisors',
      industry: 'Legal',
      role: 'Senior Attorney',
      priority: Priority.MEDIUM,
      gender: Gender.FEMALE,
      birthday: new Date('1987-04-12'),
      notes: 'Legal consultation contact.',
    },
    {
      id: 'test-contact-chris-lee',
      name: 'Chris Lee',
      email: 'chris.lee@example.com',
      linkedInUrl: 'https://linkedin.com/in/chrislee',
      company: 'Data Analytics Co',
      industry: 'Analytics',
      role: 'Data Scientist',
      priority: Priority.LOW,
      notes: 'Data analysis collaboration.',
      lastContactedAt: new Date('2024-09-15T10:00:00Z'),
    },
  ];

  // Delete existing test contacts for this user to avoid duplicates
  const deletedCount = await prisma.contact.deleteMany({
    where: { userId: user.id },
  });

  console.log(`🗑️  Deleted ${deletedCount.count} existing contacts for clean slate`);

  // Create contacts with predictable IDs
  const createdContactIds: string[] = [];

  for (let i = 0; i < testContacts.length; i++) {
    const { id: contactId, ...contactData } = testContacts[i];

    const contact = await prisma.contact.create({
      data: {
        id: contactId, // Use the provided ID for deterministic testing
        userId: user.id,
        ...contactData,
      },
    });

    createdContactIds.push(contact.id);
    console.log(`✅ Created contact: ${contact.name} (ID: ${contact.id})`);
  }

  console.log(`\n🎉 Successfully seeded ${createdContactIds.length} contacts`);

  return createdContactIds;
}

/**
 * Clear all contacts for a user
 */
export async function clearContacts(userSupabaseId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { supabaseId: userSupabaseId },
  });

  if (!user) {
    throw new Error(`User with supabaseId ${userSupabaseId} not found in database`);
  }

  const deletedCount = await prisma.contact.deleteMany({
    where: { userId: user.id },
  });

  console.log(`🗑️  Cleared ${deletedCount.count} contacts for user ${user.email}`);

  return deletedCount.count;
}

// Export prisma client for use in tests
export { prisma };
