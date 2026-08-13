const express = require("express");

const {
    getStores,
    submitRating,
    changePassword
} = require("../controllers/userController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ======================================
// Normal User - Get Stores
// ======================================
router.get(
    "/stores",
    authenticateToken,
    authorizeRoles("USER"),
    getStores
);
// ======================================
// Normal User - Submit / Update Rating
// ======================================
router.post(
    "/ratings",
    authenticateToken,
    authorizeRoles("USER"),
    submitRating
);
// ======================================
// Change Password
// ======================================
router.put(
    "/change-password",
    authenticateToken,
    authorizeRoles("USER", "OWNER"),
    changePassword
);

module.exports = router;
