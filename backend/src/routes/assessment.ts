import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import Assessment from '../models/Assessment';

const router = Router();

// PHQ-9 抑郁筛查量表
const PHQ9_QUESTIONS = [
  '做事时提不起劲或没有兴趣',
  '感到心情低落、沮丧或绝望',
  '入睡困难、睡不安稳或睡眠过多',
  '感觉疲倦或没有活力',
  '食欲不振或吃太多',
  '觉得自己很糟或是个失败者',
  '注意力难以集中',
  '动作或说话变慢或坐立不安',
  '有不如死掉或用某种方式伤害自己的念头'
];

// GAD-7 焦虑筛查量表
const GAD7_QUESTIONS = [
  '感到紧张、焦虑或急切',
  '不能停止或控制担忧',
  '对各种事情担忧过多',
  '很难放松',
  '烦躁不安',
  '容易生气或烦躁',
  '感到害怕好像有可怕的事情要发生'
];

// 获取测评量表
router.get('/:type', async (req, res, next) => {
  try {
    const { type } = req.params;

    if (type === 'phq9') {
      return res.json({
        type: 'phq9',
        name: 'PHQ-9 抑郁筛查量表',
        description: '过去两周内，以下症状出现的频率',
        questions: PHQ9_QUESTIONS.map((q, i) => ({
          id: i,
          question: q,
          options: [
            { value: 0, label: '完全没有' },
            { value: 1, label: '几天' },
            { value: 2, label: '一半以上时间' },
            { value: 3, label: '几乎每天' }
          ]
        })),
        scoring: {
          0-4: '无抑郁症状',
          5-9: '轻度抑郁',
          10-14: '中度抑郁',
          15-19: '中重度抑郁',
          20-27: '重度抑郁'
        }
      });
    }

    if (type === 'gad7') {
      return res.json({
        type: 'gad7',
        name: 'GAD-7 焦虑筛查量表',
        description: '过去两周内，以下症状出现的频率',
        questions: GAD7_QUESTIONS.map((q, i) => ({
          id: i,
          question: q,
          options: [
            { value: 0, label: '完全没有' },
            { value: 1, label: '几天' },
            { value: 2, label: '一半以上时间' },
            { value: 3, label: '几乎每天' }
          ]
        })),
        scoring: {
          0-4: '无焦虑症状',
          5-9: '轻度焦虑',
          10-14: '中度焦虑',
          15-21: '重度焦虑'
        }
      });
    }

    return res.status(400).json({ error: '不支持的测评类型' });
  } catch (error) {
    next(error);
  }
});

// 提交测评
router.post(
  '/:type/submit',
  [
    body('answers').isArray({ min: 1 }),
    body('answers.*.questionId').isInt(),
    body('answers.*.value').isInt({ min: 0, max: 3 })
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { type } = req.params;
      const { answers } = req.body;
      const userId = (req as any).user.userId;

      // 计算分数
      const score = answers.reduce((sum: number, ans: any) => sum + ans.value, 0);

      // 生成解读
      let interpretation = '';
      if (type === 'phq9') {
        if (score <= 4) interpretation = '无抑郁症状';
        else if (score <= 9) interpretation = '轻度抑郁症状';
        else if (score <= 14) interpretation = '中度抑郁症状';
        else if (score <= 19) interpretation = '中重度抑郁症状';
        else interpretation = '重度抑郁症状';
      } else if (type === 'gad7') {
        if (score <= 4) interpretation = '无焦虑症状';
        else if (score <= 9) interpretation = '轻度焦虑症状';
        else if (score <= 14) interpretation = '中度焦虑症状';
        else interpretation = '重度焦虑症状';
      }

      // 保存测评结果
      const assessment = await Assessment.query().insert({
        user_id: userId,
        type,
        answers,
        score,
        interpretation
      });

      res.status(201).json({
        message: '测评完成',
        assessment: {
          id: assessment.id,
          type: assessment.type,
          score: assessment.score,
          interpretation: assessment.interpretation,
          created_at: assessment.created_at
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// 获取测评历史
router.get('/:type/history', async (req, res, next) => {
  try {
    const { type } = req.params;
    const userId = (req as any).user.userId;

    const assessments = await Assessment.query()
      .where('user_id', userId)
      .where('type', type)
      .orderBy('created_at', 'desc')
      .limit(10);

    res.json({
      assessments
    });
  } catch (error) {
    next(error);
  }
});

// 获取单个测评结果
router.get('/:type/:id', async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const userId = (req as any).user.userId;

    const assessment = await Assessment.query()
      .where('id', id)
      .where('type', type)
      .where('user_id', userId)
      .first();

    if (!assessment) {
      return res.status(404).json({ error: '测评结果不存在' });
    }

    res.json({ assessment });
  } catch (error) {
    next(error);
  }
});

export default router;
