const express = require('express');
const { addDependency, removeDependency ,resetDependency} = require('../controllers/dependencyController');
const router = express.Router();

router.post('/dependencies/:projectId', resetDependency);
router.put('/dependencies', resetDependency);
router.post('/dependencies/remove', removeDependency);


module.exports = router;
