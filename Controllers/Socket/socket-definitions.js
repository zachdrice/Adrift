'use strict';

module.exports = socket => {
	require('./../../Helpers/iterate_events')(__dirname, (event, dir) => {
		socket.on(event, (...params) => socket = require(`./${dir}/${event}`)(socket, ...params) || socket);
	});
};