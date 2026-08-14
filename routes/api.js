const express = require('express');
const { randomUUID } = require('crypto');
const User = require('../models/User');
const Item = require('../models/Item');
const Note = require('../models/Note');
const StudyRequest = require('../models/StudyRequest');
const Event = require('../models/Event');
const Connection = require('../models/Connection');

const router = express.Router();
const sessions = new Map();
const safeUser = (user) => ({ id: user._id, name: user.name, email: user.email, department: user.department, year: user.year, skills: user.skills, interests: user.interests, bio: user.bio, rating: user.rating });
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const required = (value, label) => { if (!String(value || '').trim()) { const error = new Error(`${label} is required.`); error.name = 'ValidationError'; throw error; } };
const auth = asyncRoute(async (req, res, next) => {
    const token = req.get('x-session-token'); const id = token && sessions.get(token);
    if (!id) return res.status(401).json({ error: 'Please sign in to continue.' });
    req.user = await User.findById(id);
    if (!req.user) return res.status(401).json({ error: 'Session expired.' });
    next();
});
const profile = async (user) => ({ ...safeUser(user), marketplaceListings: await Item.countDocuments({ seller: user._id }), resourcesShared: await Note.countDocuments({ uploader: user._id }), connectionCount: await Connection.countDocuments({ status: 'Accepted', $or: [{ requester: user._id }, { recipient: user._id }] }) });

router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.post('/auth/signup', asyncRoute(async (req, res) => {
    const { name, email, password, department, year } = req.body; required(name, 'Name'); required(email, 'Email'); required(password, 'Password');
    const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), password, department: (department || 'Engineering').trim(), year: (year || '1st Year').trim() });
    const token = randomUUID(); sessions.set(token, user.id); res.status(201).json({ token, user: await profile(user) });
}));
router.post('/auth/login', asyncRoute(async (req, res) => {
    const user = await User.findOne({ email: String(req.body.email || '').trim().toLowerCase() }).select('+password');
    if (!user || user.password !== req.body.password) return res.status(401).json({ error: 'Incorrect email or password.' });
    const token = randomUUID(); sessions.set(token, user.id); res.json({ token, user: await profile(user) });
}));
router.post('/auth/logout', auth, (req, res) => { sessions.delete(req.get('x-session-token')); res.status(204).end(); });
router.get('/auth/me', auth, asyncRoute(async (req, res) => res.json(await profile(req.user))));
router.patch('/profile', auth, asyncRoute(async (req, res) => {
    ['name', 'department', 'year', 'bio'].forEach((field) => { if (req.body[field] !== undefined) req.user[field] = String(req.body[field]).trim(); });
    ['skills', 'interests'].forEach((field) => { if (Array.isArray(req.body[field])) req.user[field] = req.body[field].map((value) => String(value).trim()).filter(Boolean).slice(0, 10); });
    await req.user.save(); res.json(await profile(req.user));
}));

router.get('/users', asyncRoute(async (req, res) => { const query = req.query.search ? { $or: [{ name: new RegExp(req.query.search, 'i') }, { department: new RegExp(req.query.search, 'i') }] } : {}; res.json((await User.find(query).limit(30)).map(safeUser)); }));
router.get('/items', asyncRoute(async (req, res) => { const filter = { status: 'Active' }; if (req.query.category && req.query.category !== 'All') filter.category = req.query.category; if (req.query.search) filter.title = new RegExp(req.query.search, 'i'); res.json(await Item.find(filter).populate('seller', 'name department year rating').sort({ createdAt: -1 }).limit(50)); }));
router.post('/items', auth, asyncRoute(async (req, res) => { const { title, category, price, listingType, condition, description } = req.body; required(title, 'Title'); required(category, 'Category'); const item = await Item.create({ title: title.trim(), category, price: Number(price) || 0, listingType, condition, description: String(description || '').trim(), seller: req.user._id }); res.status(201).json(await item.populate('seller', 'name department year rating')); }));

router.get('/notes', asyncRoute(async (req, res) => { const filter = {}; ['subject', 'semester', 'department'].forEach((field) => { if (req.query[field]) filter[field] = req.query[field]; }); res.json(await Note.find(filter).populate('uploader', 'name department year rating').sort({ createdAt: -1 }).limit(50)); }));
router.post('/notes', auth, asyncRoute(async (req, res) => { const { title, subject, semester, description } = req.body; required(title, 'Title'); required(subject, 'Subject'); required(semester, 'Semester'); const note = await Note.create({ title: title.trim(), subject: subject.trim(), semester: semester.trim(), description: String(description || '').trim(), department: req.user.department, uploader: req.user._id }); res.status(201).json(await note.populate('uploader', 'name department year rating')); }));
router.post('/notes/:id/download', asyncRoute(async (req, res) => { const note = await Note.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } }, { new: true }); if (!note) return res.status(404).json({ error: 'Note not found.' }); res.json({ message: 'Mock download started.', note }); }));

router.get('/study', asyncRoute(async (req, res) => res.json(await StudyRequest.find({ status: 'Open' }).populate('host', 'name department year rating').populate('members', 'name').sort({ createdAt: -1 }).limit(50))));
router.post('/study', auth, asyncRoute(async (req, res) => { const { subject, topic, semester, prepLevel, location } = req.body; required(subject, 'Subject'); required(topic, 'Topic'); required(semester, 'Semester'); required(prepLevel, 'Preparation level'); const study = await StudyRequest.create({ subject: subject.trim(), topic: topic.trim(), semester: semester.trim(), prepLevel, location: String(location || 'Campus Library').trim(), host: req.user._id, members: [req.user._id] }); res.status(201).json(await study.populate('host', 'name department year rating')); }));
router.post('/study/:id/join', auth, asyncRoute(async (req, res) => { const study = await StudyRequest.findById(req.params.id); if (!study) return res.status(404).json({ error: 'Study group not found.' }); if (!study.members.some((member) => member.equals(req.user._id))) { study.members.push(req.user._id); await study.save(); } res.json(study); }));
router.get('/connections', auth, asyncRoute(async (req, res) => res.json(await Connection.find({ $or: [{ requester: req.user._id }, { recipient: req.user._id }] }).populate('requester', 'name department year').populate('recipient', 'name department year').sort({ createdAt: -1 }))));
router.post('/connections/:userId', auth, asyncRoute(async (req, res) => { if (req.params.userId === req.user.id) return res.status(400).json({ error: 'You cannot connect with yourself.' }); const recipient = await User.findById(req.params.userId); if (!recipient) return res.status(404).json({ error: 'Student not found.' }); const existing = await Connection.findOne({ $or: [{ requester: req.user._id, recipient: recipient._id }, { requester: recipient._id, recipient: req.user._id }] }); if (existing) return res.json(existing); res.status(201).json(await Connection.create({ requester: req.user._id, recipient: recipient._id })); }));
router.patch('/connections/:id/accept', auth, asyncRoute(async (req, res) => { const connection = await Connection.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { status: 'Accepted' }, { new: true }); if (!connection) return res.status(404).json({ error: 'Connection request not found.' }); res.json(connection); }));
router.get('/events', asyncRoute(async (req, res) => res.json(await Event.find().sort({ date: 1 }).limit(20))));
module.exports = router;
