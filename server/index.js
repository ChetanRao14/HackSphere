const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/team', require('./routes/team'));
app.use('/api/judge', require('./routes/judge'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/hackathons', require('./routes/hackathons'));

// Default Route
app.get('/', (req, res) => {
  res.send('HackSphere API is running...');
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
