const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/projectController');

router.post('/', ProjectController.createProject);
router.get('/', ProjectController.getAllProjects);
router.get('/:id', ProjectController.getProjectById);
router.put('/:id', ProjectController.updateProject);
router.delete('/:id', ProjectController.deleteProject);

module.exports = router;
