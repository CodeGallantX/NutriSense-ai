/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface BaseField {
  key: string;
  label: string;
  description: string;
}

interface NumberField extends BaseField {
  type: "number";
  placeholder: string;
  unit: string;
}

interface TextField extends BaseField {
  type: "text";
  placeholder: string;
  unit: string;
}

interface SelectField extends BaseField {
  type: "select";
  options: { value: string; label: string }[];
}

interface CheckboxField extends BaseField {
  type: "checkboxes";
  options: string[];
}

type Field = NumberField | TextField | SelectField | CheckboxField;

const allFields: Field[] = [
  // Step 1: Country/Region
  {
    key: "country",
    label: "Which country do you live in?",
    type: "select",
    options: [
      { value: "nigeria", label: "Nigeria 🇳🇬" },
      { value: "other", label: "Outside Africa" },
    ],
    description:
      "This helps us suggest local foods and ingredients available in your area.",
  },
  // Step 3: Age
  {
    key: "age",
    label: "How old are you?",
    type: "number",
    placeholder: "25",
    unit: "years",
    description: "We use your age to personalize your daily recommendations.",
  },
  // Step 4: Gender
  {
    key: "gender",
    label: "What is your gender?",
    type: "select",
    options: [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
      { value: "prefer_not_say", label: "Prefer not to say" },
    ],
    description: "This helps tailor advice to your body.",
  },
  // Step 5: Weight
  {
    key: "weight",
    label: "What is your weight?",
    type: "number",
    placeholder: "70",
    unit: "kg",
    description: "We'll use this for nutritional calculations. Skip if unsure.",
  },
  // Step 6: Height
  {
    key: "height",
    label: "What is your height?",
    type: "number",
    placeholder: "175",
    unit: "cm",
    description:
      "This helps determine your ideal weight range. Skip if unsure.",
  },
  // Step 7: Primary Health Goal
  {
    key: "primaryGoal",
    label: "What's your primary health goal?",
    type: "select",
    options: [
      { value: "balanced_meals", label: "🍽️ Eat balanced meals" },
      { value: "low_budget_health", label: "💰 Eat healthier on low budget" },
      { value: "weight_friendly", label: "⚖️ Weight-friendly planning" },
      { value: "healthy_combos", label: "🔍 Discover healthy food combos" },
      { value: "track_health", label: "📊 Track & improve health issues" },
      // { value: "general_wellness", label: "🌟 General wellness & vitality" },
    ],
    description: "Choose what matters most to you right now.",
  },
  // Step 8: Secondary Goals
  {
    key: "secondaryGoals",
    label: "Any other goals? (Select all that apply)",
    type: "checkboxes",
    options: [
      "Lose weight",
      "Gain muscle",
      "Better digestion",
      "Clearer skin",
      "Better sleep",
      "Manage stress",
      "Improve immunity",
      "Save money on food",
      "Learn cooking skills",
    ],
    description: "Select as many as you like. Helps us create a complete plan.",
  },
  // Step 9: Eating Pattern & Lifestyle
  {
    key: "eatingPattern",
    label: "What's your eating pattern?",
    type: "select",
    options: [
      { value: "regular_3meals", label: "🍽️ Regular 3 meals/day" },
      { value: "frequent_snacker", label: "🍎 Frequent snacker" },
      { value: "skip_breakfast", label: "🌅 Often skip breakfast" },
      { value: "intermittent_fasting", label: "⏰ Intermittent fasting" },
      { value: "late_night_eater", label: "🌙 Late-night eater" },
      { value: "variable_schedule", label: "🔄 Irregular schedule" },
      { value: "home_cook", label: "👩‍🍳 Mostly home-cooked meals" },
      { value: "eat_out_often", label: "🏪 Eat out often" },
    ],
    description: "Tell us about your daily eating habits.",
  },
  // Step 10: Activity Level
  {
    key: "activityLevel",
    label: "What is your activity level?",
    type: "select",
    options: [
      { value: "sedentary", label: "Sedentary (office job, little exercise)" },
      { value: "light", label: "Light (walking, light chores 1-3 days/week)" },
      { value: "moderate", label: "Moderate (exercise 3-5 days/week)" },
      { value: "active", label: "Active (exercise 6-7 days/week)" },
      {
        value: "very_active",
        label: "Very Active (physical job or intense training)",
      },
    ],
    description: "Adjusts your calorie needs based on movement.",
  },
  // Step 11: Weekly Food Budget (in local currency)
  {
    key: "weeklyBudget",
    label: "Weekly food budget?",
    type: "select",
    options: [
      { value: "5000", label: "₦5,000 or less" },
      { value: "10000", label: "₦5,000 - ₦10,000" },
      { value: "15000", label: "₦10,000 - ₦15,000" },
      { value: "20000", label: "₦15,000 - ₦20,000" },
      { value: "25000", label: "₦20,000 - ₦25,000" },
      { value: "30000", label: "₦25,000 - ₦30,000" },
      { value: "40000", label: "₦30,000 - ₦40,000" },
      { value: "50000", label: "₦40,000+" },
      { value: "not_sure", label: "Not sure / varies" },
    ],
    description: "Helps find affordable meal ideas for your budget.",
  },
  // Step 12: Dietary Preferences
  {
    key: "dietary",
    label: "Any dietary preferences?",
    type: "checkboxes",
    options: [
      "Vegetarian",
      "Vegan",
      "Halal",
      "Gluten-Free",
      "Dairy-Free",
      "Low-carb",
      "Low-sodium",
      "No pork",
      "No restrictions",
    ],
    description:
      "Select all that apply. We'll suggest meals that fit your style.",
  },
  // Step 13: Allergies & Dislikes
  {
    key: "allergies",
    label: "Any allergies or strong dislikes?",
    type: "text",
    unit: "",
    placeholder: "e.g., peanuts, shellfish, okra, bitter leaf",
    description: "List them comma-separated. We'll avoid them in suggestions.",
  },
  // Step 14: Health Conditions
  {
    key: "healthConditions",
    label: "Any health conditions? (Optional)",
    type: "checkboxes",
    options: [
      "Type 2 Diabetes",
      "Type 1 Diabetes",
      "Prediabetes",
      "Hypertension (High BP)",
      "High Cholesterol",
      "Arthritis",
      "Asthma",
      "Anemia",
      "PCOS",
      "Thyroid issues",
      "None",
    ],
    description:
      "This ensures safe, targeted recommendations. Skip if no conditions.",
  },
  // Step 15: Preferred Cuisines & Local Foods
  {
    key: "cuisines",
    label: "Favorite foods & cuisines?",
    type: "checkboxes",
    options: [
      // Nigerian
      "Jollof Rice",
      "Pounded Yam & Egusi",
      "Amala & Ewedu",
      "Suya & Kilishi",
      "Moi Moi",
      "Akara",
      // International
      "Italian",
      "Chinese",
      "Indian",
      "Mexican",
      "American",
      "Mediterranean",
      // General
      "Grilled foods",
      "Soups & Stews",
      "Rice dishes",
      "Bean dishes",
      "Vegetable meals",
      "Snacks & Small chops",
    ],
    description: "We'll mix in flavors and foods you love.",
  },
];

