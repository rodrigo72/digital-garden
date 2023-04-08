const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const ROLES = require("../config/rolesList");
const verifyRoles = require("../middleware/verifyRoles");

router
	.route("/")
	.get(verifyRoles(ROLES.Admin), usersController.getAllUsers)
	.delete(verifyRoles(ROLES.Admin), usersController.deleteUser);

	router.route("/:id").get(verifyRoles(ROLES.Admin), usersController.getUser);

module.exports = router;