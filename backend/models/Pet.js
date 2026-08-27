const mongoose = require('mongoose');
const PetSchema = new mongoose.Schema({
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    petName: { type: String, required: true },
    petType: { type: String, required: true }, // Dog, Cat, etc.
    breed: { type: String },
    age: { type: Number },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Pet', PetSchema);