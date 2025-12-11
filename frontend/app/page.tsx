import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, TrendingUp, DollarSign, Heart } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-teal-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-serif">
            AI-Powered Nutrition Intelligence
          </h1>
          <p className="text-xl text-gray-600 text-pretty leading-relaxed max-w-2xl mx-auto">
            Analyze your eating patterns, predict nutritional gaps, and get personalized meal recommendations based on
            your budget, lifestyle, and health goals
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button asChild size="lg" className="text-lg">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg bg-transparent">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-4xl mx-auto mt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            <Card className="border border-gray-200 hover:border-gray-400 transition-colors shadow-none bg-transparent">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-full border-2 border-gray-300 flex items-center justify-center bg-transparent">
                  <Camera className="h-6 w-6 text-gray-700" />
                </div>
                <h3 className="font-semibold text-lg">AI Visual Food Detector</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Snap a photo of your meal and get instant nutritional analysis with ingredient detection
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:border-gray-400 transition-colors shadow-none bg-transparent">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-full border-2 border-gray-300 flex items-center justify-center bg-transparent">
                  <TrendingUp className="h-6 w-6 text-gray-700" />
                </div>
                <h3 className="font-semibold text-lg">Smart Pattern Analysis</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Track your eating habits and receive AI-powered insights on nutritional gaps
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:border-gray-400 transition-colors shadow-none bg-transparent">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-full border-2 border-gray-300 flex items-center justify-center bg-transparent">
                  <DollarSign className="h-6 w-6 text-gray-700" />
                </div>
                <h3 className="font-semibold text-lg">Budget-Based Meals</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Get personalized meal suggestions that fit your budget and cultural preferences
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:border-gray-400 transition-colors shadow-none bg-transparent">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-full border-2 border-gray-300 flex items-center justify-center bg-transparent">
                  <Heart className="h-6 w-6 text-gray-700" />
                </div>
                <h3 className="font-semibold text-lg">Diabetes Management</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Predict blood sugar spikes and get glycemic index insights for better diabetes control
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 max-w-3xl mx-auto text-center p-8 bg-linear-to-r from-teal-100 to-blue-100 rounded-2xl text-gray-900">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Nutrition?</h2>
          <p className="text-lg mb-6 text-gray-600">
            Join thousands of users making healthier choices with AI-powered insights
          </p>
          <Button asChild size="lg" variant="default">
            <Link href="/auth/signup">Start Your Free Journey</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}