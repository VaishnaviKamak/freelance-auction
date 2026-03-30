const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
  project_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  client_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  budget: { type: DataTypes.FLOAT, allowNull: false },
  deadline: { type: DataTypes.DATEONLY, allowNull: false },
  status: {
    type: DataTypes.ENUM('open', 'listed', 'assigned', 'completed', 'closed'),
    defaultValue: 'open',
  },
  assigned_freelancer_id: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'projects',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Class diagram methods
Project.prototype.createProject = async function () { return await this.save(); };
Project.prototype.updateProject = async function (data) { return await this.update(data); };
Project.prototype.closeProject = async function () {
  return await this.update({ status: 'closed' });
};

module.exports = Project;
