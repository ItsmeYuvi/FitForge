import { Schema, model, Document } from 'mongoose';

export interface IBodyMeasurement extends Document {
  clerkId: string;
  weight: number; // in kg
  waist?: number; // in cm
  chest?: number; // in cm
  arms?: number; // in cm
  hips?: number; // in cm
  createdAt: Date;
}

const BodyMeasurementSchema = new Schema<IBodyMeasurement>({
  clerkId: { type: String, required: true, index: true },
  weight: { type: Number, required: true },
  waist: { type: Number },
  chest: { type: Number },
  arms: { type: Number },
  hips: { type: Number },
  createdAt: { type: Date, default: Date.now, index: true }
});

export default model<IBodyMeasurement>('BodyMeasurement', BodyMeasurementSchema);
