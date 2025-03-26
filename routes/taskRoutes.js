const express = require('express');
const { createTask, getTasks , getTasksByProjectId, updateTask,deleteTask} = require('../controllers/taskController');
const { getCriticalPath } = require('../services/criticalPath')
const router = express.Router();

router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);
router.get('/tasks/project/:projectId', getTasksByProjectId);
router.get('/tasks', getTasks);
router.get('/critical-path/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const criticalPath = await getCriticalPath(projectId);
    res.status(200).json(criticalPath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
