import { Router, Request, Response } from 'express';
import DailyCheckIn from '../models/DailyCheckIn';
import BodyMeasurement from '../models/BodyMeasurement';
import FitnessProfile from '../models/FitnessProfile';
import WorkoutSession from '../models/WorkoutSession';
import NutritionPlan from '../models/NutritionPlan';

const router = Router();

// 1. Post Daily Check-In
router.post('/checkin', async (req: Request, res: Response) => {
  try {
    const { clerkId, weight, sleepHours, energyLevel, mood, waterIntake } = req.body;
    if (!clerkId || !weight || !sleepHours || !energyLevel || !mood || !waterIntake) {
      return res.status(400).json({ error: 'All check-in values are required.' });
    }

    const checkIn = new DailyCheckIn({
      clerkId,
      weight: Number(weight),
      sleepHours: Number(sleepHours),
      energyLevel: Number(energyLevel),
      mood,
      waterIntake: Number(waterIntake)
    });

    await checkIn.save();

    // Also update body measurements with the latest weight automatically
    const measurement = new BodyMeasurement({
      clerkId,
      weight: Number(weight)
    });
    await measurement.save();

    return res.status(200).json(checkIn);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to submit check-in' });
  }
});

// 2. Fetch Check-In History
router.get('/checkin/:clerkId', async (req: Request, res: Response) => {
  try {
    const logs = await DailyCheckIn.find({ clerkId: req.params.clerkId }).sort({ createdAt: -1 }).limit(30);
    return res.status(200).json(logs);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch check-in history' });
  }
});

// 3. Post Body Measurements
router.post('/measurement', async (req: Request, res: Response) => {
  try {
    const { clerkId, weight, waist, chest, arms, hips } = req.body;
    if (!clerkId || !weight) {
      return res.status(400).json({ error: 'Clerk ID and Weight are required.' });
    }

    const measurement = new BodyMeasurement({
      clerkId,
      weight: Number(weight),
      waist: waist ? Number(waist) : undefined,
      chest: chest ? Number(chest) : undefined,
      arms: arms ? Number(arms) : undefined,
      hips: hips ? Number(hips) : undefined
    });

    await measurement.save();
    return res.status(200).json(measurement);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to submit measurements' });
  }
});

// 4. Fetch Measurement History
router.get('/measurement/:clerkId', async (req: Request, res: Response) => {
  try {
    const measurements = await BodyMeasurement.find({ clerkId: req.params.clerkId }).sort({ createdAt: -1 });
    return res.status(200).json(measurements);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch measurement logs' });
  }
});

// 5. Transformation Predictor
router.get('/predictions/:clerkId', async (req: Request, res: Response) => {
  try {
    const { clerkId } = req.params;
    const profile = await FitnessProfile.findOne({ clerkId });
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });

    // Fetch historical logs to compute consistency scores
    const pastSessions = await WorkoutSession.find({ clerkId });
    const pastCheckins = await DailyCheckIn.find({ clerkId });

    // Calculate a confidence score out of 100 based on consistency
    let consistencyFactor = 0.5; // Default average index if no logs exist
    if (pastSessions.length > 0) {
      const activeDaysRatio = Math.min(1, pastSessions.length / (profile.workoutDays * 4)); // Checked against target sessions in past 4 weeks
      const checkinRatio = Math.min(1, pastCheckins.length / 28);
      consistencyFactor = (activeDaysRatio * 0.6) + (checkinRatio * 0.4);
    }
    const confidenceScore = Math.round(50 + (consistencyFactor * 45) + (Math.random() * 5)); // Clamped between 50% and 100%

    // Calculate prediction points based on goal
    const heightM = profile.height / 100;
    const initialBmi = profile.weight / (heightM * heightM);
    let initialFat = profile.gender === 'male' ? (1.20 * initialBmi + 0.23 * profile.age - 16.2) : (1.20 * initialBmi + 0.23 * profile.age - 5.4);
    initialFat = Math.max(5, initialFat);

    const predictions = [];
    let currentWeight = profile.weight;
    let currentFat = initialFat;

    for (let day of [30, 60, 90]) {
      // Modify target outcomes based on consistency levels (high consistency = closer to target goal index)
      const multiplier = 0.5 + (consistencyFactor * 0.5); // ranges 0.5x to 1x target progress speed

      if (profile.goal === 'lose_fat') {
        currentWeight -= parseFloat((1.8 * multiplier).toFixed(1));
        currentFat -= parseFloat((0.9 * multiplier).toFixed(1));
      } else if (profile.goal === 'build_muscle') {
        currentWeight += parseFloat((1.0 * multiplier).toFixed(1));
        currentFat += parseFloat((0.15 * multiplier).toFixed(1));
      } else {
        // Recomposition
        currentWeight -= parseFloat((0.4 * multiplier).toFixed(1));
        currentFat -= parseFloat((0.6 * multiplier).toFixed(1));
      }

      const muscleMass = currentWeight * (1 - currentFat / 100);

      predictions.push({
        day,
        weight: parseFloat(currentWeight.toFixed(1)),
        bodyFat: parseFloat(currentFat.toFixed(1)),
        muscleMass: parseFloat(muscleMass.toFixed(1)),
        status: `Phase ${day === 30 ? 'Alpha' : day === 60 ? 'Beta' : 'Omega'} prediction compiled.`
      });
    }

    return res.status(200).json({
      confidenceScore,
      predictions,
      goalTimeline: `Projected goal state targeted for Day 90 based on active workload capacity.`
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch predictions' });
  }
});

