const router = require('express').Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { protect, allow } = require('../middleware/auth');

router.use(protect);

// Today's date in India time as YYYY-MM-DD
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

// GET /api/attendance/today  -> my record for today
router.get('/today', async (req, res) => {
  const record = await Attendance.findOne({ user: req.user._id, date: today() });
  res.json(record);
});

// POST /api/attendance/check-in
router.post('/check-in', async (req, res) => {
  try {
    const exists = await Attendance.findOne({ user: req.user._id, date: today() });
    if (exists) return res.status(400).json({ message: 'You have already checked in today' });
    const record = await Attendance.create({ user: req.user._id, date: today(), checkIn: new Date() });
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/attendance/check-out
router.post('/check-out', async (req, res) => {
  const record = await Attendance.findOne({ user: req.user._id, date: today() });
  if (!record) return res.status(400).json({ message: 'Please check in first' });
  if (record.checkOut) return res.status(400).json({ message: 'You have already checked out today' });
  record.checkOut = new Date();
  const hours = (record.checkOut - record.checkIn) / 3600000;
  record.status = hours < 4 ? 'Half Day' : 'Present';
  await record.save();
  res.json(record);
});

// GET /api/attendance/my  -> my history
router.get('/my', async (req, res) => {
  const records = await Attendance.find({ user: req.user._id }).sort('-date').limit(60);
  res.json(records);
});

// GET /api/attendance?date=YYYY-MM-DD  -> HR: everyone, Manager: team
router.get('/', allow('hr', 'manager'), async (req, res) => {
  const filter = {};
  if (req.query.date) filter.date = req.query.date;
  if (req.user.role === 'manager') {
    const team = await User.find({ manager: req.user._id }).select('_id');
    filter.user = { $in: team.map((t) => t._id) };
  }
  const records = await Attendance.find(filter)
    .populate('user', 'name employeeId department')
    .sort('-date -checkIn')
    .limit(500);
  res.json(records);
});

module.exports = router;
