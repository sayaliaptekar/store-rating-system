const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const createAdmin = async () => {
    try {
        const name = "System Administrator";
        const email = "admin@storerating.com";
        const address = "Admin Office";
        const password = "Admin@123";

        // Check if admin already exists
        const [existingUser] = await pool.execute(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            console.log("Admin already exists!");
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert admin
        const [result] = await pool.execute(
            `INSERT INTO users
            (name, email, password, address, role)
            VALUES (?, ?, ?, ?, ?)`,
            [
                name,
                email,
                hashedPassword,
                address,
                "ADMIN"
            ]
        );

        console.log("✅ Admin created successfully!");
        console.log("Admin ID:", result.insertId);
        console.log("Email:", email);
        console.log("Password:", password);

        process.exit(0);

    } catch (error) {
        console.error("❌ Failed to create admin:", error.message);
        process.exit(1);
    }
};

createAdmin();