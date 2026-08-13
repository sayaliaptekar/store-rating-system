import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    Link,
    useNavigate
} from "react-router-dom";

import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

// ======================================
// Axios helper
// ======================================
const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};


// ======================================
// LOGIN
// ======================================
function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const response = await axios.post(
                `${API_URL}/auth/login`,
                {
                    email,
                    password
                }
            );

            const { token, user } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            if (user.role === "ADMIN") {
                navigate("/admin");
            } else if (user.role === "OWNER") {
                navigate("/owner");
            } else {
                navigate("/user");
            }

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Login failed"
            );
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">

                <h1>Store Rating System</h1>

                <p className="subtitle">
                    Login to your account
                </p>

                <form onSubmit={handleLogin}>

                    <label>Email</label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />

                    <label>Password</label>

                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                    />

                    <button type="submit">
                        Login
                    </button>

                </form>

                {message && (
                    <p className="error-message">
                        {message}
                    </p>
                )}

                <p className="bottom-text">
                    Don't have an account?
                    <Link to="/signup">
                        Sign Up
                    </Link>
                </p>

            </div>
        </div>
    );
}


// ======================================
// SIGNUP
// ======================================
function Signup() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSignup = async (e) => {
        e.preventDefault();
        setMessage("");

        if (name.length < 20 || name.length > 60) {
            setMessage(
                "Name must be between 20 and 60 characters"
            );
            return;
        }

        if (address.length > 400) {
            setMessage(
                "Address cannot exceed 400 characters"
            );
            return;
        }

        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordRegex.test(password)) {
            setMessage(
                "Password must be 8-16 characters and contain at least one uppercase letter and one special character"
            );
            return;
        }

        try {
            const response = await axios.post(
                `${API_URL}/auth/register`,
                {
                    name,
                    email,
                    address,
                    password
                }
            );

            setMessage(
                response.data.message +
                " Redirecting to login..."
            );

            setTimeout(() => {
                navigate("/");
            }, 1500);

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Registration failed"
            );
        }
    };

    return (
        <div className="auth-container">

            <div className="auth-card">

                <h1>Create Account</h1>

                <p className="subtitle">
                    Register as a Normal User
                </p>

                <form onSubmit={handleSignup}>

                    <label>Name</label>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        required
                    />

                    <small>
                        20-60 characters
                    </small>

                    <label>Email</label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />

                    <label>Address</label>

                    <textarea
                        value={address}
                        onChange={(e) =>
                            setAddress(e.target.value)
                        }
                        maxLength={400}
                        required
                    />

                    <label>Password</label>

                    <input
                        type="password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                    />

                    <small>
                        8-16 characters, 1 uppercase & 1 special character
                    </small>

                    <button type="submit">
                        Create Account
                    </button>

                </form>

                {message && (
                    <p className="message">
                        {message}
                    </p>
                )}

                <p className="bottom-text">
                    Already have an account?
                    <Link to="/">
                        Login
                    </Link>
                </p>

            </div>
        </div>
    );
}

