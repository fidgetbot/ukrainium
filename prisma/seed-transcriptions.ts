import { PrismaClient } from '@prisma/client';
import { spawnSync } from 'node:child_process';

const prisma = new PrismaClient();

const ACUTE = '\u0301';

const UKRAINIAN_TO_ENGLISH: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd',
  'е': 'e', 'є': 'yeh', 'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i',
  'ї': 'yee', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
  'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
  'ь': '', 'ю': 'yoo', 'я': 'ya',
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'H', 'Ґ': 'G', 'Д': 'D',
  'Е': 'E', 'Є': 'YEH', 'Ж': 'ZH', 'З': 'Z', 'И': 'Y', 'І': 'I',
  'Ї': 'YEE', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N',
  'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
  'Ф': 'F', 'Х': 'KH', 'Ц': 'TS', 'Ч': 'CH', 'Ш': 'SH', 'Щ': 'SHCH',
  'Ь': '', 'Ю': 'YOO', 'Я': 'YA',
  "'": '', 'ʼ': ''
};

const ACCENTED_VOWELS: Record<string, string> = {
  a: 'á', A: 'Á',
  e: 'é', E: 'É',
  i: 'í', I: 'Í',
  o: 'ó', O: 'Ó',
  u: 'ú', U: 'Ú',
  y: 'ý', Y: 'Ý',
};

function accentify(transliteration: string): string {
  for (let i = 0; i < transliteration.length; i++) {
    const accented = ACCENTED_VOWELS[transliteration[i]];
    if (accented) {
      return transliteration.slice(0, i) + accented + transliteration.slice(i + 1);
    }
  }
  return transliteration;
}

function transcribeWord(stressedUkrainian: string): string {
  let result = '';

  for (let i = 0; i < stressedUkrainian.length; i++) {
    const char = stressedUkrainian[i];
    if (char === ACUTE) continue;

    const stressed = stressedUkrainian[i + 1] === ACUTE;
    const transliteration = UKRAINIAN_TO_ENGLISH[char] ?? char;
    result += stressed ? accentify(transliteration) : transliteration;
  }

  return result;
}

function stressifyWords(words: string[]): string[] {
  const command = 'source .venv-stress/bin/activate && python scripts/ukrainian_stressify.py';
  const result = spawnSync('bash', ['-lc', command], {
    input: words.join('\n') + '\n',
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || 'Stressification failed');
  }

  const output = result.stdout.trimEnd().split('\n');
  if (output.length !== words.length) {
    throw new Error(`Expected ${words.length} stressified lines, got ${output.length}`);
  }

  return output;
}

async function populateTranscriptions() {
  console.log('Fetching all words...');
  const words = await prisma.word.findMany({
    orderBy: { frequencyRank: 'asc' },
  });

  console.log(`Found ${words.length} words. Generating stressed transcriptions...`);

  const stressedWords = stressifyWords(words.map((word) => word.ukrainian));

  let updated = 0;
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const stressedUkrainian = stressedWords[i];
    const transcription = transcribeWord(stressedUkrainian);

    await prisma.word.update({
      where: { id: word.id },
      data: { transcription },
    });

    updated++;
    if (updated % 100 === 0) {
      console.log(`  Updated ${updated}/${words.length}...`);
    }
  }

  console.log(`✅ Done! Updated ${updated} words with stressed transcriptions.`);

  const samples = await prisma.word.findMany({
    take: 5,
    orderBy: { frequencyRank: 'asc' },
  });
  console.log('\nSample transcriptions:');
  for (const word of samples) {
    console.log(`  ${word.ukrainian} → ${word.transcription}`);
  }
}

populateTranscriptions()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
