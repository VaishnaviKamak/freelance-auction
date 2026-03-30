const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Administrator = sequelize.define('Administrator', {
  admin_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  access_level: { type: DataTypes.STRING(50), defaultValue: 'standard' },
}, {
  tableName: 'administrators',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Class diagram methods
Administrator.prototype.manageUser = async function (userId, action, data) {
  const User = require('./User');
  if (action === 'update') return await User.update(data, { where: { user_id: userId } });
  if (action === 'delete') return await User.destroy({ where: { user_id: userId } });
  return await User.findByPk(userId);
};

Administrator.prototype.monitorAuction = async function () {
  const Auction = require('./Auction');
  return await Auction.findAll();
};

module.exports = Administrator;
