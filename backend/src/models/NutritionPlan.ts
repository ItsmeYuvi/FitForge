import { Schema, model, Document } from 'mongoose';

export interface IMeal {
  id: string; // unique string for targeting individual meal regeneration
  type: string; // breakfast, lunch, dinner, snack
  name: string;
  description: string;
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
}

export interface INutritionPlan extends Document {
  clerkId: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  dietaryPreference: string;
  meals: IMeal[];
  isActive: boolean;
  createdAt: Date;
}

const NutritionPlanSchema = new Schema<INutritionPlan>({
  clerkId: { type: String, required: true, index: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fats: { type: Number, required: true },
  dietaryPreference: { type: String, required: true },
  meals: [
    {
      id: { type: String, required: true },
      type: { type: String, required: true },
      name: { type: String, required: true },
      description: { type: String, required: true },
      protein: { type: Number, required: true },
      carbs: { type: Number, required: true },
      fats: { type: Number, required: true },
      calories: { type: Number, required: true }
    }
  ],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default model<INutritionPlan>('NutritionPlan', NutritionPlanSchema);
