const { Payment, Project, Client, Freelancer } = require('../models');
const { v4: uuidv4 } = require('crypto');

// POST /payments - Make a payment (client, use case: Make Payment)
exports.makePayment = async (req, res) => {
  try {
    const client = await Client.findOne({ where: { user_id: req.user.user_id } });
    if (!client) return res.status(403).json({ success: false, message: 'Client profile not found' });

    const { project_id, freelancer_id, amount } = req.body;
    const project = await Project.findOne({ where: { project_id, client_id: client.client_id } });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Simulate payment gateway processing
    const transaction_id = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const paymentStatus = 'completed'; // In production, integrate a real payment gateway

    const payment = await Payment.create({
      project_id,
      client_id: client.client_id,
      freelancer_id,
      amount,
      status: paymentStatus,
      transaction_id,
    });

    res.status(201).json({ success: true, message: 'Payment processed successfully', payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /payments/project/:id - Get payment for a project
exports.getProjectPayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({ where: { project_id: req.params.id } });
    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /payments/my - Get client's payment history
exports.getMyPayments = async (req, res) => {
  try {
    const client = await Client.findOne({ where: { user_id: req.user.user_id } });
    const payments = await Payment.findAll({
      where: { client_id: client.client_id },
      include: [{ model: Project, as: 'project', attributes: ['title'] }],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