// ======================================
// ADMIN - ADD STORE
// ======================================
function AddStorePage() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [ownerId, setOwnerId] = useState("");
    const [owners, setOwners] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // Fetch store owners
    useEffect(() => {
        const fetchOwners = async () => {
            try {
                const response = await axios.get(
                    `${API_URL}/admin/users`,
                    getAuthConfig()
                );

                const ownerUsers = (response.data.users || [])
                    .filter((user) => user.role === "OWNER");

                setOwners(ownerUsers);

            } catch (error) {
                console.error("Failed to fetch owners:", error);
                setMessage("Failed to load store owners");
            }
        };

        fetchOwners();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        // Name validation
        if (name.length < 20 || name.length > 60) {
            setMessage(
                "Store name must be between 20 and 60 characters"
            );
            return;
        }

        // Address validation
        if (address.length > 400) {
            setMessage(
                "Address cannot exceed 400 characters"
            );
            return;
        }

        if (!ownerId) {
            setMessage("Please select a store owner");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `${API_URL}/admin/stores`,
                {
                    name,
                    email,
                    address,
                    ownerId: Number(ownerId)
                },
                getAuthConfig()
            );

            setMessage(
                response.data.message || "Store added successfully"
            );

            // Clear form
            setName("");
            setEmail("");
            setAddress("");
            setOwnerId("");

            // Go back to dashboard after short delay
            setTimeout(() => {
                navigate("/admin");
            }, 1000);

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to add store"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">

            <div className="auth-card">

                <h1>Add New Store</h1>

                <p className="subtitle">
                    Admin - Store Registration
                </p>

                <form onSubmit={handleSubmit}>

                    <label>Store Name</label>

                    <input
                        type="text"
                        placeholder="Enter store name"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        required
                    />

                    <small>
                        20-60 characters
                    </small>


                    <label>Email</label>

                    <input
                        type="email"
                        placeholder="Enter store email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />


                    <label>Address</label>

                    <textarea
                        placeholder="Enter store address"
                        value={address}
                        onChange={(e) =>
                            setAddress(e.target.value)
                        }
                        maxLength={400}
                        required
                    />

                    <small>
                        Maximum 400 characters
                    </small>


                    <label>Store Owner</label>

                    <select
                        value={ownerId}
                        onChange={(e) =>
                            setOwnerId(e.target.value)
                        }
                        required
                    >
                        <option value="">
                            Select Store Owner
                        </option>

                        {owners.map((owner) => (
                            <option
                                key={owner.id}
                                value={owner.id}
                            >
                                {owner.name} - {owner.email}
                            </option>
                        ))}
                    </select>


                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Adding Store..."
                            : "Add Store"}
                    </button>

                </form>


                {message && (
                    <p className="message">
                        {message}
                    </p>
                )}


                <button
                    type="button"
                    onClick={() => navigate("/admin")}
                >
                    Back to Dashboard
                </button>

            </div>

        </div>
    );
}
// ======================================
// ADMIN DASHBOARD
// ======================================
function AdminPage() {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalOwners: 0,
        totalNormalUsers: 0,
        totalStores: 0,
        totalRatings: 0,
        averageRating: 0
    });

    const [stores, setStores] = useState([]);
    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // ================================
    // USER FILTERS / SORTING
    // ================================
    const [userSearch, setUserSearch] = useState("");
    const [userRoleFilter, setUserRoleFilter] = useState("");
    const [userSort, setUserSort] = useState({
        field: "",
        direction: "asc"
    });

    // ================================
    // STORE FILTERS / SORTING
    // ================================
    const [storeSearch, setStoreSearch] = useState("");
    const [storeSort, setStoreSort] = useState({
        field: "",
        direction: "asc"
    });

    // ================================
    // ADD USER
    // ================================
    const [showAddUser, setShowAddUser] = useState(false);

    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "",
        address: "",
        role: "USER"
    });

    const [addUserLoading, setAddUserLoading] = useState(false);

    // ======================================
    // Logout
    // ======================================
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    // ======================================
    // Fetch Dashboard
    // ======================================
    const fetchDashboard = async () => {
        try {
            const config = getAuthConfig();

            const [
                statsResponse,
                storesResponse,
                usersResponse
            ] = await Promise.all([
                axios.get(
                    `${API_URL}/admin/dashboard`,
                    config
                ),

                axios.get(
                    `${API_URL}/admin/stores`,
                    config
                ),

                axios.get(
                    `${API_URL}/admin/users`,
                    config
                )
            ]);

            setStats(statsResponse.data);

            setStores(
                storesResponse.data.stores || []
            );

            setUsers(
                usersResponse.data.users || []
            );

        } catch (err) {
            console.error("Dashboard Error:", err);

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                logout();
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to load dashboard"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    // ======================================
    // ADD USER HANDLER
    // ======================================
    const handleAddUser = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        // Name validation
        if (
            newUser.name.trim().length < 20 ||
            newUser.name.trim().length > 60
        ) {
            setError(
                "Name must be between 20 and 60 characters"
            );
            return;
        }

        // Address validation
        if (newUser.address.trim().length > 400) {
            setError(
                "Address cannot exceed 400 characters"
            );
            return;
        }

        // Password validation
        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordRegex.test(newUser.password)) {
            setError(
                "Password must be 8-16 characters and contain at least one uppercase letter and one special character"
            );
            return;
        }

        setAddUserLoading(true);

        try {
            const response = await axios.post(
                `${API_URL}/admin/users`,
                {
                    name: newUser.name.trim(),
                    email: newUser.email.trim(),
                    password: newUser.password,
                    address: newUser.address.trim(),
                    role: newUser.role
                },
                getAuthConfig()
            );

            setMessage(
                response.data.message ||
                "User added successfully"
            );

            // Clear form
            setNewUser({
                name: "",
                email: "",
                password: "",
                address: "",
                role: "USER"
            });

            setShowAddUser(false);

            // Refresh users + dashboard stats
            await fetchDashboard();

        } catch (err) {
            console.error("Add User Error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to add user"
            );
        } finally {
            setAddUserLoading(false);
        }
    };



