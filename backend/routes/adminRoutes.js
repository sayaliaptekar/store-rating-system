const express = require("express");

const {
    getDashboardStats,
    addStore,
    getUsers,
    addUser,
    getStores,
    updateUser,
    deleteUser,
    updateStore,
    deleteStore,
    getStoreDetails
} = require("../controllers/adminController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();


// ======================================
// Admin Dashboard
// ======================================
router.get(
    "/dashboard",
    authenticateToken,
    authorizeRoles("ADMIN"),
    getDashboardStats
);


// ======================================
// Add Store
// ======================================
router.post(
    "/stores",
    authenticateToken,
    authorizeRoles("ADMIN"),
    addStore
);
// ======================================
// Get Store Details
// ======================================
router.get(
    "/stores/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    getStoreDetails
);
// ======================================
// Update Store
// ======================================
router.put(
    "/stores/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    updateStore
);
// ======================================
// Delete Store
// ======================================
router.delete(
    "/stores/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    deleteStore
);

// ======================================
// Get Users
// ======================================
router.get(
    "/users",
    authenticateToken,
    authorizeRoles("ADMIN"),
    getUsers
);
// ======================================
// Add User
// ======================================
router.post(
    "/users",
    authenticateToken,
    authorizeRoles("ADMIN"),
    addUser
);
// ======================================
// Update User
// ======================================
router.put(
    "/users/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    updateUser
);
// ======================================
// Delete User
// ======================================
router.delete(
    "/users/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    deleteUser
);

// ======================================
// Get All Stores
// ======================================
router.get(
    "/stores",
    authenticateToken,
    authorizeRoles("ADMIN"),
    getStores
);

module.exports = router;