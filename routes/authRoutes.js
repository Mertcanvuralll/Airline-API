const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Örnek bir kullanıcı veritabanı
const users = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
  { id: 2, username: 'user', password: 'user123', role: 'user' }
];

// Login endpoint
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Kullanıcı doğrulama
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ status: 'error', message: 'Invalid username or password' });
  }

  // JWT oluşturma
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.status(200).json({ status: 'success', token });
});

module.exports = router;
