const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const { ensureAuth } = require("../middleware/auth");

console.log("createComment exists:", typeof commentController.createComment);
router.post("/:postId", ensureAuth, commentController.createComment);


//deleting comment alert prompt
router.post('/:commentId/delete', ensureAuth, commentController.deleteComment);

//editing comment
router.get('/:commentId/edit', ensureAuth, commentController.getEditCommentForm);
router.post('/:commentId/edit', ensureAuth, commentController.updateComment);

module.exports = router;