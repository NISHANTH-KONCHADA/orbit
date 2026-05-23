const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getIssues,
  createIssue,
  getIssue,
  updateIssue,
  moveIssue,
  deleteIssue,
  addComment,
  deleteComment,
} = require('../controllers/issueController');

const router = express.Router();

router.use(protect);

router.route('/').get(getIssues).post(createIssue);
router.route('/:id').get(getIssue).put(updateIssue).delete(deleteIssue);
router.patch('/:id/move', moveIssue);
router.post('/:id/comments', addComment);
router.delete('/:id/comments/:commentId', deleteComment);

module.exports = router;
