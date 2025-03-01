const express = require('express');
const { createTask, getTasks } = require('../controllers/taskController');
const { getCriticalPath } = require('../services/criticalPath')
const router = express.Router();

router.post('/tasks', createTask);
router.get('/tasks', getTasks);
router.get('/critical-path', async (req, res) => {
    try {
      const result = await getCriticalPath();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

module.exports = router;
