const express = require("express");

const {
    submitRating,
    updateRating
} = require("../controllers/ratingController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();


// Submit rating
router.post(
    "/",
    authenticateToken,
    authorizeRoles("USER"),
    submitRating
);


// Update rating
router.put(
    "/:storeId",
    authenticateToken,
    authorizeRoles("USER"),
    updateRating
);


module.exports = router;