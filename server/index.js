require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seedIfEmpty = require('./seed');

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET not set - using a default. Set it in .env / Render for real use.');
  process.env.JWT_SECRET = 'staffsync_default_secret_change_me';
}

const app = express();
app.use(cors());
app.use(express.json());

// ---------- API routes ----------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/leaves', require('./routes/leaves'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/trainings', require('./routes/trainings'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ---------- Serve React build (client/dist) ----------
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // Any non-API route -> React app (so page refresh works)
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
} else {
  app.get('/', (req, res) => res.send('StaffSync API is running. Build the client with "npm run build".'));
}

// Unknown API route
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
connectDB()
  .then(seedIfEmpty)
  .then(() => app.listen(PORT, () => console.log(`StaffSync running on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Failed to start:', err.message);
    process.exit(1);
  });
