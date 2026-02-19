const mongoose = require('mongoose');

const trafficSignalSchema = new mongoose.Schema({
  junctionName: {
    type: String,
    required: true,
    unique: true,
    enum: ['AIIMS', 'ITO', 'Connaught Place', 'Karol Bagh', 'Lajpat Nagar']
  },
  greenTime: {
    type: Number,
    required: true,
    min: 20,
    max: 120,
    default: 60
  },
  redTime: {
    type: Number,
    required: true,
    min: 20,
    max: 120,
    default: 60
  },
  yellowTime: {
    type: Number,
    default: 5,
    min: 3,
    max: 10
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: String,
    enum: ['system', 'manual', 'ai_optimization'],
    default: 'system'
  }
}, { timestamps: true });

module.exports = mongoose.model('TrafficSignal', trafficSignalSchema);
