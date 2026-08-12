const mongoose =.require('mongoose');

const orderSchema = new mongoose.Schema({
    items: Array,
    totalAmount: Number,
    customerName: String,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
