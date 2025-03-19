const Task = require("../models/Task");
const Project = require("../models/Project");

async function createTask(req, res) {
  try {
    const tasks = req.body.tasks;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: "La liste de tâches est invalide." });
    }

    // Vérification des données pour chaque tâche
    for (const task of tasks) {
      if (!task.name || typeof task.name !== "string" || task.name.trim() === "") {
        return res.status(400).json({ error: "Chaque tâche doit avoir un nom valide." });
      }
      if (!task.duration || typeof task.duration !== "number" || task.duration < 1) {
        return res.status(400).json({ error: "Chaque tâche doit avoir une durée valide (>= 1 jour)." });
      }
      if (!task.projectId || typeof task.projectId !== "number") {
        return res.status(400).json({ error: "Chaque tâche doit être associée à un projet valide." });
      }

      // Vérifier si le projet existe
      const projectExists = await Project.findByPk(task.projectId);
      if (!projectExists) {
        return res.status(404).json({ error: `Le projet avec l'ID ${task.projectId} n'existe pas.` });
      }
    }

    // Création des tâches
    const createdTasks = await Task.bulkCreate(tasks);

    res.status(201).json(createdTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
}


async function getTasks(req, res) {
  try {
    const tasks = await Task.findAll();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
}
async function getTasksByProjectId(req, res) {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ error: "L'identifiant du projet est requis." });
    }

    const tasks = await Task.findAll({
      where: { projectId }
    });

    if (!tasks.length) {
      return res.status(404).json({ message: "Aucune tâche trouvée pour ce projet." });
    }

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { createTask, getTasks,getTasksByProjectId };
