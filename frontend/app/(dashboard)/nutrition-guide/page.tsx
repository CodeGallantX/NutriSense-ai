"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Apple,
  Heart,
  AlertTriangle,
  TrendingUp,
  Leaf,
  Info,
  ShoppingCart,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  BookOpen,
} from "lucide-react"

const articles = [
  // Diabetes-friendly articles
  {
    id: 1,
    title: "Understanding Glycemic Index for Better Blood Sugar Control",
    intro: "Learn how different foods affect your blood sugar levels and make smarter choices.",
    category: "Diabetes",
    tags: ["diabetes-friendly", "balanced"],
    content:
      "The glycemic index (GI) is a valuable tool for managing blood sugar levels. Foods with a low GI (55 or less) are digested more slowly, causing a gradual rise in blood sugar. Examples include most fruits, non-starchy vegetables, and whole grains. Medium GI foods (56-69) like whole wheat products should be eaten in moderation. High GI foods (70+) like white bread and sugary snacks cause rapid spikes and should be limited. Pairing high GI foods with protein or healthy fats can help slow digestion and minimize blood sugar spikes.",
  },
  {
    id: 2,
    title: "Hydration and Blood Sugar: The Connection You Need to Know",
    intro: "Proper hydration plays a crucial role in maintaining stable blood sugar levels.",
    category: "Diabetes",
    tags: ["diabetes-friendly", "balanced"],
    content:
      "Adequate hydration is vital for people with diabetes. When dehydrated, blood sugar becomes more concentrated, leading to higher readings. Drinking enough water helps kidneys flush out excess blood sugar through urine. Aim for 8-10 glasses of water daily, more if exercising or in hot weather. Signs of dehydration include increased thirst, dry mouth, and dark urine. Choose water, herbal tea, or sparkling water over sugary drinks. If plain water is unappealing, add lemon, cucumber, or mint for flavor without added sugars or calories.",
  },
  {
    id: 3,
    title: "Meal Prepping for Diabetes Success",
    intro: "Master the art of meal preparation to maintain consistent eating patterns and better control.",
    category: "Diabetes",
    tags: ["diabetes-friendly", "balanced"],
    content:
      "Meal prepping is a game-changer for diabetes management. Planning and preparing meals in advance ensures consistent timing and portion sizes, crucial for blood sugar stability. Start by choosing one day weekly for prep. Cook proteins in bulk, chop vegetables, and portion snacks. Use containers to create balanced meals with protein, complex carbs, and vegetables. Include portable snacks like nuts, cheese, and cut vegetables to avoid unhealthy choices when hungry. Label containers with dates and carb counts for easy tracking. This approach reduces stress, saves time, and supports consistent blood sugar control.",
  },
  {
    id: 4,
    title: "Timing Your Carbs for Optimal Blood Sugar",
    intro: "When you eat carbs matters just as much as what you eat for diabetes management.",
    category: "Diabetes",
    tags: ["diabetes-friendly", "balanced"],
    content:
      "Strategic carbohydrate timing can significantly improve blood sugar management. Eating carbs earlier in the day when insulin sensitivity is typically higher can help with better glucose control. Pair carbs with protein and fiber to slow absorption. Avoid eating large amounts of carbs before bed, as this can lead to elevated morning blood sugar. Consider splitting carbs evenly across meals rather than consuming them all at once. Monitor your individual response to carbs at different times to find your optimal pattern.",
  },
  {
    id: 5,
    title: "Best Snacks for Steady Blood Sugar",
    intro: "Keep your energy stable between meals with these diabetes-friendly snack options.",
    category: "Diabetes",
    tags: ["diabetes-friendly", "low-carb", "balanced"],
    content:
      "Smart snacking prevents blood sugar crashes and overeating at meals. Choose snacks that combine protein, healthy fats, and fiber. Great options include Greek yogurt with berries, apple slices with almond butter, hummus with vegetables, or a small handful of nuts. Aim for snacks with 15-20 grams of carbs or less. Avoid processed snacks high in refined carbs and sugars. Keep portable snacks on hand for emergencies. Timing snacks 2-3 hours after meals and at least 1 hour before the next meal helps maintain steady glucose levels.",
  },
  {
    id: 6,
    title: "Navigating Restaurant Menus with Diabetes",
    intro: "Enjoy dining out while keeping your blood sugar in check with these smart strategies.",
    category: "Diabetes",
    tags: ["diabetes-friendly", "balanced"],
    content:
      "Eating out doesn't have to derail your diabetes management. Review menus online beforehand to plan your choices. Look for grilled, baked, or steamed options instead of fried. Ask for sauces and dressings on the side. Request extra vegetables in place of starchy sides. Don't be afraid to make substitutions - most restaurants are accommodating. Watch portion sizes and consider sharing entrees or taking half home. Skip sugary drinks and stick with water, unsweetened tea, or sparkling water. Remember that restaurant portions are often 2-3 times larger than appropriate serving sizes.",
  },

  // Low-carb articles
  {
    id: 7,
    title: "Low-Carb Essentials: What You Need to Know",
    intro: "Discover the fundamentals of a successful low-carb lifestyle and its health benefits.",
    category: "Low-Carb",
    tags: ["low-carb", "weight-loss"],
    content:
      "A low-carb diet typically limits carbohydrates to 20-100 grams per day, focusing on protein, healthy fats, and non-starchy vegetables. This approach can improve blood sugar control, promote weight loss, and reduce triglycerides. Key foods include meat, fish, eggs, nuts, seeds, oils, and leafy greens. Avoid grains, sugars, starchy vegetables, and most fruits. The initial transition may cause fatigue as your body adapts to using fat for fuel. Stay hydrated and ensure adequate electrolyte intake. Many people experience increased energy, reduced cravings, and better mental clarity after adaptation.",
  },
  {
    id: 8,
    title: "Protein Power: Building Your Low-Carb Meals",
    intro: "Master protein selection and preparation for satisfying low-carb eating.",
    category: "Low-Carb",
    tags: ["low-carb", "balanced"],
    content:
      "Protein forms the foundation of successful low-carb eating. Choose fatty cuts of meat for satiety and energy. Excellent options include ribeye steak, salmon, chicken thighs, pork belly, and eggs. Aim for 25-35% of calories from protein. Vary your sources to get different nutrients and amino acids. Include organ meats occasionally for nutrient density. Don't fear fat on meat - it provides satiety and essential fatty acids. Prepare proteins simply with herbs and spices. Meal prep proteins in bulk for convenient low-carb meals throughout the week.",
  },
  {
    id: 9,
    title: "Vegetables That Won't Spike Your Blood Sugar",
    intro: "Fill your plate with these nutritious, low-carb vegetable choices.",
    category: "Low-Carb",
    tags: ["low-carb", "diabetes-friendly", "balanced"],
    content:
      "Not all vegetables are equal on a low-carb diet. Focus on leafy greens, cruciferous vegetables, and those that grow above ground. Excellent choices include spinach, kale, broccoli, cauliflower, zucchini, asparagus, and bell peppers. Limit root vegetables like potatoes, carrots, and beets which are higher in carbs. A large serving of leafy greens contains minimal net carbs due to high fiber content. Use vegetables as the base for meals, adding protein and healthy fats. Roasting, sautéing, or raw with dips are all great preparation methods.",
  },
  {
    id: 10,
    title: "Healthy Fats for Low-Carb Success",
    intro: "Embrace these nutrient-dense fats to fuel your body on a low-carb diet.",
    category: "Low-Carb",
    tags: ["low-carb", "balanced"],
    content:
      "Fat becomes your primary energy source on low-carb diets. Prioritize monounsaturated and saturated fats from whole food sources. Include avocados, olive oil, coconut oil, butter from grass-fed cows, and nuts like macadamias and almonds. Fatty fish provides omega-3s crucial for inflammation reduction and heart health. Don't fear saturated fat - research shows it's not the villain once thought. Avoid industrial seed oils like soybean and canola. Use fat to add flavor and increase meal satisfaction. Adequate fat intake prevents hunger and supports hormone production.",
  },
  {
    id: 11,
    title: "Low-Carb Meal Prep Made Simple",
    intro: "Streamline your week with efficient low-carb meal preparation strategies.",
    category: "Low-Carb",
    tags: ["low-carb", "balanced"],
    content:
      "Successful low-carb eating requires planning and preparation. Dedicate a few hours weekly to prep proteins, chop vegetables, and make sauces. Cook large batches of versatile proteins like grilled chicken, ground beef, and hard-boiled eggs. Pre-portion nuts and seeds for grab-and-go snacks. Prepare vegetable sides that reheat well like roasted broccoli or sautéed greens. Make keto-friendly sauces and dressings in bulk. Invest in quality storage containers. Having ready-to-eat low-carb options prevents reaching for high-carb convenience foods when hungry.",
  },
  {
    id: 12,
    title: "Navigating Social Events on Low-Carb",
    intro: "Stay committed to your low-carb lifestyle while enjoying social gatherings.",
    category: "Low-Carb",
    tags: ["low-carb", "balanced"],
    content:
      "Social situations don't have to derail your low-carb commitment. Eat a small low-carb meal before events to avoid arriving hungry. Focus on protein and vegetable options at buffets. Bring a low-carb dish to share. Skip bread baskets and starchy sides. Choose drinks wisely - dry wine and spirits have minimal carbs. Don't feel obligated to explain your food choices. Plan ahead for holidays and special occasions. Remember that occasional flexibility won't undo your progress, but having strategies helps maintain consistency.",
  },

  // Weight-loss articles
  {
    id: 13,
    title: "The Power of Fiber in Weight Management",
    intro: "Discover how increasing fiber intake can help you feel fuller longer and support weight loss.",
    category: "Weight Loss",
    tags: ["weight-loss", "balanced"],
    content:
      "Fiber is a crucial nutrient for weight management and overall health. Soluble fiber, found in oats, beans, and apples, dissolves in water and helps lower cholesterol and glucose levels. Insoluble fiber, found in whole grains and vegetables, aids digestion and promotes regular bowel movements. Adults should aim for 25-35 grams of fiber daily. High-fiber foods are typically low in calories but high in volume, helping you feel satisfied with fewer calories. Start increasing fiber gradually and drink plenty of water to avoid digestive discomfort.",
  },
  {
    id: 14,
    title: "Mindful Eating for Sustainable Weight Loss",
    intro: "Transform your relationship with food through mindful eating practices.",
    category: "Weight Loss",
    tags: ["weight-loss", "balanced"],
    content:
      "Mindful eating involves paying full attention to the eating experience without judgment. Eat slowly, chewing thoroughly and savoring each bite. Remove distractions like TV and phones during meals. Notice hunger and fullness cues. Ask yourself if you're eating from physical hunger or emotional triggers. Plate smaller portions and wait before taking seconds. This practice naturally reduces calorie intake and improves satisfaction. Studies show mindful eaters lose more weight and maintain it better than those who diet restrictively. It also reduces binge eating and improves the pleasure of meals.",
  },
  {
    id: 15,
    title: "Protein's Role in Fat Loss",
    intro: "Maximize your weight loss results by optimizing protein intake.",
    category: "Weight Loss",
    tags: ["weight-loss", "balanced"],
    content:
      "Protein is essential for fat loss while preserving muscle mass. It has the highest thermic effect of all macronutrients, meaning your body burns more calories digesting it. Protein increases satiety hormones and reduces hunger hormones, keeping you fuller longer. Aim for 1.6-2.2 grams per kilogram of body weight when losing weight. Distribute protein evenly across meals for optimal muscle protein synthesis. Include lean sources like chicken breast, fish, Greek yogurt, and legumes. Higher protein intake also prevents the metabolic slowdown that typically accompanies weight loss.",
  },
  {
    id: 16,
    title: "Sleep and Weight Loss: The Hidden Connection",
    intro: "Discover how quality sleep directly impacts your weight loss success.",
    category: "Weight Loss",
    tags: ["weight-loss", "balanced"],
    content:
      "Poor sleep sabotages weight loss efforts. Sleep deprivation increases ghrelin (hunger hormone) and decreases leptin (satiety hormone), leading to increased appetite and cravings for high-calorie foods. Aim for 7-9 hours of quality sleep nightly. Lack of sleep also impairs glucose metabolism and increases cortisol, promoting fat storage especially around the abdomen. Establish a consistent sleep schedule, avoid screens before bed, keep your room cool and dark, and limit caffeine after noon. Prioritizing sleep may be as important as diet and exercise for successful weight management.",
  },
  {
    id: 17,
    title: "Volume Eating: Eat More, Weigh Less",
    intro: "Learn how to feel satisfied while maintaining a calorie deficit through volume eating.",
    category: "Weight Loss",
    tags: ["weight-loss", "balanced"],
    content:
      "Volume eating focuses on foods high in volume but low in calories, primarily vegetables, fruits, and lean proteins. Fill half your plate with non-starchy vegetables at every meal. Choose whole fruits over dried fruits or juices. Include air-popped popcorn, broth-based soups, and large salads. These foods stretch your stomach and trigger fullness signals while keeping calories low. You can eat larger portions and still lose weight. Add volume to meals by incorporating vegetables into dishes like cauliflower rice, zucchini noodles, or veggie-loaded omelets.",
  },
  {
    id: 18,
    title: "Breaking Through Weight Loss Plateaus",
    intro: "Overcome stalls in your weight loss journey with these proven strategies.",
    category: "Weight Loss",
    tags: ["weight-loss", "balanced"],
    content:
      "Weight loss plateaus are normal but frustrating. Your metabolism adapts to lower calorie intake over time. Strategies to break through include recalculating your calorie needs, varying your exercise routine, ensuring adequate protein intake, and taking diet breaks where you eat at maintenance for 1-2 weeks. Track everything you eat - hidden calories often creep in. Increase NEAT (non-exercise activity thermogenesis) by moving more throughout the day. Consider reducing stress and improving sleep quality. Be patient - plateaus can last weeks before breaking. Sometimes continuing current habits while being consistent is all that's needed.",
  },

  // Weight-gain articles
  {
    id: 19,
    title: "Healthy Weight Gain: Building Muscle, Not Just Fat",
    intro: "Learn the right way to gain weight through muscle development and proper nutrition.",
    category: "Weight Gain",
    tags: ["weight-gain", "balanced"],
    content:
      "Healthy weight gain focuses on building muscle mass rather than accumulating fat. Calculate your calorie needs and add 300-500 calories daily for gradual, sustainable gains. Emphasize protein intake at 1.6-2.2 grams per kilogram body weight to support muscle growth. Combine increased calories with resistance training 3-4 times weekly. Choose nutrient-dense foods like nuts, avocados, whole grains, fatty fish, and quality proteins. Eat frequent meals and include snacks between main meals. Drink calories through smoothies with protein powder, fruits, nut butters, and oats. Aim to gain 0.25-0.5 kg per week for optimal muscle-to-fat ratio.",
  },
  {
    id: 20,
    title: "Calorie-Dense Foods for Weight Gain",
    intro: "Discover the best high-calorie, nutritious foods to support healthy weight gain.",
    category: "Weight Gain",
    tags: ["weight-gain", "balanced"],
    content:
      "When gaining weight, calorie-dense foods make reaching your targets easier. Include nuts and nut butters (almonds, cashews, peanut butter), which provide 160-200 calories per ounce. Avocados offer healthy fats at 240 calories each. Whole milk, full-fat yogurt, and cheese add calories and protein. Olive oil and coconut oil easily add calories to meals. Dried fruits provide concentrated calories and nutrients. Whole grains like quinoa, brown rice, and oats offer calories with fiber. Fatty fish like salmon provides calories, protein, and omega-3s. Focus on adding these to meals rather than eating empty-calorie junk food.",
  },
  {
    id: 21,
    title: "Strength Training for Muscle Growth",
    intro: "Maximize muscle gains with proper resistance training strategies.",
    category: "Weight Gain",
    tags: ["weight-gain", "balanced"],
    content:
      "Building muscle requires progressive resistance training. Focus on compound exercises like squats, deadlifts, bench presses, and rows that work multiple muscle groups. Train each muscle group 2-3 times weekly for optimal growth. Use weights that allow 6-12 repetitions before failure. Progressively increase weight, reps, or sets over time. Rest 48-72 hours between training the same muscle groups. Combine training with adequate protein and calories. Don't neglect sleep - muscle growth occurs during recovery. Consider working with a trainer initially to learn proper form and prevent injury. Consistency over months yields results.",
  },
  {
    id: 22,
    title: "High-Calorie Smoothies for Easy Gains",
    intro: "Blend your way to healthy weight gain with these nutrient-packed smoothie recipes.",
    category: "Weight Gain",
    tags: ["weight-gain", "balanced"],
    content:
      "Smoothies offer an easy way to consume extra calories without feeling overly full. A weight-gain smoothie might include: 2 cups whole milk (300 cal), 2 bananas (200 cal), 3 tablespoons peanut butter (285 cal), 1 scoop protein powder (120 cal), 1/2 cup oats (150 cal), and honey to taste (60 cal) - totaling over 1000 calories. Experiment with different combinations using Greek yogurt, avocado, frozen fruits, nut butters, seeds, and protein powder. Drink smoothies between meals rather than replacing meals. They're especially useful post-workout when appetite may be low but calorie needs are high.",
  },
  {
    id: 23,
    title: "Overcoming Appetite Challenges for Weight Gain",
    intro: "Practical strategies for increasing food intake when you have a small appetite.",
    category: "Weight Gain",
    tags: ["weight-gain", "balanced"],
    content:
      "Many people struggle to eat enough for weight gain. Eat smaller, more frequent meals - 5-6 times daily instead of 3 large meals. Choose calorie-dense foods that don't fill you up quickly. Drink calories through smoothies, milk, and juices. Eat your protein and calorie-dense foods first, vegetables last. Use bigger plates to make portions seem smaller. Add flavor enhancers like sauces and seasonings to make food more appealing. Engage in light activity to stimulate appetite. Don't drink large amounts of water before meals as it reduces appetite. Keep convenient snacks visible and accessible.",
  },
  {
    id: 24,
    title: "Tracking Progress: More Than Just the Scale",
    intro: "Monitor your weight gain journey effectively with these comprehensive tracking methods.",
    category: "Weight Gain",
    tags: ["weight-gain", "balanced"],
    content:
      "While the scale shows progress, it doesn't tell the whole story. Take progress photos weekly from multiple angles - visual changes often appear before significant weight changes. Measure body circumferences (arms, chest, waist, thighs) monthly. Track strength gains in the gym - increasing weights indicates muscle growth. Monitor how clothes fit, especially in the shoulders and thighs. Keep a food diary to ensure you're consistently hitting calorie targets. Note energy levels and how you feel. Remember that muscle weighs more than fat by volume, so you might see size increases before major scale changes. Aim for gradual, steady progress over months.",
  },

  // Balanced/General articles
  {
    id: 25,
    title: "Protein Timing: When and How Much",
    intro: "Optimize your protein intake throughout the day for better muscle health and satiety.",
    category: "General Health",
    tags: ["balanced"],
    content:
      "Protein timing can significantly impact muscle synthesis, recovery, and appetite control. Research suggests distributing protein evenly across meals (20-30g per meal) is more effective than consuming most protein at dinner. Include protein at breakfast to reduce cravings throughout the day. Post-exercise protein (within 2 hours) supports muscle recovery. Good sources include lean meats, fish, eggs, dairy, legumes, and plant-based options like tofu and tempeh. For optimal health, aim for 0.8-1g of protein per kilogram of body weight daily, adjusting based on activity level.",
  },
  {
    id: 26,
    title: "Healthy Fats: Not All Fats Are Created Equal",
    intro: "Learn which fats to embrace and which to avoid for optimal heart health.",
    category: "General Health",
    tags: ["balanced", "diabetes-friendly"],
    content:
      "Understanding dietary fats is essential for heart health and diabetes management. Unsaturated fats (monounsaturated and polyunsaturated) found in olive oil, avocados, nuts, and fatty fish help reduce bad cholesterol and inflammation. Omega-3 fatty acids are particularly beneficial for heart health. Limit saturated fats from red meat and full-fat dairy to less than 10% of daily calories. Avoid trans fats completely, as they raise bad cholesterol and lower good cholesterol. Remember, while healthy fats are beneficial, they are calorie-dense, so portion control is important.",
  },
  {
    id: 27,
    title: "The Mediterranean Diet: A Balanced Approach",
    intro: "Discover the heart-healthy benefits of Mediterranean-style eating patterns.",
    category: "General Health",
    tags: ["balanced", "weight-loss"],
    content:
      "The Mediterranean diet emphasizes whole foods, healthy fats, and plant-based eating. It includes abundant vegetables, fruits, whole grains, legumes, nuts, and olive oil. Fish and poultry are eaten regularly, while red meat is limited. Moderate wine consumption with meals is optional. This pattern reduces heart disease risk, supports brain health, and aids weight management. Unlike restrictive diets, it's sustainable long-term. The social aspect of meals is valued. Research shows Mediterranean eaters have lower rates of chronic disease. Focus on food quality over calorie counting. Include herbs and spices for flavor without excess salt.",
  },
  {
    id: 28,
    title: "Gut Health: The Foundation of Overall Wellness",
    intro: "Learn how supporting your microbiome can improve digestion, immunity, and even mood.",
    category: "General Health",
    tags: ["balanced"],
    content:
      "Your gut microbiome contains trillions of bacteria affecting digestion, immunity, and mental health. Support gut health by eating diverse plant foods - aim for 30 different plants weekly. Include fermented foods like yogurt, kefir, sauerkraut, and kimchi for beneficial probiotics. Prebiotic foods (onions, garlic, bananas, oats) feed good bacteria. Limit artificial sweeteners and processed foods that harm the microbiome. Manage stress through meditation or exercise. Avoid unnecessary antibiotics. Stay hydrated and get adequate sleep. A healthy gut reduces inflammation, strengthens immunity, improves mood, and supports healthy weight.",
  },
  {
    id: 29,
    title: "Plant-Based Eating: Complete Nutrition Guide",
    intro: "Get all essential nutrients while following a plant-based or vegetarian diet.",
    category: "General Health",
    tags: ["balanced", "weight-loss"],
    content:
      "Plant-based diets can provide complete nutrition with proper planning. Ensure adequate protein from legumes, tofu, tempeh, seitan, and quinoa. Get iron from lentils, spinach, and fortified cereals, paired with vitamin C for better absorption. Include B12 through fortified foods or supplements. Obtain calcium from fortified plant milks, leafy greens, and tofu. Get omega-3s from flaxseeds, chia seeds, and walnuts. Zinc sources include beans, nuts, and whole grains. Combine different plant proteins throughout the day for complete amino acid profiles. Plant-based eating reduces chronic disease risk and supports environmental sustainability.",
  },
  {
    id: 30,
    title: "Anti-Inflammatory Foods for Better Health",
    intro: "Reduce chronic inflammation naturally through strategic food choices.",
    category: "General Health",
    tags: ["balanced", "diabetes-friendly"],
    content:
      "Chronic inflammation contributes to many diseases including diabetes, heart disease, and arthritis. Combat it through diet by including fatty fish rich in omega-3s, colorful fruits and vegetables containing antioxidants, nuts (especially walnuts and almonds), olive oil, and spices like turmeric and ginger. Green tea provides anti-inflammatory compounds. Limit inflammatory foods including refined carbohydrates, fried foods, processed meats, and excessive alcohol. Focus on whole, minimally processed foods. The Mediterranean diet is particularly anti-inflammatory. Combining anti-inflammatory eating with adequate sleep, stress management, and regular exercise provides maximum benefit.",
  },
]

