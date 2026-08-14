const User = require('../models/User');
const Item = require('../models/Item');
const Note = require('../models/Note');
const StudyRequest = require('../models/StudyRequest');
const Event = require('../models/Event');

async function seedInitialData() {
    if (await User.countDocuments()) return;
    const users = await User.create([
        { name: 'Maya Rao', email: 'maya@campus.edu', password: 'demo123', department: 'Computer Science', year: '3rd Year', skills: ['JavaScript', 'Python'], interests: ['Hackathons', 'Open Source'], bio: 'Building useful things for students.' },
        { name: 'Aarav Sharma', email: 'aarav@campus.edu', password: 'demo123', department: 'Mechanical Engineering', year: '4th Year', skills: ['CAD', 'MATLAB'], interests: ['Robotics'], bio: 'Senior mentor and maker.' },
        { name: 'Neha Verma', email: 'neha@campus.edu', password: 'demo123', department: 'Computer Science', year: '2nd Year', skills: ['Java', 'DSA'], interests: ['Competitive Programming'], bio: 'Always looking for a study sprint.' },
        { name: 'Priya Patel', email: 'priya@campus.edu', password: 'demo123', department: 'Electronics Engineering', year: '3rd Year', skills: ['Embedded C', 'PCB Design'], interests: ['IoT'], bio: 'Turning circuits into ideas.' }
    ]);
    await Item.create([
        { title: 'Engineering Physics Vol. 1', category: 'Books', price: 250, condition: 'Good', description: 'Clean copy with highlighted derivations.', seller: users[1]._id },
        { title: 'Digital Multimeter & Breadboard', category: 'Lab Equipment', price: 400, condition: 'Like New', description: 'Barely used starter kit.', seller: users[3]._id },
        { title: 'Scientific Calculator FX-991ES', category: 'Calculators', price: 550, listingType: 'Exchange', condition: 'Good', description: 'Exchange for a graph notebook set.', seller: users[0]._id }
    ]);
    await Note.create([
        { title: 'Data Structures Quick Revision', subject: 'Data Structures', semester: 'Semester 4', department: 'Computer Science', description: 'Trees, graphs and exam patterns.', uploader: users[2]._id, downloads: 84 },
        { title: 'Network Theory Formula Sheet', subject: 'Network Theory', semester: 'Semester 4', department: 'Electronics Engineering', description: 'Last-week revision formulas.', uploader: users[3]._id, downloads: 51 },
        { title: 'Engineering Mechanics Notes', subject: 'Engineering Mechanics', semester: 'Semester 2', department: 'Mechanical Engineering', description: 'Solved examples and key concepts.', uploader: users[1]._id, downloads: 109 }
    ]);
    await StudyRequest.create([
        { subject: 'Data Structures', topic: 'Binary Trees & Graphs', semester: 'Semester 4', prepLevel: 'Exam Ready', location: 'Library - Floor 2', host: users[2]._id, members: [users[2]._id, users[0]._id] },
        { subject: 'Applied Mathematics', topic: 'Fourier Series', semester: 'Semester 3', prepLevel: 'Beginner', location: 'Student Lounge', host: users[0]._id, members: [users[0]._id] }
    ]);
    await Event.create([
        { title: 'Build for Campus Hackathon', type: 'Hackathon', date: new Date('2026-09-05T09:00:00'), location: 'Innovation Lab', description: 'A 24-hour sprint to improve student life.' },
        { title: 'Embedded Systems Workshop', type: 'Workshop', date: new Date('2026-09-12T14:00:00'), location: 'ECE Seminar Hall', description: 'Hands-on sensor prototyping.' },
        { title: 'CodeSprint 2026', type: 'Coding Contest', date: new Date('2026-09-20T10:00:00'), location: 'Online + Main Auditorium', description: 'Solve, learn, and meet the coding community.' }
    ]);
}
module.exports = { seedInitialData };
