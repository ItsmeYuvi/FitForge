import { Schema, model, Document } from 'mongoose';

export interface IDailyCheckIn extends Document {
  clerkId: string;
  weight: number; // in kg
  sleepHours: number;
  energyLevel: number; // Scale 1 to 10
  mood: string; // energetic, focused, stable, fatigued, stressed, etc.
  waterIntake: number; // in liters
  createdAt: Date;
}

const DailyCheckInSchema = new Schema<IDailyCheckIn>({
  clerkId: { type: String, required: true, index: true },
  weight: { type: Number, required: true },
  sleepHours: { type: Number, required: true },
  energyLevel: { type: Number, required: true },
  mood: { type: String, required: true },
  waterIntake: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now, index: true }
});

export default model<IDailyCheckIn>('DailyCheckIn', DailyCheckInSchema);
