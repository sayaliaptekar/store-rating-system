const bcrypt = require("bcryptjs");
const pool = require("../config/db");

// Get all stores for normal user
const getStores = async (req, res) => {
    try {
        const { search } = req.query;
        const userId = req.user.id;

        let query = `
            SELECT
                s.id,
                s.name,
                s.email,
                s.address,
                ROUND(AVG(allRatings.rating), 2) AS overallRating,
                myRating.rating AS userRating
            FROM stores s
            LEFT JOIN ratings allRatings
                ON s.id = allRatings.store_id
            LEFT JOIN ratings myRating
                ON s.id = myRating.store_id
                AND myRating.user_id = ?
        `;

        const values = [userId];

        // Search stores by name or address
        if (search) {
            query += `
                WHERE
                    s.name LIKE ?
                    OR s.address LIKE ?
            `;

            const searchValue = `%${search}%`;
            values.push(searchValue, searchValue);
        }

        query += `
            GROUP BY
                s.id,
                s.name,
                s.email,
                s.address,
                myRating.rating
            ORDER BY s.name ASC
        `;

        const [stores] = await pool.execute(query, values);

        res.status(200).json({
            count: stores.length,
            stores
        });
    } catch (error) {
        console.error("Get user stores error:", error);

        res.status(500).json({
            message: "Failed to fetch stores"
        });
    }
};

// Submit or update a store rating
const submitRating = async (req, res) => {
    try {
        const userId = req.user.id;
        const { storeId, rating } = req.body;

        // Validate required fields
        if (!storeId || rating === undefined) {
            return res.status(400).json({
                message: "Store ID and rating are required"
            });
        }

        // Validate rating
        const numericRating = Number(rating);

        if (
            !Number.isInteger(numericRating) ||
            numericRating < 1 ||
            numericRating > 5
        ) {
            return res.status(400).json({
                message: "Rating must be an integer between 1 and 5"
            });
        }

        // Check whether the store exists
        const [stores] = await pool.execute(
            "SELECT id FROM stores WHERE id = ?",
            [storeId]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                message: "Store not found"
            });
        }

        // Check whether the user has already rated the store
        const [existingRating] = await pool.execute(
            `SELECT id
             FROM ratings
             WHERE user_id = ? AND store_id = ?`,
            [userId, storeId]
        );

        if (existingRating.length > 0) {
            // Update existing rating
            await pool.execute(
                `UPDATE ratings
                 SET rating = ?
                 WHERE user_id = ? AND store_id = ?`,
                [numericRating, userId, storeId]
            );

            return res.status(200).json({
                message: "Rating updated successfully"
            });
        }

        // Add new rating
        await pool.execute(
            `INSERT INTO ratings
             (user_id, store_id, rating)
             VALUES (?, ?, ?)`,
            [userId, storeId, numericRating]
        );

        res.status(201).json({
            message: "Rating submitted successfully"
        });
    } catch (error) {
        console.error("Submit rating error:", error);

        res.status(500).json({
            message: "Failed to submit rating"
        });
    }
};

// Change user password
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        // Validate required fields
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Current password and new password are required"
            });
        }

        // Validate new password
        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                message:
                    "Password must be 8-16 characters and contain at least one uppercase letter and one special character"
            });
        }

        // Get current password
        const [users] = await pool.execute(
            "SELECT password FROM users WHERE id = ?",
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Verify current password
        const passwordMatch = await bcrypt.compare(
            currentPassword,
            users[0].password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Current password is incorrect"
            });
        }

        // Hash and update new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.execute(
            "UPDATE users SET password = ? WHERE id = ?",
            [hashedPassword, userId]
        );

        res.status(200).json({
            message: "Password updated successfully"
        });
    } catch (error) {
        console.error("Change password error:", error);

        res.status(500).json({
            message: "Failed to update password"
        });
    }
};

module.exports = {
    getStores,
    submitRating,
    changePassword
};