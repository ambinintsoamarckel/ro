const express = require('express');
const { addDependency } = require('../controllers/dependencyController');
const router = express.Router();

router.post('/dependencies', addDependency);

module.exports = router;
