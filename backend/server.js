const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log('✅ MongoDB Successfully Connected!'))
.catch(err => {
    console.error('❌ MongoDB Connection Error:');
    console.error(err);
});

// --- MODELS ---
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const PetSchema = new mongoose.Schema({
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    petName: { type: String, required: true },
    petType: { type: String, required: true },
    breed: { type: String },
    age: { type: Number },
    createdAt: { type: Date, default: Date.now }
});
const Pet = mongoose.models.Pet || mongoose.model('Pet', PetSchema);

const ServiceSchema = new mongoose.Schema({
    serviceName: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    duration: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);

const AppointmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    appointmentDate: { type: Date, required: true },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);

// --- MIDDLEWARE ---
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Access denied' });
    try {
        req.user = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

// --- AUTH ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, email, password, role, adminCode } = req.body;
        if (role === 'admin' && adminCode !== 'admin@123') return res.status(400).json({ error: 'Invalid Admin Code.' });
        
        const finalRole = role === 'admin' ? 'admin' : 'user';
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword, role: finalRole });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed. Email might exist.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'User not found' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
        
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, username: user.username, role: user.role, email: user.email, createdAt: user.createdAt } });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// --- SERVICES ROUTES ---
app.get('/api/services', async (req, res) => {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
});

app.post('/api/services', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only.' });
    const service = new Service(req.body);
    await service.save();
    res.json(service);
});

app.delete('/api/services/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only.' });
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
});

// --- PETS ROUTES ---
app.get('/api/pets', authMiddleware, async (req, res) => {
    const pets = await Pet.find({ ownerId: req.user.id });
    res.json(pets);
});

app.post('/api/pets', authMiddleware, async (req, res) => {
    const pet = new Pet({ ...req.body, ownerId: req.user.id });
    await pet.save();
    res.json(pet);
});

// NEW: Update existing pet route
app.put('/api/pets/:id', authMiddleware, async (req, res) => {
    try {
        const pet = await Pet.findOneAndUpdate(
            { _id: req.params.id, ownerId: req.user.id }, // Ensures they own the pet
            req.body,
            { new: true }
        );
        if (!pet) return res.status(404).json({ error: 'Pet not found or unauthorized' });
        res.json(pet);
    } catch (err) {
        res.status(500).json({ error: "Failed to update pet." });
    }
});

// NEW: Delete pet route (Also deletes their appointments)
app.delete('/api/pets/:id', authMiddleware, async (req, res) => {
    try {
        const pet = await Pet.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
        if (!pet) return res.status(404).json({ error: 'Pet not found or unauthorized' });
        
        // Cascade delete: remove any appointments associated with this pet
        await Appointment.deleteMany({ petId: req.params.id });

        res.json({ message: 'Pet and associated appointments deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete pet." });
    }
});

// --- APPOINTMENTS ROUTES ---
app.get('/api/appointments', authMiddleware, async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { userId: req.user.id };
        const appointments = await Appointment.find(query)
            .populate('userId', 'username email')
            .populate('petId', 'petName petType breed')
            .populate('serviceId', 'serviceName price duration')
            .sort({ appointmentDate: 1 });
        res.json(appointments);
    } catch(err) { res.status(500).json({error: "Failed to fetch."}) }
});

app.post('/api/appointments', authMiddleware, async (req, res) => {
    try {
        const apt = new Appointment({ ...req.body, userId: req.user.id });
        await apt.save();
        res.json(apt);
    } catch(err) { res.status(500).json({error: "Failed to book."}) }
});

app.put('/api/appointments/:id/status', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only.' });
    const apt = await Appointment.findByIdAndUpdate(req.params.id, { status: req.body.status }, { returnDocument: 'after' });
    res.json(apt);
});

// NEW: Delete Appointment (Admin Only)
app.delete('/api/appointments/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only.' });
    try {
        await Appointment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Appointment deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete appointment." });
    }
});

// --- ADMIN USERS ROUTE ---
app.get('/api/users', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only.' });
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
});

app.delete('/api/users/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only.' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
});

// --- STATS ROUTE ---
app.get('/api/stats', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only.' });
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'Pending' });
    res.json({ totalUsers, totalAppointments, pendingAppointments });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));