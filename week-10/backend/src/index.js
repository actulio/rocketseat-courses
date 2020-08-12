const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
// const 
const {setupWebSocket} = require('./webscoket');
const routes = require('./routes');

const app = express();
const server = http.Server(app);

setupWebSocket(server);

const connectionString = ''; // your mongodb atlas password 

mongoose.connect(connectionString, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

app.use(cors());
app.use(express.json());

app.use(routes);
server.listen(3333);
