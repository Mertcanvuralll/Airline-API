const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');

// Mobile Flights Query with Dynamic Paging
router.get('/', async (req, res) => {
  try {
    const { from, to, dateRange, offset = 0, limit = 10 } = req.query;

    // Parametrelerin doğruluğunu kontrol et
    if (!from || !to || !dateRange) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters: from, to, or dateRange',
      });
    }

    // dateRange doğrulaması
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

    // Offset ve limit değerlerini sayıya çevir
    const offsetNumber = parseInt(offset, 10);
    const limitNumber = parseInt(limit, 10);

    // Uçuşları filtrele ve offset/limit uygula
    const flights = await Flight.find({
      from,
      to,
      date: { $gte: startDate, $lte: endDate },
      seatsAvailable: { $gt: 0 },
    })
      .skip(offsetNumber)
      .limit(limitNumber);

    // Toplam kayıt sayısını hesapla
    const total = await Flight.countDocuments({
      from,
      to,
      date: { $gte: startDate, $lte: endDate },
      seatsAvailable: { $gt: 0 },
    });

    // Yanıt formatı
    res.status(200).json({
      total,
      offset: offsetNumber,
      limit: limitNumber,
      flights,
      message:
        flights.length > 0
          ? 'Flights fetched successfully'
          : 'No flights available for the given criteria', // Mesaj her zaman dönecek
    });
  } catch (err) {
    console.error('Error fetching flights:', err);
    res.status(500).json({ status: 'error', message: 'An error occurred while fetching flights' });
  }
});

module.exports = router;
