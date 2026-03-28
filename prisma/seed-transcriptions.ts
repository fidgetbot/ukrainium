import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Ukrainian to English phonetic mapping
const UKRAINIAN_TO_ENGLISH: Record<string, string> = {
  'а': 'ah', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd',
  'е': 'eh', 'є': 'yeh', 'ж': 'zh', 'з': 'z', 'и': 'ih', 'і': 'ee',
  'ї': 'yee', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
  'о': 'oh', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'oo',
  'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
  'ь': '', 'ю': 'yoo', 'я': 'ya',
  'А': 'AH', 'Б': 'B', 'В': 'V', 'Г': 'H', 'Ґ': 'G', 'Д': 'D',
  'Е': 'EH', 'Є': 'YEH', 'Ж': 'ZH', 'З': 'Z', 'И': 'IH', 'І': 'EE',
  'Ї': 'YEE', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N',
  'О': 'OH', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'OO',
  'Ф': 'F', 'Х': 'KH', 'Ц': 'TS', 'Ч': 'CH', 'Ш': 'SH', 'Щ': 'SHCH',
  'Ь': '', 'Ю': 'YOO', 'Я': 'YA',
  "'": "", 'ʼ': ""
};

function transcribeWord(ukrainian: string): string {
  return ukrainian.split('').map(char => UKRAINIAN_TO_ENGLISH[char] || char).join('');
}

async function populateTranscriptions() {
  console.log('Fetching all words...');
  const words = await prisma.word.findMany();
  
  console.log(`Found ${words.length} words. Generating transcriptions...`);
  
  let updated = 0;
  for (const word of words) {
    const transcription = transcribeWord(word.ukrainian);
    
    await prisma.word.update({
      where: { id: word.id },
      data: { transcription },
    });
    
    updated++;
    if (updated % 100 === 0) {
      console.log(`  Updated ${updated}/${words.length}...`);
    }
  }
  
  console.log(`✅ Done! Updated ${updated} words with transcriptions.`);
  
  // Show samples
  const samples = await prisma.word.findMany({ take: 5 });
  console.log('\nSample transcriptions:');
  for (const word of samples) {
    console.log(`  ${word.ukrainian} → ${word.transcription}`);
  }
}

populateTranscriptions()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
