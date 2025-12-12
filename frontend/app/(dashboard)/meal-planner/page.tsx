// "use client"

// import { useState, useEffect, useRef, useCallback } from "react"
// import type { Ingredient, Preferences, MealPlan } from "./lib/types"
// import {
//   saveDraft,
//   loadDraft,
//   saveLastPlan,
//   loadLastPlan,
//   getSavedPlans,
//   savePlan,
//   deletePlan,
//   exportToCSV,
//   copyJSON,
//   defaultPreferences,
// } from "./lib/localStorage"
// import { generateMealPlan } from "./lib/aiClient"

// const DIETARY_OPTIONS = [
//   "vegetarian",
//   "vegan",
//   "halal",
//   "kosher",
//   "gluten-free",
//   "dairy-free",
//   "low-carb",
//   "diabetic-friendly",
// ]

// // Icons as inline SVG
// const AddIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M8 3v10M3 8h10" />
//   </svg>
// )

// const DeleteIcon = () => (
//   <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M2 2l8 8M10 2l-8 8" />
//   </svg>
// )

// const CopyIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
//     <rect x="5" y="5" width="8" height="8" rx="1" />
//     <path d="M3 11V3h8" />
//   </svg>
// )

// const DownloadIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M8 2v8M4 7l4 4 4-4M2 12h12" />
//   </svg>
// )

// export default function MealPlannerPage() {
//   const [ingredients, setIngredients] = useState<Ingredient[]>([])
//   const [preferences, setPreferences] = useState<Preferences>(defaultPreferences)
//   const [inputValue, setInputValue] = useState("")
//   const [currentStep, setCurrentStep] = useState(1)
//   const [isGenerating, setIsGenerating] = useState(false)
//   const [generatedPlan, setGeneratedPlan] = useState<MealPlan | null>(null)
//   const [savedPlans, setSavedPlans] = useState<MealPlan[]>([])
//   const [viewMode, setViewMode] = useState<"compact" | "detailed">("detailed")
//   const [copied, setCopied] = useState(false)
//   const inputRef = useRef<HTMLInputElement>(null)
//   const abortRef = useRef(false)

//   // Load saved data on mount
//   useEffect(() => {
//     const draft = loadDraft()
//     if (draft) {
//       setIngredients(draft.ingredients)
//       setPreferences(draft.preferences)
//     }
//     const lastPlan = loadLastPlan()
//     if (lastPlan) setGeneratedPlan(lastPlan)
//     setSavedPlans(getSavedPlans())
//   }, [])

//   // Auto-save draft every 10s
//   useEffect(() => {
//     const interval = setInterval(() => {
//       saveDraft(ingredients, preferences)
//     }, 10000)
//     return () => clearInterval(interval)
//   }, [ingredients, preferences])

//   // Keyboard shortcut: / to focus input
//   useEffect(() => {
//     const handleKey = (e: KeyboardEvent) => {
//       if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
//         e.preventDefault()
//         inputRef.current?.focus()
//       }
//     }
//     window.addEventListener("keydown", handleKey)
//     return () => window.removeEventListener("keydown", handleKey)
//   }, [])

//   // Update current step based on state
//   useEffect(() => {
//     if (ingredients.length === 0) setCurrentStep(1)
//     else if (preferences.dietary.length === 0) setCurrentStep(2)
//     else if (!generatedPlan) setCurrentStep(3)
//     else setCurrentStep(4)
//   }, [ingredients, preferences, generatedPlan])

//   const addIngredient = useCallback(() => {
//     const name = inputValue.trim()
//     if (!name) return
//     setIngredients((prev) => [...prev, { id: `ing_${Date.now()}`, name }])
//     setInputValue("")
//   }, [inputValue])

//   const removeIngredient = (id: string) => {
//     setIngredients((prev) => prev.filter((i) => i.id !== id))
//   }

//   const toggleDietary = (option: string) => {
//     setPreferences((prev) => ({
//       ...prev,
//       dietary: prev.dietary.includes(option) ? prev.dietary.filter((d) => d !== option) : [...prev.dietary, option],
//     }))
//   }

//   const handleGenerate = async () => {
//     setIsGenerating(true)
//     abortRef.current = false
//     try {
//       const plan = await generateMealPlan({
//         ingredients: ingredients.map((i) => i.name),
//         preferences: preferences.dietary,
//         mealsPerDay: preferences.mealsPerDay,
//         mode: preferences.mode,
//         days: preferences.mode === "weekly" ? preferences.daysCount : 1,
//       })
//       if (!abortRef.current) {
//         setGeneratedPlan(plan)
//         saveLastPlan(plan)
//       }
//     } finally {
//       setIsGenerating(false)
//     }
//   }

