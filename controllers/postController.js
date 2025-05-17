const Post = require('../models/Post');
const Comment = require('../models/Comments');
const User = require('../models/Users');
// Render Homepage with Posts + Pagination
exports.getHomepage = async (req, res) => {
  console.log("🔍 Current page:", req.query.page);
  const page = parseInt(req.query.page) || 1;
  const limit = 15;
  const skip = (page - 1) * limit;
  const searchQuery = req.query.search ? req.query.search.trim() : "";

  try {
    const query = searchQuery
      ? { topic: { $regex: searchQuery, $options: "i" } }
      : {};

    console.log("🔍 Search Query:", searchQuery);
    console.log("🔎 MongoDB Query:", JSON.stringify(query, null, 2));

    const [posts, totalPosts] = await Promise.all([
      Post.find(query)
        .sort({ creation: -1 })
        .skip(skip)
        .limit(limit)
        .populate([
          { path: "author", model: "User" },
          {
            path: "comments",
            populate: {
              path: "user",
              model: "User",
            },
          },
        ])
        .lean(),
      Post.countDocuments(query),
    ]);

    console.log("📌 Retrieved Posts:", posts.length);
    if (posts.length > 0) {
      console.log("📝 First Post Topic:", posts[0].topic);
    }

    const totalPages = Math.ceil(totalPosts / limit);

    res.render("home", {
      layout: "main",
      title: "Home",
      user: req.user,
      posts,
      currentPage: page,
      totalPages,
      searchQuery,
    });
  } catch (err) {
    console.error("❌ Error loading homepage:", err);
    res.status(500).send("Server error");
  }
};

// Render Create Post Page
exports.getCreateForm = (req, res) => {
  res.render('createPost', {
    layout: 'main',
    title: 'Create Post',
    username: req.user.username,
  });
};

// Handle Post Submission
exports.createPost = async (req, res) => {
  try {
    const newPost = new Post({
      author: req.user._id, // Replace later with req.user.username if using auth
      topic: req.body.topic,
      content: req.body.content,
      creation: new Date(),
      comments: []
    });

    await newPost.save();
    res.redirect('/');
  } catch (err) {
    console.error("❌ Error creating post:", err);
    res.status(500).send("Error creating post");
  }
};


exports.submitComment = async (req, res) => {
  console.log("📥 Comment submission received:");
  console.log("Post ID:", req.params.postId);
  console.log("Comment content:", req.body.content);
  console.log("Logged in user:", req.user);
  try {
    const user = req.user._id;
    const { postId } = req.params;
    const { content } = req.body;

    const newComment = new Comment({
      post: postId,
      user,
      content
    });

    await newComment.save();

    // Push comment ID to the Post's comments array
    await Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } });

    res.redirect('/'); // or res.redirect('back');
  } catch (err) {
    console.error("❌ Error submitting comment:", err);
    res.status(500).send('Error submitting comment');
  }
};

exports.getSinglePost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId)
      .populate('author')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          model: 'User',
        },
      })
      .lean();

    if (!post) {
      return res.status(404).send("Post not found");
    }

    res.render('singlePost', {
      layout: 'singleLayout',
      post,
    });
  } catch (err) {
    console.error('Error loading single post:', err);
    res.status(500).send('Server Error');
  }
};


exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Remove user from dislikes if present
    post.dislikes = post.dislikes.filter(
      (dislikeUserId) => dislikeUserId.toString() !== userId
    );

    // Check if user already liked the post
    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
      // Unlike the post
      post.likes = post.likes.filter(
        (likeUserId) => likeUserId.toString() !== userId
      );
    } else {
      // Add like
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      message: hasLiked ? "Post unliked" : "Post liked",
      likeCount: post.likes.length,
      dislikeCount: post.dislikes.length,
    });
  } catch (err) {
    console.error("❌ Error liking post:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.dislikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Remove user from likes if present
    post.likes = post.likes.filter(
      (likeUserId) => likeUserId.toString() !== userId
    );

    // Check if user already disliked the post
    const hasDisliked = post.dislikes.includes(userId);

    if (hasDisliked) {
      // Remove dislike
      post.dislikes = post.dislikes.filter(
        (dislikeUserId) => dislikeUserId.toString() !== userId
      );
    } else {
      // Add dislike
      post.dislikes.push(userId);
    }

    await post.save();

    res.status(200).json({
      message: hasDisliked ? "Dislike removed" : "Post disliked",
      likeCount: post.likes.length,
      dislikeCount: post.dislikes.length,
    });
  } catch (err) {
    console.error("❌ Error disliking post:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;

    // Find the post and check if the user is the author
    const post = await Post.findById(postId);
    if (!post || post.author.toString() !== req.user._id.toString()) {
      return res.status(403).send("Unauthorized to delete this post");
    }

    // Delete associated comments for this post
    await Comment.deleteMany({ post: postId });

    // Delete the post using findByIdAndDelete
    await Post.findByIdAndDelete(postId);

    // Redirect to the profile page to reflect the change immediately
    res.redirect(`/profile`);
  } catch (err) {
    console.error('❌ Error deleting post:', err);
    res.status(500).send("Internal Server Error");
  }
};


exports.getEditPostForm = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).lean();

    if (!post) return res.status(404).send("Post not found");

    // Ensure the logged-in user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).send("Unauthorized");
    }

    res.render('editPost', {
      layout: 'profileLayout',
      title: 'Edit Post',
      post
    });
  } catch (err) {
    console.error("❌ Error loading edit post form:", err);
    res.status(500).send("Server error");
  }
};

// Handle Post Update
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) return res.status(404).send("Post not found");

    // Only allow owner to update
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).send("Unauthorized");
    }

    post.topic = req.body.topic;
    post.content = req.body.content;
    post.edited = true;

    await post.save();

    res.redirect('/profile');
  } catch (err) {
    console.error("❌ Error updating post:", err);
    res.status(500).send("Server error");
  }
};