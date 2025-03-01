const Dependency = require('../models/Dependency');

async function checkForCycle(taskId, dependsOnId) {
  let visited = new Set();

  async function hasCycle(currentId) {
    if (visited.has(currentId)) return true;
    visited.add(currentId);

    const dependencies = await Dependency.findAll({ where: { taskId: currentId } });
    for (let dep of dependencies) {
      if (await hasCycle(dep.dependsOnId)) return true;
    }
    visited.delete(currentId);
    return false;
  }

  return await hasCycle(dependsOnId);
}

module.exports = { checkForCycle };
