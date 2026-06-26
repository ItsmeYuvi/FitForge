import { Schema, model, Document } from 'mongoose';

export interface IWorkoutDay {
  day: string;
  focus: string;
  exercises: {
    name: string;
    sets: number;
    reps: string;
    rest: string;
    notes?: string;
  }[];
}

export interface INutritionPlan {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  advice: string;
  meals: {
    name: string;
    description: string;
    macros: string;
  }[];
}

export interface IPredictionPoint {
  day: number;
  weight: number;
  bodyFat: number;
  muscleMass: number;
  status: string;
}

export interface IUserBlueprint extends Document {
  age: number;
  gender: string;
  height: number; // in cm
  weight: number; // in kg
  activityLevel: string; // sedentary, light, moderate, active, very_active
  goal: string; // lose_fat, build_muscle, build_strength, endurance, maintenance
  bmi: number;
  bodyFatEst: number;
  bmr: number;
  tdee: number;
  healthAnalysis: string;
  workoutPlan: IWorkoutDay[];
  nutritionPlan: INutritionPlan;
  predictions: IPredictionPoint[];
  createdAt: Date;
}

const UserBlueprintSchema = new Schema<IUserBlueprint>({
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  activityLevel: { type: String, required: true },
  goal: { type: String, required: true },
  bmi: { type: Number, required: true },
  bodyFatEst: { type: Number, required: true },
  bmr: { type: Number, required: true },
  tdee: { type: Number, required: true },
  healthAnalysis: { type: String, required: true },
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
  nutritionPlan: {
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fats: { type: Number, required: true },
    advice: { type: String, required: true },
    meals: [
      {
        name: { type: String, required: true },
        description: { type: String, required: true },
        macros: { type: String, required: true }
      }
    ]
  },
  predictions: [
    {
      day: { type: Number, required: true },
      weight: { type: Number, required: true },
      bodyFat: { type: Number, required: true },
      muscleMass: { type: Number, required: true },
      status: { type: String, required: true }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default model<IUserBlueprint>('UserBlueprint', UserBlueprintSchema);
