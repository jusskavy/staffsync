const router = require('express').Router();
const User = require('../models/User');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const Announcement = require('../models/Announcement');
const Training = require('../models/Training');
const { protect } = require('../middleware/auth');

router.use(protect);

const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

// GET /api/dashboard  -> numbers for the dashboard cards (different per role)
router.get('/', async (req, res) => {
  const { role, _id } = req.user;
  const latestNews = await Announcement.find().sort('-createdAt').limit(3).populate('postedBy', 'name');
  const stats = {};

  if (role === 'hr') {
    stats.totalEmployees = await User.countDocuments({ isActive: true });
    stats.managers = await User.countDocuments({ role: 'manager', isActive: true });
    stats.presentToday = await Attendance.countDocuments({ date: today() });
    stats.pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
    const byDept = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    stats.departments = byDept.map((d) => ({ name: d._id, count: d.count }));
  }

  if (role === 'manager') {
    const team = await User.find({ manager: _id }).select('_id');
    const ids = team.map((t) => t._id);
    stats.teamSize = ids.length;
    stats.teamPresentToday = await Attendance.countDocuments({ date: today(), user: { $in: ids } });
    stats.pendingLeaves = await Leave.countDocuments({ status: 'Pending', employee: { $in: ids } });
    stats.trainings = await Training.countDocuments({ createdBy: _id, status: { $ne: 'Completed' } });
  }

  if (role === 'employee' || role === 'manager') {
    stats.leaveBalance = req.user.leaveBalance;
    stats.myPendingLeaves = await Leave.countDocuments({ employee: _id, status: 'Pending' });
    stats.todayAttendance = await Attendance.findOne({ user: _id, date: today() });
    stats.myTrainings = await Training.countDocuments({ participants: _id, status: { $ne: 'Completed' } });
    const monthPrefix = today().slice(0, 7);
    stats.daysPresentThisMonth = await Attendance.countDocuments({ user: _id, date: { $regex: '^' + monthPrefix } });
  }

  res.json({ role, stats, latestNews });
});

module.exports = router;
