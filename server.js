'use strict';
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

const app = express();

// Seguridad
app.use(helmet({
  contentSecurityPolicy: false
}));

app.use('/public', express.static(process.cwd() + '/public'));
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Front-end
app.route('/b/:board/')
  .get((req, res) => res.sendFile(process.cwd() + '/views/board.html'));

app.route('/b/:board/:threadid')
  .get((req, res) => res.sendFile(process.cwd() + '/views/thread.html'));

app.route('/')
  .get((req, res) => res.sendFile(process.cwd() + '/views/index.html'));

// 🔥 PRIMERO conectar MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("Connected to MongoDB");

  // 🔥 LUEGO cargar rutas FCC y API
  fccTestingRoutes(app);
  apiRoutes(app);
})
.catch(err => console.error("MongoDB error:", err));

// 404
app.use((req, res) => {
  res.status(404).type('text').send('Not Found');
});

// Start server
const PORT = process.env.PORT || 5000;
const listener = app.listen(PORT, () => {
  console.log('Listening on port ' + listener.address().port);

  if (process.env.NODE_ENV === 'test') {
    setTimeout(() => {
      try {
        runner.run();
      } catch (e) {
        console.error(e);
      }
    }, 1500);
  }
});

module.exports = app;
