const express = require('express');
const client = require('prom-client');
const bodyParser = require('body-parser');

const app = express();
const register = new client.Registry();

client.collectDefaultMetrics({ register });

// Set up an object to store multiple meters
const meters = {};

// Set up an object to store building meters
const buildingMeters = {};

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// POST endpoint to receive meter readings
app.post('/meter_reading', (req, res) => {
  const { meterName, reading, timestamp } = req.body;

  if (!meterName || reading === undefined || !timestamp) {
    return res.status(400).send('Missing required fields: meterName, reading, timestamp');
  }

  // Create or update the gauge for the specific meter
  if (!meters[meterName]) {
    meters[meterName] = new client.Gauge({
      name: `meter_reading_${meterName}`,
      help: `Energy meter reading for ${meterName} in kWh`,
      labelNames: ['timestamp'],
    });
    register.registerMetric(meters[meterName]);
  }

  meters[meterName].set({ timestamp: timestamp.toString() }, reading);
  console.log(meters);
  res.send('Reading recorded');
});

// POST endpoint to receive building meter readings
app.post('/building_meter_reading_A', (req, res) => {
  const { id, meterName, reading, timestamp } = req.body;
  console.log(req.body);
  if (!id || !meterName || reading === undefined || !timestamp) {
    return res.status(400).send('Missing required fields: id, meterName, reading, timestamp');
  }

  // Create or update the gauge for the specific meter
  if (!buildingMeters[id]) {
    buildingMeters[id] = new client.Gauge({
      name: `building_meter_reading_${id}`,
      help: `Energy meter reading for building ${id} - ${meterName} in kWh`,
      labelNames: ['timestamp'],
    });
    register.registerMetric(buildingMeters[id]);
  }

  buildingMeters[id].set({ timestamp: timestamp.toString() }, reading);
  console.log(buildingMeters);
  res.status(200).send({data: "Data Succesfully recorded"});
});

// app.post('/building_meter_reading_A', (req, res) => {
//   const { id, meterName, reading, timestamp } = req.body;

//   if (!id || !meterName || reading === undefined || !timestamp) {
//     return res.status(400).send('Missing required fields: id, meterName, reading, timestamp');
//   }

//   // Create or update the gauge for the specific meter
//   if (!buildingMeters[id]) {
//     buildingMeters[id] = new client.Gauge({
//       name: `building_meter_reading_${id}`,
//       help: `Energy meter reading for building ${id} - ${meterName} in kWh`,
//       labelNames: ['timestamp'],
//     });
//     register.registerMetric(buildingMeters[id]);
//   }

//   buildingMeters[id].set({ timestamp: timestamp.toString() }, reading);
//   console.log(buildingMeters);
//   res.send('Reading recorded');
// });



const tankVolume = new client.Gauge({
  name: 'tank_data',
  help: 'Volume of liquid in the tank',
  labelNames: ['tankName', 'date'],
});
register.registerMetric(tankVolume);

app.post('/tank_volume', (req, res) => {
  const { tankName, diameter, level, date } = req.body;

  if (!tankName || diameter === undefined || level === undefined || !date) {
    return res.status(400).send('Missing required fields: tankName, diameter, level, date');
  }

  const radius = diameter / 2;
  const volume = Math.PI * Math.pow(radius, 2) * level;

  tankVolume.labels(tankName, date).set(volume);
  res.send('Tank volume recorded');
});


// Endpoint to expose metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Start the server
const port = 3001;
app.listen(port, () => {
  console.log(`Energy meter exporter listening at http://localhost:${port}`);
});
