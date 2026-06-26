import { Router, Request, Response } from 'express';
import AICoachConversation, { IChatMessage } from '../models/AICoach';
import FitnessProfile from '../models/FitnessProfile';
import WorkoutPlan from '../models/WorkoutPlan';
import NutritionPlan from '../models/NutritionPlan';
import WorkoutSession from '../models/WorkoutSession';
import DailyCheckIn from '../models/DailyCheckIn';

const router = Router();

// Send message to AI Coach
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { clerkId, message } = req.body;
    if (!clerkId || !message) return res.status(400).json({ error: 'Clerk ID and Message are required.' });

    // Fetch user context
    const profile = await FitnessProfile.findOne({ clerkId });
    const workout = await WorkoutPlan.findOne({ clerkId, isActive: true });
    const nutrition = await NutritionPlan.findOne({ clerkId, isActive: true });
    const recentSessions = await WorkoutSession.find({ clerkId }).sort({ createdAt: -1 }).limit(3);
    const recentCheckins = await DailyCheckIn.find({ clerkId }).sort({ createdAt: -1 }).limit(3);

    // Get active conversation or create new
    let conversation = await AICoachConversation.findOne({ clerkId });
    if (!conversation) {
      conversation = new AICoachConversation({ clerkId, messages: [] });
    }

    // Add user message to history
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    let aiReply = '';
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (apiKey && apiKey !== 'YOUR_OPENROUTER_API_KEY') {
      try {
        // Compile system profile context
        const userContext = `You are FitForge AI, a premium, highly scientific virtual fitness intelligence operating system.
You are acting as an elite personal coach, biomechanical analyst, and clinical sports nutritionist.

User Bio Profile:
- Age: ${profile ? profile.age : 'N/A'}
- Gender: ${profile ? profile.gender : 'N/A'}
- Height: ${profile ? profile.height : 'N/A'} cm
- Weight: ${profile ? profile.weight : 'N/A'} kg
- Goal: ${profile ? profile.goal : 'N/A'}
- Experience Level: ${profile ? profile.experienceLevel : 'N/A'}
- Equipment: ${profile ? profile.availableEquipment.join(', ') : 'N/A'}
- Injuries: ${profile ? profile.injuries : 'None'}

Current Training Plan Focuses:
${workout ? workout.workoutPlan.map(d => `- ${d.day}: ${d.focus}`).join('\n') : 'No active workout plan.'}

Current Macro Ratios:
- Target Calories: ${nutrition ? nutrition.calories : 'N/A'} kcal
- Protein: ${nutrition ? nutrition.protein : 'N/A'}g, Carbs: ${nutrition ? nutrition.carbs : 'N/A'}g, Fats: ${nutrition ? nutrition.fats : 'N/A'}g

Recent Training Compliance Logs:
${recentSessions.length > 0 ? recentSessions.map(s => `- Logged ${s.dayName} (${s.focus}) - Duration: ${Math.round(s.duration / 60)} mins`).join('\n') : 'No logged sessions yet.'}

Recent Check-in Logs:
${recentCheckins.length > 0 ? recentCheckins.map(c => `- Energy: ${c.energyLevel}/10, Sleep: ${c.sleepHours} hrs, Mood: ${c.mood}, Water: ${c.waterIntake}L`).join('\n') : 'No check-ins logged yet.'}

Answer the user's questions clearly, concisely, and with premium clinical specificity. Suggest exercise swaps, correct form details, explain energy trends, or guide their macros according to their live log data above. Keep formatting premium, bulleted, and professional.`;

        // Format message logs
        const formattedMessages = conversation.messages.map(m => ({
          role: m.role,
          content: m.content
        }));

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'deepseek/deepseek-chat-v3',
            messages: [
              { role: 'system', content: userContext },
              ...formattedMessages.slice(-8) // Feed past 8 messages for memory
            ]
          })
        });

        if (response.ok) {
          const resJson = await response.json() as any;
          aiReply = resJson.choices[0]?.message?.content || '';
        }
      } catch (err) {
        console.error('Error generating AI coach response, utilizing fallback:', err);
      }
    }

    if (!aiReply) {
      // High-fidelity fallback responder
      const lower = message.toLowerCase();
      if (lower.includes('pain') || lower.includes('hurt') || lower.includes('injury')) {
        aiReply = `I have logged your concern regarding joint tension/discomfort. Based on your profile, it is critical to bypass shearing forces. I recommend swapping out heavy vertical loads (like barbell presses or deep squats) for closed-chain bodyweight movements or unilateral cable exercises. Let me know which exact movement is causing issue so I can pull a specific replacement.`;
      } else if (lower.includes('protein') || lower.includes('eat') || lower.includes('macro') || lower.includes('diet')) {
        aiReply = `Inspecting your macro targets: we have you configured at ${nutrition ? nutrition.protein : 'N/A'}g of protein daily. If you are struggling to hit this target, focus on adding highly dense somatic sources such as low-fat paneer, extra-lean turkey breast, or egg whites to your early meal frames, and ensure you consume 35g of protein within 90 minutes post-training.`;
      } else if (lower.includes('tired') || lower.includes('sleep') || lower.includes('energy')) {
        aiReply = `Reviewing your recent check-in indexes, your sleep averaged ${recentCheckins.length > 0 ? recentCheckins.reduce((acc, c) => acc + c.sleepHours, 0) / recentCheckins.length : 'N/A'} hours. This explains the lower energy metrics. I suggest adding a rest frame tomorrow, shifting your calories towards active carbohydrate loading post-workout, and adjusting your water target to 3.5 liters to combat dehydration fatigue.`;
      } else {
        aiReply = `Understood. Your active bio-blueprint shows you are on track. To optimize your training split further, target progressive overload by adding 1 rep to your compound sets this week, keeping your rest times capped at 90 seconds to increase mechanical tension. Let me know if you would like me to review a specific movement or calorie cycle.`;
      }
    }

    // Add assistant reply to history
    conversation.messages.push({
      role: 'assistant',
      content: aiReply,
      timestamp: new Date()
    });

    conversation.updatedAt = new Date();
    await conversation.save();

    return res.status(200).json({ reply: aiReply, history: conversation.messages });
  } catch (error: any) {
    console.error('Error in AI Coach Chat router:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Fetch Chat History
router.get('/history/:clerkId', async (req: Request, res: Response) => {
  try {
    const conversation = await AICoachConversation.findOne({ clerkId: req.params.clerkId });
    if (!conversation) return res.status(200).json({ messages: [] });
    return res.status(200).json(conversation);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch conversation history' });
  }
});

export default router;
