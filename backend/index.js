require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

const app = express();

// Connect to database
connectDB();

// Init Middleware
app.use(cors());
app.use(express.json({ extended: false, limit: '6mb' }));

// Define Routes
app.use('/auth', require('./routes/auth'));
app.use('/', require('./routes/evaluation'));
app.use('/', require('./routes/exams'));
app.use('/', require('./routes/examSession'));
app.use('/', require('./routes/integrity'));
app.use('/', require('./routes/proctor'));
app.use('/', require('./routes/users'));
app.use('/', require('./routes/candidate'));
app.use('/', require('./routes/admin'));

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
