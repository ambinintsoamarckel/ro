const Task = require('../models/Task');
const Dependency = require('../models/Dependency');
const { checkForCycle } = require('../services/graphService');

async function addDependency(req, res) {
  const { taskId, dependsOnIds, successorIds } = req.body;

  try {
    if (dependsOnIds) {
      for (const dependsOnId of dependsOnIds) {
        if (await checkForCycle(taskId, dependsOnId)) {
          return res.status(400).json({ error: "Cycle détecté !" });
        }
        await Dependency.create({ taskId, dependsOnId });
      }
    }

    if (successorIds) {
      for (const successorId of successorIds) {
        if (await checkForCycle(successorId, taskId)) {
          return res.status(400).json({ error: "Cycle détecté !" });
        }
        await Dependency.create({ taskId: successorId, dependsOnId: taskId });
      }
    }

    res.status(201).json({ message: "Dépendances ajoutées !" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { addDependency };
