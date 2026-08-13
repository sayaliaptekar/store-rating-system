const pool = require("../config/db");

// Submit rating
const submitRating = async (req, res) => {
    try {
        const userId = req.user.id;
        const { storeId, rating } = req.body;

        // Required fields
        if (!storeId || rating === undefined) {
            return res.status(400).json({
                message: "storeId and rating are required"
            });
        }

        // Rating validation
        if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
            return res.status(400).json({
                message: "Rating must be an integer between 1 and 5"
            });
        }

        // Check store exists
        const [stores] = await pool.execute(
            "SELECT id FROM stores WHERE id = ?",
            [storeId]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                message: "Store not found"
            });
        }

        // Check if user already rated this store
        const [existingRating] = await pool.execute(
            "SELECT id FROM ratings WHERE user_id = ? AND store_id = ?",
            [userId, storeId]
        );

        if (existingRating.length > 0) {
            return res.status(409).json({
                message: "You have already rated this store"
            });
        }

        // Insert rating
        const [result] = await pool.execute(
            `INSERT INTO ratings
            (user_id, store_id, rating)
            VALUES (?, ?, ?)`,
            [userId, storeId, rating]
        );

        res.status(201).json({
            message: "Rating submitted successfully",
            ratingId: result.insertId
        });

    } catch (error) {
        console.error("Submit rating error:", error);

        res.status(500).json({
            message: "Failed to submit rating"
        });
    }
};


// Update rating
const updateRating = async (req, res) => {
    try {
        const userId = req.user.id;
        const { storeId } = req.params;
        const { rating } = req.body;

        // Rating validation
        if (rating === undefined) {
            return res.status(400).json({
                message: "Rating is required"
            });
        }

        if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
            return res.status(400).json({
                message: "Rating must be an integer between 1 and 5"
            });
        }

        // Check rating exists for this user and store
        const [existingRating] = await pool.execute(
            `SELECT id FROM ratings
             WHERE user_id = ? AND store_id = ?`,
            [userId, storeId]
        );

        if (existingRating.length === 0) {
            return res.status(404).json({
                message: "Rating not found"
            });
        }

        // Update rating
        await pool.execute(
            `UPDATE ratings
             SET rating = ?
             WHERE user_id = ? AND store_id = ?`,
            [rating, userId, storeId]
        );

        res.status(200).json({
            message: "Rating updated successfully"
        });

    } catch (error) {
        console.error("Update rating error:", error);

        res.status(500).json({
            message: "Failed to update rating"
        });
    }
};


module.exports = {
    submitRating,
    updateRating
};