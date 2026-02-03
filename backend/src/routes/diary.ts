import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import MoodDiary from '../models/MoodDiary';

const router = Router();

// 创建情绪日记
router.post(
  '/',
  [
    body('mood').isIn(['happy', 'sad', 'anxious', 'angry', 'calm', 'tired', 'excited']),
    body('intensity').isInt({ min: 1, max: 10 }),
    body('triggers').optional().isArray(),
    body('notes').optional().isString()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { mood, intensity, triggers, notes } = req.body;
      const userId = (req as any).user.userId;

      const diary = await MoodDiary.query().insert({
        user_id: userId,
        mood,
        intensity,
        triggers,
        notes
      });

      res.status(201).json({
        message: '情绪日记已保存',
        diary
      });
    } catch (error) {
      next(error);
    }
  }
);

// 获取情绪日记列表
router.get('/', async (req, res, next) => {
  try {
    const userId = (req as any).user.userId;
    const { startDate, endDate, page = 1, limit = 20 } = req.query;

    let query = MoodDiary.query()
      .where('user_id', userId)
      .orderBy('created_at', 'desc');

    if (startDate) {
      query = query.where('created_at', '>=', startDate);
    }
    if (endDate) {
      query = query.where('created_at', '<=', endDate);
    }

    const diaries = await query
      .offset((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await MoodDiary.query()
      .where('user_id', userId)
      .count('* as count')
      .first();

    res.json({
      diaries,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(total?.count || 0),
        pages: Math.ceil(Number(total?.count || 0) / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// 获取情绪统计
router.get('/stats', async (req, res, next) => {
  try {
    const userId = (req as any).user.userId;
    const { days = 7 } = req.query;

    const stats = await MoodDiary.query()
      .where('user_id', userId)
      .where('created_at', '>=', new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000))
      .select(
        'mood',
        MoodDiary.raw('COUNT(*) as count'),
        MoodDiary.raw('AVG(intensity) as avg_intensity')
      )
      .groupBy('mood')
      .orderBy('count', 'desc');

    const trend = await MoodDiary.query()
      .where('user_id', userId)
      .where('created_at', '>=', new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000))
      .select(
        MoodDiary.raw('DATE(created_at) as date'),
        MoodDiary.raw('COUNT(*) as count'),
        MoodDiary.raw('AVG(intensity) as avg_intensity')
      )
      .groupBy('date')
      .orderBy('date', 'asc');

    res.json({
      stats,
      trend
    });
  } catch (error) {
    next(error);
  }
});

// 获取单条日记
router.get('/:id', async (req, res, next) => {
  try {
    const userId = (req as any).user.userId;
    const diary = await MoodDiary.query()
      .where('id', req.params.id)
      .where('user_id', userId)
      .first();

    if (!diary) {
      return res.status(404).json({ error: '日记不存在' });
    }

    res.json({ diary });
  } catch (error) {
    next(error);
  }
});

// 更新日记
router.put('/:id', async (req, res, next) => {
  try {
    const userId = (req as any).user.userId;
    const diary = await MoodDiary.query()
      .where('id', req.params.id)
      .where('user_id', userId)
      .first();

    if (!diary) {
      return res.status(404).json({ error: '日记不存在' });
    }

    const updated = await MoodDiary.query().findById(req.params.id).patch(req.body);
    res.json({ message: '日记已更新', diary: updated });
  } catch (error) {
    next(error);
  }
});

// 删除日记
router.delete('/:id', async (req, res, next) => {
  try {
    const userId = (req as any).user.userId;
    const diary = await MoodDiary.query()
      .where('id', req.params.id)
      .where('user_id', userId)
      .first();

    if (!diary) {
      return res.status(404).json({ error: '日记不存在' });
    }

    await MoodDiary.query().findById(req.params.id).delete();
    res.json({ message: '日记已删除' });
  } catch (error) {
    next(error);
  }
});

export default router;
