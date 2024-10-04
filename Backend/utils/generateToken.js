const jwt = require('jsonwebtoken');

require("dotenv").config();
const generateToken = (user) => {
    return jwt.sign({ fullname: user.fullname, id: user._id }, process.env.JWT_KEY);
}

module.exports.generateToken = generateToken