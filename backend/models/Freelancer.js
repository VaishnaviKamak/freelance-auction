const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Freelancer = sequelize.define('Freelancer', {
  freelancer_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  skills: { type: DataTypes.TEXT },
  experience: { type: DataTypes.INTEGER, defaultValue: 0 },
  rating: { type: DataTypes.FLOAT, defaultValue: 0.0 },
}, {
  tableName: 'freelancers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Class diagram methods
Freelancer.prototype.viewProjects = async function () {
  const Project = require('./Project');
  return await Project.findAll({ where: { status: 'listed' } });
};

Freelancer.prototype.submitBids = async function (bidData) {
  const Bid = require('./Bid');
  return await Bid.create({ ...bidData, freelancer_id: this.freelancer_id });
};

module.exports = Freelancer;
