require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);

  const email = 'admin@presence-app.com';
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin déjà créé');
    process.exit(0);
  }

  const hashed = await bcrypt.hash('AdminPass123!', 10);
  const admin = new User({
    firstname: 'Admin',
    lastname: 'Principal',
    email,
    password: hashed,
    role: 'admin',
    isVerified: true
  });

  await admin.save();
  console.log('Admin créé avec succès');
  process.exit(0);
}

seedAdmin();