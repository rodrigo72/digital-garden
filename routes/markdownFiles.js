const express = require("express");
const router = express.Router();
const markdownController = require("../controllers/markdownController");
const ROLES_LIST = require("../config/rolesList");
const verifyRoles = require("../middleware/verifyRoles");

router
	.route("/")
	.get(markdownController.getAllMarkdownFiles)
	.post(
		verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
		markdownController.createNewMarkdownFile
	)
	.put(
		verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
		markdownController.updateMarkdownFile
	)
	.delete(verifyRoles(ROLES_LIST.Admin), markdownController.deleteMarkdownFile);

router
	.route("/:id")
	.get(
		verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
		markdownController.getMarkdownFileWithID
	);
router
	.route("/name/:name")
	.get(
		verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
		markdownController.getMarkdownFileWithName
	);

// router.route("/semantic-search/:query").get(markdownController.semanticSearch);
router.route("/semantic-search").post(markdownController.semanticSearchBody);

module.exports = router;
