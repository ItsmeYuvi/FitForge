import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import FitnessProfile from '../models/FitnessProfile';

const router = Router();

// Submit/Update Fitness Profile
router.post('/', async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Database connection is offline. Please verify MongoDB Atlas IP whitelisting (0.0.0.0/0) or credentials in Railway env.' });
    }
    const {
      clerkId,
      age,
      gender,
      height,
      weight,
      goal,
      experienceLevel,
      availableEquipment,
      workoutDays,
      sessionDuration,
      dietaryPreference,
      activityLevel,
      injuries
    } = req.body;

    if (!clerkId || !age || !gender || !height || !weight || !goal || !experienceLevel || !availableEquipment || !workoutDays || !sessionDuration || !dietaryPreference || !activityLevel) {
      return res.status(400).json({ error: 'All primary fitness variables are required.' });
    }

    // Find and update if exists, else create new
    const profile = await FitnessProfile.findOneAndUpdate(
      { clerkId },
      {
        age: Number(age),
        gender,
        height: Number(height),
        weight: Number(weight),
        goal,
        experienceLevel,
        availableEquipment,
        workoutDays: Number(workoutDays),
        sessionDuration: Number(sessionDuration),
        dietaryPreference,
        activityLevel,
        injuries: injuries || ''
      },
      { new: true, upsert: true }
    );

    return res.status(200).json(profile);
  } catch (error: any) {
    console.error('Error saving fitness profile:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Fetch Profile by Clerk ID
router.get('/:clerkId', async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Database connection is offline. Please verify MongoDB Atlas IP whitelisting (0.0.0.0/0) or credentials in Railway env.' });
    }
    const profile = await FitnessProfile.findOne({ clerkId: req.params.clerkId });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    return res.status(200).json(profile);
  } catch (error: any) {
    console.error('Error fetching fitness profile:', error);
    return res.status(500).json({ error: 'Failed to fetch fitness profile' });
  }
});

export default router;