const dailyTips = [
  { icon: Apple, text: "Start your day with a protein-rich breakfast to stabilize blood sugar" },
  { icon: Heart, text: "Include colorful vegetables in every meal for essential nutrients" },
  { icon: Leaf, text: "Choose whole grains over refined carbohydrates for sustained energy" },
]

const foodSafety = [
  { name: "White Rice", level: "avoid", color: "bg-red-50 text-red-700 border-red-200" },
  { name: "Sugary Drinks", level: "avoid", color: "bg-red-50 text-red-700 border-red-200" },
  { name: "White Bread", level: "limit", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { name: "Pasta", level: "limit", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { name: "Brown Rice", level: "safe", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { name: "Quinoa", level: "safe", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { name: "Leafy Greens", level: "safe", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { name: "Nuts & Seeds", level: "safe", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
]

const foodComparisons = [
  { less: "White Rice", better: "Brown Rice", benefit: "More fiber, lower GI" },
  { less: "Fruit Juice", better: "Whole Fruit", benefit: "Less sugar, more fiber" },
  { less: "Soda", better: "Sparkling Water", benefit: "Zero sugar, hydrating" },
  { less: "Potato Chips", better: "Roasted Chickpeas", benefit: "More protein & fiber" },
]

const portionGuide = [
  { name: "Protein", size: "Palm of Hand", icon: "🖐️", description: "3-4 oz of meat/fish" },
  { name: "Carbs", size: "Closed Fist", icon: "✊", description: "1/2 - 1 cup grains" },
  { name: "Fats", size: "Thumb", icon: "👍", description: "1 tbsp oils/nuts" },
  { name: "Vegetables", size: "Two Handfuls", icon: "🙌", description: "Fill half your plate" },
]

const myths = [
  {
    myth: "All carbs are bad for diabetics",
    reality: "Complex carbs are essential",
    explanation:
      "Whole grains, legumes, and vegetables provide necessary nutrients and fiber. Focus on quality and portion control, not elimination.",
  },
  {
    myth: "Fruit has too much sugar to eat",
    reality: "Fruit is healthy in moderation",
    explanation:
      "Whole fruits contain fiber, vitamins, and antioxidants. The natural sugars are paired with nutrients that slow absorption. Aim for 2-3 servings daily.",
  },
  {
    myth: "You need to eat special diabetic foods",
    reality: "Eat regular, balanced meals",
    explanation:
      "Diabetic-labeled foods are often expensive and unnecessary. Focus on whole foods, proper portions, and balanced meals instead.",
  },
  {
    myth: "Skipping meals helps control blood sugar",
    reality: "Regular meals maintain stability",
    explanation:
      "Skipping meals can cause blood sugar swings and overeating later. Eat balanced meals every 4-5 hours to maintain steady levels.",
  },
  {
    myth: "Fat-free foods are always healthier",
    reality: "Healthy fats are beneficial",
    explanation:
      "Fat-free products often contain added sugars. Healthy fats from nuts, avocados, and olive oil support heart health and satiety.",
  },
]

const meals = [
  {
    type: "Breakfast",
    examples: [
      "Greek yogurt with berries and almonds",
      "Oatmeal with chia seeds and cinnamon",
      "Vegetable omelet with whole grain toast",
    ],
    image: "/healthy-breakfast-bowl.png",
  },
  {
    type: "Lunch",
    examples: [
      "Grilled chicken salad with olive oil",
      "Quinoa bowl with roasted vegetables",
      "Lentil soup with mixed greens",
    ],
    image: "/healthy-lunch-bowl.jpg",
  },
  {
    type: "Dinner",
    examples: [
      "Baked salmon with broccoli and sweet potato",
      "Stir-fried tofu with brown rice",
      "Turkey meatballs with zucchini noodles",
    ],
    image: "/healthy-dinner.png",
  },
  {
    type: "Snacks",
    examples: ["Apple slices with almond butter", "Carrot sticks with hummus", "Mixed nuts and seeds"],
    image: "/healthy-snacks-variety.png",
  },
]

const shoppingList = {
  Vegetables: [
    "Leafy greens (spinach, kale)",
    "Broccoli & cauliflower",
    "Bell peppers",
    "Tomatoes",
    "Cucumbers",
    "Carrots",
  ],
  "Lean Proteins": ["Chicken breast", "Fish (salmon, cod)", "Eggs", "Greek yogurt", "Tofu", "Legumes (lentils, beans)"],
  "Whole Grains": ["Brown rice", "Quinoa", "Oats", "Whole wheat bread", "Barley"],
  "Healthy Fats": ["Olive oil", "Avocados", "Nuts (almonds, walnuts)", "Seeds (chia, flax)", "Natural nut butter"],
  "Items to Avoid": [
    "Sugary cereals",
    "White bread",
    "Soda & fruit juices",
    "Processed snacks",
    "High-fat dairy",
    "Fried foods",
  ],
}

const filters = ["All", "Diabetes-friendly", "Low-carb", "Balanced", "Weight-loss", "Weight-gain"]

export default function NutritionGuidePage() {
  const [selectedFilter, setSelectedFilter] = useState("All")
  const [selectedArticle, setSelectedArticle] = useState<(typeof articles)[0] | null>(null)

  const filteredArticles = articles.filter((article) => {
    if (selectedFilter === "All") return true
    const filterTag = selectedFilter.toLowerCase()
    return article.tags.includes(filterTag)
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 via-green-50/20 to-white">
      <header className="border-b border-green-200 bg-white/90 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-green-800 to-green-700 flex items-center justify-center shadow-md">
              <Apple className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nutrition Guide</h1>
              <p className="text-sm text-green-700">Your path to better health</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-12 max-w-6xl">
        {/* Quick Filters */}
        <section>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(filter)}
                className={`whitespace-nowrap ${
                  selectedFilter === filter
                    ? "bg-green-800 hover:bg-green-900 text-white shadow-md"
                    : "border-green-300 text-green-800 hover:bg-green-50 hover:border-green-400"
                }`}
              >
                {filter}
              </Button>
            ))}
          </div>
        </section>

        {/* Daily Tips */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-green-800" />
            <h2 className="text-xl font-semibold text-gray-900">Today's Health Tips</h2>
          </div>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm">
            <CardContent className="p-6 space-y-4">
              {dailyTips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-green-200">
                    <tip.icon className="h-5 w-5 text-green-800" />
                  </div>
                  <p className="text-gray-700 pt-2 leading-relaxed">{tip.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-green-800" />
            <h2 className="text-xl font-semibold text-gray-900">
              Featured Articles
              {selectedFilter !== "All" && (
                <span className="text-base font-normal text-green-700 ml-2">
                  ({filteredArticles.length} {selectedFilter} articles)
                </span>
              )}
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg hover:border-green-300 transition-all border-green-100">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-900 border-green-300">
                      {article.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight text-gray-900">{article.title}</CardTitle>
                  <CardDescription className="leading-relaxed">{article.intro}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between group text-green-800 hover:text-green-900 hover:bg-green-50"
                        onClick={() => setSelectedArticle(article)}
                      >
                        Read More
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh]">
                      <DialogHeader>
                        <div className="mb-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-900 border-green-300">
                            {article.category}
                          </Badge>
                        </div>
                        <DialogTitle className="text-2xl leading-tight">{article.title}</DialogTitle>
                        <DialogDescription className="text-base leading-relaxed">{article.intro}</DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="max-h-[50vh] pr-4">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{article.content}</p>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Food Safety Warnings */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h2 className="text-xl font-semibold text-gray-900">Food Safety Guide</h2>
          </div>
          <Card className="border-green-100">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {foodSafety.map((food, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 flex flex-col items-center text-center gap-2 ${food.color}`}
                  >
                    {food.level === "avoid" && <XCircle className="h-5 w-5" />}
                    {food.level === "limit" && <AlertCircle className="h-5 w-5" />}
                    {food.level === "safe" && <CheckCircle2 className="h-5 w-5" />}
                    <span className="font-medium text-sm">{food.name}</span>
                    <Badge variant="outline" className="text-xs capitalize border-current">
                      {food.level}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Smart Food Comparisons */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-800" />
            <h2 className="text-xl font-semibold text-gray-900">Smart Food Swaps</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {foodComparisons.map((comparison, index) => (
              <Card key={index} className="overflow-hidden border-green-100">
                <CardContent className="p-0">
                  <div className="grid grid-cols-2">
                    <div className="p-6 bg-red-50/50 flex flex-col items-center justify-center text-center border-r">
                      <XCircle className="h-8 w-8 text-red-600 mb-2" />
                      <p className="font-medium text-gray-900">{comparison.less}</p>
                      <p className="text-xs text-gray-500 mt-1">Less Optimal</p>
                    </div>
                    <div className="p-6 bg-green-50/50 flex flex-col items-center justify-center text-center">
                      <CheckCircle2 className="h-8 w-8 text-green-800 mb-2" />
                      <p className="font-medium text-gray-900">{comparison.better}</p>
                      <p className="text-xs text-gray-500 mt-1">Better Choice</p>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 border-t">
                    <p className="text-sm text-gray-600 text-center">
                      <span className="font-medium">Why?</span> {comparison.benefit}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Portion Size Guide */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-green-800" />
            <h2 className="text-xl font-semibold text-gray-900">Portion Size Guide</h2>
          </div>
          <Card className="border-green-100">
            <CardContent className="p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {portionGuide.map((portion, index) => (
                  <div
                    key={index}
                    className="text-center p-4 rounded-lg bg-gradient-to-b from-green-50 to-white border border-green-200 shadow-sm"
                  >
                    <div className="text-5xl mb-3">{portion.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-1">{portion.name}</h3>
                    <p className="text-sm text-green-800 font-medium mb-2">{portion.size}</p>
                    <p className="text-xs text-gray-600">{portion.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Nutrition Myth Busters */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">Nutrition Myth Busters</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {myths.map((item, index) => (
              <Card key={index} className="border-green-100">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <CardTitle className="text-base text-red-700 mb-2">Myth: {item.myth}</CardTitle>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-800 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-semibold text-green-800">Reality: {item.reality}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.explanation}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Meal Recommendations */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-green-800" />
            <h2 className="text-xl font-semibold text-gray-900">Meal Ideas</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {meals.map((meal, index) => (
              <Card key={index} className="overflow-hidden border-green-100">
                <div className="aspect-video relative bg-green-50">
                  <img src={meal.image || "/placeholder.svg"} alt={meal.type} className="w-full h-full object-cover" />
                </div>
                <CardHeader>
                  <CardTitle className="text-green-900">{meal.type}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {meal.examples.map((example, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="h-4 w-4 text-green-800 flex-shrink-0 mt-0.5" />
                        {example}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Shopping List */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="h-5 w-5 text-green-800" />
            <h2 className="text-xl font-semibold text-gray-900">Smart Shopping List</h2>
          </div>
          <Card className="border-green-100">
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(shoppingList).map(([category, items]) => (
                  <div key={category}>
                    <h3
                      className={`font-semibold mb-3 pb-2 border-b ${
                        category === "Items to Avoid"
                          ? "text-red-700 border-red-200"
                          : "text-green-900 border-green-200"
                      }`}
                    >
                      {category}
                    </h3>
                    <ul className="space-y-2">
                      {items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          {category === "Items to Avoid" ? (
                            <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-green-800 flex-shrink-0 mt-0.5" />
                          )}
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* AI Assistant Coming Soon */}
        <section>
          <Card className="bg-gradient-to-br from-green-100 via-emerald-50 to-green-50 border-green-200 shadow-md">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-green-800 to-green-700 mb-4 shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Nutrition Assistant</h3>
              <p className="text-gray-700 mb-4 max-w-2xl mx-auto leading-relaxed">
                Get personalized meal plans, real-time nutrition advice, and smart food recommendations tailored to your
                health goals. Coming soon!
              </p>
              <Badge className="bg-green-800 text-white hover:bg-green-900">Coming Soon</Badge>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
