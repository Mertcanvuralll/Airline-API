require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();

// MongoDB Bağlantısı
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Middleware
app.use(bodyParser.json());

// Rota Loglama (istekleri loglamak için faydalı bir middleware)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/v1/admin/flights', require('./routes/adminFlightRoutes'));
app.use('/api/v1/mobile/flights', require('./routes/mobileFlightRoutes'));
app.use('/api/v1/tickets', require('./routes/mobileTicketRoutes'));
app.use('/api/v1/auth', require('./routes/authRoutes'));

// Swagger UI
app.use('/api/v1/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Temel Rota
app.get('/', (req, res) => {
  res.send('API is running. Use /api/v1/ endpoints.');
});

// Sunucu Başlatma
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
