import { Router } from 'express';
import User from '../models/User';

const router = Router();

// 获取当前用户信息
router.get('/me', async (req, res, next) => {
  try {
    const userId = (req as any).user.userId;
    const user = await User.query().findById(userId);

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        anonymous_id: user.anonymous_id,
        is_anonymous: user.is_anonymous,
        created_at: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// 更新用户信息
router.patch('/me', async (req, res, next) => {
  try {
    const userId = (req as any).user.userId;
    const { email, phone } = req.body;

    const updates: any = {};
    if (email) updates.email = email;
    if (phone) updates.phone = phone;

    const user = await User.query().findById(userId).patch(updates);
    res.json({ message: '用户信息已更新', user });
  } catch (error) {
    next(error);
  }
});

// 删除账户
router.delete('/me', async (req, res, next) => {
  try {
    const userId = (req as any).user.userId;
    await User.query().findById(userId).delete();
    res.json({ message: '账户已删除' });
  } catch (error) {
    next(error);
  }
});

// 获取统计数据
router.get('/stats', async (req, res, next) => {
  try {
    const userId = (req as any).user.userId;

    // 对话次数
    const conversations = await User.relatedQuery('conversations')
      .for(userId)
      .count('* as count')
      .first();

    // 日记条数
    const diaries = await User.relatedQuery('moodDiaries')
      .for(userId)
      .count('* as count')
      .first();

    // 测评次数
    const assessments = await User.relatedQuery('assessments')
      .for(userId)
      .count('* as count')
      .first();

    res.json({
      stats: {
        conversations: Number(conversations?.count || 0),
        diaries: Number(diaries?.count || 0),
        assessments: Number(assessments?.count || 0)
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
