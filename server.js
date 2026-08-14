const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- MongoDB Schemas ---
const ItemSchema = new mongoose.Schema({
    title: String,
    category: String,
    price: String,
    condition: String,
    sellerName: String,
    contact: String,
    createdAt: { type: Date, default: Date.now }
});

const StudyRequestSchema = new mongoose.Schema({
    subject: String,
    topic: String,
    prepLevel: String,
    studentName: String,
    contact: String,
    location: String,
    createdAt: { type: Date, default: Date.now }
});

const Item = mongoose.model('Item', ItemSchema);
const StudyRequest = mongoose.model('StudyRequest', StudyRequestSchema);

// --- REST API Endpoints ---
app.get('/api/items', async (req, res) => {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
});

app.post('/api/items', async (req, res) => {
    const newItem = new Item(req.body);
    await newItem.save();
    res.status(201).json(newItem);
});


app.get('/api/study', async (req, res) => {
    const requests = await StudyRequest.find().sort({ createdAt: -1 });
    res.json(requests);
});

app.post('/api/study', async (req, res) => {
    const newRequest = new StudyRequest(req.body);
    await newRequest.save();
    res.status(201).json(newRequest);
});

// --- Seed Initial Presentation Data ---
async function seedInitialData() {
    await Item.insertMany([
        { title: 'Engineering Physics Vol 1', category: 'Book', price: '₹250', condition: 'Good', sellerName: 'Aarav Sharma', contact: 'aarav@campus.edu' },
        { title: 'Digital Multimeter & Breadboard', category: 'Gear', price: '₹400', condition: 'Like New', sellerName: 'Priya Patel', contact: '+91 9876543210' },
        { title: 'Chemistry Lab Coat (Size L)', category: 'Lab Equipment', price: 'Exchange', condition: 'Fair', sellerName: 'Rohan Gupta', contact: 'rohan@campus.edu' }
    ]);

    await StudyRequest.insertMany([
        { subject: 'Data Structures', topic: 'Binary Trees & Graphs', prepLevel: 'Exam Ready', studentName: 'Neha Verma', contact: 'neha@campus.edu', location: 'Library - Floor 2' },
        { subject: 'Applied Mathematics', topic: 'Fourier Series', prepLevel: 'Beginner', studentName: 'Vikram Singh', contact: '+91 9123456789', location: 'Student Lounge' }
    ]);
    console.log('🌱 Seeded initial presentation data.');
}

// --- Start Server with In-Memory Database ---
async function startApp() {
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);
    console.log('✅ Connected to In-Memory MongoDB');

    await seedInitialData();

    const PORT = 3000;
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:3000`));
}

startApp();