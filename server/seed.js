const User = require('./models/User');
const Announcement = require('./models/Announcement');
const Training = require('./models/Training');

// Creates demo accounts the first time the app starts with an empty database.
// All demo passwords: password123
async function seedIfEmpty() {
  if ((await User.countDocuments()) > 0) return;
  console.log('Empty database - creating demo data...');

  const hr = await User.create({
    name: 'Priya Sharma', email: 'hr@staffsync.com', password: 'password123',
    role: 'hr', department: 'Human Resources', designation: 'HR Manager', phone: '9876500001',
  });
  const manager = await User.create({
    name: 'Amit Verma', email: 'manager@staffsync.com', password: 'password123',
    role: 'manager', department: 'Engineering', designation: 'Engineering Manager', phone: '9876500002',
  });
  const emp1 = await User.create({
    name: 'Rohan Patel', email: 'employee@staffsync.com', password: 'password123',
    role: 'employee', department: 'Engineering', designation: 'Software Developer',
    phone: '9876500003', manager: manager._id,
  });
  const emp2 = await User.create({
    name: 'Sneha Joshi', email: 'sneha@staffsync.com', password: 'password123',
    role: 'employee', department: 'Engineering', designation: 'UI Designer',
    phone: '9876500004', manager: manager._id,
  });
  await User.create({
    name: 'Karan Mehta', email: 'karan@staffsync.com', password: 'password123',
    role: 'employee', department: 'Sales', designation: 'Sales Executive', phone: '9876500005',
  });

  await Announcement.create([
    {
      title: 'Welcome to StaffSync!',
      content: 'Our new HR portal is live. You can now apply for leave, mark attendance and read company news from one place.',
      category: 'Announcement', postedBy: hr._id,
    },
    {
      title: 'Diwali Celebration',
      content: 'Office Diwali celebration on Friday at 4 PM in the main hall. Ethnic wear encouraged!',
      category: 'Event', postedBy: hr._id,
    },
  ]);

  const start = new Date();
  start.setDate(start.getDate() + 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 2);
  await Training.create({
    title: 'React Advanced Workshop',
    description: 'Hooks, context and performance best practices.',
    trainer: 'Amit Verma', mode: 'Online', startDate: start, endDate: end,
    createdBy: manager._id, participants: [emp1._id, emp2._id],
  });

  console.log('Demo data ready. Login: hr@staffsync.com / manager@staffsync.com / employee@staffsync.com (password123)');
}

module.exports = seedIfEmpty;