interface FormData {
  country: string;
  region: string;
  age: string;
  weight: string;
  height: string;
  gender: string;
  primaryGoal: string;
  secondaryGoals: string[];
  eatingPattern: string;
  activityLevel: string;
  weeklyBudget: string;
  selectedDietary: string[];
  selectedCuisines: string[];
  allergies: string;
  selectedConditions: string[];
  hasDiabetes: boolean;
  diabetesType: string;
  targetBSMin: string;
  targetBSMax: string;
}

// Rest of the component functions remain the same (NumberOrTextInput, CustomSelect, CheckboxList, FieldRenderer, DiabetesSection)

function NumberOrTextInput({
  field,
  value,
  onChange,
}: {
  field: NumberField | TextField;
  value: string;
  onChange: (value: string) => void;
}) {
  const inputPadding = field.type === "number" ? "pr-12" : "pr-10";

  return (
    <div className="relative">
      <Input
        id={field.key}
        type={field.type}
        placeholder={field.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-16 text-2xl text-center border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none px-4 ${inputPadding}`}
      />
      {field.unit && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-gray-500 pointer-events-none">
          {field.unit}
        </span>
      )}
    </div>
  );
}

function CustomSelect({
  field,
  value,
  onChange,
}: {
  field: SelectField;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
      {field.options.map((opt) => {
        const selected = value === opt.value;
        return (
          <motion.button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`p-4 rounded-xl border-2 text-center font-medium text-lg ${
              selected
                ? "border-teal-800 bg-teal-50 text-teal-700"
                : "border-gray-200 hover:border-gray-300"
            }`}
            whileHover={{ scale: selected ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  );
}

function CheckboxList({
  field,
  value,
  onToggle,
}: {
  field: CheckboxField;
  value: string[];
  onToggle: (option: string) => void;
}) {
  const safeValue = Array.isArray(value) ? value : [];

  return (
    <div className="max-h-96 overflow-y-auto space-y-3 p-4">
      {safeValue.length === 0 && (
        <p className="text-sm text-gray-500 text-center">None selected</p>
      )}
      <div className="grid grid-cols-1 gap-3">
        {field.options.map((option) => (
          <motion.div
            key={option}
            className="flex items-center justify-center space-x-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer border border-gray-200"
            onClick={() => onToggle(option)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Checkbox
              id={option}
              checked={safeValue.includes(option)}
              onCheckedChange={() => onToggle(option)}
              className="h-6 w-6"
            />
            <label htmlFor={option} className="text-lg cursor-pointer">
              {option}
            </label>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function FieldRenderer({
  field,
  formData,
  onInputChange,
  onCheckboxToggle,
}: {
  field: Field;
  formData: FormData;
  onInputChange: (key: string, value: string | string[]) => void;
  onCheckboxToggle: (key: string, option: string) => void;
}) {
  const value = formData[field.key as keyof FormData] as
    | string
    | string[]
    | undefined;
  const stringValue = typeof value === "string" ? value : "";

  switch (field.type) {
    case "number":
    case "text":
      return (
        <div className="flex-1 space-y-4">
          <NumberOrTextInput
            field={field}
            value={stringValue}
            onChange={(v) => onInputChange(field.key, v)}
          />
        </div>
      );
    case "select":
      return (
        <div className="flex-1 space-y-4 w-full">
          <CustomSelect
            field={field}
            value={stringValue}
            onChange={(v) => onInputChange(field.key, v)}
          />
        </div>
      );
    case "checkboxes":
      return (
        <div className="flex-1 space-y-4">
          <CheckboxList
            field={field}
            value={Array.isArray(value) ? value : []}
            onToggle={(option) => onCheckboxToggle(field.key, option)}
          />
        </div>
      );
    default:
      return null;
  }
}

function DiabetesSection({
  formData,
  onInputChange,
}: {
  formData: FormData;
  onInputChange: (key: string, value: string) => void;
}) {
  if (!formData.hasDiabetes) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-6 bg-blue-50 rounded-xl mt-6"
    >
      <h4 className="font-medium text-blue-900 text-lg text-center">
        Diabetes Management Settings
      </h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm text-center block">
            Target Blood Sugar Min (mg/dL)
          </Label>
          <Input
            type="number"
            placeholder="80"
            value={formData.targetBSMin}
            onChange={(e) => onInputChange("targetBSMin", e.target.value)}
            className="h-12 text-lg text-center border-2 border-gray-200 rounded-lg focus:border-green-500"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-center block">
            Target Blood Sugar Max (mg/dL)
          </Label>
          <Input
            type="number"
            placeholder="130"
            value={formData.targetBSMax}
            onChange={(e) => onInputChange("targetBSMax", e.target.value)}
            className="h-12 text-lg text-center border-2 border-gray-200 rounded-lg focus:border-green-500"
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [isChecking, setIsChecking] = useState(true); 

  // Redirect to dashboard if onboarding already completed
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth/signin");
        return;
      }

      // Fetch profile
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (error || !profile) {
        console.error("Error fetching profile:", error);
        setIsChecking(false);
        return;
      }

      // Already completed → go straight to dashboard
      if (profile.onboarding_completed === true) {
        router.replace("/dashboard");
        return;
      }

      // Not completed → allow onboarding flow
      setIsChecking(false);
    };

    checkOnboardingStatus();
  }, [supabase, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-teal-50 to-blue-50">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const [formData, setFormData] = useState<FormData>({
    country: "",
    region: "",
    age: "",
    weight: "",
    height: "",
    gender: "",
    primaryGoal: "",
    secondaryGoals: [],
    eatingPattern: "",
    activityLevel: "",
    weeklyBudget: "",
    selectedDietary: [],
    selectedCuisines: [],
    allergies: "",
    selectedConditions: [],
    hasDiabetes: false,
    diabetesType: "",
    targetBSMin: "",
    targetBSMax: "",
  });

  const currentField = allFields[step - 1];

  const handleInputChange = (key: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckboxToggle = (key: string, option: string) => {
    const current = (formData[key as keyof FormData] as string[]) || [];
    const newSelection = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option];

    handleInputChange(key, newSelection);

    if (key === "selectedConditions") {
      const isDiabetes = option.toLowerCase().includes("diabetes");
      const isNone = option === "None";

      if (isNone && !current.includes(option)) {
        // If "None" is selected, clear all other selections
        setFormData((prev) => ({
          ...prev,
          selectedConditions: ["None"],
          hasDiabetes: false,
          diabetesType: "",
        }));
        return;
      }

      if (isNone && current.includes(option)) {
        // If "None" is being unselected, just remove it
        handleInputChange(key, []);
        return;
      }

      if (isDiabetes && !current.includes(option)) {
        setFormData((prev) => ({
          ...prev,
          hasDiabetes: true,
          diabetesType: getDiabetesType(option),
        }));
      } else if (isDiabetes && current.includes(option)) {
        const hasOtherDiabetes = newSelection.some(
          (c) => c !== option && c.toLowerCase().includes("diabetes")
        );
        if (!hasOtherDiabetes) {
          setFormData((prev) => ({
            ...prev,
            hasDiabetes: false,
            diabetesType: "",
          }));
        }
      }
    }
  };

  const getDiabetesType = (condition: string) => {
    if (condition === "Type 2 Diabetes") return "type2";
    if (condition === "Type 1 Diabetes") return "type1";
    if (condition === "Prediabetes") return "prediabetes";
    return "";
  };

  const handleNext = () => {
    if (step < allFields.length) {
      setStep((prev) => prev + 1);
    } else {
      setShowCompletion(true);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    const allergiesArray = formData.allergies
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a);

    // Filter out "None" from conditions if selected
    const conditions = formData.selectedConditions.includes("None")
      ? []
      : formData.selectedConditions.filter((c) => c !== "None");

    const { error } = await supabase
      .from("profiles")
      .update({
        country: formData.country || null,
        region: formData.region === "skip" ? null : formData.region || null,
        age: formData.age ? Number.parseInt(formData.age) : null,
        weight_kg: formData.weight ? Number.parseFloat(formData.weight) : null,
        height_cm: formData.height ? Number.parseFloat(formData.height) : null,
        gender:
          formData.gender === "prefer_not_say" ? null : formData.gender || null,
        primary_goal: formData.primaryGoal || null,
        secondary_goals:
          formData.secondaryGoals.length > 0 ? formData.secondaryGoals : null,
        eating_pattern: formData.eatingPattern || null,
        activity_level: formData.activityLevel || null,
        weekly_budget:
          formData.weeklyBudget === "not_sure"
            ? null
            : formData.weeklyBudget || null,
        dietary_preferences:
          formData.selectedDietary.length > 0 ? formData.selectedDietary : null,
        allergies: allergiesArray.length > 0 ? allergiesArray : null,
        health_conditions: conditions.length > 0 ? conditions : null,
        cuisine_preferences:
          formData.selectedCuisines.length > 0
            ? formData.selectedCuisines
            : null,
        has_diabetes: formData.hasDiabetes,
        diabetes_type: formData.diabetesType || null,
        target_blood_sugar_min: formData.targetBSMin
          ? Number.parseInt(formData.targetBSMin)
          : null,
        target_blood_sugar_max: formData.targetBSMax
          ? Number.parseInt(formData.targetBSMax)
          : null,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating profile:", error);
      setLoading(false);
      return;
    }

    // Show completion message for 2 seconds before redirecting
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  };

  const progress = (step / allFields.length) * 100;

  if (showCompletion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-teal-50 via-white to-blue-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center space-y-8"
        >
          <div className="space-y-4 mt-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex items-center justify-center mx-auto"
            >
              <Sparkles className="w-8 h-8 text-primary" />
            </motion.div>

            <h1 className="text-3xl font-serif text-gray-900">
              Perfect! We&apos;ve refined your data
            </h1>

            <p className="text-lg text-gray-600">
              Your profile is now personalized for:
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div >

              <div className="p-4 bg-green-50 rounded-xl">
                <p className="text-sm text-green-600">Primary Goal</p>
                <p className="font-semibold">
                  {formData.primaryGoal === "balanced_meals"
                    ? "Balanced Meals"
                    : formData.primaryGoal === "low_budget_health"
                    ? "Healthy on Budget"
                    : formData.primaryGoal
                        ?.replace(/_/g, " ")
                        .charAt(0)
                        .toUpperCase() + formData.primaryGoal?.slice(1)}
                </p>
              </div>
            </div>

            <div className="p-6 bg-linear-to-r from-teal-50 to-blue-50 rounded-2xl border-2 border-teal-100">
              <h3 className="font-bold text-xl mb-3">Your Dashboard Awaits!</h3>
              <p className="text-gray-700 mb-4">
                Based on your profile, here&apos;s what you can do:
              </p>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🤖</span>
                  <span>
                    <strong>Chat with AI Nutritionist:</strong> Get personalized
                    meal advice
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📱</span>
                  <span>
                    <strong>Scan & Track:</strong> Log meals, track nutrients
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💊</span>
                  <span>
                    <strong>Health Monitoring:</strong>{" "}
                    {formData.selectedConditions.length > 0
                      ? "Track your conditions & progress"
                      : "Monitor your wellness journey"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🛒</span>
                  <span>
                    <strong>Budget-Friendly Plans:</strong> Local recipes within
                    your budget
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="pt-4"
          >
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-12 text-lg"
            >
              {loading ? "Finalizing..." : "🚀 Go to Dashboard"}
            </Button>
            <p className="text-sm text-gray-500 mt-3">
              Taking you to your personalized dashboard...
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-teal-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-sm mx-auto flex flex-col flex-1">
        <div className="flex-1">
          {/* TOP SECTION */}
          <div className="mb-4">
            <h1 className="text-3xl font-serif text-gray-900 text-center mb-4">
              NutriSense AI
            </h1>

            <div className="w-full bg-gray-200 rounded-full h-1 mb-2">
              <motion.div
                className="bg-[#018075] h-1 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <p className="text-sm text-gray-500 text-center">
              Step {step} of {allFields.length}
            </p>

            <h2 className="text-2xl font-medium text-gray-900 text-center mt-6">
              {currentField.label}
            </h2>
          </div>

          {/* MIDDLE SECTION */}
          <div className="flex-1 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <FieldRenderer
                  field={currentField}
                  formData={formData}
                  onInputChange={handleInputChange}
                  onCheckboxToggle={handleCheckboxToggle}
                />

                {/* Show diabetes section if diabetes condition is selected */}
                {step === 14 && formData.hasDiabetes && (
                  <DiabetesSection
                    formData={formData}
                    onInputChange={handleInputChange}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="shrink-0 mt-6 pb-4 flex flex-col items-center gap-4">
          <p className="text-sm text-gray-600 text-center max-w-xs">
            {currentField.description}
          </p>

          <div className="flex gap-3 w-full">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 h-10 sm:h-12 rounded-lg text-sm sm:text-md"
              >
                Back
              </Button>
            )}

            <Button
              onClick={handleNext}
              className="flex-1 h-10 sm:h-12 rounded-lg text-sm sm:text-md"
            >
              {step === allFields.length ? "Complete Setup" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
