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

  // Detect platform from User-Agent to set optimal Content-Disposition
  const ua = request.headers.get('user-agent') || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  // iOS: inline lets Safari trigger the native contact sheet
  // Others: attachment forces download with .vcf extension (Android recognizes and offers Contacts app)
  const disposition = isIOS
    ? `inline; filename="${filename}.vcf"`
    : `attachment; filename="${filename}.vcf"`;

  return new NextResponse(vcard, {
    headers: {
      'Content-Type': 'text/x-vcard; charset=utf-8',
      'Content-Disposition': disposition,
      'Cache-Control': 'no-cache',
    },
  });
}