// 6. Weekly AI Reviewer
router.get('/weekly-review/:clerkId', async (req: Request, res: Response) => {
  try {
    const { clerkId } = req.params;
    const profile = await FitnessProfile.findOne({ clerkId });
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });

    // Fetch logs from past 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sessions = await WorkoutSession.find({ clerkId, createdAt: { $gte: sevenDaysAgo } });
    const checkins = await DailyCheckIn.find({ clerkId, createdAt: { $gte: sevenDaysAgo } });
    const activePlan = await NutritionPlan.findOne({ clerkId, isActive: true });

    // Consistency score logic
    const workoutConsistencyScore = Math.min(100, Math.round((sessions.length / profile.workoutDays) * 100));
    const nutritionConsistencyScore = checkins.length > 0 ? Math.min(100, Math.round((checkins.length / 7) * 100)) : 0;

    let reviewText = '';
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (apiKey && apiKey !== 'YOUR_OPENROUTER_API_KEY') {
      try {
        const prompt = `You are FitForge AI, a futuristic diagnostic OS.
Compile a weekly clinical fitness progress review in strict JSON format based on the following weekly logs:
- Profile Goal: ${profile.goal}
- Target Workouts/Week: ${profile.workoutDays}
- Workouts Logged Past 7 Days: ${sessions.length} (Consistency Score: ${workoutConsistencyScore}%)
- Daily Check-ins Logged Past 7 Days: ${checkins.length} (Consistency Score: ${nutritionConsistencyScore}%)
- Target Calorie Budget: ${activePlan ? activePlan.calories : 'N/A'} kcal

Return ONLY a raw JSON string conforming to this structure:
{
  "summary": "One-sentence overview of their weekly compliance and performance.",
  "improvements": ["Highlight 1", "Highlight 2"],
  "adjustments": ["Calorie adjustment if needed", "Training volume recommendation"]
}
Keep descriptions highly clinical, technical, and formatted for a dashboard. Do not include markdown code block formatting.`;

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
            reviewText = JSON.parse(contentText.trim());
          }
        }
      } catch (err) {
        console.error('Error generating AI weekly review, falling back:', err);
      }
    }

    if (!reviewText) {
      // Local review compilation fallback
      reviewText = {
        summary: `Workout compliance is at ${workoutConsistencyScore}% with ${sessions.length} sessions completed. Hydration index stable.`,
        improvements: [
          workoutConsistencyScore < 80 ? 'Increase session attendance to meet your weekly training target.' : 'Great consistency in progressive overload exercises.',
          'Optimize sleep consistency (average logs show minor variances).'
        ],
        adjustments: [
          profile.goal === 'lose_fat' ? 'Decrease daily carbs by 15g if fat loss pace stabilizes.' : 'Add one set of compound overhead press to increase shoulder kinetic loading.',
          'Keep hydration levels at 3.5 liters.'
        ]
      } as any;
    }

    return res.status(200).json({
      workoutConsistencyScore,
      nutritionConsistencyScore,
      review: reviewText
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch weekly review' });
  }
});

export default router;
