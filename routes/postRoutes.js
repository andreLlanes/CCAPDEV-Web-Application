const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { ensureAuth } = require("../middleware/auth");
const commentController = require('../controllers/commentController');


// View homepage with all posts
router.get("/home", ensureAuth, postController.getHomepage);

// Create new post
router.get("/create", ensureAuth, postController.getCreateForm);
router.post("/createPost", ensureAuth, postController.createPost);

// View single post
router.get("/post/:postId", postController.getSinglePost);

// Comment on post
router.post("/posts/:postId/comment", ensureAuth, postController.submitComment);

// Like/Dislike post
router.post("/posts/:id/like", ensureAuth, postController.likePost);
router.post("/posts/:id/dislike", ensureAuth, postController.dislikePost);

// Delete post
router.post("/posts/:postId/delete", ensureAuth, postController.deletePost);

// editing
router.get('/comments/:commentId/edit', ensureAuth, commentController.getEditCommentForm);
router.post('/comments/:commentId/edit', ensureAuth, commentController.updateComment);

router.get('/posts/:postId/edit', ensureAuth, postController.getEditPostForm);
router.post('/posts/:postId/edit', ensureAuth, postController.updatePost);

router.get('/about', (req, res) => {
    res.render('about');
  });
  
  // Contact page
  router.get('/contact', (req, res) => {
    res.render('contact');
  });
  

module.exports = router;