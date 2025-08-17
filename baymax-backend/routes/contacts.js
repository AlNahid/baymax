const express = require('express');
const Contact = require('../models/Contact');

const router = express.Router();

// Get all contacts for the authenticated user
router.get('/', require('../middleware/auth'), async (req, res) => {
  try {
    const contacts = await Contact.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ status: 'success', data: { contacts } });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.json({ status: 'error', message: 'Failed to fetch contacts' });
  }
});

// Add new contact
router.post('/', require('../middleware/auth'), async (req, res) => {
  try {
    const { name, type, phone } = req.body;
    
    const contact = new Contact({
      userId: req.user._id,
      name,
      type,
      phone
    });
    
    await contact.save();
    res.json({ status: 'success', data: { contact } });
  } catch (error) {
    console.error('Add contact error:', error);
    res.json({ status: 'error', message: 'Failed to add contact' });
  }
});

// Delete contact
router.delete('/:id', require('../middleware/auth'), async (req, res) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!contact) {
      return res.json({ status: 'error', message: 'Contact not found' });
    }
    
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ status: 'success', message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.json({ status: 'error', message: 'Failed to delete contact' });
  }
});

module.exports = router;
