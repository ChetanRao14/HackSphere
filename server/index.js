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
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Drop old unique index for createdBy safely
    try {
      if (mongoose.connection.db) {
        await mongoose.connection.collection('teams').dropIndex('createdBy_1');
        console.log('Dropped old createdBy_1 index');
      }
    } catch (e) {
      // Ignore if index doesn't exist
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

// If running locally, listen on port
connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
});

// Export the app for serverless and the db connector functions
module.exports = { app, connectDB };
