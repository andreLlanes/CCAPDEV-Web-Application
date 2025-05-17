const Comment = require("../models/Comments");
const Post = require("../models/Post");
const User = require("../models/Users");

exports.createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    console.log("REQ.PARAMS:", req.params); // Add this
    console.log("REQ.BODY:", req.body);

    const comment = await Comment.create({
      content,
      post: postId,
      user: req.user._id,
    });
    
    const populatedComment = await comment.populate('user', 'username');

    // Push the comment to the post
    await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });

    // 🔥 Only respond ONCE - using JSON response
    res.status(201).json({ comment: populatedComment });

  } catch (err) {
    console.error("❌ Error creating comment:", err);
    // 🔥 Only respond once - with error JSON
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error creating comment' });
    }
  }
};


exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;

    // Find the comment by ID
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).send("Comment not found");
    }

    // Ensure that the logged-in user is the author of the comment
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).send("You do not have permission to delete this comment");
    }

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    // Optionally, you can also remove the comment from the associated post
    await Post.findByIdAndUpdate(
      comment.post, 
      { $pull: { comments: commentId } }
    );

    // Redirect to the user's profile page
    res.redirect(`/profile`);
  } catch (err) {
    console.error('❌ Error deleting comment:', err);
    res.status(500).send("Internal Server Error");
  }
};


exports.getEditCommentForm = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment || comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).send("Unauthorized");
    }
    res.render('editComment', {
      layout: 'main',
      comment,
      user: req.user,
    });
  } catch (err) {
    console.error('❌ Error loading comment edit form:', err);
    res.status(500).send("Error loading edit form");
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.commentId);

    if (!comment || comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).send("Unauthorized");
    }

    comment.content = content;
    comment.edited = true;
    await comment.save();

    res.redirect(`/post/${comment.post}`); // back to the post
  } catch (err) {
    console.error('❌ Error updating comment:', err);
    res.status(500).send("Error updating comment");
  }
};

exports.getEditCommentForm = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId).lean();
    if (!comment || comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).send("Unauthorized");
    }
    res.render('editComment', {
      layout: 'main',
      comment,
      user: req.user,
    });
  } catch (err) {
    console.error('❌ Error loading comment edit form:', err);
    res.status(500).send("Error loading edit form");
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.commentId);

    if (!comment || comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).send("Unauthorized");
    }

    comment.content = content;
    comment.edited = true;
    await comment.save();

    res.redirect('/profile'); // Redirect back to profile page
  } catch (err) {
    console.error('❌ Error updating comment:', err);
    res.status(500).send("Error updating comment");
  }
};
