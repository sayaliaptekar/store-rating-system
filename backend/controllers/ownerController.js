const pool = require("../config/db");

// ======================================
// Get Owner's Store
// ======================================
const getMyStore = async (req, res) => {
    try {
        const ownerId = req.user.id;

        const [stores] = await pool.execute(
            `SELECT
                s.id,
                s.name,
                s.email,
                s.address,
                ROUND(AVG(r.rating), 2) AS averageRating,
                COUNT(r.id) AS totalRatings
            FROM stores s
            LEFT JOIN ratings r ON s.id = r.store_id
            WHERE s.owner_id = ?
            GROUP BY s.id, s.name, s.email, s.address`,
            [ownerId]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                message: "No store found for this owner"
            });
        }

        res.status(200).json({
            store: stores[0]
        });

    } catch (error) {
        console.error("Get owner store error:", error);

        res.status(500).json({
            message: "Failed to fetch store details"
        });
    }
};

// ======================================
// Get Users Who Rated Owner's Store
// ======================================
const getStoreRatings = async (req, res) => {
    try {
        const ownerId = req.user.id;

        const [ratings] = await pool.execute(
            `SELECT
                u.id AS userId,
                u.name AS userName,
                u.email AS userEmail,
                r.rating,
                r.created_at AS ratingDate
            FROM ratings r
            INNER JOIN users u ON r.user_id = u.id
            INNER JOIN stores s ON r.store_id = s.id
            WHERE s.owner_id = ?
            ORDER BY r.created_at DESC`,
            [ownerId]
        );

        res.status(200).json({
            count: ratings.length,
            ratings
        });

    } catch (error) {
        console.error("Get store ratings error:", error);

        res.status(500).json({
            message: "Failed to fetch store ratings"
        });
    }
};


module.exports = {
    getMyStore,
    getStoreRatings
};