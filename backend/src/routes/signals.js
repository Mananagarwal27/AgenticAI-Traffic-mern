const express = require('express');
const TrafficSignal = require('../models/TrafficSignal');
const TrafficData = require('../models/TrafficData');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const signals = await TrafficSignal.find().lean();
    res.json({ success: true, data: signals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:junctionName', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { greenTime, redTime } = req.body;
    const signal = await TrafficSignal.findOneAndUpdate(
      { junctionName: req.params.junctionName },
      { greenTime: greenTime || 60, redTime: redTime || 60, lastUpdated: new Date(), updatedBy: 'manual' },
      { new: true, runValidators: true }
    );
    if (!signal) {
      return res.status(404).json({ success: false, message: 'Junction not found' });
    }
    req.app.get('io').emit('signalUpdate', signal);
    res.json({ success: true, data: signal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/optimize', protect, restrictTo('admin'), async (req, res) => {
  try {
    const axios = require('axios');
    const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const trafficData = await TrafficData.find().sort({ timestamp: -1 }).limit(50).lean();
    const response = await axios.post(`${AI_URL}/api/optimize`, { trafficData });
    const updates = response.data.updates || [];
    const io = req.app.get('io');
    const applied = [];
    for (const update of updates) {
      const signal = await TrafficSignal.findOneAndUpdate(
        { junctionName: update.junctionName },
        { greenTime: update.greenTime, redTime: update.redTime, lastUpdated: new Date(), updatedBy: 'ai_optimization' },
        { new: true }
      );
      if (signal) {
        io.emit('signalUpdate', signal);
        applied.push(signal);
      }
    }
    res.json({ success: true, updates: applied });
  } catch (error) {
    res.status(500).json({ success: false, message: error.response?.data?.detail || error.message });
  }
});

module.exports = router;
