const cors = require("cors");

const whiteList = require("./whiteList");

const corsOptions = {
	origin: (origin, callback) => {
		// remove second argument after development
		if (whiteList.indexOf(origin) != -1 || !origin) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
	optionsSuccessStatus: 200,
};

module.exports = corsOptions;