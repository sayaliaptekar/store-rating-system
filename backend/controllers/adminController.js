const bcrypt = require("bcryptjs");
const pool = require("../config/db");


// ===============================
// ADMIN DASHBOARD STATS
// ===============================
const getDashboardStats = async (req, res) => {
    try {

        // ======================================
        // Total Users
        // ======================================
        const [userResult] = await pool.execute(
            "SELECT COUNT(*) AS totalUsers FROM users"
        );

        // ======================================
        // Total Owners
        // ======================================
        const [ownerResult] = await pool.execute(
            "SELECT COUNT(*) AS totalOwners FROM users WHERE role = 'OWNER'"
        );

        // ======================================
        // Total Normal Users
        // ======================================
        const [normalUserResult] = await pool.execute(
            "SELECT COUNT(*) AS totalNormalUsers FROM users WHERE role = 'USER'"
        );

        // ======================================
        // Total Stores
        // ======================================
        const [storeResult] = await pool.execute(
            "SELECT COUNT(*) AS totalStores FROM stores"
        );

        // ======================================
        // Total Ratings
        // ======================================
        const [ratingResult] = await pool.execute(
            "SELECT COUNT(*) AS totalRatings FROM ratings"
        );

        // ======================================
        // Average Rating
        // ======================================
        const [averageRatingResult] = await pool.execute(
            "SELECT ROUND(AVG(rating), 2) AS averageRating FROM ratings"
        );

        // ======================================
        // Response
        // ======================================
        res.status(200).json({
            totalUsers: userResult[0].totalUsers,
            totalOwners: ownerResult[0].totalOwners,
            totalNormalUsers: normalUserResult[0].totalNormalUsers,
            totalStores: storeResult[0].totalStores,
            totalRatings: ratingResult[0].totalRatings,
            averageRating: averageRatingResult[0].averageRating
        });

    } catch (error) {
        console.error("Dashboard error:", error);

        res.status(500).json({
            message: "Failed to fetch dashboard statistics"
        });
    }
};

