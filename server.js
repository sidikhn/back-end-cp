const express = require('express');
const bodyParser = require('body-parser');
const userRouter = require('./src/users/user.router');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/', userRouter);

// Example route to check if the server is running
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
