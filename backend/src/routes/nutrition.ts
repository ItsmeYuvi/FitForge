import { Router, Request, Response } from 'express';
import NutritionPlan, { INutritionPlan, IMeal } from '../models/NutritionPlan';
import FitnessProfile from '../models/FitnessProfile';

const router = Router();

// Local fallback nutrition generator
function generateLocalNutrition(goal: string, diet: string, weight: number, tdee: number): Partial<INutritionPlan> {
  let calories = tdee;
  if (goal === 'lose_fat') calories = Math.round(tdee - 450);
  else if (goal === 'build_muscle') calories = Math.round(tdee + 300);

  const protein = Math.round(weight * 2.1);
  const fats = Math.round(weight * 0.85);
  const carbs = Math.round((calories - (protein * 4) - (fats * 9)) / 4);

  // Generate fallback meal items based on diet type
  const isIndian = diet.includes('indian');
  const isVeg = diet.includes('veg') || diet.includes('vegan');

  let breakfast: IMeal = {
    id: 'meal-b-1',
    type: 'breakfast',
    name: 'Metabolic Fuel Oats',
    description: 'Oatmeal cooked in almond milk, topped with ground flaxseeds, chia seeds, blueberries, and a scoop of whey isolate.',
    protein: 35,
    carbs: 45,
    fats: 10,
    calories: 410
  };

  let lunch: IMeal = {
    id: 'meal-l-1',
    type: 'lunch',
    name: 'Macro Lean Rice Bowl',
    description: 'Grilled chicken breast with brown rice, sautéed spinach, and mixed bell peppers dressed with olive oil.',
    protein: 48,
    carbs: 50,
    fats: 12,
    calories: 500
  };

  let dinner: IMeal = {
    id: 'meal-d-1',
    type: 'dinner',
    name: 'Somatic Salmon & Potato',
    description: 'Baked salmon fillet served with roasted sweet potato wedges and steamed asparagus.',
    protein: 42,
    carbs: 35,
    fats: 16,
    calories: 452
  };

  let snack: IMeal = {
    id: 'meal-s-1',
    type: 'snack',
    name: 'Anabolic Nut Butter Blend',
    description: 'Greek yogurt mixed with almond butter, cocoa nibs, and half a sliced banana.',
    protein: 20,
    carbs: 18,
    fats: 8,
    calories: 224
  };

  // Adjust for Indian/Veg profiles
  if (isIndian) {
    if (isVeg) {
      breakfast = {
        id: 'meal-b-2',
        type: 'breakfast',
        name: 'Paneer & Oats Besan Chilla',
        description: 'Two savory chickpea and oats pancakes stuffed with low-fat grated paneer and served with mint chutney.',
        protein: 26,
        carbs: 38,
        fats: 12,
        calories: 364
      };
      lunch = {
        id: 'meal-l-2',
        type: 'lunch',
        name: 'Tofu Paneer Sabzi & Roti',
        description: 'Tofu stir-fry cooked in mustard oil, served with boiled chana daal and two whole wheat rotis.',
        protein: 32,
        carbs: 55,
        fats: 14,
        calories: 474
      };
      dinner = {
        id: 'meal-d-2',
        type: 'dinner',
        name: 'Low-Fat Soya Chunk Biryani',
        description: 'Basmati rice cooked with high-protein soya chunks, green peas, yogurt gravy, and cucumber raita.',
        protein: 38,
        carbs: 50,
        fats: 8,
        calories: 424
      };
    } else {
      // Indian Non-Veg
      breakfast = {
        id: 'meal-b-3',
        type: 'breakfast',
        name: 'Egg Bhurji & Multigrain Toast',
        description: 'Scrambled whole eggs and egg whites cooked with onions, tomatoes, green chilies, served with two slices of toasted multigrain bread.',
        protein: 28,
        carbs: 25,
        fats: 10,
        calories: 302
      };
      lunch = {
        id: 'meal-l-3',
        type: 'lunch',
        name: 'Spiced Chicken Tikka & Daal',
        description: 'Tandoori chicken breast skewers served with yellow moong daal, steamed basmati rice, and a bowl of mixed green salad.',
        protein: 45,
        carbs: 45,
        fats: 11,
        calories: 459
      };
    }
  } else if (isVeg) {
    // Western Veg/Vegan
    breakfast = {
      id: 'meal-b-4',
      type: 'breakfast',
      name: 'Anabolic Tofu Scramble',
      description: 'Scrambled firm tofu cooked with spinach, nutritional yeast, and turmeric, served alongside two slices of sourdough bread.',
      protein: 28,
      carbs: 32,
      fats: 9,
      calories: 321
    };
    lunch = {
      id: 'meal-l-4',
      type: 'lunch',
      name: 'Tempeh Quinoa Bowl',
      description: 'Pan-seared marinated tempeh with red quinoa, sliced avocado, black beans, and steamed kale.',
      protein: 34,
      carbs: 52,
      fats: 15,
      calories: 479
    };
  }

  return {
    calories,
    protein,
    carbs,
    fats,
    dietaryPreference: diet,
    meals: [breakfast, lunch, dinner, snack]
  };
}

