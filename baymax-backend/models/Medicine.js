const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  dose: {
    type: String,
    required: true,
    trim: true
  },
  program: {
    type: Number,
    required: true,
    min: 1
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  foodRelation: {
    type: String,
    required: true,
    enum: ['Before food', 'After food']
  },
  dailyDosage: {
    morning: { type: Number, default: 0 },
    noon: { type: Number, default: 0 },
    night: { type: Number, default: 0 }
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  intakeHistory: [{
    date: { type: Date, required: true },
    morning: {
      taken: { type: Boolean, default: false },
      time: { type: Date }
    },
    noon: {
      taken: { type: Boolean, default: false },
      time: { type: Date }
    },
    night: {
      taken: { type: Boolean, default: false },
      time: { type: Date }
    }
  }],
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Medicine', medicineSchema);
