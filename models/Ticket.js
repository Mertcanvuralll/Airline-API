const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
  passengerName: { type: String, required: true },
  checkedIn: { type: Boolean, default: false },
});

module.exports = mongoose.model('Ticket', TicketSchema);
