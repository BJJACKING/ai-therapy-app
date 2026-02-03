import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User';

const router = Router();

// 注册
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('phone').optional().isMobilePhone()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, phone } = req.body;

      // 检查用户是否已存在
      const existingUser = await User.query().where('email', email).first();
      if (existingUser) {
        return res.status(400).json({ error: '用户已存在' });
      }

      // 创建用户
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await User.query().insert({
        email,
        password: hashedPassword,
        phone,
        anonymous_id: `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });

      // 生成 JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: '注册成功',
        token,
        user: {
          id: user.id,
          email: user.email,
          anonymous_id: user.anonymous_id
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// 登录
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // 查找用户
      const user = await User.query().where('email', email).first();
      if (!user) {
        return res.status(401).json({ error: '邮箱或密码错误' });
      }

      // 验证密码
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: '邮箱或密码错误' });
      }

      // 生成 JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.json({
        message: '登录成功',
        token,
        user: {
          id: user.id,
          email: user.email,
          anonymous_id: user.anonymous_id
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// 匿名快速体验
router.post('/anonymous', async (req, res, next) => {
  try {
    const anonymous_id = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const user = await User.query().insert({
      email: null,
      password: null,
      anonymous_id,
      is_anonymous: true
    });

    const token = jwt.sign(
      { userId: user.id, anonymous_id: user.anonymous_id },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      message: '匿名体验创建成功',
      token,
      user: {
        id: user.id,
        anonymous_id: user.anonymous_id,
        is_anonymous: true
      }
    });
  } catch (error) {
    next(error);
  }
});

// 获取当前用户
router.get('/me', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: '未授权' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await User.query().findById(decoded.userId);

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

export default router;
