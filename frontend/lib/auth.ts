import { createServerClient } from './supabase/server';
import { Profile } from '@/types/database';

export type UserSession = {
  user: {
    id: string;
    email: string;
  } | null;
  profile: Profile | null;
};

export async function getServerUserSession(): Promise<UserSession> {
  const supabase = await createServerClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    return { user: null, profile: null };
  }

  const user = {
    id: userData.user.id,
    email: userData.user.email ?? '',
  };

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    user,
    profile: profileError ? null : profile ?? null,
  };
}
