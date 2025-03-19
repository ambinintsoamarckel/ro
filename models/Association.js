const Project = require('./Project');
const Task = require('./Task');
const Dependency = require('./Dependency');

Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

Task.hasMany(Dependency, { foreignKey: 'taskId', as: 'dependencies' });
Task.hasMany(Dependency, { foreignKey: 'dependsOnId', as: 'successors' });

Dependency.belongsTo(Task, { foreignKey: 'taskId' });
Dependency.belongsTo(Task, { foreignKey: 'dependsOnId' });

module.exports = { Project, Task, Dependency };
