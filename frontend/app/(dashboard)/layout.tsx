// app/(protected)/layout.tsx or similar server layout file
// This is now a server component for fetching user

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import ClientDashboard from "@/components/client-layout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const userData = {
    name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
    email: user.email ?? "no-email",
    avatar: user.user_metadata?.avatar_url || "",
  };

  return <ClientDashboard user={userData}>{children}</ClientDashboard>;
}
