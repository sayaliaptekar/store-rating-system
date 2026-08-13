const express = require("express");

const {
    getStores
} = require("../controllers/storeController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Get all stores
router.get(
    "/",
    authenticateToken,
    authorizeRoles("USER"),
    getStores
);

module.exports = router;