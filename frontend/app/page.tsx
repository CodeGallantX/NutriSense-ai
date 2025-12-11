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
          <h1 className="text-5xl md:text-6xl font-bold text-balance bg-linear-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          <Card className="border-2 hover:border-teal-200 transition-colors">
            <CardContent className="pt-6 space-y-4">
              <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                <Camera className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-lg">AI Visual Food Detector</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Snap a photo of your meal and get instant nutritional analysis with ingredient detection
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-blue-200 transition-colors">
            <CardContent className="pt-6 space-y-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg">Smart Pattern Analysis</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Track your eating habits and receive AI-powered insights on nutritional gaps
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-green-200 transition-colors">
            <CardContent className="pt-6 space-y-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg">Budget-Based Meals</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Get personalized meal suggestions that fit your budget and cultural preferences
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-red-200 transition-colors">
            <CardContent className="pt-6 space-y-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-lg">Diabetes Management</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Predict blood sugar spikes and get glycemic index insights for better diabetes control
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-20 max-w-3xl mx-auto text-center p-8 bg-linear-to-r from-teal-500 to-blue-500 rounded-2xl text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Nutrition?</h2>
          <p className="text-lg mb-6 text-teal-50">
            Join thousands of users making healthier choices with AI-powered insights
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/auth/signup">Start Your Free Journey</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
