import { Router, Request, Response } from 'express';
import UserBlueprint, { IUserBlueprint, IWorkoutDay, INutritionPlan, IPredictionPoint } from '../models/UserBlueprint';

const router = Router();

// Calculate standard metrics
function calculateMetrics(
  age: number,
  gender: string,
  height: number,
  weight: number,
  activityLevel: string,
  goal: string
) {
  // BMI
  const heightM = height / 100;
  const bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));

  // Body Fat % (Adult formula estimation based on BMI, age, and gender)
  let bodyFatEst = 0;
  if (gender.toLowerCase() === 'male') {
    bodyFatEst = parseFloat((1.20 * bmi + 0.23 * age - 16.2).toFixed(1));
    bodyFatEst = Math.max(3, Math.min(bodyFatEst, 50)); // Clamp to realistic human values
  } else {
    bodyFatEst = parseFloat((1.20 * bmi + 0.23 * age - 5.4).toFixed(1));
    bodyFatEst = Math.max(8, Math.min(bodyFatEst, 55));
  }

  // BMR (Mifflin-St Jeor)
  let bmr = 0;
  if (gender.toLowerCase() === 'male') {
    bmr = Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  } else {
    bmr = Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  }

  // TDEE
  let multiplier = 1.2;
  switch (activityLevel) {
    case 'sedentary': multiplier = 1.2; break;
    case 'light': multiplier = 1.375; break;
    case 'moderate': multiplier = 1.55; break;
    case 'active': multiplier = 1.725; break;
    case 'very_active': multiplier = 1.9; break;
  }
  const tdee = Math.round(bmr * multiplier);

  return { bmi, bodyFatEst, bmr, tdee };
}

