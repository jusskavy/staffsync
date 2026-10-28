const router = require('express').Router();
const Announcement = require('../models/Announcement');
const { protect, allow } = require('../middleware/auth');

router.use(protect);

// GET /api/announcements  -> everyone can read
router.get('/', async (req, res) => {
  const list = await Announcement.find().populate('postedBy', 'name role').sort('-createdAt');
  res.json(list);
});

// POST /api/announcements  -> HR posts news / announcement
router.post('/', allow('hr'), async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const item = await Announcement.create({ title, content, category, postedBy: req.user._id });
    res.status(201).json(await item.populate('postedBy', 'name role'));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/announcements/:id
router.put('/:id', allow('hr'), async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const item = await Announcement.findByIdAndUpdate(
      req.params.id,
      { title, content, category },
      { new: true, runValidators: true }
    ).populate('postedBy', 'name role');
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/announcements/:id
router.delete('/:id', allow('hr'), async (req, res) => {
  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
