"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AnimatePresence, motion } from "framer-motion";

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
  // Step 1: Age
  {
    key: "age",
    label: "How old are you?",
    type: "number",
    placeholder: "25",
    unit: "years",
    description: "We use your age to personalize your daily recommendations.",
  },
  // Step 2: Gender
  {
    key: "gender",
    label: "What is your gender?",
    type: "select",
    options: [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
    ],
    description: "This helps tailor advice to your body.",
  },
  // Step 3: Weight
  {
    key: "weight",
    label: "What is your weight?",
    type: "number",
    placeholder: "70",
    unit: "kg",
    description: "We'll use this for nutritional calculations.",
  },
  // Step 4: Height
  {
    key: "height",
    label: "What is your height?",
    type: "number",
    placeholder: "175",
    unit: "cm",
    description: "This helps determine your ideal weight range.",
  },
  // Step 5: Activity Level
  {
    key: "activityLevel",
    label: "What is your activity level?",
    type: "select",
    options: [
      { value: "sedentary", label: "Sedentary (little or no exercise)" },
      { value: "light", label: "Light (exercise 1-3 days/week)" },
      { value: "moderate", label: "Moderate (exercise 3-5 days/week)" },
      { value: "active", label: "Active (exercise 6-7 days/week)" },
      {
        value: "very_active",
        label: "Very Active (physical job or 2x training)",
      },
    ],
    description: "Adjusts your calorie needs based on movement.",
  },
  // Step 6: Dietary Preferences
  {
    key: "dietary",
    label: "Any dietary preferences?",
    type: "checkboxes",
    options: [
      "Vegetarian",
      "Vegan",
      "Halal",
      "Kosher",
      "Gluten-Free",
      "Dairy-Free",
      "Pescatarian",
    ],
    description: "We'll suggest meals that fit your style.",
  },
  // Step 7: Allergies
  {
    key: "allergies",
    label: "Any allergies?",
    type: "text",
    unit: "",
    placeholder: "peanuts, shellfish, soy",
    description: "List them comma-separated to avoid them.",
  },
  // Step 8: Health Conditions
  {
    key: "healthConditions",
    label: "Any health conditions?",
    type: "checkboxes",
    options: [
      "Type 2 Diabetes",
      "Type 1 Diabetes",
      "Prediabetes",
      "Hypertension",
      "High Cholesterol",
      "Heart Disease",
      "Celiac Disease",
    ],
    description: "This ensures safe, targeted recommendations.",
  },
  // Step 9: Monthly Budget
  {
    key: "monthlyBudget",
    label: "What's your monthly food budget?",
    type: "number",
    placeholder: "300",
    unit: "USD",
    description: "Helps find affordable meal ideas.",
  },
  // Step 10: Cuisines
  {
    key: "cuisines",
    label: "Preferred cuisines?",
    type: "checkboxes",
    options: [
      "Italian",
      "Chinese",
      "Indian",
      "Mexican",
      "Japanese",
      "Thai",
      "Mediterranean",
      "American",
      "Middle Eastern",
      "Korean",
    ],
    description: "We'll mix in flavors you love.",
  },
];

interface FormData {
  age: string;
  weight: string;
  height: string;
  gender: string;
  activityLevel: string;
  monthlyBudget: string;
  selectedDietary: string[];
  selectedCuisines: string[];
  allergies: string;
  selectedConditions: string[];
  hasDiabetes: boolean;
  diabetesType: string;
  targetBSMin: string;
  targetBSMax: string;
}

function NumberOrTextInput({
  field,
  value,
  onChange,
}: {
  field: NumberField | TextField;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <Input
        id={field.key}
        type={field.type}
        placeholder={field.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-16 text-2xl text-center border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none px-4"
      />
      {field.unit && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-gray-500">
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
    <div className="grid grid-cols-1 gap-3 max-h-96">
      {field.options.map((opt) => {
        const selected = value === opt.value;
        return (
          <motion.button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`p-4 rounded-xl border-2 text-center font-medium text-lg ${
              selected
                ? "border-green-500 bg-green-50 text-green-700"
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
  return (
    <div className="max-h-96 overflow-y-auto space-y-3 p-4">
      {value.length === 0 && (
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
              checked={value.includes(option)}
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
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [formData, setFormData] = useState<FormData>({
    age: "",
    weight: "",
    height: "",
    gender: "",
    activityLevel: "",
    monthlyBudget: "",
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
    const current = formData[key as keyof FormData] as string[];
    const newSelection = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option];
    handleInputChange(key, newSelection);

    if (key === "selectedConditions") {
      const isDiabetes = option.toLowerCase().includes("diabetes");
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

    const { error } = await supabase
      .from("profiles")
      .update({
        age: formData.age ? Number.parseInt(formData.age) : null,
        weight_kg: formData.weight ? Number.parseFloat(formData.weight) : null,
        height_cm: formData.height ? Number.parseFloat(formData.height) : null,
        gender: formData.gender || null,
        activity_level: formData.activityLevel || null,
        dietary_preferences:
          formData.selectedDietary.length > 0 ? formData.selectedDietary : null,
        allergies: allergiesArray.length > 0 ? allergiesArray : null,
        health_conditions:
          formData.selectedConditions.length > 0
            ? formData.selectedConditions
            : null,
        monthly_budget_usd: formData.monthlyBudget
          ? Number.parseFloat(formData.monthlyBudget)
          : null,
        cultural_cuisine_preferences:
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
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating profile:", error);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  const progress = (step / allFields.length) * 100;

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

                {step === 8 && (
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
              <Button variant="outline" onClick={handleBack} className="flex-1 h-10 sm:h-12 rounded-lg text-sm sm:text-md">
                Back
              </Button>
            )}

            <Button
              onClick={step === allFields.length ? handleSubmit : handleNext}
              disabled={loading}
              className="flex-1 h-10 sm:h-12 rounded-lg text-sm sm:text-md"
            >
              {loading
                ? "Saving..."
                : step === allFields.length
                ? "Complete Setup"
                : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
