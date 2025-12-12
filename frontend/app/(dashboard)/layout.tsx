import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getUserConversations } from "@/app/actions/chat";
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

  const conversations = await getUserConversations(user.id);

  const userData = {
    id: user.id,
    name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
    email: user.email ?? "no-email",
    avatar: user.user_metadata?.avatar_url || "",
  };

  return <ClientDashboard user={userData} conversations={conversations}>{children}</ClientDashboard>;
}