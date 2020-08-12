const Spot = require('../models/Spot');

module.exports = {
  async show(req, res) {
    // eslint-disable-next-line camelcase
    const { user_id } = req.headers;

    const spots = await Spot.find({
      user: user_id,
    });

    return res.json(spots);
  },
};