//   const handleSaveDraft = () => {
//     saveDraft(ingredients, preferences)
//   }

//   const handleSavePlan = () => {
//     if (!generatedPlan) return
//     savePlan(generatedPlan)
//     setSavedPlans(getSavedPlans())
//   }

//   const handleRestorePlan = (plan: MealPlan) => {
//     setGeneratedPlan(plan)
//   }

//   const handleDeletePlan = (id: string) => {
//     deletePlan(id)
//     setSavedPlans(getSavedPlans())
//   }

//   const handleCopyJSON = () => {
//     if (!generatedPlan) return
//     copyJSON(generatedPlan)
//     setCopied(true)
//     setTimeout(() => setCopied(false), 2000)
//   }

//   return (
//     <main className="min-h-screen bg-white">
//       {/* Hero */}
//       <header className="px-4 py-8 text-center lg:py-12">
//         <h1 className="text-3xl font-semibold text-gray-900 lg:text-4xl">Smart Meal Planner</h1>
//         <p className="mt-2 text-gray-500">
//           Generate meal plans from what you have — quick, simple, and diabetic-friendly.
//         </p>
//       </header>

//       {/* Progress Indicator */}
//       <div className="mx-auto max-w-4xl px-4">
//         <div className="flex items-center justify-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
//           Step {currentStep} of 4
//           <div className="ml-2 flex gap-1">
//             {[1, 2, 3, 4].map((s) => (
//               <div
//                 key={s}
//                 className={`h-2 w-2 rounded-full transition-colors ${s <= currentStep ? "bg-teal-500" : "bg-teal-200"}`}
//               />
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="mx-auto max-w-6xl px-4 py-8">
//         <div className="grid gap-6 lg:grid-cols-2">
//           {/* Left Column: Steps */}
//           <div className="space-y-6">
//             {/* Step 1: Ingredients */}
//             <section className="rounded-2xl bg-gray-50 p-6 shadow-sm">
//               <h2 className="mb-4 text-lg font-semibold text-gray-900">
//                 <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-xs text-white">
//                   1
//                 </span>
//                 Add Ingredients
//               </h2>
//               <div className="flex gap-2">
//                 <input
//                   ref={inputRef}
//                   type="text"
//                   value={inputValue}
//                   onChange={(e) => setInputValue(e.target.value)}
//                   onKeyDown={(e) => e.key === "Enter" && addIngredient()}
//                   placeholder="Type ingredient..."
//                   aria-label="Ingredient input"
//                   className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
//                 />
//                 <button
//                   onClick={addIngredient}
//                   aria-label="Add ingredient"
//                   className="flex items-center gap-1 rounded-lg bg-teal-500 px-4 py-2 font-medium text-white transition hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
//                 >
//                   <AddIcon /> Add
//                 </button>
//               </div>
//               <p className="mt-2 text-xs text-gray-400">Press / to focus, Enter to add</p>

//               {/* Ingredient Chips */}
//               <div className="mt-4 flex flex-wrap gap-2">
//                 {ingredients.length === 0 ? (
//                   <p className="text-sm text-gray-400">
//                     Start by adding an ingredient or click Generate to get general ideas.
//                   </p>
//                 ) : (
//                   ingredients.map((ing) => (
//                     <span
//                       key={ing.id}
//                       className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm text-gray-700 shadow-sm"
//                     >
//                       {ing.name}
//                       <button
//                         onClick={() => removeIngredient(ing.id)}
//                         aria-label={`Remove ${ing.name}`}
//                         className="ml-1 rounded-full p-0.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
//                       >
//                         <DeleteIcon />
//                       </button>
//                     </span>
//                   ))
//                 )}
//               </div>
//             </section>

//             {/* Step 2: Dietary Preferences */}
//             <section className="rounded-2xl bg-gray-50 p-6 shadow-sm">
//               <h2 className="mb-4 text-lg font-semibold text-gray-900">
//                 <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-xs text-white">
//                   2
//                 </span>
//                 Dietary Preferences
//               </h2>
//               <p className="mb-3 text-xs text-gray-500">
//                 Choose any that apply — diabetic-friendly suggestions prioritized.
//               </p>
//               <div className="flex flex-wrap gap-2">
//                 {DIETARY_OPTIONS.map((option) => (
//                   <button
//                     key={option}
//                     onClick={() => toggleDietary(option)}
//                     aria-pressed={preferences.dietary.includes(option)}
//                     className={`rounded-full px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
//                       preferences.dietary.includes(option)
//                         ? "bg-teal-500 text-white"
//                         : "bg-white text-gray-600 hover:bg-gray-100"
//                     }`}
//                   >
//                     {option}
//                   </button>
//                 ))}
//               </div>
//             </section>

