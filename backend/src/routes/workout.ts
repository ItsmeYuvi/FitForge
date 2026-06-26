import { Router, Request, Response } from 'express';
import WorkoutPlan, { IWorkoutPlan, IWorkoutDay } from '../models/WorkoutPlan';
import WorkoutSession from '../models/WorkoutSession';
import FitnessProfile from '../models/FitnessProfile';

const router = Router();

// Programmatic fallback workout generator
function generateLocalWorkout(goal: string, exp: string, equip: string[], days: number): Partial<IWorkoutPlan> {
  const isGym = equip.includes('gym') || equip.includes('barbells') || equip.includes('dumbbells');
  
  let split = 'Full Body Overload';
  if (days >= 4) split = 'Upper / Lower Split';
  if (days >= 5) split = 'Push / Pull / Legs Split';

  const progressiveOverloadStrategy = exp === 'beginner' 
    ? 'Focus on linear progression: Add 2.5kg to compound lifts every 1-2 weeks if sets are completed with perfect form.'
    : 'Incorporate double progression: Work within a rep range (e.g., 8-12). Once all sets hit 12 reps, increase load and drop to 8 reps.';

  const warmupAdvice = '5-10 minutes of active dynamic stretching focusing on hip circles, arm swings, and lightweight warm-up sets.';
  const cooldownAdvice = '5-10 minutes of static deep tissue stretching, foam rolling prime movers, and diaphragmatic box breathing.';

  // Day generators
  const workoutPlan: IWorkoutDay[] = [];
  const exerciseCatalog = {
    chest: isGym ? { name: 'Barbell Bench Press', sets: 4, reps: '8-10 reps', rest: '90s', notes: 'Retract scapulae.' } : { name: 'Bodyweight Push-Ups', sets: 4, reps: '15-20 reps', rest: '60s', notes: 'Control descent.' },
    back: isGym ? { name: 'Seated Cable Rows', sets: 4, reps: '10-12 reps', rest: '75s', notes: 'Pull to lower abdomen.' } : { name: 'Towel Door Pull-ups', sets: 4, reps: '10-12 reps', rest: '60s', notes: 'Squeeze lats.' },
    legs: isGym ? { name: 'Goblet Squats', sets: 4, reps: '10 reps', rest: '90s', notes: 'Squat to depth.' } : { name: 'Bodyweight Air Squats', sets: 4, reps: '20 reps', rest: '60s', notes: 'Drive knees out.' },
    shoulders: { name: 'Dumbbell Lateral Raises', sets: 3, reps: '12-15 reps', rest: '60s', notes: 'Lead with elbows.' },
    arms: { name: 'Incline Bicep Curls', sets: 3, reps: '12 reps', rest: '60s', notes: 'Fully extend elbow.' },
    core: { name: 'Plank Holds', sets: 3, reps: '60s hold', rest: '45s', notes: 'Keep glutes locked.' }
  };

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  for (let i = 0; i < days; i++) {
    const dayName = weekdays[i];
    let focus = 'Strength & Muscle Load';
    let exercises = [];

    if (split.includes('Push / Pull / Legs')) {
      if (i % 3 === 0) {
        focus = 'Push Focus (Chest, Shoulders, Triceps)';
        exercises = [exerciseCatalog.chest, exerciseCatalog.shoulders, { name: 'Tricep Pushdowns', sets: 3, reps: '12 reps', rest: '60s' }];
      } else if (i % 3 === 1) {
        focus = 'Pull Focus (Back, Biceps, Rear Delts)';
        exercises = [exerciseCatalog.back, exerciseCatalog.arms, { name: 'Face Pulls', sets: 3, reps: '15 reps', rest: '60s' }];
      } else {
        focus = 'Legs & Core Focus';
        exercises = [exerciseCatalog.legs, exerciseCatalog.core, { name: 'Leg Curls', sets: 3, reps: '12 reps', rest: '60s' }];
      }
    } else if (split.includes('Upper / Lower')) {
      if (i % 2 === 0) {
        focus = 'Upper Body Overload';
        exercises = [exerciseCatalog.chest, exerciseCatalog.back, exerciseCatalog.shoulders];
      } else {
        focus = 'Lower Body & Core';
        exercises = [exerciseCatalog.legs, exerciseCatalog.core, { name: 'Lunges', sets: 3, reps: '12 reps/leg', rest: '60s' }];
      }
    } else {
      focus = 'Full Body Conditioning';
      exercises = [exerciseCatalog.legs, exerciseCatalog.chest, exerciseCatalog.back, exerciseCatalog.core];
    }

    workoutPlan.push({ day: dayName, focus, exercises });
  }

  // Inject rest days for non-active days
  for (let i = days; i < 7; i++) {
    workoutPlan.push({
      day: weekdays[i],
      focus: 'Active Recovery & Stretching',
      exercises: [{ name: 'LISS Walking / Stretching', sets: 1, reps: '30 mins', rest: 'N/A', notes: 'Zone 1 heart rate.' }]
    });
  }

  return { workoutSplit: split, progressiveOverloadStrategy, warmupAdvice, cooldownAdvice, workoutPlan };
}

