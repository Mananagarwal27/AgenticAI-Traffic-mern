require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const trafficRoutes = require('./routes/traffic');
const signalsRoutes = require('./routes/signals');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', methods: ['GET', 'POST'] }
});

app.set('io', io);
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/traffic', trafficRoutes);
app.use('/api/signals', signalsRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/delhi_traffic')
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
