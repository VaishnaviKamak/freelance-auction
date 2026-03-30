const User = require('./User');
const Client = require('./Client');
const Freelancer = require('./Freelancer');
const Administrator = require('./Administrator');
const Project = require('./Project');
const Auction = require('./Auction');
const Bid = require('./Bid');
const Feedback = require('./Feedback');
const Payment = require('./Payment');

// User -> Client (1:1)
User.hasOne(Client, { foreignKey: 'user_id', as: 'clientProfile' });
Client.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User -> Freelancer (1:1)
User.hasOne(Freelancer, { foreignKey: 'user_id', as: 'freelancerProfile' });
Freelancer.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User -> Administrator (1:1)
User.hasOne(Administrator, { foreignKey: 'user_id', as: 'adminProfile' });
Administrator.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Client -> Project (1:many) — Client Posts Projects
Client.hasMany(Project, { foreignKey: 'client_id', as: 'projects' });
Project.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

// Project -> Auction (1:1)
Project.hasOne(Auction, { foreignKey: 'project_id', as: 'auction' });
Auction.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Auction -> Bid (1:many)
Auction.hasMany(Bid, { foreignKey: 'auction_id', as: 'bids' });
Bid.belongsTo(Auction, { foreignKey: 'auction_id', as: 'auction' });

// Freelancer -> Bid (1:many) — Freelancer Submits Bids
Freelancer.hasMany(Bid, { foreignKey: 'freelancer_id', as: 'bids' });
Bid.belongsTo(Freelancer, { foreignKey: 'freelancer_id', as: 'freelancer' });

// Project -> Freelancer (assigned)
Project.belongsTo(Freelancer, { foreignKey: 'assigned_freelancer_id', as: 'assignedFreelancer' });

// Feedback associations
Client.hasMany(Feedback, { foreignKey: 'client_id', as: 'feedbacks' });
Freelancer.hasMany(Feedback, { foreignKey: 'freelancer_id', as: 'feedbacks' });
Project.hasMany(Feedback, { foreignKey: 'project_id', as: 'feedbacks' });
Feedback.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
Feedback.belongsTo(Freelancer, { foreignKey: 'freelancer_id', as: 'freelancer' });
Feedback.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Payment associations
Payment.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
Payment.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
Payment.belongsTo(Freelancer, { foreignKey: 'freelancer_id', as: 'freelancer' });

module.exports = { User, Client, Freelancer, Administrator, Project, Auction, Bid, Feedback, Payment };
