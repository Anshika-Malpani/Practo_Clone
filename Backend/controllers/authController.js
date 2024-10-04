const userModel = require("../models/user-model");
const bcrypt = require('bcrypt');
const { generateToken } = require("../utils/generateToken");


module.exports.registeredUser = async function (req, res) {
    try {
        let { fullname, mobileNumber, password } = req.body;

        let user = await userModel.findOne({ mobileNumber: mobileNumber });
        if (user) return res.status(409).json({
            message: "User already exists"
        });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        user = await userModel.create({
            fullname,
            mobileNumber: mobileNumber,
            password: hash
        });

        let token = generateToken({ id: user._id, fullname: user.fullname });
        res.cookie("token", token);
        req.user = user;

        res.status(201).json({
            message: "Account created successfully.",
            user: {
                id: user._id,
                fullname: user.fullname,
                mobileNumber: user.mobileNumber
            },
            token: token
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

module.exports.loginUser = async function (req, res) {
    try {
        let { mobileNumber, password } = req.body;

        let user = await userModel.findOne({ mobileNumber: mobileNumber });
        if (!user) return res.status(409).json({
            message: "User does not exist. Please try to register!"
        });

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            let token = generateToken({ id: user._id, mobileNumber: user.mobileNumber });
            res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'None' });
            req.user = user;
            return res.status(201).json({
                message: "Login successfully",
                user: {
                    id: user._id,
                    fullname: user.fullname,
                    mobileNumber: user.mobileNumber
                },
                token: token
            });
        } else {
            return res.status(409).json({
                message: "Mobile Number or Password incorrect"
            });
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
};


module.exports.logout = function (req, res) {
    res.clearCookie("token"); 
    return res.status(200).json({ message: "Logged out successfully." }); 
};