// ======================================
// DELETE USER
// ======================================
const handleDeleteUser = async (userId, userName) => {
    const confirmed = window.confirm(
        `Are you sure you want to delete "${userName}"?`
    );

    if (!confirmed) return;

    try {
        setError("");
        setMessage("");

        await axios.delete(
            `${API_URL}/admin/users/${userId}`,
            getAuthConfig()
        );

        setMessage("User deleted successfully");

        await fetchDashboard();

    } catch (err) {
        console.error("Delete User Error:", err);

        setError(
            err.response?.data?.message ||
            "Failed to delete user"
        );
    }
};
// ======================================
// DELETE STORE
// ======================================
const handleDeleteStore = async (storeId, storeName) => {
    const confirmed = window.confirm(
        `Are you sure you want to remove "${storeName}"?`
    );

    if (!confirmed) return;

    try {
        setError("");
        setMessage("");

        await axios.delete(
            `${API_URL}/admin/stores/${storeId}`,
            getAuthConfig()
        );

        setMessage("Store removed successfully");

        await fetchDashboard();

    } catch (err) {
        console.error("Delete Store Error:", err);

        setError(
            err.response?.data?.message ||
            "Failed to remove store"
        );
    }
};


    // ======================================
    // SORT FUNCTION
    // ======================================
    const sortData = (data, field, direction) => {
        if (!field) return data;

        return [...data].sort((a, b) => {
            let valueA = a[field];
            let valueB = b[field];

            // Rating
            if (field === "rating") {
                valueA = Number(valueA || 0);
                valueB = Number(valueB || 0);

                return direction === "asc"
                    ? valueA - valueB
                    : valueB - valueA;
            }

            valueA = String(valueA ?? "").toLowerCase();
            valueB = String(valueB ?? "").toLowerCase();

            if (valueA < valueB) {
                return direction === "asc" ? -1 : 1;
            }

            if (valueA > valueB) {
                return direction === "asc" ? 1 : -1;
            }

            return 0;
        });
    };

    // ======================================
    // SORT USER
    // ======================================
    const handleUserSort = (field) => {
        setUserSort((previous) => ({
            field,
            direction:
                previous.field === field &&
                previous.direction === "asc"
                    ? "desc"
                    : "asc"
        }));
    };

    // ======================================
    // SORT STORE
    // ======================================
    const handleStoreSort = (field) => {
        setStoreSort((previous) => ({
            field,
            direction:
                previous.field === field &&
                previous.direction === "asc"
                    ? "desc"
                    : "asc"
        }));
    };

    // ======================================
    // FILTER USERS
    // ======================================
    const filteredUsers = users.filter((user) => {
        const searchText = userSearch
            .toLowerCase()
            .trim();

        const matchesSearch =
            !searchText ||
            String(user.name || "")
                .toLowerCase()
                .includes(searchText) ||
            String(user.email || "")
                .toLowerCase()
                .includes(searchText) ||
            String(user.address || "")
                .toLowerCase()
                .includes(searchText);

        const matchesRole =
            !userRoleFilter ||
            user.role === userRoleFilter;

        return matchesSearch && matchesRole;
    });

    const sortedUsers = sortData(
        filteredUsers,
        userSort.field,
        userSort.direction
    );

    // ======================================
    // FILTER STORES
    // ======================================
    const filteredStores = stores.filter((store) => {
        const searchText = storeSearch
            .toLowerCase()
            .trim();

        return (
            !searchText ||
            String(store.name || "")
                .toLowerCase()
                .includes(searchText) ||
            String(store.email || "")
                .toLowerCase()
                .includes(searchText) ||
            String(store.address || "")
                .toLowerCase()
                .includes(searchText)
        );
    });

    const sortedStores = sortData(
        filteredStores,
        storeSort.field,
        storeSort.direction
    );

    // ======================================
    // SORT ARROW
    // ======================================
    const getSortArrow = (sortState, field) => {
        if (sortState.field !== field) {
            return " ↕";
        }

        return sortState.direction === "asc"
            ? " ↑"
            : " ↓";
    };

    // ======================================
    // LOADING
    // ======================================
    if (loading) {
        return (
            <div className="loading">
                Loading Admin Dashboard...
            </div>
        );
    }

    // ======================================
    // UI
    // ======================================
    return (
        <div className="admin-layout">

            {/* ================================
                Navbar
            ================================= */}
            <nav className="navbar">

                <div>
                    <h2>Store Rating System</h2>
                    <span>Admin Panel</span>
                </div>

                <button
                    className="logout-btn"
                    onClick={logout}
                >
                    Logout
                </button>

            </nav>


            {/* ================================
                Main Content
            ================================= */}
            <main className="admin-content">

                <h1>Dashboard</h1>

                {message && (
                    <div className="message">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="error-box">
                        {error}
                    </div>
                )}


                {/* ================================
    Statistics
================================= */}
<div className="stats-grid">

    <div className="stat-card users-card">
        <div className="stat-icon">👥</div>
        <div className="stat-info">
            <h3>Total Users</h3>
            <strong>{stats.totalUsers}</strong>
            <span>Registered users</span>
        </div>
    </div>

    <div className="stat-card owners-card">
        <div className="stat-icon">🏪</div>
        <div className="stat-info">
            <h3>Total Owners</h3>
            <strong>{stats.totalOwners}</strong>
            <span>Store owners</span>
        </div>
    </div>

    <div className="stat-card normal-card">
        <div className="stat-icon">👤</div>
        <div className="stat-info">
            <h3>Normal Users</h3>
            <strong>{stats.totalNormalUsers}</strong>
            <span>Active customers</span>
        </div>
    </div>

    <div className="stat-card stores-card">
        <div className="stat-icon">🛍️</div>
        <div className="stat-info">
            <h3>Total Stores</h3>
            <strong>{stats.totalStores}</strong>
            <span>Registered stores</span>
        </div>
    </div>

    <div className="stat-card ratings-card">
        <div className="stat-icon">⭐</div>
        <div className="stat-info">
            <h3>Total Ratings</h3>
            <strong>{stats.totalRatings}</strong>
            <span>Submitted ratings</span>
        </div>
    </div>

    <div className="stat-card average-card">
        <div className="stat-icon">📊</div>
        <div className="stat-info">
            <h3>Average Rating</h3>
            <strong>{stats.averageRating ?? "N/A"}</strong>
            <span>Overall store rating</span>
        </div>
    </div>

</div>

                {/* ================================
                    STORES
                ================================= */}
                <section className="table-section">

                    <div className="section-header">

                        <h2>Stores</h2>

                        <button
                            className="primary-btn"
                            onClick={() =>
                                navigate("/admin/add-store")
                            }
                        >
                            + Add Store
                        </button>

                    </div>


                    {/* Store Search */}
                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                            marginBottom: "15px",
                            flexWrap: "wrap"
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Search store by name, email or address..."
                            value={storeSearch}
                            onChange={(e) =>
                                setStoreSearch(e.target.value)
                            }
                            style={{
                                flex: 1,
                                minWidth: "250px",
                                padding: "10px"
                            }}
                        />

                        <button
                            type="button"
                            onClick={() => {
                                setStoreSearch("");
                                setStoreSort({
                                    field: "",
                                    direction: "asc"
                                });
                            }}
                        >
                            Clear
                        </button>
                    </div>


                    <div className="table-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th
                                        onClick={() =>
                                            handleStoreSort("name")
                                        }
                                        style={{
                                            cursor: "pointer"
                                        }}
                                    >
                                        Name
                                        {getSortArrow(
                                            storeSort,
                                            "name"
                                        )}
                                    </th>

                                    <th
                                        onClick={() =>
                                            handleStoreSort("email")
                                        }
                                        style={{
                                            cursor: "pointer"
                                        }}
                                    >
                                        Email
                                        {getSortArrow(
                                            storeSort,
                                            "email"
                                        )}
                                    </th>

                                    <th
                                        onClick={() =>
                                            handleStoreSort("address")
                                        }
                                        style={{
                                            cursor: "pointer"
                                        }}
                                    >
                                        Address
                                        {getSortArrow(
                                            storeSort,
                                            "address"
                                        )}
                                    </th>

                                    <th
                                        onClick={() =>
                                            handleStoreSort("rating")
                                        }
                                        style={{
                                            cursor: "pointer"
                                        }}
                                    >
                                        Rating
                                        {getSortArrow(
                                            storeSort,
                                            "rating"
                                        )}
                                    </th>
                                    <th>Action</th>

                                </tr>

                            </thead>

                            <tbody>

                                {sortedStores.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="empty"
                                        >
                                            No stores found
                                        </td>
                                    </tr>

                                ) : (

                                    sortedStores.map((store) => (

                                        <tr key={store.id}>

                                            <td>
                                                {store.name}
                                            </td>

                                            <td>
                                                {store.email}
                                            </td>

                                            <td>
                                                {store.address}
                                            </td>

                                            <td>
                                                ⭐{" "}
                                                {store.rating ??
                                                    "N/A"}
                                            </td>

                                            <td>
    <button
        type="button"
        onClick={() =>
            handleDeleteStore(
                store.id,
                store.name
            )
        }
        style={{
            background: "#dc3545",
            color: "white",
            border: "none",
            padding: "7px 12px",
            borderRadius: "5px",
            cursor: "pointer"
        }}
    >
        Remove
    </button>
</td>

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                    </div>

                </section>


                {/* ================================
                    USERS
                ================================= */}
                <section className="table-section">

                    <div className="section-header">

                        <h2>Users</h2>

                        <button
                            className="primary-btn"
                            onClick={() => {
                                setShowAddUser(
                                    !showAddUser
                                );
                                setError("");
                                setMessage("");
                            }}
                        >
                            {showAddUser
                                ? "Close"
                                : "+ Add User"}
                        </button>

                    </div>


                    {/* ================================
                        ADD USER FORM
                    ================================= */}
                    {showAddUser && (

                        <div
                            className="auth-card"
                            style={{
                                marginBottom: "25px",
                                maxWidth: "600px"
                            }}
                        >

                            <h2>Add New User</h2>

                            <form onSubmit={handleAddUser}>

                                <label>Name</label>

                                <input
                                    type="text"
                                    placeholder="Enter name (20-60 characters)"
                                    value={newUser.name}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            name: e.target.value
                                        })
                                    }
                                    required
                                    minLength={20}
                                    maxLength={60}
                                />

                                <small>
                                    20-60 characters
                                </small>


                                <label>Email</label>

                                <input
                                    type="email"
                                    placeholder="Enter email"
                                    value={newUser.email}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            email: e.target.value
                                        })
                                    }
                                    required
                                />


                                <label>Address</label>

                                <textarea
                                    placeholder="Enter address"
                                    value={newUser.address}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            address: e.target.value
                                        })
                                    }
                                    maxLength={400}
                                    required
                                />

                                <small>
                                    Maximum 400 characters
                                </small>


                                <label>Password</label>

                                <input
                                    type="password"
                                    placeholder="Enter password"
                                    value={newUser.password}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            password: e.target.value
                                        })
                                    }
                                    required
                                />

                                <small>
                                    8-16 characters, 1 uppercase
                                    & 1 special character
                                </small>


                                <label>Role</label>

                                <select
                                    value={newUser.role}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            role: e.target.value
                                        })
                                    }
                                    required
                                >
                                    <option value="USER">
                                        Normal User
                                    </option>

                                    <option value="OWNER">
                                        Store Owner
                                    </option>

                                    <option value="ADMIN">
                                        System Administrator
                                    </option>
                                </select>


                                <button
                                    type="submit"
                                    disabled={addUserLoading}
                                >
                                    {addUserLoading
                                        ? "Adding User..."
                                        : "Add User"}
                                </button>

                            </form>

                        </div>

                    )}


                    {/* ================================
                        USER FILTERS
                    ================================= */}
                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                            marginBottom: "15px",
                            flexWrap: "wrap"
                        }}
                    >

                        <input
                            type="text"
                            placeholder="Search by name, email or address..."
                            value={userSearch}
                            onChange={(e) =>
                                setUserSearch(e.target.value)
                            }
                            style={{
                                flex: 1,
                                minWidth: "250px",
                                padding: "10px"
                            }}
                        />

                        <select
                            value={userRoleFilter}
                            onChange={(e) =>
                                setUserRoleFilter(e.target.value)
                            }
                            style={{
                                padding: "10px"
                            }}
                        >

                            <option value="">
                                All Roles
                            </option>

                            <option value="USER">
                                Normal User
                            </option>

                            <option value="OWNER">
                                Store Owner
                            </option>

                            <option value="ADMIN">
                                Administrator
                            </option>

                        </select>


                        <button
                            type="button"
                            onClick={() => {
                                setUserSearch("");
                                setUserRoleFilter("");
                                setUserSort({
                                    field: "",
                                    direction: "asc"
                                });
                            }}
                        >
                            Clear
                        </button>

                    </div>


                    <div className="table-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th
                                        onClick={() =>
                                            handleUserSort("name")
                                        }
                                        style={{
                                            cursor: "pointer"
                                        }}
                                    >
                                        Name
                                        {getSortArrow(
                                            userSort,
                                            "name"
                                        )}
                                    </th>

                                    <th
                                        onClick={() =>
                                            handleUserSort("email")
                                        }
                                        style={{
                                            cursor: "pointer"
                                        }}
                                    >
                                        Email
                                        {getSortArrow(
                                            userSort,
                                            "email"
                                        )}
                                    </th>

                                    <th
                                        onClick={() =>
                                            handleUserSort("address")
                                        }
                                        style={{
                                            cursor: "pointer"
                                        }}
                                    >
                                        Address
                                        {getSortArrow(
                                            userSort,
                                            "address"
                                        )}
                                    </th>

                                    <th
                                        onClick={() =>
                                            handleUserSort("role")
                                        }
                                        style={{
                                            cursor: "pointer"
                                        }}
                                    >
                                        Role
                                        {getSortArrow(
                                            userSort,
                                            "role"
                                        )}
                                    </th>
                                    <th>Action</th>

                                </tr>

                            </thead>

                            <tbody>

                                {sortedUsers.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="empty"
                                        >
                                            No users found
                                        </td>
                                    </tr>

                                ) : (

                                    sortedUsers.map((user) => (

                                        <tr key={user.id}>

                                            <td>
                                                {user.name}
                                            </td>

                                            <td>
                                                {user.email}
                                            </td>

                                            <td>
                                                {user.address}
                                            </td>

                                            <td>
                                                <span className="role-badge">
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>
 <button
        type="button"
        onClick={() =>
            handleDeleteUser(
                user.id,
                user.name
            )
        }
        style={{
            background: "#dc3545",
            color: "white",
            border: "none",
            padding: "7px 12px",
            borderRadius: "5px",
            cursor: "pointer"
        }}
    >
        Delete
    </button>
</td>

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                    </div>

                </section>

            </main>

        </div>
    );
}

// ======================================
// CHANGE PASSWORD
// ======================================
function ChangePasswordPage() {

    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChangePassword = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordRegex.test(newPassword)) {
            setError(
                "Password must be 8-16 characters and contain at least one uppercase letter and one special character"
            );
            return;
        }

        try {

            const response = await axios.put(
                `${API_URL}/user/change-password`,
                {
                    currentPassword,
                    newPassword
                },
                getAuthConfig()
            );

            setMessage(
                response.data.message ||
                "Password updated successfully"
            );

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Failed to change password"
            );
        }
    };

    return (
        <div className="auth-container">

            <div className="auth-card">

                <h1>Change Password</h1>

                <p className="subtitle">
                    Update your account password
                </p>

                <form onSubmit={handleChangePassword}>

                    <label>
                        Current Password
                    </label>

                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) =>
                            setCurrentPassword(e.target.value)
                        }
                        required
                    />


                    <label>
                        New Password
                    </label>

                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) =>
                            setNewPassword(e.target.value)
                        }
                        required
                    />

                    <small>
                        8-16 characters, 1 uppercase & 1 special character
                    </small>


                    <label>
                        Confirm New Password
                    </label>

                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) =>
                            setConfirmPassword(e.target.value)
                        }
                        required
                    />


                    <button type="submit">
                        Change Password
                    </button>

                </form>


                {message && (
                    <p className="message">
                        {message}
                    </p>
                )}

                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}


                <button
                    type="button"
                    onClick={() => navigate("/user")}
                >
                    Back to Dashboard
                </button>

            </div>

        </div>
    );
}

