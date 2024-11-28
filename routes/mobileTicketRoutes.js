const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Flight = require('../models/Flight');

// Bilet satın alma rotası
router.post('/', async (req, res) => {
  try {
    const { flightId, passengerName } = req.body;

    // Uçuş doğrulama
    const flight = await Flight.findById(flightId);
    if (!flight || flight.seatsAvailable <= 0) {
      return res.status(400).json({ status: 'error', message: 'No available seats or flight not found' });
    }

    // Yeni bilet oluşturma
    const ticket = new Ticket({ flightId, passengerName });
    await ticket.save();

    // Koltuk sayısını güncelleme
    flight.seatsAvailable -= 1;
    await flight.save();

    res.status(201).json({ status: 'success', ticket });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Check-in işlemi rotası
router.post('/checkin', async (req, res) => {
  try {
    const { ticketId } = req.body;

    // Parametre kontrolü
    if (!ticketId) {
      return res.status(400).json({ status: 'error', message: 'Missing required parameter: ticketId' });
    }

    // Bilet doğrulama
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ status: 'error', message: 'Ticket not found' });
    }

    // Zaten check-in yapılmış mı kontrolü
    if (ticket.checkedIn) {
      return res.status(400).json({ status: 'error', message: 'Ticket already checked in' });
    }

    // Check-in işlemi
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
