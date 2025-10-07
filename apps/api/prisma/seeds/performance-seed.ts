/**
 * Performance Testing Seed Script
 *
 * This script creates 1000+ test contacts for performance testing.
 * Use: pnpm prisma db seed:performance
 */

import { PrismaClient, Priority, Gender } from '@relationhub/database';

// Type-safe enum arrays
const priorities: Priority[] = ['HIGH', 'MEDIUM', 'LOW'];
const genders: Gender[] = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'];

const prisma = new PrismaClient();

// Sample data arrays for realistic contact generation
const firstNames = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa',
  'James', 'Maria', 'William', 'Jennifer', 'Richard', 'Linda', 'Thomas', 'Patricia',
  'Charles', 'Barbara', 'Joseph', 'Elizabeth', 'Christopher', 'Susan', 'Daniel', 'Jessica',
  'Matthew', 'Karen', 'Anthony', 'Nancy', 'Mark', 'Betty', 'Donald', 'Helen',
  'Steven', 'Sandra', 'Paul', 'Donna', 'Andrew', 'Carol', 'Joshua', 'Ruth',
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Walker', 'Hall', 'Allen',
  'Young', 'King', 'Wright', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson',
  'Carter', 'Mitchell', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans',
];

const companies = [
  'TechCorp', 'InnovateCo', 'Global Solutions', 'Digital Ventures', 'Future Tech',
  'Smart Systems', 'Cloud Services', 'Data Analytics Inc', 'AI Solutions', 'WebDev Pro',
  'Mobile Apps LLC', 'Software House', 'Consulting Group', 'Enterprise Systems', 'Startup Hub',
];

const industries = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Retail',
  'Manufacturing', 'Consulting', 'Marketing', 'Real Estate', 'Entertainment',
];

const roles = [
  'Software Engineer', 'Product Manager', 'Designer', 'Data Scientist', 'DevOps Engineer',
  'Marketing Manager', 'Sales Director', 'CEO', 'CTO', 'CFO',
  'Consultant', 'Analyst', 'Coordinator', 'Specialist', 'Manager',
];

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateEmail(firstName: string, lastName: string, company: string): string {
  const domain = company.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') + '.com';
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
}

function generatePhone(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const exchange = Math.floor(Math.random() * 900) + 100;
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `+1 (${areaCode}) ${exchange}-${number}`;
}

async function main() {
  console.log('🌱 Starting performance test data seeding...');

  // Note: You need to create the test user manually via Supabase Auth
  // Email: performance.test@relationhub.com

  // Try to find existing user in database
  let testUser = await prisma.user.findUnique({
    where: { email: 'performance.test@relationhub.com' },
  });

  if (!testUser) {
    console.log('⚠️  Test user not found in database.');
    console.log('📝 Please create user via Supabase Auth:');
    console.log('   Email: performance.test@relationhub.com');
    console.log('   Then re-run this seed script.');
    console.log('\n💡 Tip: Visit http://localhost:3000/signup to create the user');
    process.exit(1);
  }

  console.log('✅ Found test user for performance testing');

  // Check existing contacts
  const existingContactsCount = await prisma.contact.count({
    where: { userId: testUser.id },
  });

  if (existingContactsCount >= 1000) {
    console.log(`✅ Already have ${existingContactsCount} contacts for performance testing`);
    return;
  }

  console.log(`📊 Creating ${1000 - existingContactsCount} contacts...`);

  // Generate contacts in batches for better performance
  const batchSize = 100;
  const totalBatches = Math.ceil((1000 - existingContactsCount) / batchSize);

  for (let batch = 0; batch < totalBatches; batch++) {
    const contactsToCreate = Math.min(batchSize, 1000 - existingContactsCount - batch * batchSize);
    const contacts = [];

    for (let i = 0; i < contactsToCreate; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      const company = randomElement(companies);
      const priority = randomElement(priorities);
      const gender = randomElement(genders);

      contacts.push({
        userId: testUser.id,
        name: `${firstName} ${lastName}`,
        email: generateEmail(firstName, lastName, company),
        phone: generatePhone(),
        linkedinUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
        company,
        industry: randomElement(industries),
        role: randomElement(roles),
        priority,
        gender,
        birthday: randomDate(new Date(1970, 0, 1), new Date(2000, 11, 31)),
        notes: `Met at conference. Interested in ${randomElement(['AI', 'Cloud Computing', 'Data Science', 'Web Development', 'Mobile Apps'])}. Follow up in ${randomElement(['1 week', '2 weeks', '1 month'])}.`,
      });
    }

    await prisma.contact.createMany({
      data: contacts,
    });

    console.log(`  ✅ Batch ${batch + 1}/${totalBatches} completed (${contactsToCreate} contacts)`);
  }

  const finalCount = await prisma.contact.count({
    where: { userId: testUser.id },
  });

  console.log(`\n🎉 Performance test data seeding complete!`);
  console.log(`📊 Total contacts for performance testing: ${finalCount}`);
  console.log(`\n👤 Test User Credentials:`);
  console.log(`   Email: performance.test@relationhub.com`);
  console.log(`   Note: Use Supabase Auth to authenticate this user`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding performance test data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
