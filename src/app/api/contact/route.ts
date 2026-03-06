import { NextResponse } from 'next/server';
import { profiles } from '@/lib/hub-data';
import type { HubProfile } from '@/lib/hub-data';

function generateVCard(profile: HubProfile): string {
  const nameParts = profile.name.split(' ');
  const lastName = nameParts.pop() || '';
  const firstName = nameParts.join(' ');

  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${profile.name}`,
    `N:${lastName};${firstName};;;`,
    `ORG:${profile.company}`,
    `TITLE:${profile.title}`,
    `TEL;TYPE=CELL:${profile.phone}`,
    `EMAIL:${profile.email}`,
    `ADR;TYPE=WORK:;;${profile.address.street};${profile.address.city};;;${profile.address.country}`,
    `URL:${profile.website}`,
    profile.bio ? `NOTE:${profile.bio}` : '',
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\r\n');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || profiles[0]?.slug;

  const profile = profiles.find((p) => p.slug === slug);
  if (!profile) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const vcard = generateVCard(profile);
  const filename = profile.name.replace(/\s+/g, '-').toLowerCase();

  return new NextResponse(vcard, {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `inline; filename="${filename}.vcf"`,
      'Cache-Control': 'no-cache',
    },
  });
}
