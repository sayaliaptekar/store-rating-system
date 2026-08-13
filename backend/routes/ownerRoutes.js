const express = require("express");

const {
    getMyStore,
    getStoreRatings
} = require("../controllers/ownerController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();


// Owner Store Dashboard
router.get(
    "/my-store",
    authenticateToken,
    authorizeRoles("OWNER"),
    getMyStore
);


// Users who submitted ratings
router.get(
    "/ratings",
    authenticateToken,
    authorizeRoles("OWNER"),
    getStoreRatings
);


module.exports = router;