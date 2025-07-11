// const User = require('../models/User');
// const Attendance = require('../models/Attendance');
// const socket = require('../socket');;
// // Coordonnées de l'adresse  à autorisée : 4 Avenue Laurent Cély, 92600 Asnières-sur-Seine
// const ALLOWED_LATITUDE = 48.7957393;
// const ALLOWED_LONGITUDE = 2.4482247;
// const ALLOWED_RADIUS_METERS = 20000;

// function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
//   const R = 6371000; // Rayon de la Terre en mètres
//   const dLat = (lat2 - lat1) * Math.PI / 180;
//   const dLon = (lon2 - lon1) * Math.PI / 180;
//   const a = 
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//     Math.sin(dLon / 2) ** 2;

//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// }

// // POST /api/attendance/point
// exports.pointAttendance = async (req, res) => {
//   try {
//     const { userId, latitude, longitude } = req.body;

//     if (!userId) return res.status(400).json({ error: 'userId requis' });

//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

//     const startOfDay = new Date();
//     startOfDay.setHours(0, 0, 0, 0);

//     const alreadyPointed = await Attendance.findOne({
//       user: userId,
//       timestamp: { $gte: startOfDay },
//     });

//     if (alreadyPointed) {
//       return res.status(400).json({ error: 'Vous avez déjà pointé aujourd\'hui' });
//     }

//     const now = new Date();
//     const limitHour = new Date(now);
//     limitHour.setHours(9, 45, 0, 0); // Heure limite pour ne pas être en retard

//     let isRemote = false;

//     if (!user.remoteAllowed) {
//       if (latitude == null || longitude == null) {
//         return res.status(400).json({ error: 'Position GPS requise' });
//       }
// console.log(`Position reçue : lat=${latitude}, lon=${longitude}`);

//       const distance = getDistanceFromLatLonInMeters(
//         latitude,
//         longitude,
//         ALLOWED_LATITUDE,
//         ALLOWED_LONGITUDE
//       );
//       console.log(`Distance calculée : ${distance} mètres`);

//       if (distance > ALLOWED_RADIUS_METERS) {
//         return res.status(403).json({ error: 'Vous devez être à l\'adresse autorisée pour pointer' });
//       }
//     } else {
//       isRemote = true;
//     }

//     const status = now <= limitHour
//       ? (isRemote ? 'remote' : 'present')
//       : (isRemote ? 'remote' : 'late');

//     const attendance = new Attendance({
//       user: userId,
//       status,
//       timestamp: now,
//       location: isRemote ? null : { latitude, longitude },
//       remote: isRemote,
//     });

//     await attendance.save();
//     res.json({ message: 'Pointage enregistré', status });

//   } catch (err) {
//     console.error('Erreur pointage :', err);
//     res.status(500).json({ error: 'Erreur serveur' });
//   }
// };


// // GET /api/users
// exports.getUsers = async (req, res) => {
//   try {
//     const users = await User.find({}, 'firstname lastname email role remoteAllowed');

//     const startOfDay = new Date();
//     startOfDay.setHours(0, 0, 0, 0);

//     const usersWithStatus = await Promise.all(users.map(async user => {
//       const attendance = await Attendance.findOne({
//         user: user._id,
//         timestamp: { $gte: startOfDay },
//       }).sort({ timestamp: -1 });

//       return {
//         _id: user._id,
//         firstname: user.firstname,
//         lastname: user.lastname,
//         email: user.email,
//         role: user.role,
//         remoteAllowed: user.remoteAllowed,
//         status: attendance ? attendance.status : 'absent',
//       };
//     }));

//     res.json(usersWithStatus);
//   } catch (err) {
//     console.error('Erreur récupération utilisateurs :', err);
//     res.status(500).json({ error: 'Erreur serveur' });
//   }
// };

// // PATCH /api/users/:id/remote
// exports.setRemoteAllowed = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { remoteAllowed } = req.body;

//     if (typeof remoteAllowed !== 'boolean') {
//       return res.status(400).json({ error: 'remoteAllowed doit être un booléen' });
//     }

//     const user = await User.findByIdAndUpdate(id, { remoteAllowed }, { new: true });

//     if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

//     res.json({
//       message: `RemoteAllowed mis à jour pour ${user.firstname}`,
//       remoteAllowed: user.remoteAllowed,
//     });
//   } catch (err) {
//     console.error('Erreur mise à jour remoteAllowed :', err);
//     res.status(500).json({ error: 'Erreur serveur' });
//   }
// };

// // GET /api/attendance/today?userId=...
// exports.getTodayStatus = async (req, res) => {
//   try {
//     const { userId } = req.query;
//     if (!userId) return res.status(400).json({ error: 'userId requis' });

//     const startOfDay = new Date();
//     startOfDay.setHours(0, 0, 0, 0);

//     const attendance = await Attendance.findOne({
//       user: userId,
//       timestamp: { $gte: startOfDay },
//     });

//     if (!attendance) {
//       return res.json({ status: 'absent' });
//     }

//     res.json({
//       status: attendance.status,
//       timestamp: attendance.timestamp,
//       remote: attendance.remote,
//     });
//   } catch (err) {
//     console.error('Erreur récupération pointage du jour :', err);
//     res.status(500).json({ error: 'Erreur serveur' });
//   }
// };

// exports.requestRemote = async (req, res) => {
//   try {
//     const { userId, firstname, lastname, requestedStatus } = req.body;
//     if (!userId || !requestedStatus) {
//       return res.status(400).json({ error: 'userId et requestedStatus requis' });
//     }

//     const startOfDay = new Date();
//     startOfDay.setHours(0, 0, 0, 0);

