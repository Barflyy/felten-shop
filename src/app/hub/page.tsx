import { Metadata } from 'next';
import { profiles } from '@/lib/hub-data';
import { HubPage } from './hub-page';

const profile = profiles[0];

export const metadata: Metadata = {
  title: `${profile.name} — ${profile.company}`,
  description: profile.bio,
  openGraph: {
    title: `${profile.name} — ${profile.company}`,
    description: profile.bio,
    type: 'profile',
  },
};

export default function Hub() {
  return <HubPage profile={profile} />;
}
