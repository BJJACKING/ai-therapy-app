import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { generateAIResponse, recognizeEmotion, detectCrisis } from '../utils/ai';
import Conversation from '../models/Conversation';

const router = Router();

// 发送消息
router.post(
  '/',
  [
    body('message').notEmpty().trim(),
    body('aiRole').optional().isIn(['gentle', 'rational', 'energetic']),
    body('history').optional().isArray()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { message, aiRole = 'gentle', history = [] } = req.body;
      const userId = (req as any).user.userId;

      // 识别情绪
      const emotionData = await recognizeEmotion(message);

      // 检测危机
      const crisisData = await detectCrisis(message);
      if (crisisData.isCrisis && crisisData.riskLevel === 'high') {
        // 危机处理
        const crisisResponse = `我听到了你的痛苦。你正在经历的一定很艰难。请记住，你并不孤单。

${crisisData.suggestions.join('\n')}

**重要提醒**：如果你有自杀或自伤的想法，请立即寻求专业帮助：
- 全国心理援助热线：12320
- 北京心理危机干预中心：010-82951332
- 上海心理援助热线：021-12320-5

你的生命很重要，请给自己一个机会，也给他人一个帮助你的机会。`;

        // 保存对话
        const conversation = await Conversation.query().where('user_id', userId).first();
        if (conversation) {
          await Conversation.query().findById(conversation.id).patch({
            messages: [
              ...conversation.messages,
              { role: 'user', content: message, timestamp: new Date().toISOString() },
              { role: 'assistant', content: crisisResponse, timestamp: new Date().toISOString() }
            ],
            emotion_data: emotionData
          });
        } else {
          await Conversation.query().insert({
            user_id: userId,
            ai_role: aiRole,
            messages: [
              { role: 'user', content: message, timestamp: new Date().toISOString() },
              { role: 'assistant', content: crisisResponse, timestamp: new Date().toISOString() }
            ],
            emotion_data: emotionData
          });
        }

        return res.json({
          reply: crisisResponse,
          emotionData,
          crisisData,
          isCrisisResponse: true
        });
      }

      // 生成 AI 回应
      const messages = [
        ...history,
        { role: 'user', content: message }
      ];

      const reply = await generateAIResponse(messages, aiRole, emotionData);

      // 保存对话
      const conversation = await Conversation.query().where('user_id', userId).first();
      if (conversation) {
        await Conversation.query().findById(conversation.id).patch({
          messages: [
            ...conversation.messages,
            { role: 'user', content: message, timestamp: new Date().toISOString() },
            { role: 'assistant', content: reply, timestamp: new Date().toISOString() }
          ],
          emotion_data: emotionData
        });
      } else {
        await Conversation.query().insert({
          user_id: userId,
          ai_role: aiRole,
          messages: [
            { role: 'user', content: message, timestamp: new Date().toISOString() },
            { role: 'assistant', content: reply, timestamp: new Date().toISOString() }
          ],
          emotion_data: emotionData
        });
      }

      res.json({
        reply,
        emotionData,
        crisisData,
        isCrisisResponse: false
      });
    } catch (error) {
      next(error);
    }
  }
);

// 获取对话历史
router.get('/history', async (req, res, next) => {
  try {
    const userId = (req as any).user.userId;
    const conversation = await Conversation.query()
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
      .first();

    if (!conversation) {
      return res.json({ messages: [] });
    }

    res.json({
      messages: conversation.messages,
      emotion_data: conversation.emotion_data,
      ai_role: conversation.ai_role
    });
  } catch (error) {
    next(error);
  }
});

// 清空对话
router.delete('/clear', async (req, res, next) => {
  try {
    const userId = (req as any).user.userId;
    await Conversation.query()
      .where('user_id', userId)
      .delete();

    res.json({ message: '对话已清空' });
  } catch (error) {
    next(error);
  }
});

export default router;