//             {/* Step 3: Frequency */}
//             <section className="rounded-2xl bg-gray-50 p-6 shadow-sm">
//               <h2 className="mb-4 text-lg font-semibold text-gray-900">
//                 <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-xs text-white">
//                   3
//                 </span>
//                 Meals & Frequency
//               </h2>
//               <div className="space-y-4">
//                 {/* Mode Toggle */}
//                 <div className="flex gap-2">
//                   {(["daily", "weekly"] as const).map((mode) => (
//                     <button
//                       key={mode}
//                       onClick={() => setPreferences((p) => ({ ...p, mode }))}
//                       className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition focus:outline-none focus:ring-2 focus:ring-teal-500 ${
//                         preferences.mode === mode
//                           ? "bg-teal-500 text-white"
//                           : "bg-white text-gray-600 hover:bg-gray-100"
//                       }`}
//                     >
//                       {mode}
//                     </button>
//                   ))}
//                 </div>

//                 {/* Meals per day */}
//                 <div className="flex items-center gap-3">
//                   <label htmlFor="mealsPerDay" className="text-sm text-gray-600">
//                     Meals per day:
//                   </label>
//                   <input
//                     id="mealsPerDay"
//                     type="number"
//                     min={1}
//                     max={6}
//                     value={preferences.mealsPerDay}
//                     onChange={(e) =>
//                       setPreferences((p) => ({
//                         ...p,
//                         mealsPerDay: Math.min(6, Math.max(1, +e.target.value)),
//                       }))
//                     }
//                     className="w-16 rounded-lg border border-gray-200 px-3 py-2 text-center text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
//                   />
//                 </div>

//                 {/* Days count (weekly only) */}
//                 {preferences.mode === "weekly" && (
//                   <div className="flex items-center gap-3">
//                     <label htmlFor="daysCount" className="text-sm text-gray-600">
//                       Number of days:
//                     </label>
//                     <input
//                       id="daysCount"
//                       type="number"
//                       min={1}
//                       max={7}
//                       value={preferences.daysCount}
//                       onChange={(e) =>
//                         setPreferences((p) => ({
//                           ...p,
//                           daysCount: Math.min(7, Math.max(1, +e.target.value)),
//                         }))
//                       }
//                       className="w-16 rounded-lg border border-gray-200 px-3 py-2 text-center text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
//                     />
//                   </div>
//                 )}
//               </div>
//             </section>

//             {/* Step 4: Generate Controls */}
//             <section className="rounded-2xl bg-gray-50 p-6 shadow-sm">
//               <h2 className="mb-4 text-lg font-semibold text-gray-900">
//                 <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-xs text-white">
//                   4
//                 </span>
//                 Generate
//               </h2>
//               <div className="flex flex-wrap gap-3">
//                 <button
//                   onClick={handleGenerate}
//                   disabled={isGenerating}
//                   className="flex-1 rounded-xl bg-teal-500 px-6 py-3 font-semibold text-white transition hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 sm:flex-none"
//                 >
//                   {isGenerating ? "Generating..." : "Generate Meal Plan"}
//                 </button>
//                 {isGenerating && (
//                   <button
//                     onClick={() => (abortRef.current = true)}
//                     className="rounded-xl border border-gray-300 px-4 py-3 text-gray-600 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
//                   >
//                     Cancel
//                   </button>
//                 )}
//                 <button
//                   onClick={handleSaveDraft}
//                   className="rounded-xl border border-gray-300 px-4 py-3 text-gray-600 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
//                 >
//                   Save Draft
//                 </button>
//               </div>
//             </section>
//           </div>

//           {/* Right Column: Results & Saved Plans */}
//           <div className="space-y-6">
//             {/* Generated Plan Area */}
//             <section className="rounded-2xl bg-gray-50 p-6 shadow-sm">
//               <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
//                 <h2 className="text-lg font-semibold text-gray-900">Your Meal Plan</h2>
//                 {generatedPlan && (
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => setViewMode(viewMode === "compact" ? "detailed" : "compact")}
//                       className="rounded-lg bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-gray-100"
//                     >
//                       {viewMode === "compact" ? "Detailed" : "Compact"}
//                     </button>
//                     <button
//                       onClick={handleGenerate}
//                       disabled={isGenerating}
//                       className="rounded-lg bg-teal-100 px-3 py-1 text-xs font-medium text-teal-700 transition hover:bg-teal-200"
//                     >
//                       Regenerate
//                     </button>
//                   </div>
//                 )}
//               </div>

