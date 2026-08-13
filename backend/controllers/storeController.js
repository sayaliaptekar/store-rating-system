const pool = require("../config/db");

const getStores = async (req, res) => {
    try {
        const userId = req.user.id;

        const [stores] = await pool.execute(
            `SELECT 
                s.id,
                s.name,
                s.email,
                s.address,
                ROUND(AVG(r.rating), 2) AS overallRating,
                MAX(CASE WHEN r.user_id = ? THEN r.rating END) AS userRating
            FROM stores s
            LEFT JOIN ratings r ON s.id = r.store_id
            GROUP BY s.id, s.name, s.email, s.address
            ORDER BY s.name ASC`,
            [userId]
        );

        res.status(200).json({
            count: stores.length,
            stores
        });

    } catch (error) {
        console.error("Get stores error:", error);

        res.status(500).json({
            message: "Failed to fetch stores"
        });
    }
};

module.exports = {
    getStores
};