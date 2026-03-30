const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bid = sequelize.define('Bid', {
  bid_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  auction_id: { type: DataTypes.INTEGER, allowNull: false },
  freelancer_id: { type: DataTypes.INTEGER, allowNull: false },
  bid_amount: { type: DataTypes.FLOAT, allowNull: false },
  delivery_time: { type: DataTypes.DATE, allowNull: false },
  score: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending',
  },
}, {
  tableName: 'bids',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

/**
 * calculateScore - Best-value scoring formula
 *
 * Weights (consultant-recommended):
 *  - Freelancer rating   40% — proven track record is the strongest predictor of success
 *  - Bid amount          30% — cost matters but shouldn't dominate; cheap ≠ best value
 *  - Delivery speed      20% — earlier delivery earns higher score
 *  - Experience          10% — years of experience adds credibility and reduces risk
 *
 * @param {number} maxBudget         - project budget ceiling
 * @param {Date}   projectDeadline   - project deadline
 * @param {number} freelancerRating  - freelancer avg rating (0–5)
 * @param {number} experienceYears   - freelancer years of experience
 * @returns {number} score 0–100
 */
Bid.prototype.calculateScore = function (maxBudget, projectDeadline, freelancerRating, experienceYears = 0) {
  // Rating score: 0–5 stars mapped to 0–100  (40%)
  const ratingScore = ((freelancerRating || 0) / 5) * 100;

  // Budget score: savings vs ceiling, mapped to 0–100  (30%)
  const budgetScore = maxBudget > 0
    ? Math.max(0, ((maxBudget - this.bid_amount) / maxBudget) * 100)
    : 0;

  // Delivery score: how much earlier than deadline, mapped to 0–100  (20%)
  const deadline = new Date(projectDeadline);
  const delivery = new Date(this.delivery_time);
  const today = new Date();
  const totalDays = (deadline - today) / (1000 * 60 * 60 * 24);
  const bidDays   = (delivery  - today) / (1000 * 60 * 60 * 24);
  const deliveryScore = totalDays > 0
    ? Math.max(0, ((totalDays - bidDays) / totalDays) * 100)
    : 50;

  // Experience score: capped at 10 years → 100  (10%)
  const expScore = Math.min((experienceYears || 0) / 10, 1) * 100;

  const score = Math.round(
    ratingScore   * 0.40 +
    budgetScore   * 0.30 +
    deliveryScore * 0.20 +
    expScore      * 0.10
  );
  return Math.min(100, Math.max(0, score));
};

module.exports = Bid;
