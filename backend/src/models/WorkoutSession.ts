import { Schema, model, Document } from 'mongoose';

export interface ILoggedSet {
  setIndex: number;
  weight: number; // in kg
  reps: number;
  isCompleted: boolean;
}

export interface ILoggedExercise {
  name: string;
  sets: ILoggedSet[];
}

export interface IWorkoutSession extends Document {
  clerkId: string;
  workoutPlanId?: string;
  dayName: string;
  focus: string;
  duration: number; // workout duration in seconds
  loggedExercises: ILoggedExercise[];
  createdAt: Date;
}

const WorkoutSessionSchema = new Schema<IWorkoutSession>({
  clerkId: { type: String, required: true, index: true },
  workoutPlanId: { type: String },
  dayName: { type: String, required: true },
  focus: { type: String, required: true },
  duration: { type: Number, required: true },
  loggedExercises: [
    {
      name: { type: String, required: true },
      sets: [
        {
          setIndex: { type: Number, required: true },
          weight: { type: Number, required: true },
          reps: { type: Number, required: true },
          isCompleted: { type: Boolean, default: true }
        }
      ]
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default model<IWorkoutSession>('WorkoutSession', WorkoutSessionSchema);
