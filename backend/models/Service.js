const mongoose = require('mongoose');
const ServiceSchema = new mongoose.Schema({
    serviceName: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    duration: { type: String, required: true }, // e.g., "60 mins"
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Service', ServiceSchema);