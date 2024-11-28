const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');
const authenticate = require('../middlewares/auth');

// Insert Flight (Admin)
router.post('/', authenticate, async (req, res) => {
  try {
    const { from, to, dateRange, days, capacity } = req.body;

    if (!from || !to || !dateRange || !days || !capacity) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters: from, to, dateRange, days, or capacity',
      });
    }

    if (dateRange.length !== 2) {
      return res.status(400).json({
        status: 'error',
        message: 'dateRange must include exactly two dates: [startDate, endDate]',
      });
    }

    const [startDate, endDate] = dateRange.map(date => new Date(date));
    if (startDate > endDate) {
      return res.status(400).json({
        status: 'error',
        message: 'startDate must be before endDate',
      });
    }

    const flights = [];
    let current = new Date(startDate);

    while (current <= endDate) {
      const dayName = current.toLocaleString('en-US', { weekday: 'long' });
      if (days.includes(dayName)) {
        const newFlight = new Flight({
          from,
          to,
          date: new Date(current),
          capacity: parseInt(capacity, 10),
          seatsAvailable: parseInt(capacity, 10),
        });
        flights.push(newFlight.save());
      }
      current.setDate(current.getDate() + 1);
    }

    await Promise.all(flights);

    res.status(201).json({ status: 'success', message: 'Flights added successfully' });
  } catch (err) {
    console.error('Error inserting flights:', err);
    res.status(500).json({ status: 'error', message: 'An error occurred while adding flights' });
  }
});

// Report Flights with Capacity (Paging Included)
router.get('/capacity', authenticate, async (req, res) => {
  try {
    const { from, to, dateRange, capacity, offset = 0, limit = 10 } = req.query;

    if (!from || !to || !dateRange || !capacity) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters: from, to, dateRange, or capacity',
      });
    }

    const dates = Array.isArray(dateRange) ? dateRange : dateRange.split(',');
    if (dates.length !== 2 || isNaN(new Date(dates[0])) || isNaN(new Date(dates[1]))) {
      return res.status(400).json({
        status: 'error',
        message: 'dateRange must include two valid dates: [startDate, endDate]',
      });
    }

    const [startDate, endDate] = dates.map(date => new Date(date));
    if (startDate > endDate) {
      return res.status(400).json({
        status: 'error',
        message: 'startDate must be before endDate',
      });
    }

    const offsetNumber = parseInt(offset, 10);
    const limitNumber = parseInt(limit, 10);

    const flights = await Flight.find({
      from,
      to,
      date: { $gte: startDate, $lte: endDate },
      seatsAvailable: { $gte: capacity },
    })
      .skip(offsetNumber)
      .limit(limitNumber);

    const total = await Flight.countDocuments({
      from,
      to,
      date: { $gte: startDate, $lte: endDate },
      seatsAvailable: { $gte: capacity },
    });

    res.status(200).json({
      total,
      offset: offsetNumber,
      limit: limitNumber,
      flights,
      message: flights.length > 0
        ? 'Flights fetched successfully'
        : 'No flights available for the given criteria',
    });
  } catch (err) {
    console.error('Error fetching flights:', err);
    res.status(500).json({ status: 'error', message: 'An error occurred while fetching flights' });
  }
});

module.exports = router;