//               {isGenerating ? (
//                 // Loading skeleton
//                 <div className="space-y-4">
//                   {[1, 2, 3].map((i) => (
//                     <div key={i} className="animate-pulse rounded-xl bg-gray-200 p-4">
//                       <div className="mb-2 h-4 w-1/3 rounded bg-gray-300" />
//                       <div className="h-3 w-2/3 rounded bg-gray-300" />
//                     </div>
//                   ))}
//                 </div>
//               ) : generatedPlan ? (
//                 <div className="space-y-4">
//                   <p className="text-xs text-gray-400">Created: {new Date(generatedPlan.createdAt).toLocaleString()}</p>

//                   {generatedPlan.days.map((day) => (
//                     <div key={day.day} className="rounded-xl bg-white p-4 shadow-sm">
//                       <h3 className="mb-3 font-medium text-gray-800">Day {day.day}</h3>
//                       <div className={viewMode === "compact" ? "space-y-2" : "space-y-4"}>
//                         {day.meals.map((meal, idx) => (
//                           <div
//                             key={idx}
//                             className={
//                               viewMode === "compact"
//                                 ? "flex items-center justify-between text-sm"
//                                 : "rounded-lg bg-gray-50 p-3"
//                             }
//                           >
//                             {viewMode === "compact" ? (
//                               <>
//                                 <span className="font-medium text-gray-700">{meal.title}</span>
//                                 <span className="text-gray-400">{meal.prepMinutes} min</span>
//                               </>
//                             ) : (
//                               <>
//                                 <div className="mb-1 flex items-center justify-between">
//                                   <span className="font-medium text-gray-700">{meal.title}</span>
//                                   {meal.diabeticFriendly && (
//                                     <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
//                                       diabetic-friendly
//                                     </span>
//                                   )}
//                                 </div>
//                                 <p className="text-xs text-gray-500">
//                                   {meal.ingredients.join(", ")} • {meal.prepMinutes} min
//                                 </p>
//                                 <p className="mt-1 text-sm text-gray-600">{meal.instructions}</p>
//                               </>
//                             )}
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   ))}

//                   {/* Export Tools */}
//                   <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-4">
//                     <button
//                       onClick={handleCopyJSON}
//                       className="flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm text-gray-600 shadow-sm transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
//                     >
//                       <CopyIcon /> {copied ? "Copied!" : "Copy JSON"}
//                     </button>
//                     <button
//                       onClick={() => exportToCSV(generatedPlan)}
//                       className="flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm text-gray-600 shadow-sm transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
//                     >
//                       <DownloadIcon /> Download CSV
//                     </button>
//                     <button
//                       onClick={handleSavePlan}
//                       className="rounded-lg bg-teal-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
//                     >
//                       Save to My Plans
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <p className="text-center text-sm text-gray-400">Your generated meal plan will appear here.</p>
//               )}
//             </section>

//             {/* Saved Plans */}
//             <section className="rounded-2xl bg-gray-50 p-6 shadow-sm">
//               <h2 className="mb-4 text-lg font-semibold text-gray-900">My Plans</h2>
//               {savedPlans.length === 0 ? (
//                 <p className="text-sm text-gray-400">No saved plans yet.</p>
//               ) : (
//                 <div className="space-y-3">
//                   {savedPlans.map((plan) => (
//                     <div
//                       key={plan.id}
//                       className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-4 shadow-sm"
//                     >
//                       <div>
//                         <p className="font-medium text-gray-700">{plan.planName}</p>
//                         <p className="text-xs text-gray-400">{new Date(plan.createdAt).toLocaleDateString()}</p>
//                       </div>
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => handleRestorePlan(plan)}
//                           className="rounded-lg bg-teal-100 px-3 py-1 text-xs font-medium text-teal-700 transition hover:bg-teal-200"
//                         >
//                           Restore
//                         </button>
//                         <button
//                           onClick={() => exportToCSV(plan)}
//                           className="rounded-lg bg-gray-100 px-3 py-1 text-xs text-gray-600 transition hover:bg-gray-200"
//                         >
//                           Export
//                         </button>
//                         <button
//                           onClick={() => handleDeletePlan(plan.id)}
//                           className="rounded-lg bg-red-50 px-3 py-1 text-xs text-red-600 transition hover:bg-red-100"
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </section>
//           </div>
//         </div>
//       </div>
//     </main>
//   )
// }
