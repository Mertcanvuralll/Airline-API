const mongoose = require('mongoose');

const FlightSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  date: { type: Date, required: true },
  capacity: { type: Number, required: true },
  seatsAvailable: { type: Number, required: true },
});

module.exports = mongoose.model('Flight', FlightSchema);
