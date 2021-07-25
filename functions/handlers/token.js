const jwt = require('jsonwebtoken');
const { hash } = require('../util/config');

module.exports.generateToken = data => {
	return jwt.sign(data, hash.hex_200);
};

module.exports.getTokendata = token => {
	return jwt.verify(token, hash.hex_200);
};
