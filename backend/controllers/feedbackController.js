const { Feedback, Client, Freelancer, Project, User } = require('../models');

// POST /feedbacks - Submit feedback (client only, after project assigned)
exports.submitFeedback = async (req, res) => {
  try {
    const client = await Client.findOne({ where: { user_id: req.user.user_id } });
    if (!client) return res.status(403).json({ success: false, message: 'Client profile not found' });

    const { project_id, freelancer_id, rating, comments } = req.body;

    const project = await Project.findOne({ where: { project_id, client_id: client.client_id } });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const existing = await Feedback.findOne({ where: { project_id, client_id: client.client_id } });
    if (existing) return res.status(409).json({ success: false, message: 'Feedback already submitted for this project' });

    // giveFeedback from class diagram
    const feedback = await client.giveFeedback({ project_id, freelancer_id, rating, comments });
    await feedback.submitFeedback(); // Feedback class method

    // Update freelancer's average rating
    const allFeedbacks = await Feedback.findAll({ where: { freelancer_id } });
    const avgRating = allFeedbacks.reduce((sum, f) => sum + f.rating, 0) / allFeedbacks.length;
    await Freelancer.update({ rating: parseFloat(avgRating.toFixed(2)) }, { where: { freelancer_id } });

    // Mark project as completed
    await Project.update({ status: 'completed' }, { where: { project_id } });

    res.status(201).json({ success: true, message: 'Feedback submitted and rating updated', feedback });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /feedbacks/freelancer/:id - Get all feedbacks for a freelancer
exports.getFreelancerFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll({
      where: { freelancer_id: req.params.id },
      include: [
        { model: Client, as: 'client', include: [{ model: User, as: 'user', attributes: ['username'] }] },
        { model: Project, as: 'project', attributes: ['title'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /feedbacks/project/:id - Get feedbacks for a specific project
exports.getProjectFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findOne({
      where: { project_id: req.params.id },
      include: [
        { model: Client, as: 'client', include: [{ model: User, as: 'user', attributes: ['username'] }] },
        { model: Freelancer, as: 'freelancer', include: [{ model: User, as: 'user', attributes: ['username'] }] },
      ],
    });
    res.json({ success: true, feedback });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
