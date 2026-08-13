const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const createOwner = async () => {
    try {
        const name = "Store Owner Account";
        const email = "owner@storerating.com";
        const address = "Owner Office";
        const password = "Owner@123";

        // Check if owner already exists
        const [existingUser] = await pool.execute(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            console.log("Owner already exists!");
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert owner
        const [result] = await pool.execute(
            `INSERT INTO users
            (name, email, password, address, role)
            VALUES (?, ?, ?, ?, ?)`,
            [
                name,
                email,
                hashedPassword,
                address,
                "OWNER"
            ]
        );

        console.log("✅ Owner created successfully!");
        console.log("Owner ID:", result.insertId);
        console.log("Email:", email);
        console.log("Password:", password);

        process.exit(0);

    } catch (error) {
        console.error("❌ Failed to create owner:", error.message);
        process.exit(1);
    }
};

createOwner();