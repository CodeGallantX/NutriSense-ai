import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, TrendingUp, Utensils, Activity } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: recentLogsData } = await supabase
    .from("food_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false })
    .limit(5);

  const recentLogs = recentLogsData ?? [];

  const { data: gapsData } = await supabase
    .from("nutritional_gaps")
    .select("*")
    .eq("user_id", user.id)
    .limit(3);

  const gaps = gapsData ?? [];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl font-medium text-gray-900">
              Welcome back, {profile?.full_name || "User"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track your nutrition and health goals
            </p>
          </div>
          <form action="/actions/sign-out">
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-900"
            >
              Sign Out
            </Button>
          </form>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/analyzer">
            <Card className="group hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300 cursor-pointer animate-slide-up">
              <CardContent className="pt-6 pb-6 flex flex-col items-center text-center space-y-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors duration-200">
                  <Camera className="h-5 w-5 text-gray-600" />
                </div>
                <h3 className="font-medium text-gray-900 text-sm">Scan Food</h3>
                <p className="text-xs text-gray-500">Analyze your meal</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/meals">
            <Card
              className="group hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300 cursor-pointer animate-slide-up"
              style={{ animationDelay: "100ms" }}
            >
              <CardContent className="pt-6 pb-6 flex flex-col items-center text-center space-y-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors duration-200">
                  <Utensils className="h-5 w-5 text-gray-600" />
                </div>
                <h3 className="font-medium text-gray-900 text-sm">
                  Meal Plans
                </h3>
                <p className="text-xs text-gray-500">Get suggestions</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/analytics">
            <Card
              className="group hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300 cursor-pointer animate-slide-up"
              style={{ animationDelay: "200ms" }}
            >
              <CardContent className="pt-6 pb-6 flex flex-col items-center text-center space-y-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors duration-200">
                  <TrendingUp className="h-5 w-5 text-gray-600" />
                </div>
                <h3 className="font-medium text-gray-900 text-sm">Analytics</h3>
                <p className="text-xs text-gray-500">View insights</p>
              </CardContent>
            </Card>
          </Link>

          {profile?.has_diabetes && (
            <Link href="/diabetes">
              <Card
                className="group hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300 cursor-pointer animate-slide-up"
                style={{ animationDelay: "300ms" }}
              >
                <CardContent className="pt-6 pb-6 flex flex-col items-center text-center space-y-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors duration-200">
                    <Activity className="h-5 w-5 text-gray-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm">
                    Diabetes
                  </h3>
                  <p className="text-xs text-gray-500">Manage blood sugar</p>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>

        {/* Recent Activity & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Food Logs */}
          <Card className="animate-fade-in">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium text-gray-900">
                Recent Food Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentLogs?.length > 0 ? (
                <div className="space-y-3">
                  {recentLogs.map((log, index) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md transition-colors duration-150 hover:bg-gray-100 animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {log.food_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {log.meal_type} •{" "}
                          {log.calories
                            ? `${Math.round(log.calories)} cal`
                            : "N/A"}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(log.logged_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No food logs yet</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/analyzer">Log your first meal</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nutritional Gaps */}
          <Card className="animate-fade-in">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium text-gray-900">
                Nutritional Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gaps?.length > 0 ? (
                <div className="space-y-3">
                  {gaps.map((gap, index) => (
                    <div
                      key={gap.id}
                      className={`p-3 rounded-md border transition-all duration-150 hover:shadow-sm animate-slide-up ${
                        gap.severity === "high"
                          ? "bg-red-50 border-red-200"
                          : gap.severity === "moderate"
                          ? "bg-yellow-50 border-yellow-200"
                          : "bg-blue-50 border-blue-200"
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {gap.nutrient_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Current: {gap.current_intake} {gap.unit} / Target:{" "}
                            {gap.recommended_intake} {gap.unit}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            gap.severity === "high"
                              ? "bg-red-100 text-red-800"
                              : gap.severity === "moderate"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {gap.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Log more meals to see nutritional insights
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
