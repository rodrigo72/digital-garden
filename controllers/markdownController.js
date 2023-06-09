const Markdown = require("../model/Markdown");

const natural = require("natural");
const stopWords = require("stopwords-pt");
const stopWordsEnglish = require("stopwords").english;

const LanguageDetect = require("languagedetect");

const getAllMarkdownFiles = async (req, res) => {
	const markdownFiles = await Markdown.find();
	if (!markdownFiles)
		return res.status(204).json({ message: "No markdown files found." });
	res.json(markdownFiles);
};

const createNewMarkdownFile = async (req, res) => {
	if (!req?.body?.filename || !req?.body?.content) {
		return res
			.status(400)
			.json({ message: "Filename and content are required" });
	}

	const newMarkdown = {
		filename: req.body.filename,
		content: req.body.content,
		author: req.body.author || "",
		tags: req.body.tags || [],
		isPublic: req.body.isPublic || false,
	};

	try {
		const result = await Markdown.create(newMarkdown);
		res.status(201).json(result);
	} catch (err) {
		console.error(err);
	}
};

const updateMarkdownFile = async (req, res) => {
	if (!req?.body?.id) {
		return res.status(400).json({ message: "ID parameter is required." });
	}

	const markdownFile = await Markdown.findOne({ _id: req.body.id }).exec();
	if (!markdownFile) {
		return res
			.status(204)
			.json({ message: `No markdown file matches ID ${req.body.id}.` });
	}

	if (req.body?.filename) markdownFile.filename = req.body.filename;
	if (req.body?.content) markdownFile.content = req.body.content;
	if (req.body?.author) markdownFile.author = req.body.author;
	if (req.body?.tags) markdownFile.tags = req.body.tags;
	if (req.body?.isPublic) markdownFile.isPublic = req.body.isPublic;
	if (req.body?.views) markdownFile.views = req.body.views;
	if (req.body?.links) markdownFile.links = req.body.links;

	const result = await markdownFile.save();
	res.json(result);
};

const deleteMarkdownFile = async (req, res) => {
	if (!req?.body?.id)
		return res.status(400).json({ message: "Markdown ID required." });

	const markdownFile = await Markdown.findOne({ _id: req.body.id }).exec();
	if (!markdownFile) {
		return res
			.status(204)
			.json({ message: `No markdown file matches ID ${req.body.id}.` });
	}
	const result = await markdownFile.deleteOne();
	res.json(result);
};

const getMarkdownFileWithID = async (req, res) => {
	if (!req?.params?.id)
		return res.status(400).json({ message: "Markdown ID required." });

	const markdownFile = await Markdown.findOne({ _id: req.params.id }).exec();
	if (!markdownFile) {
		return res
			.status(204)
			.json({ message: `No markdown file matches ID ${req.params.id}.` });
	}
	res.json(markdownFile);
};

const getMarkdownFileWithName = async (req, res) => {
	if (!req?.params?.filename) {
		return res.status(400).json({ message: "Markdown filename required." });
	}

	const markdownFile = await Markdown.findOne({
		filename: req.params.filename,
	}).exec();

	if (!markdownFile) {
		return res.status(204).json({
			message: `No markdown file matches filename ${req.params.filename}.`,
		});
	}

	res.json(markdownFile);
};

const semanticSearch = async (req, res) => {
	if (!req?.params?.query)
		return res.status(400).json({ message: "Query required." });
	const results = await Markdown.find(
		// use $text operator to search for documents that match the query
		{ $text: { $search: req.params.query }, isPublic: true }, // only public files
		// sort results by relevance score (textScore)
		{ score: { $meta: "textScore" } }
	)
		.populate("author", "username")
		.exec();

	res.json(results);
};

class CustomTokenizer extends natural.WordTokenizer {
	tokenize(text) {
		const pattern = /[^a-zA-Z0-9áàãâéèêíïóôõöúüç]/g;
		const words = text.split(pattern);
		return words.filter(Boolean);
	}
}

const semanticSearchBody = async (req, res) => {
	if (!req?.body?.query)
		return res.status(400).json({ message: "Query required." });

	const lngDetector = new LanguageDetect();
	const detectedLanguages = lngDetector.detect(req.body.query, 1);

	let stemmer;
	const tokenizer = new CustomTokenizer();
	let queryTokens = tokenizer.tokenize(req.body.query);
	let noStemmerTokens = queryTokens;

	if (
		detectedLanguages.length > 0 &&
		detectedLanguages[0][0] === "portuguese"
	) {
		console.log("pt");
		queryTokens = queryTokens.filter((token) => !stopWords.includes(token));
		stemmer = natural.PorterStemmerPt;
	} else {
		console.log("en");
		queryTokens = queryTokens.filter(
			(token) => !stopWordsEnglish.includes(token)
		);
		stemmer = natural.PorterStemmer;
	}

	queryTokens = queryTokens.map((token) => stemmer.stem(token));
	const uniqueTokens = new Set([...queryTokens, ...noStemmerTokens]);
	const query = Array.from(uniqueTokens).join(" ");

	console.log(query);

	const results = await Markdown.find(
		{ $text: { $search: query }, isPublic: true }, // only public files
		{ score: { $meta: "textScore" } }
	)
		.populate("author", "username")
		.exec();

	res.json(results);
};

module.exports = {
	getAllMarkdownFiles,
	createNewMarkdownFile,
	updateMarkdownFile,
	deleteMarkdownFile,
	getMarkdownFileWithID,
	getMarkdownFileWithName,
	semanticSearch,
	semanticSearchBody,
};
