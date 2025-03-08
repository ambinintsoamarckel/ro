const Task = require("../models/Task");

async function createTask(req, res) {
  try {
    const tasks = req.body.tasks; // 🔥 Correction ici

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: "La liste de tâches est invalide." });
    }

    // Vérification des données pour chaque tâche
    for (const task of tasks) {
      if (!task.name || typeof task.name !== "string" || task.name.trim() === "") {
        return res.status(400).json({ error: "Chaque tâche doit avoir un nom valide." });
      }
      if (!task.duration || typeof task.duration !== "number" || task.duration < 1) {
        return res.status(400).json({ error: "Chaque tâche doit avoir une durée valide (>= 1)." });
      }
    }

    // Création des tâches en une seule opération
    const createdTasks = await Task.bulkCreate(tasks);

    res.status(201).json(createdTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


async function getTasks(req, res) {
  try {
    const tasks = await Task.findAll();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { createTask, getTasks };
