import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI 角色配置
const AI_ROLES = {
  gentle: {
    name: '温暖陪伴者',
    description: '温和、共情、温暖、支持',
    prompt: `你是一位温暖的心理陪伴者。你的特点是：
- 温和、共情、充满关怀
- 倾听为主，少说多听
- 用温暖的语言回应
- 不评判，不建议，只陪伴
- 适时给予鼓励和支持
- 保持简短、温暖的回应`
  },
  rational: {
    name: '理性分析师',
    description: '逻辑清晰、问题解决导向',
    prompt: `你是一位理性的心理分析师。你的特点是：
- 逻辑清晰，思维严谨
- 帮助用户分析问题
- 提供结构化的思考框架
- 基于认知行为疗法原则
- 引导用户自己找到答案
- 回应简洁、专业`
  },
  energetic: {
    name: '活力鼓励师',
    description: '轻松、幽默、鼓励、积极',
    prompt: `你是一位充满活力的鼓励师。你的特点是：
- 轻松、幽默、积极向上
- 用鼓励的语言激励用户
- 保持对话的趣味性
- 适时给予正面反馈
- 帮助用户看到希望
- 回应生动、有趣`
  }
};

// 情绪识别
export async function recognizeEmotion(text: string): Promise<{
  emotion: string;
  intensity: number;
  keywords: string[];
}> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `你是一个情绪识别专家。请分析用户输入的文本，识别：
1. 主要情绪（happy, sad, anxious, angry, calm, tired, excited）
2. 情绪强度（1-10分）
3. 关键触发词

请以 JSON 格式返回：{"emotion": "string", "intensity": number, "keywords": string[]}`
        },
        { role: 'user', content: text }
      ],
      temperature: 0.3,
      max_tokens: 100
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return {
      emotion: result.emotion || 'calm',
      intensity: result.intensity || 5,
      keywords: result.keywords || []
    };
  } catch (error) {
    console.error('Emotion recognition error:', error);
    return { emotion: 'calm', intensity: 5, keywords: [] };
  }
}

// 生成 AI 回应
export async function generateAIResponse(
  messages: any[],
  role: keyof typeof AI_ROLES = 'gentle',
  emotionData?: any
): Promise<string> {
  try {
    const roleConfig = AI_ROLES[role];
    
    const systemPrompt = `${roleConfig.prompt}

${emotionData ? `用户当前情绪：${emotionData.emotion}（强度：${emotionData.intensity}/10）` : ''}

请记住：
1. 你不是专业的心理咨询师，不能提供医疗建议
2. 如果用户有严重的心理问题或危机情况，请建议寻求专业帮助
3. 保持对话的自然和温暖
4. 每次回应尽量简洁（100-200字）`;

    const messagesWithContext = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messagesWithContext,
      temperature: 0.7,
      max_tokens: 300
    });

    return completion.choices[0].message.content || '我在这里，愿意倾听。';
  } catch (error) {
    console.error('AI response generation error:', error);
    return '我在这里，愿意倾听。如果有什么想说的，随时告诉我。';
  }
}

// 危机识别
export async function detectCrisis(text: string): Promise<{
  isCrisis: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  suggestions: string[];
}> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `你是一个危机识别专家。请分析用户输入，判断是否存在自杀、自伤或其他严重心理危机风险。

请以 JSON 格式返回：
{
  "isCrisis": boolean,
  "riskLevel": "low" | "medium" | "high",
  "suggestions": string[]
}

风险等级说明：
- low: 无明显危机风险
- medium: 可能有轻微风险，需要关注
- high: 明显危机风险，需要立即干预

suggestions: 根据风险等级给出的建议`
        },
        { role: 'user', content: text }
      ],
      temperature: 0.3,
      max_tokens: 200
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return {
      isCrisis: result.isCrisis || false,
      riskLevel: result.riskLevel || 'low',
      suggestions: result.suggestions || []
    };
  } catch (error) {
    console.error('Crisis detection error:', error);
    return { isCrisis: false, riskLevel: 'low', suggestions: [] };
  }
}

export { AI_ROLES };
