import sgMail from '@sendgrid/mail';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fallback-url-for-build.com';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'fallback-key-for-build';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    // Validate environment variables at runtime
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables for Supabase');
    }
    
    const { inviteeEmail, inviterEmail, invitationToken } = await request.json();
    
    // Get inviter's name and company name
    const { data: inviterData } = await supabase
      .from('team_members')
      .select('name, companies!inner(name)')
      .eq('email', inviterEmail)
      .single();

    const inviterName = inviterData?.name || 'Team Owner';
    const companyName = inviterData?.companies && Array.isArray(inviterData.companies) 
      ? inviterData.companies[0]?.name || 'your team'
      : 'your team';
    
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invitationToken}`;

    const msg = {
      to: inviteeEmail,
      from: 'noreply@lysio.app', // Must be verified in SendGrid
      subject: `${inviterName} has invited you to join ${companyName} on Lysio`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">You've been invited to join ${companyName}!</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            ${inviterName} has invited you to join their team on Lysio, the marketing platform that helps teams collaborate and grow together.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">What's next?</h3>
            <ol style="color: #666; line-height: 1.6;">
              <li>Click the button below to accept the invitation</li>
              <li>Create your account and set your password</li>
              <li>Tell us about yourself and your services</li>
              <li>Start collaborating with your team!</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" 
               style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Accept Invitation
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:<br>
            <a href="${inviteUrl}" style="color: #0070f3;">${inviteUrl}</a>
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This invitation link will expire in 7 days. If you have any questions, please contact ${inviterName} directly.
          </p>
        </div>
      `
    };

    await sgMail.send(msg);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending invitation email:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation email' },
      { status: 500 }
    );
  }
} 