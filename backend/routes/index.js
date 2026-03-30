const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const projectController = require('../controllers/projectController');
const auctionController = require('../controllers/auctionController');
const bidController = require('../controllers/bidController');
const feedbackController = require('../controllers/feedbackController');
const paymentController = require('../controllers/paymentController');
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// ── AUTH ROUTES ─────────────────────────────────────────
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/profile', authenticate, authController.getProfile);
router.put('/auth/profile', authenticate, authController.updateProfile);
router.put('/freelancer/profile', authenticate, authorize('freelancer'), authController.updateFreelancerProfile);

// ── PROJECT ROUTES ──────────────────────────────────────
router.post('/projects', authenticate, authorize('client'), projectController.createProject);
router.get('/projects', authenticate, projectController.getProjects);
router.get('/projects/client/my', authenticate, authorize('client'), projectController.getClientProjects);
router.get('/projects/:id', authenticate, projectController.getProject);
router.put('/projects/:id', authenticate, authorize('client'), projectController.updateProject);
router.delete('/projects/:id', authenticate, authorize('client'), projectController.closeProject);
router.post('/projects/:id/select-freelancer', authenticate, authorize('client'), projectController.selectFreelancer);

// ── AUCTION ROUTES ──────────────────────────────────────
router.post('/auctions', authenticate, authorize('client'), auctionController.createAuction);
router.get('/auctions', authenticate, authorize('admin'), auctionController.getAllAuctions);
router.get('/auctions/:id', authenticate, auctionController.getAuction);
router.put('/auctions/:id/close', authenticate, authorize('client', 'admin'), auctionController.closeAuction);
router.get('/auctions/:id/ranked-bids', authenticate, authorize('client', 'admin'), auctionController.getRankedBids);

// ── BID ROUTES ──────────────────────────────────────────
router.post('/bids', authenticate, authorize('freelancer'), bidController.submitBid);
router.get('/bids/auction/:auctionId', authenticate, bidController.getBidsByAuction);
router.get('/bids/my', authenticate, authorize('freelancer'), bidController.getMyBids);
router.put('/bids/:id', authenticate, authorize('freelancer'), bidController.updateBid);
router.delete('/bids/:id', authenticate, authorize('freelancer'), bidController.deleteBid);

// ── FEEDBACK ROUTES ─────────────────────────────────────
router.post('/feedbacks', authenticate, authorize('client'), feedbackController.submitFeedback);
router.get('/feedbacks/freelancer/:id', authenticate, feedbackController.getFreelancerFeedbacks);
router.get('/feedbacks/project/:id', authenticate, feedbackController.getProjectFeedback);

// ── PAYMENT ROUTES ──────────────────────────────────────
router.post('/payments', authenticate, authorize('client'), paymentController.makePayment);
router.get('/payments/my', authenticate, authorize('client'), paymentController.getMyPayments);
router.get('/payments/project/:id', authenticate, paymentController.getProjectPayment);

// ── ADMIN ROUTES ─────────────────────────────────────────
router.get('/admin/users', authenticate, authorize('admin'), adminController.getAllUsers);
router.put('/admin/users/:id', authenticate, authorize('admin'), adminController.updateUser);
router.delete('/admin/users/:id', authenticate, authorize('admin'), adminController.deleteUser);
router.put('/admin/users/:id/block', authenticate, authorize('admin'), adminController.toggleBlockUser);
router.get('/admin/auctions', authenticate, authorize('admin'), adminController.monitorAuctions);
router.get('/admin/stats', authenticate, authorize('admin'), adminController.getStats);
router.get('/admin/projects', authenticate, authorize('admin'), adminController.getAllProjects);

module.exports = router;
