import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server action for form submission
async function acceptInvitation(formData: FormData) {
  'use server';
  
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const bio = formData.get('bio') as string;
  const services = formData.get('services') as string;
  const token = formData.get('token') as string;

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    throw new Error(authError.message);
  }

  // Update team member record
  const { error: updateError } = await supabase
    .from('team_members')
    .update({
      user_id: authData.user?.id,
      name,
      bio,
      services,
      status: 'active',
    })
    .eq('email', email);

  if (updateError) {
    throw new Error(updateError.message);
  }

  // Delete invitation
  await supabase
    .from('team_invitations')
    .delete()
    .eq('token', token);

  redirect('/dashboard/client');
}

// Main page component (server component)
export default async function InvitePage({ params }: { params: { token: string } }) {
  const { data: invitation, error } = await supabase
    .from('team_invitations')
    .select('*, team_members!inner(name, email, companies!inner(name))')
    .eq('token', params.token)
    .single();

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired. Please contact the person who invited you.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Welcome to {invitation.team_members.companies.name}!</CardTitle>
          <CardDescription>
            {invitation.team_members.name} has invited you to join their team on Lysio.
            Please complete your profile to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={acceptInvitation} className="space-y-6">
            <input type="hidden" name="token" value={params.token} />
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={invitation.email}
                  required
                  readOnly
                />
              </div>

              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Create a password"
                />
              </div>

              <div>
                <Label htmlFor="bio">About You</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us a bit about yourself and your role"
                  className="h-24"
                />
              </div>

              <div>
                <Label htmlFor="services">Services & Expertise</Label>
                <Textarea
                  id="services"
                  name="services"
                  placeholder="Describe the services you offer or your areas of expertise"
                  className="h-32"
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Complete Profile & Join Team
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 