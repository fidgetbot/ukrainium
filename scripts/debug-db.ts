import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debug() {
  console.log('=== DEBUGGING USER DATA ===\n');
  
  // 1. Check all users
  const users = await prisma.user.findMany();
  console.log('1. USERS:', users.length);
  users.forEach(u => console.log(`   - ${u.email} (ID: ${u.id})`));
  
  // 2. Check total words
  const wordCount = await prisma.word.count();
  console.log('\n2. TOTAL WORDS:', wordCount);
  
  // 3. Check words in Pack 1
  const pack1Words = await prisma.word.count({ where: { packNumber: 1 } });
  console.log('   Pack 1 words:', pack1Words);
  
  // 4. Check all user progress
  const allProgress = await prisma.userWordProgress.findMany({
    include: { user: { select: { email: true } }, word: { select: { ukrainian: true } } }
  });
  console.log('\n3. TOTAL PROGRESS ENTRIES:', allProgress.length);
  allProgress.slice(0, 5).forEach(p => {
    console.log(`   - ${p.user.email}: ${p.word.ukrainian} (${p.pile})`);
  });
  if (allProgress.length > 5) console.log(`   ... and ${allProgress.length - 5} more`);
  
  // 5. Check progress per user
  const progressByUser = await prisma.userWordProgress.groupBy({
    by: ['userId'],
    _count: { id: true }
  });
  console.log('\n4. PROGRESS BY USER:');
  for (const group of progressByUser) {
    const user = await prisma.user.findUnique({ where: { id: group.userId } });
    console.log(`   - ${user?.email || 'Unknown'}: ${group._count.id} entries`);
  }
}

debug()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