// ===============================
// ADD STORE
// ===============================
const addStore = async (req, res) => {
    try {
        const { name, email, address, ownerId } = req.body;

        // Required fields
        if (!name || !email || !address || !ownerId) {
            return res.status(400).json({
                message: "Name, email, address and ownerId are required"
            });
        }

        // Store name validation
        if (name.length < 20 || name.length > 60) {
            return res.status(400).json({
                message: "Store name must be between 20 and 60 characters"
            });
        }

        // Address validation
        if (address.length > 400) {
            return res.status(400).json({
                message: "Address cannot exceed 400 characters"
            });
        }

        // Check owner
        const [owners] = await pool.execute(
            "SELECT id FROM users WHERE id = ? AND role = 'OWNER'",
            [ownerId]
        );

        if (owners.length === 0) {
            return res.status(400).json({
                message: "Invalid store owner"
            });
        }

        // Check duplicate store email
        const [existingStore] = await pool.execute(
            "SELECT id FROM stores WHERE email = ?",
            [email]
        );

        if (existingStore.length > 0) {
            return res.status(409).json({
                message: "Store email already exists"
            });
        }

        // Insert store
        const [result] = await pool.execute(
            `INSERT INTO stores
            (name, email, address, owner_id)
            VALUES (?, ?, ?, ?)`,
            [name, email, address, ownerId]
        );

        res.status(201).json({
            message: "Store added successfully",
            storeId: result.insertId
        });

    } catch (error) {
        console.error("Add store error:", error);

        res.status(500).json({
            message: "Failed to add store"
        });
    }
};
// ======================================
// Admin - Get Store Details
// ======================================
const getStoreDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const [stores] = await pool.execute(
            `SELECT
                s.id,
                s.name,
                s.email,
                s.address,
                s.owner_id AS ownerId,
                u.name AS ownerName,
                u.email AS ownerEmail,
                ROUND(AVG(r.rating), 2) AS averageRating,
                COUNT(r.id) AS totalRatings
            FROM stores s
            LEFT JOIN users u
                ON s.owner_id = u.id
            LEFT JOIN ratings r
                ON s.id = r.store_id
            WHERE s.id = ?
            GROUP BY
                s.id,
                s.name,
                s.email,
                s.address,
                s.owner_id,
                u.name,
                u.email`,
            [id]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                message: "Store not found"
            });
        }

        res.status(200).json({
            store: stores[0]
        });

    } catch (error) {
        console.error("Get store details error:", error);

        res.status(500).json({
            message: "Failed to fetch store details"
        });
    }
};
// ======================================
// Admin - Update Store
// ======================================
const updateStore = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            email,
            address,
            ownerId
        } = req.body;

        // ======================================
        // Check Store
        // ======================================
        const [existingStore] = await pool.execute(
            "SELECT id FROM stores WHERE id = ?",
            [id]
        );

        if (existingStore.length === 0) {
            return res.status(404).json({
                message: "Store not found"
            });
        }

        // ======================================
        // Name Validation
        // ======================================
        if (name !== undefined) {
            if (name.length < 20 || name.length > 60) {
                return res.status(400).json({
                    message: "Store name must be between 20 and 60 characters"
                });
            }
        }

        // ======================================
        // Address Validation
        // ======================================
        if (address !== undefined) {
            if (address.length > 400) {
                return res.status(400).json({
                    message: "Address cannot exceed 400 characters"
                });
            }
        }

        // ======================================
        // Check Owner
        // ======================================
        if (ownerId !== undefined) {
            const [owner] = await pool.execute(
                "SELECT id FROM users WHERE id = ? AND role = 'OWNER'",
                [ownerId]
            );

            if (owner.length === 0) {
                return res.status(400).json({
                    message: "Invalid store owner"
                });
            }
        }

        // ======================================
        // Check Duplicate Email
        // ======================================
        if (email !== undefined) {
            const [duplicateEmail] = await pool.execute(
                "SELECT id FROM stores WHERE email = ? AND id != ?",
                [email, id]
            );

            if (duplicateEmail.length > 0) {
                return res.status(409).json({
                    message: "Store email already exists"
                });
            }
        }

        // ======================================
        // Build Update Query
        // ======================================
        const updates = [];
        const values = [];

        if (name !== undefined) {
            updates.push("name = ?");
            values.push(name);
        }

        if (email !== undefined) {
            updates.push("email = ?");
            values.push(email);
        }

        if (address !== undefined) {
            updates.push("address = ?");
            values.push(address);
        }

        if (ownerId !== undefined) {
            updates.push("owner_id = ?");
            values.push(ownerId);
        }

        // ======================================
        // No Data
        // ======================================
        if (updates.length === 0) {
            return res.status(400).json({
                message: "No data provided for update"
            });
        }

        // ======================================
        // Update Store
        // ======================================
        values.push(id);

        await pool.execute(
            `UPDATE stores
             SET ${updates.join(", ")}
             WHERE id = ?`,
            values
        );

        res.status(200).json({
            message: "Store updated successfully"
        });

    } catch (error) {
        console.error("Update store error:", error);

        res.status(500).json({
            message: "Failed to update store"
        });
    }
};
// ======================================
// Admin - Delete Store
// ======================================
const deleteStore = async (req, res) => {
    try {
        const { id } = req.params;

        // Check store
        const [existingStore] = await pool.execute(
            "SELECT id FROM stores WHERE id = ?",
            [id]
        );

        if (existingStore.length === 0) {
            return res.status(404).json({
                message: "Store not found"
            });
        }

        // Delete store
        await pool.execute(
            "DELETE FROM stores WHERE id = ?",
            [id]
        );

        res.status(200).json({
            message: "Store deleted successfully"
        });

    } catch (error) {
        console.error("Delete store error:", error);

        res.status(500).json({
            message: "Failed to delete store"
        });
    }
};
// ======================================
// Admin - Get All Users
// ======================================
const getUsers = async (req, res) => {
    try {
        const {
            search,
            role,
            sortBy,
            order
        } = req.query;

        let query = `
            SELECT
                id,
                name,
                email,
                address,
                role
            FROM users
        `;

        const values = [];
        const conditions = [];

        // ======================================
        // Search by name, email or address
        // ======================================
        if (search) {
            conditions.push(`
                (
                    name LIKE ?
                    OR email LIKE ?
                    OR address LIKE ?
                )
            `);

            const searchValue = `%${search}%`;

            values.push(
                searchValue,
                searchValue,
                searchValue
            );
        }

        // ======================================
        // Filter by role
        // ======================================
        if (role) {
            const allowedRoles = [
                "USER",
                "ADMIN",
                "OWNER"
            ];

            const selectedRole = role.toUpperCase();

            if (allowedRoles.includes(selectedRole)) {
                conditions.push("role = ?");
                values.push(selectedRole);
            }
        }

        // ======================================
        // WHERE clause
        // ======================================
        if (conditions.length > 0) {
            query += `
                WHERE ${conditions.join(" AND ")}
            `;
        }

        // ======================================
        // Sorting
        // ======================================
        const allowedSortColumns = {
            name: "name",
            email: "email",
            role: "role"
        };

        const selectedSort =
            allowedSortColumns[sortBy] || "name";

        const selectedOrder =
            order === "desc" ? "DESC" : "ASC";

        query += `
            ORDER BY ${selectedSort} ${selectedOrder}
        `;

        // ======================================
        // Execute Query
        // ======================================
        const [users] = await pool.execute(
            query,
            values
        );

        // ======================================
        // Response
        // ======================================
        res.status(200).json({
            count: users.length,
            users
        });

    } catch (error) {
        console.error("Get users error:", error);

        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
};
// ======================================
// Admin - Get All Stores
// ======================================
const getStores = async (req, res) => {
    try {
        const {
            search,
            minRating,
            maxRating,
            sortBy,
            order
        } = req.query;

        let query = `
            SELECT
                s.id,
                s.name,
                s.email,
                s.address,
                ROUND(AVG(r.rating), 2) AS rating
            FROM stores s
            LEFT JOIN ratings r
                ON s.id = r.store_id
        `;

        const values = [];
        const whereConditions = [];
        const havingConditions = [];

        // ======================================
        // Search by name, email or address
        // ======================================
        if (search) {
            whereConditions.push(`
                (
                    s.name LIKE ?
                    OR s.email LIKE ?
                    OR s.address LIKE ?
                )
            `);

            const searchValue = `%${search}%`;

            values.push(
                searchValue,
                searchValue,
                searchValue
            );
        }

        // ======================================
        // WHERE clause
        // ======================================
        if (whereConditions.length > 0) {
            query += `
                WHERE ${whereConditions.join(" AND ")}
            `;
        }

        // ======================================
        // GROUP BY
        // ======================================
        query += `
            GROUP BY
                s.id,
                s.name,
                s.email,
                s.address
        `;

        // ======================================
        // Minimum Rating
        // ======================================
        if (minRating) {
            havingConditions.push("AVG(r.rating) >= ?");
            values.push(Number(minRating));
        }

        // ======================================
        // Maximum Rating
        // ======================================
        if (maxRating) {
            havingConditions.push("AVG(r.rating) <= ?");
            values.push(Number(maxRating));
        }

        // ======================================
        // HAVING clause
        // ======================================
        if (havingConditions.length > 0) {
            query += `
                HAVING ${havingConditions.join(" AND ")}
            `;
        }

        // ======================================
        // Sorting
        // ======================================
        const allowedSortColumns = {
            name: "s.name",
            rating: "AVG(r.rating)"
        };

        const selectedSort =
            allowedSortColumns[sortBy] || "s.name";

        const selectedOrder =
            order === "desc" ? "DESC" : "ASC";

        query += `
            ORDER BY ${selectedSort} ${selectedOrder}
        `;

        // ======================================
        // Execute Query
        // ======================================
        const [stores] = await pool.execute(
            query,
            values
        );

        // ======================================
        // Response
        // ======================================
        res.status(200).json({
            count: stores.length,
            stores
        });

    } catch (error) {
        console.error("Get admin stores error:", error);

        res.status(500).json({
            message: "Failed to fetch stores"
        });
    }
};
// ======================================
// Admin - Add New User
// ======================================
const addUser = async (req, res) => {
    try {
        const {
            name,
            email,
            address,
            password,
            role
        } = req.body;

        // Required fields
        if (!name || !email || !address || !password || !role) {
            return res.status(400).json({
                message: "Name, email, address, password and role are required"
            });
        }

        // Name validation
        if (name.length < 20 || name.length > 60) {
            return res.status(400).json({
                message: "Name must be between 20 and 60 characters"
            });
        }

        // Address validation
        if (address.length > 400) {
            return res.status(400).json({
                message: "Address cannot exceed 400 characters"
            });
        }

        // Password validation
        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message:
                    "Password must be 8-16 characters and contain at least one uppercase letter and one special character"
            });
        }

        // Role validation
        const allowedRoles = ["USER", "ADMIN", "OWNER"];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        // Check duplicate email
        const [existingUser] = await pool.execute(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await pool.execute(
            `INSERT INTO users
            (name, email, password, address, role)
            VALUES (?, ?, ?, ?, ?)`,
            [
                name,
                email,
                hashedPassword,
                address,
                role
            ]
        );

        res.status(201).json({
            message: "User created successfully",
            userId: result.insertId
        });

    } catch (error) {
        console.error("Add user error:", error);

        res.status(500).json({
            message: "Failed to create user"
        });
    }
};
// ======================================
// Admin - Update User
// ======================================
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            email,
            address,
            password,
            role
        } = req.body;

        // ======================================
        // Check User
        // ======================================
        const [existingUser] = await pool.execute(
            "SELECT id FROM users WHERE id = ?",
            [id]
        );

        if (existingUser.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // ======================================
        // Validate Name
        // ======================================
        if (name !== undefined) {
            if (name.length < 20 || name.length > 60) {
                return res.status(400).json({
                    message: "Name must be between 20 and 60 characters"
                });
            }
        }

        // ======================================
        // Validate Address
        // ======================================
        if (address !== undefined) {
            if (address.length > 400) {
                return res.status(400).json({
                    message: "Address cannot exceed 400 characters"
                });
            }
        }

        // ======================================
        // Validate Role
        // ======================================
        if (role !== undefined) {
            const allowedRoles = [
                "USER",
                "ADMIN",
                "OWNER"
            ];

            if (!allowedRoles.includes(role)) {
                return res.status(400).json({
                    message: "Invalid role"
                });
            }
        }

        // ======================================
        // Check Duplicate Email
        // ======================================
        if (email !== undefined) {
            const [duplicateEmail] = await pool.execute(
                "SELECT id FROM users WHERE email = ? AND id != ?",
                [email, id]
            );

            if (duplicateEmail.length > 0) {
                return res.status(409).json({
                    message: "Email already registered"
                });
            }
        }

        // ======================================
        // Password Validation & Hashing
        // ======================================
        let hashedPassword = null;

        if (password !== undefined && password !== "") {

            const passwordRegex =
                /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

            if (!passwordRegex.test(password)) {
                return res.status(400).json({
                    message:
                        "Password must be 8-16 characters and contain at least one uppercase letter and one special character"
                });
            }

            hashedPassword = await bcrypt.hash(
                password,
                10
            );
        }

        // ======================================
        // Build Dynamic Update Query
        // ======================================
        const updates = [];
        const values = [];

        if (name !== undefined) {
            updates.push("name = ?");
            values.push(name);
        }

        if (email !== undefined) {
            updates.push("email = ?");
            values.push(email);
        }

        if (address !== undefined) {
            updates.push("address = ?");
            values.push(address);
        }

        if (role !== undefined) {
            updates.push("role = ?");
            values.push(role);
        }

        if (hashedPassword) {
            updates.push("password = ?");
            values.push(hashedPassword);
        }

        // ======================================
        // No Data to Update
        // ======================================
        if (updates.length === 0) {
            return res.status(400).json({
                message: "No data provided for update"
            });
        }

        // ======================================
        // Update User
        // ======================================
        values.push(id);

        await pool.execute(
            `UPDATE users
             SET ${updates.join(", ")}
             WHERE id = ?`,
            values
        );

        res.status(200).json({
            message: "User updated successfully"
        });

    } catch (error) {
        console.error("Update user error:", error);

        res.status(500).json({
            message: "Failed to update user"
        });
    }
};
// ======================================
// Admin - Delete User
// ======================================
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // ======================================
        // Check User
        // ======================================
        const [existingUser] = await pool.execute(
            "SELECT id, role FROM users WHERE id = ?",
            [id]
        );

        if (existingUser.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // ======================================
        // Delete User
        // ======================================
        await pool.execute(
            "DELETE FROM users WHERE id = ?",
            [id]
        );

        res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (error) {
        console.error("Delete user error:", error);

        res.status(500).json({
            message: "Failed to delete user"
        });
    }
};

// ===============================
// EXPORT
// ===============================
module.exports = {
    getDashboardStats,
    addStore,
    addUser,
    getStores,
    updateUser,
    getUsers,
    deleteUser,
    updateStore,
    deleteStore,
    getStoreDetails
    
};