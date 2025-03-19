const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Task = require('./Task');

const Dependency = sequelize.define('Dependency', {
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Task, key: 'id' }
  },
  dependsOnId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Task, key: 'id' }
  }
}, { timestamps: false });

Task.hasMany(Dependency, { foreignKey: 'taskId', as: 'dependencies' });
Task.hasMany(Dependency, { foreignKey: 'dependsOnId', as: 'successors' });

Dependency.belongsTo(Task, { foreignKey: 'taskId' });
Dependency.belongsTo(Task, { foreignKey: 'dependsOnId' });


module.exports = Dependency;
