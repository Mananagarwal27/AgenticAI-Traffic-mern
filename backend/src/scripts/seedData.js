require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const TrafficData = require('../models/TrafficData');
const TrafficSignal = require('../models/TrafficSignal');
const User = require('../models/User');

const JUNCTIONS = ['AIIMS', 'ITO', 'Connaught Place', 'Karol Bagh', 'Lajpat Nagar'];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/delhi_traffic');
  
  const dataPath = path.join(__dirname, '../../data/delhi_traffic_sample.json');
  const altPath = path.join(process.cwd(), 'data', 'delhi_traffic_sample.json');
  const filePath = fs.existsSync(dataPath) ? dataPath : altPath;
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    await TrafficData.deleteMany({});
    await TrafficData.insertMany(data);
    console.log(`Seeded ${data.length} traffic records`);
  }

  await TrafficSignal.deleteMany({});
  const signals = JUNCTIONS.map(name => ({
    junctionName: name,
    greenTime: 60,
    redTime: 60,
    yellowTime: 5,
    updatedBy: 'system'
  }));
  await TrafficSignal.insertMany(signals);
  console.log(`Seeded ${signals.length} traffic signals`);

  const adminExists = await User.findOne({ email: 'admin@delhi.gov.in' });
  if (!adminExists) {
    await User.create({
      name: 'Admin',
      email: 'admin@delhi.gov.in',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Created admin user: admin@delhi.gov.in / admin123');
  }

  await mongoose.disconnect();
  console.log('Seed complete');
}

seed().catch(console.error);
