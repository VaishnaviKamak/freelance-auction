const { Project, Client, Freelancer, User, Auction } = require('../models');

// POST /projects - Client posts a project
exports.createProject = async (req, res) => {
  try {
    const client = await Client.findOne({ where: { user_id: req.user.user_id } });
    if (!client) return res.status(403).json({ success: false, message: 'Client profile not found' });

    const { title, description, budget, deadline } = req.body;
    const project = await Project.create({ client_id: client.client_id, title, description, budget, deadline, status: 'open' });
    project.createProject(); // class diagram method
    res.status(201).json({ success: true, message: 'Project created', project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /projects - List all open/listed projects (freelancers can view)
exports.getProjects = async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const projects = await Project.findAll({
      where,
      include: [{ model: Client, as: 'client', include: [{ model: User, as: 'user', attributes: ['username'] }] }],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /projects/:id - Get single project with auction and bids
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: Client, as: 'client', include: [{ model: User, as: 'user', attributes: ['username', 'email'] }] },
        { model: Auction, as: 'auction' },
        { model: Freelancer, as: 'assignedFreelancer', include: [{ model: User, as: 'user', attributes: ['username'] }] },
      ],
    });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /projects/:id - Update project (client only)
exports.updateProject = async (req, res) => {
  try {
    const client = await Client.findOne({ where: { user_id: req.user.user_id } });
    const project = await Project.findOne({ where: { project_id: req.params.id, client_id: client.client_id } });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found or unauthorized' });
    await project.updateProject(req.body); // class diagram method
    res.json({ success: true, message: 'Project updated', project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /projects/:id - Close project (client only)
exports.closeProject = async (req, res) => {
  try {
    const client = await Client.findOne({ where: { user_id: req.user.user_id } });
    const project = await Project.findOne({ where: { project_id: req.params.id, client_id: client.client_id } });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    await project.closeProject(); // class diagram method
    res.json({ success: true, message: 'Project closed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /projects/client/my - Get client's own projects
exports.getClientProjects = async (req, res) => {
  try {
    const client = await Client.findOne({ where: { user_id: req.user.user_id } });
    const projects = await Project.findAll({
      where: { client_id: client.client_id },
      include: [{ model: Auction, as: 'auction' }],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /projects/:id/select-freelancer - Client selects a freelancer
exports.selectFreelancer = async (req, res) => {
  try {
    const client = await Client.findOne({ where: { user_id: req.user.user_id } });
    const { freelancer_id, bid_id } = req.body;
    await client.selectFreelancer(req.params.id, freelancer_id); // class diagram method

    // Close the auction and mark bid accepted
    const { Bid } = require('../models');
    const project = await Project.findByPk(req.params.id, { include: [{ model: Auction, as: 'auction' }] });
    if (project.auction) await project.auction.closeAuction();
    if (bid_id) {
      await Bid.update({ status: 'accepted' }, { where: { bid_id } });
      await Bid.update({ status: 'rejected' }, { where: { auction_id: project.auction.auction_id, bid_id: { [require('sequelize').Op.ne]: bid_id } } });
    }
    res.json({ success: true, message: 'Freelancer selected and project assigned' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
