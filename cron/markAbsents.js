const Attendance = require('../models/Attendance');
const User = require('../models/User');

async function markAbsents() {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const users = await User.find({ role: 'user' });

    for (const user of users) {
      const attendance = await Attendance.findOne({
        user: user._id,
        timestamp: { $gte: startOfDay }
      });

      if (!attendance) {
        const absentEntry = new Attendance({
          user: user._id,
          status: 'late',
          timestamp: new Date(),
          remote: false
        });
        await absentEntry.save();
      }
    }
    console.log('Marquage des absents terminé');
  } catch (err) {
    console.error('Erreur dans markAbsents:', err);
  }
}

module.exports = markAbsents;