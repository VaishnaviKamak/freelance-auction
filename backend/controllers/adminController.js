const { User, Client, Freelancer, Administrator, Project, Auction, Bid, Feedback, Payment } = require('../models');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [
        { model: Client, as: 'clientProfile' },
        { model: Freelancer, as: 'freelancerProfile' },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, users });
  } catch (err) {
    console.error('getAllUsers error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    await User.update(req.body, { where: { user_id: req.params.id } });
    res.json({ success: true, message: 'User updated' });
  } catch (err) {
    console.error('updateUser error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const target = await User.findByPk(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });
    if (target.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot delete admin accounts' });
    await User.destroy({ where: { user_id: req.params.id } });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    console.error('deleteUser error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Block or unblock a user
exports.toggleBlockUser = async (req, res) => {
  try {
    const target = await User.findByPk(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });
    if (target.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot block admin accounts' });

    const newStatus = !target.is_active;
    await User.update({ is_active: newStatus }, { where: { user_id: req.params.id } });

    res.json({
      success: true,
      message: newStatus ? 'User unblocked successfully' : 'User blocked successfully',
      is_active: newStatus,
    });
  } catch (err) {
    console.error('toggleBlockUser error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.monitorAuctions = async (req, res) => {
  try {
    const auctions = await Auction.findAll({
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['project_id', 'title', 'budget', 'status'],
        }
      ],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, auctions });
  } catch (err) {
    console.error('monitorAuctions error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalProjects = await Project.count();
    const totalBids = await Bid.count();
    const totalPayments = await Payment.count();
    const openProjects = await Project.count({ where: { status: 'open' } });
    const completedProjects = await Project.count({ where: { status: 'completed' } });
    const activeAuctions = await Auction.count({ where: { status: 'open' } });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProjects,
        totalBids,
        totalPayments,
        openProjects,
        completedProjects,
        activeAuctions,
      }
    });
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [{ model: Client, as: 'client' }, { model: Auction, as: 'auction' }],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};