// ======================================
// USER DASHBOARD
// ======================================
function UserPage() {

    const navigate = useNavigate();

    const [stores, setStores] = useState([]);
    const [search, setSearch] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const logout = () => {
        localStorage.clear();
        navigate("/");
    };

    // Fetch stores
    const fetchStores = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/user/stores?search=${search}`,
                getAuthConfig()
            );

            setStores(response.data.stores || []);

        } catch (err) {
            console.error(err);

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                logout();
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to load stores"
            );
        }
    };

    useEffect(() => {
        fetchStores();
    }, [search]);

    // Submit rating
    const submitRating = async (storeId, rating) => {

        try {

            await axios.post(
                `${API_URL}/user/ratings`,
                {
                    storeId,
                    rating: Number(rating)
                },
                getAuthConfig()
            );

            setMessage("Rating submitted successfully ⭐");
            setError("");

            fetchStores();

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Failed to submit rating"
            );

            setMessage("");
        }
    };

    return (
        <div className="admin-layout">

            {/* Navbar */}
            <nav className="navbar">

                <div>
                    <h2>Store Rating System</h2>
                    <span>User Panel</span>
                </div>

                <div>

                    <button
                        className="primary-btn"
                        onClick={() =>
                            navigate("/user/change-password")
                        }
                    >
                        Change Password
                    </button>

                    <button
                        className="logout-btn"
                        onClick={logout}
                    >
                        Logout
                    </button>

                </div>

            </nav>


            {/* Main */}
            <main className="admin-content">

                <h1>User Dashboard</h1>

                <p>
                    Search stores and submit your rating.
                </p>

                {message && (
                    <div className="message">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="error-box">
                        {error}
                    </div>
                )}


                {/* Search */}
                <input
                    type="text"
                    placeholder="Search store by name or address..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    style={{
                        width: "100%",
                        padding: "12px",
                        margin: "20px 0"
                    }}
                />


                {/* Stores */}
                <section className="table-section">

                    <div className="section-header">
                        <h2>Available Stores</h2>
                    </div>

                    <div className="table-wrapper">

                        <table>

                            <thead>
                                <tr>
                                    <th>Store Name</th>
                                    <th>Email</th>
                                    <th>Address</th>
                                    <th>Overall Rating</th>
                                    <th>My Rating</th>
                                    <th>Rate Store</th>
                                </tr>
                            </thead>

                            <tbody>

                                {stores.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="empty"
                                        >
                                            No stores found
                                        </td>
                                    </tr>

                                ) : (

                                    stores.map((store) => (

                                        <tr key={store.id}>

                                            <td>
                                                {store.name}
                                            </td>

                                            <td>
                                                {store.email}
                                            </td>

                                            <td>
                                                {store.address}
                                            </td>

                                            <td>
                                                ⭐{" "}
                                                {store.overallRating ??
                                                    "N/A"}
                                            </td>

                                            <td>
                                                {store.userRating
                                                    ? `⭐ ${store.userRating}`
                                                    : "Not rated"}
                                            </td>

                                            <td>

                                                <select
                                                    value={
                                                        store.userRating || ""
                                                    }
                                                    onChange={(e) =>
                                                        submitRating(
                                                            store.id,
                                                            e.target.value
                                                        )
                                                    }
                                                >

                                                    <option value="">
                                                        Rate
                                                    </option>

                                                    <option value="1">
                                                        ⭐ 1
                                                    </option>

                                                    <option value="2">
                                                        ⭐ 2
                                                    </option>

                                                    <option value="3">
                                                        ⭐ 3
                                                    </option>

                                                    <option value="4">
                                                        ⭐ 4
                                                    </option>

                                                    <option value="5">
                                                        ⭐ 5
                                                    </option>

                                                </select>

                                            </td>

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                    </div>

                </section>

            </main>

        </div>
    );
}
/// ======================================
// OWNER DASHBOARD
// ======================================
function OwnerPage() {

    const navigate = useNavigate();

    const [store, setStore] = useState(null);
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    useEffect(() => {

        const fetchOwnerDashboard = async () => {

            try {

                const config = getAuthConfig();

                const [storeResponse, ratingsResponse] =
                    await Promise.all([

                        axios.get(
                            `${API_URL}/owner/my-store`,
                            config
                        ),

                        axios.get(
                            `${API_URL}/owner/ratings`,
                            config
                        )

                    ]);

                setStore(storeResponse.data.store);

                setRatings(
                    ratingsResponse.data.ratings || []
                );

            } catch (err) {

                console.error("Owner Dashboard Error:", err);

                if (
                    err.response?.status === 401 ||
                    err.response?.status === 403
                ) {
                    logout();
                    return;
                }

                setError(
                    err.response?.data?.message ||
                    "Failed to load owner dashboard"
                );

            } finally {

                setLoading(false);

            }
        };

        fetchOwnerDashboard();

    }, []);


    if (loading) {

        return (
            <div className="loading">
                Loading Owner Dashboard...
            </div>
        );

    }


    return (

        <div className="admin-layout">

            {/* NAVBAR */}

            <nav className="navbar">

                <div>

                    <h2>Store Rating System</h2>

                    <span>Owner Panel</span>

                </div>

                <button
                    className="logout-btn"
                    onClick={logout}
                >
                    Logout
                </button>

            </nav>


            {/* CONTENT */}

            <main className="admin-content">

                <h1>Owner Dashboard</h1>


                {error && (

                    <div className="error-box">
                        {error}
                    </div>

                )}


                {/* STORE DETAILS */}

                {store && (

                    <section className="table-section">

                        <div className="section-header">

                            <h2>My Store</h2>

                        </div>


                        <div className="stats-grid">

                            <div className="stat-card">

                                <h3>Store Name</h3>

                                <strong>
                                    {store.name}
                                </strong>

                            </div>


                            <div className="stat-card">

                                <h3>Email</h3>

                                <strong>
                                    {store.email}
                                </strong>

                            </div>


                            <div className="stat-card">

                                <h3>Address</h3>

                                <strong>
                                    {store.address}
                                </strong>

                            </div>


                            <div className="stat-card">

                                <h3>Average Rating</h3>

                                <strong>
                                    ⭐ {store.averageRating ?? "N/A"}
                                </strong>

                            </div>


                            <div className="stat-card">

                                <h3>Total Ratings</h3>

                                <strong>
                                    {store.totalRatings}
                                </strong>

                            </div>

                        </div>

                    </section>

                )}


                {/* RATINGS */}

                <section className="table-section">

                    <div className="section-header">

                        <h2>Users Who Rated My Store</h2>

                    </div>


                    <div className="table-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th>User Name</th>

                                    <th>Email</th>

                                    <th>Rating</th>

                                    <th>Date</th>

                                </tr>

                            </thead>


                            <tbody>

                                {ratings.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="4"
                                            className="empty"
                                        >
                                            No ratings yet
                                        </td>

                                    </tr>

                                ) : (

                                    ratings.map((rating) => (

                                        <tr key={rating.userId}>

                                            <td>
                                                {rating.userName}
                                            </td>

                                            <td>
                                                {rating.userEmail}
                                            </td>

                                            <td>
                                                ⭐ {rating.rating}
                                            </td>

                                            <td>
                                                {new Date(
                                                    rating.ratingDate
                                                ).toLocaleDateString()}
                                            </td>

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                    </div>

                </section>

            </main>

        </div>

    );

}


// ======================================
// APP
// ======================================
function App() {

    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/signup"
                    element={<Signup />}
                />
                
                <Route
                    path="/admin"
                    element={<AdminPage />}
                />
                <Route
                    path="/admin/add-store"
                    element={<AddStorePage />}
                />


                <Route
                    path="/user"
                    element={<UserPage />}
                />
                <Route
                    path="/user/change-password"
                    element={<ChangePasswordPage />}
                />

                <Route
                    path="/owner"
                    element={<OwnerPage />}
                />

                <Route
                    path="*"
                    element={<Navigate to="/" />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;
