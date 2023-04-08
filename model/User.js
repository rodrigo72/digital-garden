const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
	username: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		require: true,
	},
	roles: {
		User: {
			type: Number,
			default: 1111,
		},
		Editor: Number,
		Admin: Number,
	},
	password: {
		type: String,
		require: true,
	},
	refreshToken: String,
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
