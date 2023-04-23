require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");

const mongoose = require("mongoose");
const connectDB = require("./config/dbConnection");

const cors = require("cors");
const credentials = require("./middleware/credentials");
const corsOptions = require("./config/corsOptions");

const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");

const verifyJWT = require("./middleware/verifyJWT");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const createAccountLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 3, 
	message:
		'Too many accounts created from this IP, please try again after an hour',
	standardHeaders: true, // return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // disable the `X-RateLimit-*` headers
})

const PORT = process.env.PORT || 3500;

connectDB();

app.use(logger);

// fetch cookies credentials requirement
app.use(credentials);

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false })); // handling urlenconded / form data

app.use(express.json());

app.use(cookieParser());

app.use("/", express.static(path.join(__dirname, "/public")));
app.use("/", require("./routes/rootPage"));
app.use("/signin", require("./routes/loginPage"));
app.use("/signup", require("./routes/registerPage"));
app.use("/add", require("./routes/add"));

app.use("/register", createAccountLimiter, require("./routes/register"));
app.use("/auth", require("./routes/auth"));
app.use("/refresh", require("./routes/refresh"));
app.use("/logout", require("./routes/logout"));

app.use(verifyJWT);

app.use("/users", require("./routes/users"));
app.use("/markdownfiles", require("./routes/markdownFiles"))

app.all("*", (req, res) => {
	res.status(404);
	if (req.accepts("json")) {
		res.json({ error: "404 Not Found" });
	} else if (req.accepts("html")) {
		res.sendFile(path.join(__dirname, "views", "404.html"));
	} else {
		res.type("txt").send("404 Not Found");
	}
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
	console.log("Connect to MongoDB");
	app.listen(PORT, () => {
		console.log(`Server running on port: ${PORT}`);
	});
});