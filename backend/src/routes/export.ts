import { Router, Request, Response } from 'express';
import FitnessProfile from '../models/FitnessProfile';
import WorkoutPlan from '../models/WorkoutPlan';
import NutritionPlan from '../models/NutritionPlan';
import BodyMeasurement from '../models/BodyMeasurement';
import DailyCheckIn from '../models/DailyCheckIn';
import WorkoutSession from '../models/WorkoutSession';

const router = Router();

// Compile full user fitness profile dossier
router.get('/:clerkId', async (req: Request, res: Response) => {
  try {
    const { clerkId } = req.params;

    // Concurrently fetch all user assets
    const [profile, workout, nutrition, measurements, checkins, sessions] = await Promise.all([
      FitnessProfile.findOne({ clerkId }),
      WorkoutPlan.findOne({ clerkId, isActive: true }),
      NutritionPlan.findOne({ clerkId, isActive: true }),
      BodyMeasurement.find({ clerkId }).sort({ createdAt: -1 }).limit(10),
      DailyCheckIn.find({ clerkId }).sort({ createdAt: -1 }).limit(7),
      WorkoutSession.find({ clerkId }).sort({ createdAt: -1 }).limit(10)
    ]);

    if (!profile) {
      return res.status(404).json({ error: 'Fitness profile not completed. Complete onboarding first.' });
    }

    // Return the consolidated dossier payload
    return res.status(200).json({
      clerkId,
      profile: {
        age: profile.age,
        gender: profile.gender,
        height: profile.height,
        weight: profile.weight,
        goal: profile.goal,
        experienceLevel: profile.experienceLevel,
        availableEquipment: profile.availableEquipment,
        workoutDays: profile.workoutDays,
        sessionDuration: profile.sessionDuration,
        dietaryPreference: profile.dietaryPreference,
        activityLevel: profile.activityLevel,
        injuries: profile.injuries || 'None',
        createdAt: profile.createdAt
      },
      workout: workout ? {
        workoutSplit: workout.workoutSplit,
        progressiveOverloadStrategy: workout.progressiveOverloadStrategy,
        warmupAdvice: workout.warmupAdvice,
        cooldownAdvice: workout.cooldownAdvice,
        workoutPlan: workout.workoutPlan
      } : null,
      nutrition: nutrition ? {
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fats: nutrition.fats,
        dietaryPreference: nutrition.dietaryPreference,
        meals: nutrition.meals
      } : null,
      progress: {
        measurements: measurements.map(m => ({
          weight: m.weight,
          waist: m.waist || null,
          chest: m.chest || null,
          arms: m.arms || null,
          hips: m.hips || null,
          createdAt: m.createdAt
        })),
        checkins: checkins.map(c => ({
          weight: c.weight,
          sleepHours: c.sleepHours,
          energyLevel: c.energyLevel,
          mood: c.mood,
          waterIntake: c.waterIntake,
          createdAt: c.createdAt
        })),
        sessionsCount: sessions.length
      },
      exportedAt: new Date()
    });

  } catch (error: any) {
    console.error('Error generating export dossier:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
