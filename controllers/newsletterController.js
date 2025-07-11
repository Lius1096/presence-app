const Newsletter = require('../models/newsletterModel');

exports.subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    await Newsletter.create({ email });
    res.status(200).json({ message: 'Inscription enregistrée' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};