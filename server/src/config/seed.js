require('dotenv').config();
const connectDB = require('./db');
const User = require('../models/User');
const Lead = require('../models/Lead');

const seed = async () => {
  await connectDB();

  // Clear existing demo users
  await User.deleteMany({ email: { $in: ['admin.demo@example.com', 'member.demo@example.com'] } });

  const admin = await User.create({
    name: 'Admin Demo',
    email: 'admin.demo@example.com  ',
    password: 'Admin@1234',
    role: 'admin',
    isActive: true,
  });

  const member = await User.create({
    name: 'Member Demo',
    email: 'member.demo@example.com',
    password: 'Member@1234',
    role: 'member',
    isActive: true,
  });

  // Seed some leads
  await Lead.deleteMany({ email: { $in: ['alice@example.com', 'bob@example.com', 'charlie@example.com'] } });

  await Lead.create([
    {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '+1-555-0101',
      company: 'TechCorp',
      requirement: 'Looking for CRM software',
      source: 'Website',
      status: 'new',
      createdBy: admin._id,
    },
    {
      name: 'Bob Smith',
      email: 'bob@example.com',
      phone: '+1-555-0102',
      company: 'StartupXYZ',
      requirement: 'Need marketing automation',
      source: 'Referral',
      status: 'contacted',
      assignedTo: member._id,
      createdBy: admin._id,
    },
    {
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      company: 'EnterpriseABC',
      requirement: 'Sales pipeline management',
      source: 'LinkedIn',
      status: 'qualified',
      assignedTo: member._id,
      createdBy: admin._id,
    },
  ]);

  console.log('✅ Seed complete');
  console.log('Admin:  admin.demo@example.com / Admin@1234');
  console.log('Member: member.demo@example.com / Member@1234');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
