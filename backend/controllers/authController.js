const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Client, Freelancer, Administrator } = require('../models');

const generateToken = (user) =>
  jwt.sign({ user_id: user.user_id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

exports.register = async (req, res) => {
  try {
    const { username, email, password, role, company_name, skills, experience } = req.body;
    if (!username || !email || !password || !role)
      return res.status(400).json({ success: false, message: 'All fields required' });
    if (!['client', 'freelancer'].includes(role))
      return res.status(400).json({ success: false, message: 'Role must be client or freelancer' });
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, password: hashed, role });
    if (role === 'client') {
      await Client.create({ user_id: user.user_id, company_name: company_name || '' });
    } else if (role === 'freelancer') {
      await Freelancer.create({ user_id: user.user_id, skills: skills || '', experience: experience || 0 });
    }
    const token = generateToken(user);
    res.status(201).json({ success: true, message: 'Registered successfully', token, user: { user_id: user.user_id, username, email, role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.is_active) {
    return res.status(403).json({ success: false, message: 'Your account has been blocked. Contact admin.' });}
    let profile = null;
    if (user.role === 'client') profile = await Client.findOne({ where: { user_id: user.user_id } });
    else if (user.role === 'freelancer') profile = await Freelancer.findOne({ where: { user_id: user.user_id } });
    else if (user.role === 'admin') profile = await Administrator.findOne({ where: { user_id: user.user_id } });
    const token = generateToken(user);
    user.login();
    res.json({ success: true, message: 'Login successful', token, user: { user_id: user.user_id, username: user.username, email: user.email, role: user.role, profile } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    let profile = null;
    if (user.role === 'client') profile = await Client.findOne({ where: { user_id: user.user_id } });
    else if (user.role === 'freelancer') profile = await Freelancer.findOne({ where: { user_id: user.user_id } });
    else if (user.role === 'admin') profile = await Administrator.findOne({ where: { user_id: user.user_id } });
    res.json({ success: true, user: { user_id: user.user_id, username: user.username, email: user.email, role: user.role, profile } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, company_name, skills, experience } = req.body;
    await req.user.updateProfile({ username });
    if (req.user.role === 'client' && company_name) {
      await Client.update({ company_name }, { where: { user_id: req.user.user_id } });
    }
    if (req.user.role === 'freelancer') {
      await Freelancer.update({ skills, experience }, { where: { user_id: req.user.user_id } });
    }
    res.json({ success: true, message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateFreelancerProfile = async (req, res) => {
  try {
    const { username, skills, experience } = req.body;
    if (username) {
      await req.user.update({ username });
    }
    await Freelancer.update(
      { skills, experience: parseInt(experience) || 0 },
      { where: { user_id: req.user.user_id } }
    );
    const updated = await Freelancer.findOne({ where: { user_id: req.user.user_id } });
    res.json({ success: true, message: 'Profile updated successfully', profile: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
