export async function sendTeamInvitation(
  inviteeEmail: string,
  inviterEmail: string,
  invitationToken: string
) {
  const response = await fetch('/api/team/invite', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inviteeEmail,
      inviterEmail,
      invitationToken
    })
  });

  if (!response.ok) {
    throw new Error('Failed to send invitation email');
  }

  return response.json();
} 