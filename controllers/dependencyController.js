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
async function resetDependency(req, res) {
  const { taskId, dependsOnIds, successorIds } = req.body;

  try {
    if (!taskId) {
      return res.status(400).json({ error: "taskId est requis." });
    }

    // Supprime toutes les dépendances où taskId est un prédécesseur (successeurs)
    if (successorIds) {
      await Dependency.destroy({ where: { dependsOnId: taskId } });
    }

    // Supprime toutes les dépendances où taskId dépend d'autres tâches (antérieurs)
    if (dependsOnIds) {
      await Dependency.destroy({ where: { taskId } });

      // Ajoute les nouvelles dépendances
      for (const dependsOnId of dependsOnIds) {
        if (await checkForCycle(taskId, dependsOnId)) {
          return res.status(400).json({ error: "Cycle détecté !" });
        }
        await Dependency.create({ taskId, dependsOnId });
      }
    }

    res.status(200).json({ message: "Dépendances réinitialisées avec succès !" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


async function removeDependency(req, res) {
  const { taskId, dependsOnId } = req.body; // On récupère les IDs des tâches concernées

  try {
    const dependency = await Dependency.findOne({ where: { taskId, dependsOnId } });

    if (!dependency) {
      return res.status(404).json({ error: "Cette dépendance n'existe pas." });
    }

    await dependency.destroy(); // Suppression de la dépendance

    res.status(200).json({ message: "Dépendance supprimée !" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


module.exports = { addDependency,removeDependency, resetDependency };
