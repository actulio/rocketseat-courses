const axios = require('axios');

const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');
const { findConnections, sendMessage } = require('../webscoket')

module.exports = {

	async index(req, res){
		const devs = await Dev.find();
		return res.json(devs);
	},

	async store (req, res) {

		const { github_username, techs, latitude, longitude } = req.body;

		let dev = await Dev.findOne({ github_username });

		if(!dev){
			const response = await axios.get(`https://api.github.com/users/${github_username}`)
		
			const { name = login, avatar_url, bio} = response.data;
		
			// se name nao existe, faça name ser o que vem como login como padrao
			const techsArray = parseStringAsArray(techs);
		
			const location = {
				type: 'Point',
				coordinates: [longitude, latitude]
			}
		
			dev = await Dev.create({
				github_username,
				name,
				avatar_url,
				bio,
				location,
				techs: techsArray,
			});

			const sendSocketMessageTo = findConnections(
				{latitude, longitude},
				techsArray
			);

			sendMessage(sendSocketMessageTo, 'new-dev', dev);

		}

		return res.json(dev);
	}
}