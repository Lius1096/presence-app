// const jwt = require('jsonwebtoken');

// function verifyToken(req, res, next) {
//   const bearerHeader = req.headers['authorization'];
//   if (!bearerHeader) return res.status(401).json({ error: 'Token manquant' });

//   const token = bearerHeader.split(' ')[1];
//   if (!token) return res.status(401).json({ error: 'Token manquant' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch {
//     res.status(401).json({ error: 'Token invalide' });
//   }
// }

// function isAdmin(req, res, next) {
//   if (!req.user || req.user.role !== 'admin') {
//     return res.status(403).json({ error: 'Accès refusé, admin uniquement' });
//   }
//   next();
// }

// module.exports = { verifyToken, isAdmin };


const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET non défini dans les variables d'environnement");
}

function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if (!bearerHeader) return res.status(401).json({ error: 'Token manquant' });

  const token = bearerHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Séparation claire
    req.user = decoded.user;     // { _id, firstname, lastname, email }
    req.userRole = decoded.role; // 'user' ou 'admin'

    next();
  } catch (err) {
    console.error('Erreur de vérification du token :', err.message);
    res.status(401).json({ error: 'Token invalide' });
  }
}

function isAdmin(req, res, next) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé, admin uniquement' });
  }
  next();
}


module.exports = { verifyToken, isAdmin };
