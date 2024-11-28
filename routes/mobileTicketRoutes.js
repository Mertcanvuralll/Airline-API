const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Flight = require('../models/Flight');

// Ticket Purchase Route
router.post('/', async (req, res) => {
  try {
    const { flightId, passengerName } = req.body;

    // Flight Validation
    const flight = await Flight.findById(flightId);
    if (!flight || flight.seatsAvailable <= 0) {
      return res.status(400).json({ status: 'error', message: 'No available seats or flight not found' });
    }

    // Create New Ticket
    const ticket = new Ticket({ flightId, passengerName });
    await ticket.save();

   // Update Seat Count
    flight.seatsAvailable -= 1;
    await flight.save();

    res.status(201).json({ status: 'success', ticket });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Check-in Process Route
router.post('/checkin', async (req, res) => {
  try {
    const { ticketId } = req.body;

    // Parameter Validation
    if (!ticketId) {
      return res.status(400).json({ status: 'error', message: 'Missing required parameter: ticketId' });
    }

    // Ticket Validation
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ status: 'error', message: 'Ticket not found' });
    }

    // Check if Already Checked-in
    if (ticket.checkedIn) {
      return res.status(400).json({ status: 'error', message: 'Ticket already checked in' });
    }

    // Perform Check-in
    ticket.checkedIn = true;
    await ticket.save();

    res.status(200).json({
      status: 'success',
      message: 'Check-in successful',
      ticket,
    });
  } catch (err) {
    console.error('Error during check-in:', err);
    res.status(500).json({ status: 'error', message: 'An error occurred during check-in' });
  }
});

module.exports = router;
