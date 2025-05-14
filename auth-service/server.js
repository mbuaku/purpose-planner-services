require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err));

// Routes
app.get('/', (req, res) => {
  res.send('Auth Service is running');
});

// Import routes (to be implemented)
// const authRoutes = require('./src/routes/auth.routes');
// app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});

// Export for testing
module.exports = app;