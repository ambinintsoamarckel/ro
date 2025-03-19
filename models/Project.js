const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Task = require('./Task'); // Ajout de l'import

const Project = sequelize.define('Project', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  isFavorite: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: false });
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'projectId', onDelete: 'CASCADE' });


module.exports = Project;