// 1. Generate workout plan via AI
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { clerkId } = req.body;
    if (!clerkId) return res.status(400).json({ error: 'Clerk ID is required' });

    // Fetch user profile
    const profile = await FitnessProfile.findOne({ clerkId });
    if (!profile) {
      return res.status(404).json({ error: 'Fitness profile not completed. Complete onboarding first.' });
    }

    let planData: Partial<IWorkoutPlan> = {};
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (apiKey && apiKey !== 'YOUR_OPENROUTER_API_KEY') {
      try {
        const prompt = `You are FitForge AI, a futuristic digital training simulator. 
Generate a custom, professional workout program in strict JSON format for this profile:
- Goal: ${profile.goal}
- Experience Level: ${profile.experienceLevel}
- Available Equipment: ${profile.availableEquipment.join(', ')}
- Workout Frequency: ${profile.workoutDays} days/week
- Target Session Duration: ${profile.sessionDuration} minutes
- Injuries/Restrictions: ${profile.injuries || 'None'}

Return ONLY a raw JSON string conforming to this structure:
{
  "workoutSplit": "PPL, Upper/Lower, or Full Body",
  "progressiveOverloadStrategy": "Specific strategy for tracking and load increases based on experience level",
  "warmupAdvice": "Pre-workout mobility steps",
  "cooldownAdvice": "Post-workout recovery steps",
  "workoutPlan": [
    {
      "day": "Monday",
      "focus": "Daily training target focus description",
      "exercises": [
        { "name": "Exercise name", "sets": 4, "reps": "8-10 reps or 60s hold", "rest": "90s", "notes": "Specific clinical form tip" }
      ]
    }
  ]
}
Cover all 7 days of the week (Monday-Sunday). Rest days should focus on recovery/LISS. Avoid wrapping in markdown ticks.`;

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
        console.error('Error generating AI workout, running local fallback:', err);
      }
    }

    // Run fallback logic if empty
    if (!planData.workoutPlan || !planData.workoutPlan.length) {
      planData = generateLocalWorkout(profile.goal, profile.experienceLevel, profile.availableEquipment, profile.workoutDays);
    }

    // Deactivate previous plans
    await WorkoutPlan.updateMany({ clerkId }, { isActive: false });

    // Save new plan
    const newPlan = new WorkoutPlan({
      clerkId,
      workoutSplit: planData.workoutSplit,
      progressiveOverloadStrategy: planData.progressiveOverloadStrategy,
      warmupAdvice: planData.warmupAdvice,
      cooldownAdvice: planData.cooldownAdvice,
      workoutPlan: planData.workoutPlan,
      isActive: true
    });

    await newPlan.save();
    return res.status(200).json(newPlan);
  } catch (error: any) {
    console.error('Error in workout generation route:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 2. Fetch Active Workout Plan
router.get('/:clerkId', async (req: Request, res: Response) => {
  try {
    const plan = await WorkoutPlan.findOne({ clerkId: req.params.clerkId, isActive: true });
    if (!plan) return res.status(404).json({ error: 'No active workout plan found.' });
    return res.status(200).json(plan);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch active plan' });
  }
});

// 3. Edit Active Workout Plan
router.put('/edit', async (req: Request, res: Response) => {
  try {
    const { id, workoutPlan } = req.body;
    const plan = await WorkoutPlan.findByIdAndUpdate(id, { workoutPlan }, { new: true });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    return res.status(200).json(plan);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update plan' });
  }
});

// 4. Log completed session
router.post('/log', async (req: Request, res: Response) => {
  try {
    const { clerkId, workoutPlanId, dayName, focus, duration, loggedExercises } = req.body;
    
    if (!clerkId || !dayName || !focus || !duration || !loggedExercises) {
      return res.status(400).json({ error: 'All logged variables are required.' });
    }

    const session = new WorkoutSession({
      clerkId,
      workoutPlanId,
      dayName,
      focus,
      duration: Number(duration),
      loggedExercises
    });

    await session.save();
    return res.status(200).json(session);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to log session' });
  }
});

// 5. Fetch Session Logs History
router.get('/sessions/:clerkId', async (req: Request, res: Response) => {
  try {
    const sessions = await WorkoutSession.find({ clerkId: req.params.clerkId }).sort({ createdAt: -1 });
    return res.status(200).json(sessions);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch session history' });
  }
});

export default router;
