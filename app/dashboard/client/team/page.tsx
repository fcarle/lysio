import ClientWrapper from '@/app/components/ClientWrapper';
import TeamPageContent from './TeamPageContent';

// Server component without any client-side hooks
export default function TeamPage() {
  return (
    <ClientWrapper>
      <TeamPageContent />
    </ClientWrapper>
  );
} 