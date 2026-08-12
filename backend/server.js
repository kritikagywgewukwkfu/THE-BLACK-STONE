const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ================= MONGODB CONNECTION =================
// ================= MONGODB CONNECTION =================
mongoose.connect('mongodb+srv://admin:admin123@cluster0.ufsiqd4.mongodb.net/?appName=Cluster0')
.then(() => console.log('Database Connected Successfully!'))
.catch(err => console.log(err));

// ================= SCHEMAS & MODELS =================

// 1. Order Schema
const orderSchema = new mongoose.Schema({
    id: String,
    items: Array,
    totalAmount: Number,
    customerName: String,
    tableNo: String,
    waiterName: String,
    status: String,
    rawDate: Number,
    date: String,
    time: String
});
const Order = mongoose.model('Order', orderSchema);

// 2. Expense Schema
const expenseSchema = new mongoose.Schema({
    id: Number,
    title: String,
    amount: Number,
    rawDate: Number,
    date: String,
    time: String
});
const Expense = mongoose.model('Expense', expenseSchema);

// 3. Staff Schema
const staffSchema = new mongoose.Schema({
    id: Number,
    name: String,
    role: String,
    salary: Number,
    paidAmount: Number,
    payoutHistory: Array
});
const Staff = mongoose.model('Staff', staffSchema);

// 4. Settings Schema (For Admin Password)
const settingSchema = new mongoose.Schema({
    key: { type: String, default: 'settings' },
    password: { type: String, default: 'admin123' }
});
const Setting = mongoose.model('Setting', settingSchema);


// ================= API ROUTES =================

// --- ORDERS ENDPOINTS ---
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/orders/:id', async (req, res) => {
    try {
        const updatedOrder = await Order.findOneAndUpdate(
            { id: req.params.id }, 
            req.body, 
            { new: true }
        );
        res.json(updatedOrder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- EXPENSES ENDPOINTS ---
app.get('/api/expenses', async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/expenses', async (req, res) => {
    try {
        const newExpense = new Expense(req.body);
        await newExpense.save();
        res.status(201).json(newExpense);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- STAFF ENDPOINTS ---
app.get('/api/staff', async (req, res) => {
    try {
        const staffList = await Staff.find();
        res.json(staffList);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/staff', async (req, res) => {
    try {
        const newStaff = new Staff(req.body);
        await newStaff.save();
        res.status(201).json(newStaff);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/staff/:id', async (req, res) => {
    try {
        const updatedStaff = await Staff.findOneAndUpdate(
            { id: Number(req.params.id) }, 
            req.body, 
            { new: true }
        );
        res.json(updatedStaff);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- SETTINGS ENDPOINTS (Password Management) ---
app.get('/api/settings', async (req, res) => {
    try {
        let setting = await Setting.findOne({ key: 'settings' });
        if (!setting) {
            setting = await Setting.create({ key: 'settings', password: 'admin123' });
        }
        res.json(setting);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/settings', async (req, res) => {
    try {
        let setting = await Setting.findOneAndUpdate(
            { key: 'settings' },
            { password: req.body.password },
            { new: true, upsert: true }
        );
        res.json(setting);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ================= SERVER START =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} 🚀`);
});