// Generate fallback blueprint logic based on inputs
function generateLocalPlan(
  age: number,
  gender: string,
  height: number,
  weight: number,
  activityLevel: string,
  goal: string,
  bmi: number,
  bodyFatEst: number,
  bmr: number,
  tdee: number
): Partial<IUserBlueprint> {
  // 1. Health Analysis
  let healthAnalysis = `Based on your biometrics, your BMI is ${bmi} (${bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy' : bmi < 30 ? 'Overweight' : 'Obese'}). `;
  if (goal === 'lose_fat') {
    healthAnalysis += `We recommend a caloric deficit of 400-500 kcal from your TDEE (${tdee} kcal). Your metabolic rate is primed for steady lipid oxidization.`;
  } else if (goal === 'build_muscle') {
    healthAnalysis += `We recommend a lean surplus of 250-350 kcal above your TDEE (${tdee} kcal) to facilitate protein synthesis and muscular hypertrophy.`;
  } else {
    healthAnalysis += `A maintenance calorie intake is recommended to support performance and recovery while stabilizing body composition.`;
  }

  // 2. Workout Plan
  let workoutPlan: IWorkoutDay[] = [];
  if (goal === 'lose_fat' || goal === 'endurance') {
    workoutPlan = [
      {
        day: 'Monday',
        focus: 'Full Body HIIT & Core',
        exercises: [
          { name: 'Dumbbell Thrusters', sets: 4, reps: '12-15 reps', rest: '45s', notes: 'Keep core tight at the top.' },
          { name: 'Kettlebell Swings', sets: 3, reps: '20 reps', rest: '45s', notes: 'Hinge at the hips, explode forward.' },
          { name: 'Hanging Knee Raises', sets: 3, reps: '15 reps', rest: '30s', notes: 'Avoid swinging.' }
        ]
      },
      {
        day: 'Tuesday',
        focus: 'Steady-State Cardio & Flexibility',
        exercises: [
          { name: 'Incline Treadmill Walk', sets: 1, reps: '40 mins', rest: 'N/A', notes: 'Maintain 12% incline, 3.2 mph.' },
          { name: 'Dynamic Yoga Flow', sets: 1, reps: '20 mins', rest: 'N/A', notes: 'Focus on hamstring and hip mobility.' }
        ]
      },
      {
        day: 'Wednesday',
        focus: 'Upper Body Push-Pull Circuit',
        exercises: [
          { name: 'Push-Ups (Weighted if possible)', sets: 4, reps: '12-15 reps', rest: '60s', notes: 'Control the descent.' },
          { name: 'Lat Pulldowns', sets: 4, reps: '12 reps', rest: '60s', notes: 'Squeeze shoulder blades.' },
          { name: 'Dumbbell Shoulder Press', sets: 3, reps: '12 reps', rest: '60s', notes: 'Fully lock out at top.' }
        ]
      },
      {
        day: 'Thursday',
        focus: 'Active Recovery',
        exercises: [
          { name: 'Zone 2 Cycling', sets: 1, reps: '30 mins', rest: 'N/A', notes: 'Heart rate kept between 120-135 bpm.' }
        ]
      },
      {
        day: 'Friday',
        focus: 'Lower Body Sculpt & Endurance',
        exercises: [
          { name: 'Goblet Squats', sets: 4, reps: '15 reps', rest: '60s', notes: 'Drive knees outward.' },
          { name: 'Walking Lunges', sets: 3, reps: '24 steps', rest: '45s', notes: '12 steps per leg.' },
          { name: 'Romanian Deadlifts', sets: 3, reps: '12 reps', rest: '60s', notes: 'Feel the stretch in the hamstrings.' }
        ]
      },
      {
        day: 'Saturday',
        focus: 'LISS Cardio & ABS Core',
        exercises: [
          { name: 'Rowing Machine', sets: 1, reps: '25 mins', rest: 'N/A', notes: 'Maintain steady pace.' },
          { name: 'Plank Holds', sets: 3, reps: '60s hold', rest: '30s', notes: 'Form a straight line from head to toe.' }
        ]
      },
      {
        day: 'Sunday',
        focus: 'Rest & Deep Tissue Stretching',
        exercises: [
          { name: 'Foam Rolling & Mobility', sets: 1, reps: '15 mins', rest: 'N/A', notes: 'Focus on tight areas.' }
        ]
      }
    ];
  } else {
    // Hypertrophy / Strength Focus
    workoutPlan = [
      {
        day: 'Monday',
        focus: 'Chest & Triceps Hypertrophy',
        exercises: [
          { name: 'Barbell Bench Press', sets: 4, reps: '8-10 reps', rest: '90s', notes: 'Exhale as you push.' },
          { name: 'Incline Dumbbell Flyes', sets: 3, reps: '12 reps', rest: '75s', notes: 'Focus on the stretch at the bottom.' },
          { name: 'Tricep Overhead Extensions', sets: 3, reps: '12-15 reps', rest: '60s', notes: 'Keep elbows tucked in.' }
        ]
      },
      {
        day: 'Tuesday',
        focus: 'Back & Biceps Power',
        exercises: [
          { name: 'Conventional Deadlifts', sets: 3, reps: '5-6 reps', rest: '120s', notes: 'Keep spine neutral.' },
          { name: 'Weighted Pull-Ups', sets: 4, reps: '8 reps', rest: '90s', notes: 'Go to full extension.' },
          { name: 'Barbell Bicep Curls', sets: 3, reps: '10-12 reps', rest: '60s', notes: 'Avoid swinging the body.' }
        ]
      },
      {
        day: 'Wednesday',
        focus: 'Legs & Quads Focus',
        exercises: [
          { name: 'Barbell Back Squats', sets: 4, reps: '8 reps', rest: '120s', notes: 'Squat to parallel or lower.' },
          { name: 'Leg Press', sets: 3, reps: '12 reps', rest: '90s', notes: 'Do not lock knees at the top.' },
          { name: 'Standing Calf Raises', sets: 4, reps: '15-20 reps', rest: '45s', notes: 'Hold squeeze at peak.' }
        ]
      },
      {
        day: 'Thursday',
        focus: 'Shoulders & Traps Hypertrophy',
        exercises: [
          { name: 'Military Press', sets: 4, reps: '8 reps', rest: '90s', notes: 'Brace your abs.' },
          { name: 'Dumbbell Lateral Raises', sets: 4, reps: '15 reps', rest: '60s', notes: 'Control the negatives.' },
          { name: 'Dumbbell Shrugs', sets: 3, reps: '12-15 reps', rest: '60s', notes: 'Squeeze traps at the top.' }
        ]
      },
      {
        day: 'Friday',
        focus: 'Posterior Chain Legs & Core',
        exercises: [
          { name: 'Romanian Deadlifts', sets: 4, reps: '10 reps', rest: '90s', notes: 'Hinge hips backward.' },
          { name: 'Hamstring Curls', sets: 3, reps: '12 reps', rest: '60s', notes: 'Squeeze at full contraction.' },
          { name: 'Ab Wheel Rollouts', sets: 3, reps: '12 reps', rest: '45s', notes: 'Do not arch lower back.' }
        ]
      },
      {
        day: 'Saturday',
        focus: 'Arm Hypertrophy Pump',
        exercises: [
          { name: 'Dips (Weighted)', sets: 3, reps: '10 reps', rest: '75s', notes: 'Lean slightly forward.' },
          { name: 'Incline Dumbbell Curls', sets: 3, reps: '12 reps', rest: '60s', notes: 'Stretch biceps fully.' },
          { name: 'Cable Tricep Pushdowns', sets: 3, reps: '15 reps', rest: '60s', notes: 'Use rope attachment.' }
        ]
      },
      {
        day: 'Sunday',
        focus: 'Rest & Active Recovery Walk',
        exercises: [
          { name: 'Outdoor Walk', sets: 1, reps: '30-45 mins', rest: 'N/A', notes: 'Enjoy nature, speed recovery.' }
        ]
      }
    ];
  }

  // 3. Nutrition Plan
  let calories = tdee;
  let protein = Math.round(weight * 2.2); // ~1g per lb
  let fats = Math.round((weight * 0.9)); // ~0.4g per lb
  let carbs = 0;

  if (goal === 'lose_fat') {
    calories = Math.round(tdee - 500);
    carbs = Math.round((calories - (protein * 4) - (fats * 9)) / 4);
  } else if (goal === 'build_muscle') {
    calories = Math.round(tdee + 350);
    carbs = Math.round((calories - (protein * 4) - (fats * 9)) / 4);
  } else {
    carbs = Math.round((calories - (protein * 4) - (fats * 9)) / 4);
  }

  const nutritionPlan: INutritionPlan = {
    calories,
    protein,
    carbs,
    fats,
    advice: `Focus on drinking 3-4 liters of water daily. Ensure you consume 30-40g of protein within 2 hours post-workout. Avoid refined sugars.`,
    meals: [
      {
        name: 'Meal 1: Fueling Breakfast',
        description: 'Scrambled eggs, egg whites, oatmeal cooked in water, topped with fresh blueberries.',
        macros: `${Math.round(protein * 0.25)}g P / ${Math.round(carbs * 0.25)}g C / ${Math.round(fats * 0.25)}g F`
      },
      {
        name: 'Meal 2: Post-Workout Lunch',
        description: 'Grilled chicken breast, brown rice or quinoa, steamed broccoli with olive oil.',
        macros: `${Math.round(protein * 0.35)}g P / ${Math.round(carbs * 0.35)}g C / ${Math.round(fats * 0.25)}g F`
      },
      {
        name: 'Meal 3: Mid-Day Power Snack',
        description: 'Whey protein isolate shake mixed with water, a handful of raw almonds, and one banana.',
        macros: `${Math.round(protein * 0.15)}g P / ${Math.round(carbs * 0.20)}g C / ${Math.round(fats * 0.25)}g F`
      },
      {
        name: 'Meal 4: Recovering Dinner',
        description: 'Baked salmon or extra lean beef, sweet potatoes, mixed green salad with avocado dressing.',
        macros: `${Math.round(protein * 0.25)}g P / ${Math.round(carbs * 0.20)}g C / ${Math.round(fats * 0.25)}g F`
      }
    ]
  };

  // 4. Predictions (30, 60, 90 days)
  const predictions: IPredictionPoint[] = [];
  let currentWeight = weight;
  let currentBodyFat = bodyFatEst;
  let currentMuscleMass = Math.round(weight * (1 - bodyFatEst / 100));

  for (let day of [30, 60, 90]) {
    if (goal === 'lose_fat') {
      currentWeight -= parseFloat((1.5 + Math.random() * 0.8).toFixed(1));
      currentBodyFat -= parseFloat((0.8 + Math.random() * 0.4).toFixed(1));
      currentMuscleMass = Math.max(currentMuscleMass - 0.2, currentMuscleMass);
    } else if (goal === 'build_muscle') {
      currentWeight += parseFloat((0.8 + Math.random() * 0.5).toFixed(1));
      currentMuscleMass += parseFloat((0.6 + Math.random() * 0.4).toFixed(1));
      currentBodyFat += parseFloat((0.1 + Math.random() * 0.2).toFixed(1));
    } else {
      // Recomposition
      currentWeight += parseFloat(((-0.2) + Math.random() * 0.4).toFixed(1));
      currentBodyFat -= parseFloat((0.3 + Math.random() * 0.2).toFixed(1));
      currentMuscleMass += parseFloat((0.2 + Math.random() * 0.2).toFixed(1));
    }

    predictions.push({
      day,
      weight: parseFloat(currentWeight.toFixed(1)),
      bodyFat: parseFloat(currentBodyFat.toFixed(1)),
      muscleMass: parseFloat(currentMuscleMass.toFixed(1)),
      status: `Day ${day}: Metamorphosis phase ${day === 30 ? 'Alpha' : day === 60 ? 'Beta' : 'Omega'}`
    });
  }

  return {
    healthAnalysis,
    workoutPlan,
    nutritionPlan,
    predictions
  };
}

