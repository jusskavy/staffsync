const router = require('express').Router();
const Leave = require('../models/Leave');
const User = require('../models/User');
const { protect, allow } = require('../middleware/auth');

router.use(protect);

const dayCount = (from, to) => Math.floor((new Date(to) - new Date(from)) / 86400000) + 1;

// POST /api/leaves  -> employee / manager applies for leave
router.post('/', allow('employee', 'manager'), async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason } = req.body;
    if (!fromDate || !toDate || !reason) return res.status(400).json({ message: 'All fields are required' });
    const days = dayCount(fromDate, toDate);
    if (days < 1) return res.status(400).json({ message: 'To date must be after from date' });

    const leave = await Leave.create({ employee: req.user._id, leaveType, fromDate, toDate, reason, days });
    res.status(201).json(leave);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/leaves/my  -> my own leave history
router.get('/my', async (req, res) => {
  const leaves = await Leave.find({ employee: req.user._id }).populate('reviewedBy', 'name').sort('-createdAt');
  res.json(leaves);
});

// GET /api/leaves  -> HR: all requests, Manager: team requests
router.get('/', allow('hr', 'manager'), async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.user.role === 'manager') {
    const team = await User.find({ manager: req.user._id }).select('_id');
    filter.employee = { $in: team.map((t) => t._id) };
  }
  const leaves = await Leave.find(filter)
    .populate('employee', 'name employeeId department role')
    .populate('reviewedBy', 'name')
    .sort('-createdAt');
  res.json(leaves);
});

// PUT /api/leaves/:id/status  -> approve / reject
router.put('/:id/status', allow('hr', 'manager'), async (req, res) => {
  try {
    const { status, remark } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const leave = await Leave.findById(req.params.id).populate('employee');
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    if (leave.status !== 'Pending') return res.status(400).json({ message: 'This leave is already ' + leave.status });

    // Manager can only review own team's leaves
    if (req.user.role === 'manager' && String(leave.employee.manager) !== String(req.user._id)) {
      return res.status(403).json({ message: 'This employee is not in your team' });
    }

    leave.status = status;
    leave.remark = remark || '';
    leave.reviewedBy = req.user._id;
    await leave.save();

    if (status === 'Approved' && leave.leaveType !== 'Unpaid') {
      await User.findByIdAndUpdate(leave.employee._id, { $inc: { leaveBalance: -leave.days } });
    }
    res.json(leave);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/leaves/:id  -> employee cancels own pending leave
router.delete('/:id', async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) return res.status(404).json({ message: 'Leave not found' });
  if (String(leave.employee) !== String(req.user._id) || leave.status !== 'Pending') {
    return res.status(400).json({ message: 'Only your own pending leave can be cancelled' });
  }
  await leave.deleteOne();
  res.json({ message: 'Leave cancelled' });
});

module.exports = router;
