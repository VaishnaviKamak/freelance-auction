const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Auction = sequelize.define('Auction', {
  auction_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  project_id: { type: DataTypes.INTEGER, allowNull: false },
  start_time: { type: DataTypes.DATE, allowNull: false },
  end_time: { type: DataTypes.DATE, allowNull: false },
  status: {
    type: DataTypes.ENUM('open', 'closed', 'cancelled'),
    defaultValue: 'open',
  },
}, {
  tableName: 'auctions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Class diagram methods
Auction.prototype.openAuction = async function () {
  return await this.update({ status: 'open' });
};

Auction.prototype.closeAuction = async function () {
  return await this.update({ status: 'closed' });
};

module.exports = Auction;
