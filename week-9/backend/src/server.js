const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const socketio = require('socket.io');
const http = require('http');
const routes = require('./routes');

const app = express();
const server = http.Server(app);
const io = socketio(server);

const connectedUsers = {};

mongoose.connect('mongodb+srv://omnistack:iJGBU5FOL8jRcWfL@cluster0-fhpzp.mongodb.net/week9?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

io.on('connection', (socket) => {
  // eslint-disable-next-line camelcase
  const { user_id } = socket.handshake.query;

  connectedUsers[user_id] = socket.id;
});

app.use((req, res, next) => {
  req.io = io;
  req.connectedUsers = connectedUsers;

  return next();
});

app.use(cors());
app.use(express.json());
app.use(routes);
app.use('/files', express.static(path.resolve(__dirname, '..', 'uploads')));

server.listen(3335);
