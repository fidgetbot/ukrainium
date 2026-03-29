import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const MAX_NOTE_LENGTH = 140;

export async function POST(request: Request) {
  const sessionToken = (await cookies()).get('session')?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
  });

  if (!session || session.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const progressId = typeof body.progressId === 'string' ? body.progressId : '';
    const rawNote = typeof body.note === 'string' ? body.note : null;
    const note = rawNote?.trim() || null;

    if (!progressId) {
      return NextResponse.json({ error: 'Missing progressId' }, { status: 400 });
    }

    if (note && note.length > MAX_NOTE_LENGTH) {
      return NextResponse.json({ error: 'Note too long' }, { status: 400 });
    }

    const progress = await prisma.userWordProgress.update({
      where: { id: progressId, userId: session.userId },
      data: { note },
      select: { id: true, note: true },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Failed to save note:', error);
    return NextResponse.json({ error: 'Failed to save note' }, { status: 500 });
  }
}
