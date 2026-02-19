/**
 * Delhi Traffic Dataset Generator
 * Generates 3000-5000 synthetic records based on real Delhi junction patterns
 * Run: node generate_dataset.js
 */

const fs = require('fs');
const path = require('path');

const JUNCTIONS = [
  { name: 'AIIMS', lat: 28.5670, lng: 77.2090 },
  { name: 'ITO', lat: 28.6328, lng: 77.2197 },
  { name: 'Connaught Place', lat: 28.6315, lng: 77.2167 },
  { name: 'Karol Bagh', lat: 28.6519, lng: 77.1909 },
  { name: 'Lajpat Nagar', lat: 28.5678, lng: 77.2431 }
];

const WEATHER = ['Clear', 'Cloudy', 'Rain', 'Fog', 'Heat'];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getCongestionLevel(vehicleCount, avgSpeed) {
  if (vehicleCount > 80 || avgSpeed < 15) return 'High';
  if (vehicleCount > 50 || avgSpeed < 25) return 'Medium';
  return 'Low';
}

function generateRecord(baseDate, junction) {
  const hour = randomBetween(0, 23);
  const minute = randomBetween(0, 59);
  const timestamp = new Date(baseDate);
  timestamp.setHours(hour, minute, 0, 0);

  const isPeakHour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20);
  const vehicleCount = isPeakHour 
    ? randomBetween(60, 120) 
    : randomBetween(20, 80);
  const averageSpeed = isPeakHour 
    ? randomBetween(10, 35) 
    : randomBetween(25, 55);
  const congestionLevel = getCongestionLevel(vehicleCount, averageSpeed);
  const weatherCondition = WEATHER[randomBetween(0, WEATHER.length - 1)];

  return {
    junctionName: junction.name,
    timestamp: timestamp.toISOString(),
    vehicleCount,
    averageSpeed,
    congestionLevel,
    weatherCondition,
    latitude: junction.lat,
    longitude: junction.lng
  };
}

function main() {
  const recordCount = randomBetween(3500, 5000);
  const records = [];
  const baseDate = new Date('2024-01-01');

  for (let i = 0; i < recordCount; i++) {
    const junction = JUNCTIONS[randomBetween(0, JUNCTIONS.length - 1)];
    const daysOffset = randomBetween(0, 90);
    const date = new Date(baseDate);
    date.setDate(date.getDate() + daysOffset);
    records.push(generateRecord(date, junction));
  }

  records.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const outputPath = path.join(__dirname, 'delhi_traffic_sample.json');
  fs.writeFileSync(outputPath, JSON.stringify(records, null, 2), 'utf8');
  
  console.log(`Generated ${records.length} records`);
  console.log(`Saved to ${outputPath}`);
  
  const levelCounts = records.reduce((acc, r) => {
    acc[r.congestionLevel] = (acc[r.congestionLevel] || 0) + 1;
    return acc;
  }, {});
  console.log('Congestion distribution:', levelCounts);
}

main();
