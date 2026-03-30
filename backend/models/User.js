const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  role: { type: DataTypes.ENUM('client', 'freelancer', 'admin'), allowNull: false },
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Instance methods
User.prototype.login = function () { return `User ${this.username} logged in`; };
User.prototype.logout = function () { return `User ${this.username} logged out`; };
User.prototype.updateProfile = async function (data) {
  return await this.update(data);
};

module.exports = User;
