const { Bid, Auction, Freelancer, Project, User } = require('../models');

// POST /bids - Submit a bid (freelancer only)
exports.submitBid = async (req, res) => {
  try {
    const freelancer = await Freelancer.findOne({ where: { user_id: req.user.user_id } });
    if (!freelancer) return res.status(403).json({ success: false, message: 'Freelancer profile not found' });

    const { auction_id, bid_amount, delivery_time } = req.body;

    const auction = await Auction.findByPk(auction_id, { include: [{ model: Project, as: 'project' }] });
    if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });
    if (auction.status !== 'open') return res.status(400).json({ success: false, message: 'Auction is not open' });
    if (bid_amount > auction.project.budget) {
      return res.status(400).json({ success: false, message: 'Bid amount exceeds project budget' });
    }

    const existing = await Bid.findOne({ where: { auction_id, freelancer_id: freelancer.freelancer_id } });
    if (existing) return res.status(409).json({ success: false, message: 'You have already submitted a bid for this auction' });

    const bid = await freelancer.submitBids({ auction_id, bid_amount, delivery_time });

    const score = bid.calculateScore(auction.project.budget, auction.project.deadline, freelancer.rating, freelancer.experience);
    await bid.update({ score });

    res.status(201).json({ success: true, message: 'Bid submitted successfully', bid: { ...bid.toJSON(), score } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /bids/auction/:auctionId - Get all bids for an auction
exports.getBidsByAuction = async (req, res) => {
  try {
    const bids = await Bid.findAll({
      where: { auction_id: req.params.auctionId },
      include: [{
        model: Freelancer, as: 'freelancer',
        include: [{ model: User, as: 'user', attributes: ['username', 'email'] }],
      }],
      order: [['score', 'DESC']],
    });
    res.json({ success: true, bids });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /bids/my - Get freelancer's own bids
exports.getMyBids = async (req, res) => {
  try {
    const freelancer = await Freelancer.findOne({ where: { user_id: req.user.user_id } });
    const bids = await Bid.findAll({
      where: { freelancer_id: freelancer.freelancer_id },
      include: [{ model: Auction, as: 'auction', include: [{ model: Project, as: 'project' }] }],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, bids });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /bids/:id - Update a bid
exports.updateBid = async (req, res) => {
  try {
    const freelancer = await Freelancer.findOne({ where: { user_id: req.user.user_id } });
    if (!freelancer) return res.status(403).json({ success: false, message: 'Freelancer profile not found' });

    const bid = await Bid.findOne({ where: { bid_id: req.params.id, freelancer_id: freelancer.freelancer_id } });
    if (!bid) return res.status(404).json({ success: false, message: 'Bid not found' });

    // Block edit if bid was already accepted or rejected
    if (bid.status === 'accepted') return res.status(400).json({ success: false, message: 'Cannot edit an accepted bid — a freelancer has already been selected' });
    if (bid.status === 'rejected') return res.status(400).json({ success: false, message: 'Cannot edit a rejected bid' });

    // Check auction is still open
    const auction = await Auction.findByPk(bid.auction_id, { include: [{ model: Project, as: 'project' }] });
    if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });
    if (auction.status !== 'open') return res.status(400).json({ success: false, message: 'Auction is closed — bids can no longer be edited' });

    // Check project has no freelancer selected yet
    if (auction.project.assigned_freelancer_id) {
      return res.status(400).json({ success: false, message: 'A freelancer has already been selected for this project' });
    }

    // Validate new bid amount
    const { bid_amount, delivery_time } = req.body;
    if (bid_amount && bid_amount > auction.project.budget) {
      return res.status(400).json({ success: false, message: 'Bid amount exceeds project budget' });
    }

    await bid.update({ bid_amount, delivery_time });

    // Recalculate score
    const score = bid.calculateScore(auction.project.budget, auction.project.deadline, freelancer.rating, freelancer.experience);
    await bid.update({ score });

    res.json({ success: true, message: 'Bid updated successfully', bid: { ...bid.toJSON(), score } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /bids/:id - Withdraw a bid
exports.deleteBid = async (req, res) => {
  try {
    const freelancer = await Freelancer.findOne({ where: { user_id: req.user.user_id } });
    const bid = await Bid.findOne({ where: { bid_id: req.params.id, freelancer_id: freelancer.freelancer_id } });
    if (!bid) return res.status(404).json({ success: false, message: 'Bid not found' });

    if (bid.status === 'accepted') return res.status(400).json({ success: false, message: 'Cannot withdraw an accepted bid' });

    const auction = await Auction.findByPk(bid.auction_id, { include: [{ model: Project, as: 'project' }] });
    if (auction?.project?.assigned_freelancer_id) {
      return res.status(400).json({ success: false, message: 'Cannot withdraw — a freelancer has already been selected' });
    }

    await bid.destroy();
    res.json({ success: true, message: 'Bid withdrawn successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};