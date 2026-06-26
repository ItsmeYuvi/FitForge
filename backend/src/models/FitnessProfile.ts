import { Schema, model, Document } from 'mongoose';

export interface IFitnessProfile extends Document {
  clerkId: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  goal: string; // lose_fat, build_muscle, recomposition
  experienceLevel: string; // beginner, intermediate, advanced
  availableEquipment: string[]; // gym, dumbbells, barbells, bodyweight, etc.
  workoutDays: number; // 2, 3, 4, 5, 6
  sessionDuration: number; // in minutes
  dietaryPreference: string; // vegetarian, vegan, non_vegetarian, etc.
  activityLevel: string; // sedentary, light, moderate, active, very_active
  injuries: string;
  createdAt: Date;
}

const FitnessProfileSchema = new Schema<IFitnessProfile>({
  clerkId: { type: String, required: true, unique: true, index: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  goal: { type: String, required: true },
  experienceLevel: { type: String, required: true },
  availableEquipment: { type: [String], required: true },
  workoutDays: { type: Number, required: true },
  sessionDuration: { type: Number, required: true },
  dietaryPreference: { type: String, required: true },
  activityLevel: { type: String, required: true },
  injuries: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export default model<IFitnessProfile>('FitnessProfile', FitnessProfileSchema);
