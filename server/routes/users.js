const router = require('express').Router();
const User = require('../models/User');
const { protect, allow } = require('../middleware/auth');

router.use(protect);

// ---------- Own profile (everyone) ----------

// PUT /api/users/me  -> employee updates own personal records
router.put('/me', async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'address', 'dateOfBirth'];
    const user = await User.findById(req.user._id);
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) user[f] = req.body[f];
    });
    await user.save();
    res.json(await User.findById(user._id).populate('manager', 'name email'));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/users/me/password
router.put('/me/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword || ''))) {
      return res.status(400).json({ message: 'Current password is wrong' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ---------- Manager: own team ----------

// GET /api/users/team
router.get('/team', allow('manager', 'hr'), async (req, res) => {
  const filter = req.user.role === 'hr' ? { role: { $ne: 'hr' } } : { manager: req.user._id };
  const team = await User.find({ ...filter, isActive: true }).sort('name');
  res.json(team);
});

// GET /api/users/managers  -> list of managers (for HR dropdown)
router.get('/managers', allow('hr'), async (req, res) => {
  res.json(await User.find({ role: 'manager', isActive: true }).select('name email department'));
});

// ---------- HR: manage employee data ----------

// GET /api/users  -> all employees
router.get('/', allow('hr'), async (req, res) => {
  const { search, role, department } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (department) filter.department = department;
  if (search) {
    const safe = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { name: new RegExp(safe, 'i') },
      { email: new RegExp(safe, 'i') },
      { employeeId: new RegExp(safe, 'i') },
    ];
  }
  const users = await User.find(filter).populate('manager', 'name').sort('-createdAt');
  res.json(users);
});

// POST /api/users  -> HR adds a new employee / manager / HR
router.post('/', allow('hr'), async (req, res) => {
  try {
    const { email } = req.body;
    if (await User.findOne({ email: (email || '').toLowerCase() })) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const data = { ...req.body };
    if (!data.manager) data.manager = null;
    if (!data.password) data.password = 'password123';
    const user = await User.create(data);
    res.status(201).json(await User.findById(user._id).populate('manager', 'name'));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/users/:id  -> HR edits employee
router.put('/:id', allow('hr'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Employee not found' });
    const fields = ['name', 'email', 'role', 'department', 'designation', 'phone', 'address',
      'dateOfBirth', 'dateOfJoining', 'manager', 'leaveBalance', 'isActive'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) user[f] = req.body[f] === '' && f === 'manager' ? null : req.body[f];
    });
    if (req.body.password) user.password = req.body.password;
    await user.save();
    res.json(await User.findById(user._id).populate('manager', 'name'));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/users/:id
router.delete('/:id', allow('hr'), async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    return res.status(400).json({ message: 'You cannot delete your own account' });
  }
  await User.findByIdAndDelete(req.params.id);
  await User.updateMany({ manager: req.params.id }, { manager: null });
  res.json({ message: 'Employee deleted' });
});

module.exports = router;
