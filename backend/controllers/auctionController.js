const { Auction, Project, Bid, Freelancer, User, Client } = require('../models');

// POST /auctions - Open an auction for a project (client only)
exports.createAuction = async (req, res) => {
  try {
    const client = await Client.findOne({ where: { user_id: req.user.user_id } });
    const { project_id, start_time, end_time } = req.body;

    const project = await Project.findOne({ where: { project_id, client_id: client.client_id } });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found or unauthorized' });

    const existing = await Auction.findOne({ where: { project_id } });
    if (existing) return res.status(409).json({ success: false, message: 'Auction already exists for this project' });

    const auction = await Auction.create({ project_id, start_time, end_time, status: 'open' });
    await auction.openAuction(); // class diagram method
    await project.update({ status: 'listed' }); // project is now listed for bidding

    res.status(201).json({ success: true, message: 'Auction opened', auction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /auctions - Get all auctions (admin)
exports.getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.findAll({
      include: [{ model: Project, as: 'project', include: [{ model: Client, as: 'client' }] }],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, auctions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /auctions/:id - Get single auction with bids
exports.getAuction = async (req, res) => {
  try {
    const auction = await Auction.findByPk(req.params.id, {
      include: [
        { model: Project, as: 'project' },
        {
          model: Bid, as: 'bids',
          include: [{ model: Freelancer, as: 'freelancer', include: [{ model: User, as: 'user', attributes: ['username'] }] }],
          order: [['score', 'DESC']],
        },
      ],
    });
    if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });
    res.json({ success: true, auction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /auctions/:id/close - Close an auction
exports.closeAuction = async (req, res) => {
  try {
    const auction = await Auction.findByPk(req.params.id);
    if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });
    await auction.closeAuction(); // class diagram method
    res.json({ success: true, message: 'Auction closed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /auctions/:id/ranked-bids - Evaluate and rank bids (from use case)
exports.getRankedBids = async (req, res) => {
  try {
    const auction = await Auction.findByPk(req.params.id, {
      include: [{ model: Project, as: 'project' }],
    });
    if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });

    const bids = await Bid.findAll({
      where: { auction_id: req.params.id },
      include: [{ model: Freelancer, as: 'freelancer', include: [{ model: User, as: 'user', attributes: ['username', 'email'] }] }],
    });

    // calculateScore for each bid using class diagram method
    const scored = bids.map((bid) => {
      const score = bid.calculateScore(
        auction.project.budget,
        auction.project.deadline,
        bid.freelancer.rating,
        bid.freelancer.experience
      );
      return { ...bid.toJSON(), computed_score: score };
    });

    scored.sort((a, b) => b.computed_score - a.computed_score);

    // Persist scores
    for (const b of scored) {
      await Bid.update({ score: b.computed_score }, { where: { bid_id: b.bid_id } });
    }

    res.json({ success: true, ranked_bids: scored });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
