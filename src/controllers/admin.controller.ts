import { Request, Response } from 'express';
import {
  User,
  Progress,
  CallSession,
  Course,
  Lesson,
  Scenario,
  Subscription,
  GemTransaction,
} from '../models';
import { generateToken } from '../utils/jwt';
import { getAppConfig, updateLocalConfig } from '../services/config.service';
import type { AuthRequest, AppConfig } from '../types';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@chinesapp.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password required' });
    return;
  }

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    return;
  }

  const token = generateToken({
    userId: 'admin',
    phone: ADMIN_EMAIL,
    isPremium: true,
  });

  res.json({
    success: true,
    message: 'Admin login successful',
    data: { token, user: { email: ADMIN_EMAIL, role: 'admin' } },
  });
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  const [totalUsers, premiumUsers, totalRevenue, totalCalls, totalCourses, totalScenarios] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isPremium: true }),
      Subscription.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      CallSession.countDocuments(),
      Course.countDocuments(),
      Scenario.countDocuments(),
    ]);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

  res.json({
    success: true,
    data: {
      totalUsers,
      premiumUsers,
      freeUsers: totalUsers - premiumUsers,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalCalls,
      totalCourses,
      totalScenarios,
      newUsersThisWeek,
      conversionRate: totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(2) : 0,
    },
  });
};

export const getRevenueChart = async (req: Request, res: Response): Promise<void> => {
  const days = parseInt(req.query.days as string) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const revenue = await Subscription.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({ success: true, data: revenue });
};

export const getUsersChart = async (req: Request, res: Response): Promise<void> => {
  const days = parseInt(req.query.days as string) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const users = await User.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({ success: true, data: users });
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string;
  const premium = req.query.premium as string;

  const query: Record<string, unknown> = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (premium === 'true') query.isPremium = true;
  if (premium === 'false') query.isPremium = false;

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-googleId'),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      users: users.map((u) => ({
        _id: u._id,
        name: u.name,
        phone: u.phone,
        email: u.email,
        avatar: u.avatar,
        isPremium: u.isPremium,
        premiumExpiry: u.premiumExpiry,
        gems: u.gems,
        xp: u.xp,
        streak: u.streak,
        hskLevel: u.hskLevel,
        createdAt: u.createdAt,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.params.id).select('-googleId');
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({ success: true, data: user });
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { name, email, isPremium, gems, xp, streak, hskLevel, premiumExpiry } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, isPremium, gems, xp, streak, hskLevel, premiumExpiry },
    { new: true }
  ).select('-googleId');

  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({ success: true, message: 'User updated', data: user });
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  await Promise.all([
    Progress.deleteOne({ userId: req.params.id }),
    CallSession.deleteMany({ userId: req.params.id }),
    Subscription.deleteMany({ userId: req.params.id }),
    GemTransaction.deleteMany({ userId: req.params.id }),
  ]);
  res.json({ success: true, message: 'User deleted' });
};

export const getUserProgress = async (req: Request, res: Response): Promise<void> => {
  const progress = await Progress.findOne({ userId: req.params.id });
  if (!progress) {
    res.status(404).json({ success: false, message: 'Progress not found' });
    return;
  }
  res.json({ success: true, data: progress });
};

export const getUserCalls = async (req: Request, res: Response): Promise<void> => {
  const calls = await CallSession.find({ userId: req.params.id }).sort({ createdAt: -1 });
  res.json({ success: true, data: calls });
};

export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Subscription.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('userId', 'name phone email'),
    Subscription.countDocuments(),
  ]);

  res.json({
    success: true,
    data: {
      payments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
};

export const getPaymentStats = async (req: Request, res: Response): Promise<void> => {
  const stats = await Subscription.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$amount' } } },
  ]);
  res.json({ success: true, data: stats });
};

export const getAllSubscriptions = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string;
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {};
  if (status) query.status = status;

  const [subs, total] = await Promise.all([
    Subscription.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('userId', 'name phone email'),
    Subscription.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      subscriptions: subs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
};

export const getAllCourses = async (req: Request, res: Response): Promise<void> => {
  const courses = await Course.find().sort({ order: 1 });
  res.json({ success: true, data: courses });
};

export const createCourse = async (req: Request, res: Response): Promise<void> => {
  const course = await Course.create(req.body);
  res.status(201).json({ success: true, message: 'Course created', data: course });
};

export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!course) {
    res.status(404).json({ success: false, message: 'Course not found' });
    return;
  }
  res.json({ success: true, message: 'Course updated', data: course });
};

export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) {
    res.status(404).json({ success: false, message: 'Course not found' });
    return;
  }
  await Lesson.deleteMany({ courseId: req.params.id });
  res.json({ success: true, message: 'Course deleted' });
};

export const getAllScenarios = async (req: Request, res: Response): Promise<void> => {
  const scenarios = await Scenario.find().sort({ order: 1 });
  res.json({ success: true, data: scenarios });
};

export const createScenario = async (req: Request, res: Response): Promise<void> => {
  const scenario = await Scenario.create(req.body);
  res.status(201).json({ success: true, message: 'Scenario created', data: scenario });
};

export const updateScenario = async (req: Request, res: Response): Promise<void> => {
  const scenario = await Scenario.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!scenario) {
    res.status(404).json({ success: false, message: 'Scenario not found' });
    return;
  }
  res.json({ success: true, message: 'Scenario updated', data: scenario });
};

export const deleteScenario = async (req: Request, res: Response): Promise<void> => {
  const scenario = await Scenario.findByIdAndDelete(req.params.id);
  if (!scenario) {
    res.status(404).json({ success: false, message: 'Scenario not found' });
    return;
  }
  res.json({ success: true, message: 'Scenario deleted' });
};

export const getConfig = async (req: Request, res: Response): Promise<void> => {
  const config = await getAppConfig();
  res.json({ success: true, data: config });
};

export const updateConfig = async (req: Request, res: Response): Promise<void> => {
  const updates = req.body as Partial<AppConfig>;
  updateLocalConfig(updates);
  const config = await getAppConfig();
  res.json({ success: true, message: 'Config updated', data: config });
};