import socketio from 'socket.io-client';
import config from '../constants/config';

const socket = socketio(config.backend_url, {
	autoConnect: false,
});

function subscribeToNewDevs(subscribeFunction){
	socket.on('new-dev', subscribeFunction);
}

function connect( latitude, longitude, techs ) {
	socket.io.opts.query = {
		latitude,
		longitude,
		techs,
	}
	socket.connect();
}

function disconnect() {
	if(socket.connected){
		socket.disconnect();
	}
}

export {
	connect,
	disconnect,
	subscribeToNewDevs
}