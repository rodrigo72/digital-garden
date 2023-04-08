const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const handleLogin = async (req, res) => {
    const { username, email, password } = req.body;
    const identifier = username || email;
    
    if (!identifier || !password)
        return res
            .status(400)
            .json({ message: "Username/email and password are required." });
    
    const foundUser = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] }).exec();
    if (!foundUser) return res.sendStatus(401); // Unauthorized
    // evaluate password
    const match = await bcrypt.compare(password, foundUser.password);
    if (match) {
        const roles = Object.values(foundUser.roles).filter(Boolean);
        // create JWTs (note)
        const accessToken = jwt.sign(
            {
                UserInfo: {
                    username: foundUser.username,
                    roles: roles,
                },
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1min" }
        );
        const refreshToken = jwt.sign(
            { username: foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "1d" }
        );

        // saving refreshToken with current user
        foundUser.refreshToken = refreshToken;
        const result = await foundUser.save();
        // console.log(result);
        
        res.cookie("jwt", refreshToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 86400000,
        }); // not available to JS (more secure)

        res.json({ roles, accessToken });
    } else {
        res.sendStatus(401);
    }
};

module.exports = { handleLogin };