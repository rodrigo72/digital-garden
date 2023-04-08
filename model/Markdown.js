const mongoose = require("mongoose");

const markdownSchema = new mongoose.Schema(
	{
		filename: { type: String, required: true },
		content: { type: String, required: true },
		author: { type: String },
		tags: { type: [String], default: [] },
		isPublic: { type: Boolean, default: false },
		views: { type: Number, default: 0 },
		createdAt: { type: Date, default: Date.now },
		links: { type: [String], default: [] },
	},
	{
		weights: {
			filename: 4,
			content: 2,
			tags: 2,
			author: 1,
		},
	}
);

markdownSchema.index({ filename: "text", content: "text", tags: "text", author: "text" });

const Markdown = mongoose.model("Markdown", markdownSchema);

module.exports = Markdown;