// Generate blueprint endpoint
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { age, gender, height, weight, activityLevel, goal } = req.body;

    if (!age || !gender || !height || !weight || !activityLevel || !goal) {
      return res.status(400).json({ error: 'All biometric parameters are required.' });
    }

    // Programmatic calculations
    const calculated = calculateMetrics(
      Number(age),
      gender,
      Number(height),
      Number(weight),
      activityLevel,
      goal
    );

    let healthAnalysis = '';
    let workoutPlan: IWorkoutDay[] = [];
    let nutritionPlan: INutritionPlan = { calories: 0, protein: 0, carbs: 0, fats: 0, advice: '', meals: [] };
    let predictions: IPredictionPoint[] = [];

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (apiKey && apiKey !== 'YOUR_OPENROUTER_API_KEY') {
      try {
        const prompt = `You are FitForge AI, a futuristic digital fitness intelligence operating system.
Generate a custom fitness and nutrition blueprint in strict JSON format based on these user parameters:
- Age: ${age}
- Gender: ${gender}
- Height: ${height} cm
- Weight: ${weight} kg
- Activity Level: ${activityLevel}
- Fitness Goal: ${goal}
- Precalculated BMI: ${calculated.bmi}
- Precalculated Estimated Body Fat: ${calculated.bodyFatEst}%
- Precalculated BMR: ${calculated.bmr} kcal
- Precalculated TDEE: ${calculated.tdee} kcal

Respond ONLY with a JSON object. Do not include markdown code block formatting like \`\`\`json. Return a single raw JSON string conforming to this structure:
{
  "healthAnalysis": "A short (2-3 sentences) futuristic, highly clinical health synthesis of this profile and meta-recommendation.",
  "workoutPlan": [
    {
      "day": "Monday",
      "focus": "Focus description",
      "exercises": [
        { "name": "Exercise Name", "sets": 4, "reps": "8-10 reps", "rest": "90s", "notes": "Form tip" }
      ]
    }
  ],
  "nutritionPlan": {
    "calories": 2500,
    "protein": 180,
    "carbs": 250,
    "fats": 70,
    "advice": "General nutrition coaching tip",
    "meals": [
      { "name": "Meal name", "description": "High protein food layout", "macros": "50g P / 60g C / 15g F" }
    ]
  },
  "predictions": [
    { "day": 30, "weight": 78.5, "bodyFat": 17.5, "muscleMass": 64.2, "status": "Steady adapt phase" },
    { "day": 60, "weight": 77.0, "bodyFat": 16.0, "muscleMass": 64.5, "status": "Optimized power index" },
    { "day": 90, "weight": 75.5, "bodyFat": 14.2, "muscleMass": 64.8, "status": "Peak physical twin achieved" }
  ]
}

Ensure the training schedule covers Monday through Sunday (with rest/recovery integrated). Make the descriptions sound ultra-premium, technical, and scientific.`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'FitForge AI'
          },
          body: JSON.stringify({
            model: 'deepseek/deepseek-chat-v3',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' }
          })
        });

        if (response.ok) {
          const data = await response.json() as any;
          const responseText = data.choices[0]?.message?.content;
          if (responseText) {
            const parsed = JSON.parse(responseText.trim());
            healthAnalysis = parsed.healthAnalysis;
            workoutPlan = parsed.workoutPlan;
            nutritionPlan = parsed.nutritionPlan;
            predictions = parsed.predictions;
          }
        }
      } catch (err) {
        console.error('Error generating blueprint via OpenRouter, running local fallback logic:', err);
      }
    }

    // Run fallback generator if fields are still empty (e.g. key missing or API call failed)
    if (!healthAnalysis || !workoutPlan.length) {
      const local = generateLocalPlan(
        Number(age),
        gender,
        Number(height),
        Number(weight),
        activityLevel,
        goal,
        calculated.bmi,
        calculated.bodyFatEst,
        calculated.bmr,
        calculated.tdee
      );
      healthAnalysis = local.healthAnalysis || '';
      workoutPlan = local.workoutPlan || [];
      nutritionPlan = local.nutritionPlan as INutritionPlan;
      predictions = local.predictions || [];
    }

    // Save to MongoDB if connected
    const blueprintData = {
      age: Number(age),
      gender,
      height: Number(height),
      weight: Number(weight),
      activityLevel,
      goal,
      bmi: calculated.bmi,
      bodyFatEst: calculated.bodyFatEst,
      bmr: calculated.bmr,
      tdee: calculated.tdee,
      healthAnalysis,
      workoutPlan,
      nutritionPlan,
      predictions
    };

    let savedId = null;
    try {
      if (UserBlueprint.db.readyState === 1) {
        const saved = new UserBlueprint(blueprintData);
        await saved.save();
        savedId = saved._id;
      }
    } catch (dbErr) {
      console.warn('Mongoose save omitted (running database-free mode):', dbErr);
    }

    return res.status(200).json({
      id: savedId,
      ...blueprintData
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Fetch blueprint by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const blueprint = await UserBlueprint.findById(req.params.id);
    if (!blueprint) {
      return res.status(404).json({ error: 'Blueprint not found' });
    }
    return res.status(200).json(blueprint);
  } catch (error: any) {
    console.error('Error fetching blueprint:', error);
    return res.status(500).json({ error: 'Failed to fetch blueprint' });
  }
});

export default router;
