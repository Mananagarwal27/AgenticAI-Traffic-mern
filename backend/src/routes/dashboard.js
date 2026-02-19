const express = require('express');
const TrafficData = require('../models/TrafficData');
const TrafficSignal = require('../models/TrafficSignal');
const PredictionLog = require('../models/PredictionLog');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', protect, async (req, res) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const [totalRecords, recentCongestion, signalCount, recentPredictions] = await Promise.all([
      TrafficData.countDocuments(),
      TrafficData.find({ timestamp: { $gte: oneDayAgo } })
        .sort({ timestamp: -1 })
        .limit(50)
        .lean(),
      TrafficSignal.countDocuments(),
      PredictionLog.find().sort({ timestamp: -1 }).limit(10).lean()
    ]);

    const congestionByJunction = recentCongestion.reduce((acc, r) => {
      if (!acc[r.junctionName]) acc[r.junctionName] = { Low: 0, Medium: 0, High: 0 };
      acc[r.junctionName][r.congestionLevel]++;
      return acc;
    }, {});

    const trend = await TrafficData.aggregate([
      { $match: { timestamp: { $gte: oneDayAgo } } },
      { $group: { _id: { $hour: '$timestamp' }, avgCongestion: { $avg: { $cond: [{ $eq: ['$congestionLevel', 'High'] }, 3, { $cond: [{ $eq: ['$congestionLevel', 'Medium'] }, 2, 1] }] } } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalRecords,
        signalCount,
        congestionByJunction,
        hourlyTrend: trend,
        recentPredictions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