// 1. Generate full nutrition plan via AI
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { clerkId } = req.body;
    if (!clerkId) return res.status(400).json({ error: 'Clerk ID is required' });

    const profile = await FitnessProfile.findOne({ clerkId });
    if (!profile) {
      return res.status(404).json({ error: 'Fitness profile not completed. Complete onboarding first.' });
    }

    // Programmatic TDEE calculations
    const heightM = profile.height / 100;
    const bmi = profile.weight / (heightM * heightM);
    let bmr = 0;
    if (profile.gender === 'male') {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
    } else {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
    }
    const multipliers: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
    const tdee = Math.round(bmr * (multipliers[profile.activityLevel] || 1.2));

    let planData: Partial<INutritionPlan> = {};
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (apiKey && apiKey !== 'YOUR_OPENROUTER_API_KEY') {
      try {
        const prompt = `You are FitForge AI, a futuristic digital nutritionist.
Generate a custom daily meal plan in strict JSON format based on these parameters:
- Goal: ${profile.goal}
- Dietary Preference: ${profile.dietaryPreference}
- Weight: ${profile.weight} kg
- Calculated TDEE: ${tdee} kcal

Return ONLY a raw JSON string conforming to this structure:
{
  "calories": 2200,
  "protein": 160,
  "carbs": 210,
  "fats": 65,
  "meals": [
    {
      "id": "meal-breakfast",
      "type": "breakfast",
      "name": "Meal name",
      "description": "Specific food layout description",
      "protein": 35,
      "carbs": 40,
      "fats": 8,
      "calories": 372
    },
    {
      "id": "meal-lunch",
      "type": "lunch",
      "name": "Meal name",
      "description": "Food layout description",
      "protein": 45,
      "carbs": 50,
      "fats": 10,
      "calories": 470
    },
    {
      "id": "meal-dinner",
      "type": "dinner",
      "name": "Meal name",
      "description": "Food layout description",
      "protein": 45,
      "carbs": 30,
      "fats": 15,
      "calories": 435
    },
    {
      "id": "meal-snack",
      "type": "snack",
      "name": "Meal name",
      "description": "Food layout description",
      "protein": 15,
      "carbs": 15,
      "fats": 6,
      "calories": 174
    }
  ]
}
Make the meals highly customized to their dietary preference (e.g. Indian Veg diets must feature foods like chana, paneer, rotis, rice, lentils). Do not include markdown code block formatting.`;

        const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'deepseek/deepseek-chat-v3',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' }
          })
        });

        if (aiResponse.ok) {
          const resJson = await aiResponse.json() as any;
          const contentText = resJson.choices[0]?.message?.content;
          if (contentText) {
            planData = JSON.parse(contentText.trim());
          }
        }
      } catch (err) {
        console.error('Error generating AI nutrition, running local fallback:', err);
      }
    }

    if (!planData.meals || !planData.meals.length) {
      planData = generateLocalNutrition(profile.goal, profile.dietaryPreference, profile.weight, tdee);
    }

    // Deactivate previous plans
    await NutritionPlan.updateMany({ clerkId: profile.clerkId }, { isActive: false });

    // Save new plan
    const newPlan = new NutritionPlan({
      clerkId: profile.clerkId,
      calories: planData.calories,
      protein: planData.protein,
      carbs: planData.carbs,
      fats: planData.fats,
      dietaryPreference: profile.dietaryPreference,
      meals: planData.meals,
      isActive: true
    });

    await newPlan.save();
    return res.status(200).json(newPlan);
  } catch (error: any) {
    console.error('Error in nutrition generation:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 2. Fetch Active Nutrition Plan
router.get('/:clerkId', async (req: Request, res: Response) => {
  try {
    const plan = await NutritionPlan.findOne({ clerkId: req.params.clerkId, isActive: true });
    if (!plan) return res.status(404).json({ error: 'No active nutrition plan found.' });
    return res.status(200).json(plan);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch active plan' });
  }
});

// 3. Regenerate single meal inside the plan
router.post('/regenerate-meal', async (req: Request, res: Response) => {
  try {
    const { planId, mealId } = req.body;
    if (!planId || !mealId) return res.status(400).json({ error: 'Plan ID and Meal ID are required.' });

    const plan = await NutritionPlan.findById(planId);
    if (!plan) return res.status(404).json({ error: 'Nutrition plan not found.' });

    const targetMealIndex = plan.meals.findIndex((m) => m.id === mealId);
    if (targetMealIndex === -1) return res.status(404).json({ error: 'Target meal not found in plan.' });

    const mealType = plan.meals[targetMealIndex].type;
    const profile = await FitnessProfile.findOne({ clerkId: plan.clerkId });
    const diet = plan.dietaryPreference;

    let newMeal: Partial<IMeal> = {};
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (apiKey && apiKey !== 'YOUR_OPENROUTER_API_KEY') {
      try {
        const prompt = `You are FitForge AI, a digital nutritionist.
Generate a single new meal recommendation for a ${mealType} meal in strict JSON format.
- Dietary Preference: ${diet}
- Goal: ${profile ? profile.goal : 'maintenance'}

Return ONLY a raw JSON string conforming to this structure:
{
  "name": "New Meal Name",
  "description": "Single-sentence food layout details",
  "protein": 30,
  "carbs": 40,
  "fats": 10,
  "calories": 370
}
Ensure it complies exactly with the ${diet} constraints. Avoid wrapping in markdown blocks.`;

        const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'deepseek/deepseek-chat-v3',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' }
          })
        });

        if (aiResponse.ok) {
          const resJson = await aiResponse.json() as any;
          const contentText = resJson.choices[0]?.message?.content;
          if (contentText) {
            newMeal = JSON.parse(contentText.trim());
          }
        }
      } catch (err) {
        console.error('Error generating AI single meal, using localized swaps:', err);
      }
    }

    // Run local swaps fallback if empty
    if (!newMeal.name) {
      const isIndian = diet.includes('indian');
      const isVeg = diet.includes('veg') || diet.includes('vegan');
      
      if (isIndian) {
        newMeal = isVeg 
          ? { name: 'Paneer Bhurji & Chapati', description: 'Crumbled paneer spiced with onions, ginger, and turmeric, served with two soft wheat chapatis.', protein: 24, carbs: 36, fats: 15, calories: 375 }
          : { name: 'Fish Curry & Brown Rice', description: 'Lightly spiced fish fillets poached in tomato-onion gravy, served with boiled brown rice.', protein: 35, carbs: 42, fats: 10, calories: 398 };
      } else {
        newMeal = isVeg
          ? { name: 'Nut Butter Sourdough Toast', description: 'Two slices of sourdough bread spread with organic peanut butter, sprinkled with hemp seeds.', protein: 18, carbs: 44, fats: 16, calories: 392 }
          : { name: 'Baked Turkey Breast Wrap', description: 'Sliced turkey breast wrapped in a whole wheat tortilla with spinach, shredded carrots, and hummus.', protein: 32, carbs: 28, fats: 9, calories: 321 };
      }
    }

    // Update target meal
    plan.meals[targetMealIndex].name = newMeal.name!;
    plan.meals[targetMealIndex].description = newMeal.description!;
    plan.meals[targetMealIndex].protein = newMeal.protein!;
    plan.meals[targetMealIndex].carbs = newMeal.carbs!;
    plan.meals[targetMealIndex].fats = newMeal.fats!;
    plan.meals[targetMealIndex].calories = newMeal.calories!;

    // Recalculate plan totals based on modified meal array
    let totalCals = 0, totalP = 0, totalC = 0, totalF = 0;
    plan.meals.forEach((m) => {
      totalCals += m.calories;
      totalP += m.protein;
      totalC += m.carbs;
      totalF += m.fats;
    });

    plan.calories = totalCals;
    plan.protein = totalP;
    plan.carbs = totalC;
    plan.fats = totalF;

    await plan.save();
    return res.status(200).json(plan);
  } catch (error: any) {
    console.error('Error in meal regeneration:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