//     const alreadyPointed = await Attendance.findOne({
//       user: userId,
//       timestamp: { $gte: startOfDay },
//     });

//     if (alreadyPointed) {
//       return res.status(400).json({ error: 'Vous avez déjà pointé aujourd\'hui' });
//     }

//     const io = socket.getIO();
//     io.emit('remote-request', { userId, firstname, lastname, requestedStatus });

//     res.status(200).json({ message: 'Demande envoyée' });

//   } catch (err) {
//     console.error('Erreur demande remote :', err);
//     res.status(500).json({ error: 'Erreur serveur' });
//   }
// };


// exports.approveRemote = async (req, res) => {
//   const { userId, status } = req.body;

//   try {
//     await Attendance.create({
//       user: userId,       
//       status,
//       timestamp: new Date(),
//       remote: true
//     });

//     res.status(200).json({ message: 'Pointage approuvé' });
//   } catch (err) {
//     console.error('Erreur lors du pointage remote:', err);
//     res.status(500).json({ error: 'Erreur lors de la validation du pointage' });
//   }
// };


const User = require('../models/User');
const Attendance = require('../models/Attendance');
const socket = require('../socket');

const ALLOWED_LATITUDE = 48.7957393;
const ALLOWED_LONGITUDE = 2.4482247;
const ALLOWED_RADIUS_METERS = 20000;

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// POST /api/attendance/point
exports.pointAttendance = async (req, res) => {
  try {
    const { userId, latitude, longitude } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId requis' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const alreadyPointed = await Attendance.findOne({
      user: userId,
      timestamp: { $gte: startOfDay }
    });

    if (alreadyPointed) {
      return res.status(400).json({ error: 'Vous avez déjà pointé aujourd\'hui' });
    }

    const now = new Date();
    const limitHour = new Date(now);
    limitHour.setHours(9, 45, 0, 0);

    let isRemote = false;
    if (!user.remoteAllowed) {
      if (latitude == null || longitude == null) {
        return res.status(400).json({ error: 'Position GPS requise' });
      }

      const distance = getDistanceFromLatLonInMeters(
        latitude, longitude,
        ALLOWED_LATITUDE, ALLOWED_LONGITUDE
      );

      if (distance > ALLOWED_RADIUS_METERS) {
        return res.status(403).json({ error: 'Vous devez être à l\'adresse autorisée pour pointer' });
      }
    } else {
      isRemote = true;
    }

    const status = now <= limitHour
      ? (isRemote ? 'remote' : 'present')
      : (isRemote ? 'remote' : 'late');

    const attendance = new Attendance({
      user: userId,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      status,
      timestamp: now,
      location: isRemote ? null : { latitude, longitude },
      remote: isRemote,
      source: 'user'
    });

    await attendance.save();
    res.json({ message: 'Pointage enregistré', status });

  } catch (err) {
    console.error('Erreur pointage :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET /api/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'firstname lastname email role remoteAllowed');

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const usersWithStatus = await Promise.all(users.map(async user => {
      const attendance = await Attendance.findOne({
        user: user._id,
        timestamp: { $gte: startOfDay }
      }).sort({ timestamp: -1 });

      return {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        remoteAllowed: user.remoteAllowed,
        status: attendance ? attendance.status : 'absent',
      };
    }));

    res.json(usersWithStatus);
  } catch (err) {
    console.error('Erreur récupération utilisateurs :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// PATCH /api/users/:id/remote
exports.setRemoteAllowed = async (req, res) => {
  try {
    const { id } = req.params;
    const { remoteAllowed } = req.body;

    if (typeof remoteAllowed !== 'boolean') {
      return res.status(400).json({ error: 'remoteAllowed doit être un booléen' });
    }

    const user = await User.findByIdAndUpdate(id, { remoteAllowed }, { new: true });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    res.json({
      message: `RemoteAllowed mis à jour pour ${user.firstname}`,
      remoteAllowed: user.remoteAllowed,
    });
  } catch (err) {
    console.error('Erreur mise à jour remoteAllowed :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET /api/attendance/today?userId=...
exports.getTodayStatus = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId requis' });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      user: userId,
      timestamp: { $gte: startOfDay }
    });

    if (!attendance) return res.json({ status: 'absent' });

    res.json({
      status: attendance.status,
      timestamp: attendance.timestamp,
      remote: attendance.remote,
      source: attendance.source
    });
  } catch (err) {
    console.error('Erreur récupération pointage du jour :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// POST /api/attendance/request-remote
exports.requestRemote = async (req, res) => {
  try {
    const { userId, firstname, lastname, requestedStatus } = req.body;
    if (!userId || !requestedStatus) {
      return res.status(400).json({ error: 'userId et requestedStatus requis' });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const alreadyPointed = await Attendance.findOne({
      user: userId,
      timestamp: { $gte: startOfDay }
    });

    if (alreadyPointed) {
      return res.status(400).json({ error: 'Vous avez déjà pointé aujourd\'hui' });
    }

    const io = socket.getIO();
    io.emit('remote-request', { userId, firstname, lastname, requestedStatus });

    res.status(200).json({ message: 'Demande envoyée' });

  } catch (err) {
    console.error('Erreur demande remote :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// POST /api/attendance/approve-remote
exports.approveRemote = async (req, res) => {
  const { userId, status } = req.body;

  try {
    // 🔍 Vérifie que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // ✅ Crée l’enregistrement de pointage
    await Attendance.create({
      user: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      status,
      timestamp: new Date(),
      remote: true,
      source: 'admin'
    });

    res.status(200).json({ message: 'Pointage approuvé' });
  } catch (err) {
    console.error('Erreur lors du pointage remote:', err);
    res.status(500).json({ error: 'Erreur lors de la validation du pointage' });
  }
};