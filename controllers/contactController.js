const Contact = require('../models/contactModel');

exports.submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    await Contact.create({ name, email, message });
    res.status(200).json({ message: 'Contact enregistré' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};