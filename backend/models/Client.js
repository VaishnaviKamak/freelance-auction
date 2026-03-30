const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
  client_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  company_name: { type: DataTypes.STRING(255) },
}, {
  tableName: 'clients',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Class diagram methods
Client.prototype.postProjects = async function (projectData) {
  const Project = require('./Project');
  return await Project.create({ ...projectData, client_id: this.client_id });
};

Client.prototype.viewBids = async function (auctionId) {
  const Bid = require('./Bid');
  return await Bid.findAll({ where: { auction_id: auctionId } });
};

Client.prototype.selectFreelancer = async function (projectId, freelancerId) {
  const Project = require('./Project');
  return await Project.update(
    { assigned_freelancer_id: freelancerId, status: 'assigned' },
    { where: { project_id: projectId, client_id: this.client_id } }
  );
};

Client.prototype.giveFeedback = async function (feedbackData) {
  const Feedback = require('./Feedback');
  return await Feedback.create({ ...feedbackData, client_id: this.client_id });
};

module.exports = Client;
