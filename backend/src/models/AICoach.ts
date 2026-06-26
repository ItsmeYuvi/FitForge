import { Schema, model, Document } from 'mongoose';

export interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IAICoachConversation extends Document {
  clerkId: string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const AICoachConversationSchema = new Schema<IAICoachConversation>({
  clerkId: { type: String, required: true, index: true },
  messages: [
    {
      role: { type: String, enum: ['user', 'assistant'], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default model<IAICoachConversation>('AICoachConversation', AICoachConversationSchema);
