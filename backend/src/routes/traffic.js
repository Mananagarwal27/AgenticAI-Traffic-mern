const express = require('express');
const TrafficData = require('../models/TrafficData');
const { protect } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

router.get('/', protect, async (req, res) => {
  try {
    const { junction, limit = 100, from, to } = req.query;
    const query = {};
    if (junction) query.junctionName = junction;
    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }
    const data = await TrafficData.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const record = await TrafficData.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/prediction', protect, async (req, res) => {
  try {
    const { vehicleCount, averageSpeed, weatherCondition, junctionName } = req.query;
    const response = await axios.get(`${AI_SERVICE_URL}/api/predict`, {
      params: { vehicleCount, averageSpeed, weatherCondition, junctionName }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.response?.data?.detail || error.message
    });
  }
});

module.exports = router;
