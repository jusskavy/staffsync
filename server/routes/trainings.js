const router = require('express').Router();
const Training = require('../models/Training');
const User = require('../models/User');
const { protect, allow } = require('../middleware/auth');

router.use(protect);

const populate = (q) => q.populate('createdBy', 'name').populate('participants', 'name employeeId department');

// GET /api/trainings
// HR: all, Manager: created by him, Employee: where he is a participant
router.get('/', async (req, res) => {
  let filter = {};
  if (req.user.role === 'manager') filter = { createdBy: req.user._id };
  if (req.user.role === 'employee') filter = { participants: req.user._id };
  res.json(await populate(Training.find(filter).sort('-startDate')));
});

// Manager can only add people from his own team
async function checkTeam(req, participants = []) {
  if (req.user.role !== 'manager' || participants.length === 0) return true;
  const count = await User.countDocuments({ _id: { $in: participants }, manager: req.user._id });
  return count === participants.length;
}

// POST /api/trainings  -> manager / HR creates a training program
router.post('/', allow('manager', 'hr'), async (req, res) => {
  try {
    if (!(await checkTeam(req, req.body.participants))) {
      return res.status(403).json({ message: 'You can only add members of your team' });
    }
    const t = await Training.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(await populate(Training.findById(t._id)));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/trainings/:id
router.put('/:id', allow('manager', 'hr'), async (req, res) => {
  try {
    const t = await Training.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Training not found' });
    if (req.user.role === 'manager' && String(t.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only edit your own trainings' });
    }
    if (!(await checkTeam(req, req.body.participants))) {
      return res.status(403).json({ message: 'You can only add members of your team' });
    }
    const fields = ['title', 'description', 'trainer', 'mode', 'startDate', 'endDate', 'status', 'participants'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) t[f] = req.body[f];
    });
    await t.save();
    res.json(await populate(Training.findById(t._id)));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/trainings/:id
router.delete('/:id', allow('manager', 'hr'), async (req, res) => {
  const t = await Training.findById(req.params.id);
  if (!t) return res.status(404).json({ message: 'Training not found' });
  if (req.user.role === 'manager' && String(t.createdBy) !== String(req.user._id)) {
    return res.status(403).json({ message: 'You can only delete your own trainings' });
  }
  await t.deleteOne();
  res.json({ message: 'Deleted' });
});

module.exports = router;
