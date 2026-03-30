const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Feedback = sequelize.define('Feedback', {
  feedback_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  project_id: { type: DataTypes.INTEGER, allowNull: false },
  client_id: { type: DataTypes.INTEGER, allowNull: false },
  freelancer_id: { type: DataTypes.INTEGER, allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comments: { type: DataTypes.TEXT },
}, {
  tableName: 'feedbacks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Class diagram method
Feedback.prototype.submitFeedback = async function () {
  return await this.save();
};

module.exports = Feedback;
