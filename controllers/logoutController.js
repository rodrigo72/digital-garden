const User = require("../model/User");
const jwt = require("jsonwebtoken");
const { response } = require("express");
require("dotenv").config();

const handleLogout = async (req, res) => {
	// on client, also delete the accessToken
	const cookies = req.cookies;
	if (!cookies?.jwt) return res.sendStatus(204); // No content
	const refreshToken = cookies.jwt;

	// is refreshtoken in DB?
	const foundUser = await User.findOne({ refreshToken });
	if (!foundUser) {
		response.clearCookie("jwt", { httpOnly: true });
		return res.sendStatus(204);
	}

	// Delete the refresh token in db
	foundUser.refreshToken = "";
	const result = await foundUser.save();
	// console.log(result);

	res.clearCookie("jwt", {
		httpOnly: true,
		sameSite: "None",
		secure: true,
	}); // secure: true - only serves on https (add in production but not in development)
	res.sendStatus(204);
};

module.exports = { handleLogout };
