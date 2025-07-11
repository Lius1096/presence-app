const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  timestamp: { type: Date, required: true },
  status: { type: String, enum: ['present', 'late', 'remote', 'pending'], required: true },
  location: {
    latitude: Number,
    longitude: Number,
  },
  remote: { type: Boolean, default: false },
});

module.exports = mongoose.model('Attendance', attendanceSchema);