const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(__dirname));

// Initialize SQLite Database
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        // Create users table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

// Registration endpoint
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'All fields are required' 
        });
    }

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        db.run(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) {
                        return res.status(400).json({ 
                            success: false, 
                            message: 'Username or email already exists' 
                        });
                    }
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Error registering user' 
                    });
                }
                res.json({ 
                    success: true, 
                    message: 'Registration successful! Please login.' 
                });
            }
        );
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Username and password are required' 
        });
    }

    // Find user in database
    db.get(
        'SELECT * FROM users WHERE username = ?',
        [username],
        async (err, user) => {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Server error' 
                });
            }

            if (!user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'User not found. Please register first.' 
                });
            }

            // Compare password
            try {
                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    res.json({ 
                        success: true, 
                        message: 'Login successful!',
                        username: user.username 
                    });
                } else {
                    res.status(401).json({ 
                        success: false, 
                        message: 'Invalid password' 
                    });
                }
            } catch (error) {
                res.status(500).json({ 
                    success: false, 
                    message: 'Error during login' 
                });
            }
        }
    );
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve welcome page
app.get('/welcome.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'welcome.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
