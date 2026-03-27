import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initUser() {
  // Find user with gvillar email
  const user = await prisma.user.findFirst({
    where: { email: { contains: 'gvillar' } }
  });
  
  if (!user) {
    console.log('User with gvillar not found');
    return;
  }
  
  console.log(`Found user: ${user.email} (${user.id})`);
  
  // Check existing progress
  const existingCount = await prisma.userWordProgress.count({
    where: { userId: user.id }
  });
  
  console.log(`Existing progress entries: ${existingCount}`);
  
  if (existingCount > 0) {
    console.log('Already initialized!');
    return;
  }
  
  // Get Pack 1 words
  const pack1Words = await prisma.word.findMany({
    where: { packNumber: 1 },
    orderBy: { frequencyRank: 'asc' }
  });
  
  console.log(`Found ${pack1Words.length} words in Pack 1`);
  
  // Create progress entries
  for (const word of pack1Words) {
    await prisma.userWordProgress.create({
      data: {
        userId: user.id,
        wordId: word.id,
        pile: 'new'
      }
    });
  }
  
  console.log(`✅ Created ${pack1Words.length} progress entries for ${user.email}`);
}

initUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
