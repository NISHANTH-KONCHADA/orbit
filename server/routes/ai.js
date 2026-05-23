const express = require('express');
const { protect } = require('../middleware/auth');
const { generateTask, chat, sprintSummary, autoLabel, keyStatus } = require('../controllers/aiController');

const router = express.Router();

router.use(protect);

router.post('/generate-task', generateTask);
router.post('/chat', chat);
router.post('/sprint-summary', sprintSummary);
router.post('/auto-label', autoLabel);
router.get('/status', keyStatus); // shows active key index & models

module.exports = router;
