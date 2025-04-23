import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Setup storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create directories if they don't exist
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Encryption key
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'infinity-secure-key-2025';

// Mock user database
const users = [
  {
    id: '1',
    name: 'Admin User',
    username: 'admin',
    password: bcrypt.hashSync('password123', 10),
    role: 'admin'
  },
  {
    id: '2',
    name: 'Test Employee',
    username: 'employee',
    password: bcrypt.hashSync('password123', 10),
    role: 'employee'
  }
];

// Mock data storage
let attendanceRecords = [];
let shopVisitRecords = [];

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'infinity-jwt-secret-key';

// Authentication middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Routes

// Login route
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username);
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  
  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  // Return user info without password
  const { password: _, ...userWithoutPassword } = user;
  
  res.json({
    ...userWithoutPassword,
    token
  });
});

// Check authentication status
app.get('/api/auth/status', authenticate, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Return user info without password
  const { password: _, ...userWithoutPassword } = user;
  
  res.json(userWithoutPassword);
});

// Submit attendance
app.post('/api/attendance', authenticate, (req, res) => {
  try {
    const { encryptedData } = req.body;
    
    // Store the encrypted data
    attendanceRecords.push({
      id: Date.now().toString(),
      encryptedData,
      employeeId: req.user.id,
      timestamp: new Date().toISOString()
    });
    
    res.status(201).json({ message: 'Attendance submitted successfully' });
  } catch (error) {
    console.error('Error submitting attendance:', error);
    res.status(500).json({ message: 'Failed to submit attendance' });
  }
});

// Submit shop visit
app.post('/api/shop-visits', authenticate, (req, res) => {
  try {
    const { encryptedData } = req.body;
    
    // Store the encrypted data
    shopVisitRecords.push({
      id: Date.now().toString(),
      encryptedData,
      employeeId: req.user.id,
      timestamp: new Date().toISOString()
    });
    
    res.status(201).json({ message: 'Shop visit submitted successfully' });
  } catch (error) {
    console.error('Error submitting shop visit:', error);
    res.status(500).json({ message: 'Failed to submit shop visit' });
  }
});

// Export data to Excel (in a real app, this would generate and return the Excel file)
app.get('/api/export', authenticate, (req, res) => {
  // This route would generate the Excel file on the backend
  // For this example, we'll just return the data that would be in the Excel file
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Permission denied' });
  }
  
  try {
    // In a real application, this would generate an Excel file and send it
    res.json({
      message: 'Export functionality would generate Excel here',
      attendanceCount: attendanceRecords.length,
      shopVisitCount: shopVisitRecords.length
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ message: 'Failed to export data' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;