const mongoose = require('mongoose');

const predictionLogSchema = new mongoose.Schema({
  junctionName: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  inputFeatures: {
    vehicleCount: Number,
    averageSpeed: Number,
    weatherCondition: String
  },
  predictedCongestion: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  modelVersion: {
    type: String,
    default: 'v1'
  }
}, { timestamps: true });

predictionLogSchema.index({ junctionName: 1, timestamp: -1 });

module.exports = mongoose.model('PredictionLog', predictionLogSchema);
