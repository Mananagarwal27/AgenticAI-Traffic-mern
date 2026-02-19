const mongoose = require('mongoose');

const trafficDataSchema = new mongoose.Schema({
  junctionName: {
    type: String,
    required: true,
    enum: ['AIIMS', 'ITO', 'Connaught Place', 'Karol Bagh', 'Lajpat Nagar']
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  vehicleCount: {
    type: Number,
    required: true,
    min: 0
  },
  averageSpeed: {
    type: Number,
    required: true,
    min: 0,
    max: 80
  },
  congestionLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  weatherCondition: {
    type: String,
    enum: ['Clear', 'Cloudy', 'Rain', 'Fog', 'Heat'],
    default: 'Clear'
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  }
}, { timestamps: true });

trafficDataSchema.index({ junctionName: 1, timestamp: -1 });
trafficDataSchema.index({ timestamp: -1 });

module.exports = mongoose.model('TrafficData', trafficDataSchema);
