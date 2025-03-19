const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const crypto = require('crypto'); // Ajout pour le hashage du mot de passe
const Project = require('./Project');

const User = sequelize.define('User', {
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  username: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true, 
    trim: true 
  },
  password: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    trim: true 
  },
  salt: { 
    type: DataTypes.STRING, 
    allowNull: false 
  }
}, { timestamps: true });

// Ajout de la méthode setPassword
User.prototype.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.password = crypto.pbkdf2Sync(password, this.salt, 310000, 32, 'sha256').toString('hex');
};

// Définition de la relation User -> Projects
User.hasMany(Project, { foreignKey: 'userId', as: 'projects' });
Project.belongsTo(User, { foreignKey: 'userId' });

module.exports = User;
