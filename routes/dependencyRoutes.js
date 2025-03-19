const express = require('express');
const { addDependency, removeDependency } = require('../controllers/dependencyController');
const router = express.Router();

router.post('/dependencies', addDependency);
router.post('/dependencies/remove', removeDependency);


module.exports = router;
