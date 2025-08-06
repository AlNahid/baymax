const express = require('express');
const Medicine = require('../models/Medicine');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all medicines for user
router.get('/', auth, async (req, res) => {
  const medicines = await Medicine.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ status: 'success', data: { medicines } });
});

// Get single medicine
router.get('/:id', auth, async (req, res) => {
  const medicine = await Medicine.findOne({ _id: req.params.id, user: req.user._id });
  res.json({ status: 'success', data: { medicine } });
});

// Add new medicine
router.post('/', auth, async (req, res) => {
  const medicine = new Medicine({ ...req.body, user: req.user._id });
  await medicine.save();
  res.status(201).json({ status: 'success', data: { medicine } });
});

// Update medicine
router.put('/:id', auth, async (req, res) => {
  const medicine = await Medicine.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
  res.json({ status: 'success', data: { medicine } });
});

// Delete medicine
router.delete('/:id', auth, async (req, res) => {
  const medicine = await Medicine.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ status: 'success' });
});

// Record medicine intake
router.post('/:id/take', auth, async (req, res) => {
  const { timeOfDay, taken, count = 1 } = req.body;
  const medicine = await Medicine.findOne({ _id: req.params.id, user: req.user._id });

  const today = new Date().toISOString().split('T')[0];
  if (!medicine.intakeHistory) medicine.intakeHistory = [];

  let todayIntake = medicine.intakeHistory.find(intake => intake.date.toISOString().split('T')[0] === today);
  if (!todayIntake) {
    todayIntake = { date: new Date(), morning: { taken: false, time: null }, noon: { taken: false, time: null }, night: { taken: false, time: null } };
    medicine.intakeHistory.push(todayIntake);
  }

  if (taken) {
    medicine.quantity -= count;
    todayIntake[timeOfDay] = { taken: true, time: new Date() };
  } else {
    medicine.quantity += count;
    todayIntake[timeOfDay] = { taken: false, time: null };
  }

  await medicine.save();
  res.json({ status: 'success', data: { medicine } });
});

module.exports = router;
