import { Schema, model, Document } from 'mongoose';

export interface IExercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
}

export interface IWorkoutDay {
  day: string; // e.g. Monday, Push Day
  focus: string;
  exercises: IExercise[];
}

export interface IWorkoutPlan extends Document {
  clerkId: string;
  workoutSplit: string; // Push Pull Legs, Upper Lower, Full Body
  progressiveOverloadStrategy: string;
  warmupAdvice: string;
  cooldownAdvice: string;
  workoutPlan: IWorkoutDay[];
  isActive: boolean;
  createdAt: Date;
}

const WorkoutPlanSchema = new Schema<IWorkoutPlan>({
  clerkId: { type: String, required: true, index: true },
  workoutSplit: { type: String, required: true },
  progressiveOverloadStrategy: { type: String, required: true },
  warmupAdvice: { type: String, required: true },
  cooldownAdvice: { type: String, required: true },
  workoutPlan: [
    {
      day: { type: String, required: true },
      focus: { type: String, required: true },
      exercises: [
        {
          name: { type: String, required: true },
          sets: { type: Number, required: true },
          reps: { type: String, required: true },
          rest: { type: String, required: true },
          notes: { type: String }
        }
      ]
    }
  ],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default model<IWorkoutPlan>('WorkoutPlan', WorkoutPlanSchema);
