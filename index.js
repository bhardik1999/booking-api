const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('DB Connected'));

// Schema
const LicenseKey = require('./models/LicenseKey');

// Routes
app.get('/api/verify', async (req, res) => {
  const key = req.query.key;
  const found = await LicenseKey.findOne({ key, status: 'active' });
  return res.json({ valid: !!found });
});

app.post('/api/add', async (req, res) => {
  const { key, issuedTo } = req.body;
  const newKey = new LicenseKey({ key, issuedTo });
  await newKey.save();
  res.json({ success: true });
});

app.listen(3000, () => console.log('Running on port 3000'));
