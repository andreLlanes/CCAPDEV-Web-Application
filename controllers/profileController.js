const User = require('../models/Users');
const Post = require('../models/Post');
const Comment = require('../models/Comments');

exports.getProfilePage = async (req, res) => {
  console.log("🔥 profileController triggered");
  try {
    const user = await User.findById(req.user.id).lean(); // Ensure you're using req.user.id
    if (!user) {
      return res.status(404).send("User not found");
    }

    console.log("User data:", user);  // Log user data

    const posts = await Post.find({ author: user._id })
      .populate([
        { path: 'author', model: 'User' },
        { path: 'comments', populate: { path: 'user', model: 'User' } },
      ])
      .sort({ creation: -1 })
      .lean();

    console.log("Posts data:", posts);  // Log posts data

    const commentCount = await Comment.countDocuments({ user: user._id });
    console.log("Comment count:", commentCount);  // Log comment count

    const userComments = await Comment.find({ user: user._id })
      .populate('post')
      .sort({ createdAt: -1 })
      .lean();

    console.log("User comments:", userComments);  // Log user comments

    let totalLikes = 0;
    let totalDislikes = 0;
    posts.forEach(post => {
      totalLikes += post.likes?.length || 0;
      totalDislikes += post.dislikes?.length || 0;
    });

    res.render('profile', {
      layout: 'profileLayout',
      user,
      posts,
      postCount: posts.length,
      commentCount,
      totalLikes,
      totalDislikes,
      userComments,
    });
  } catch (err) {
    console.error('Error loading profile:', err);
    res.status(500).send('Server Error');
  }
};


exports.getUserProfilePage = async (req, res) => {
  console.log("👤 Visiting another user's profile");
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).send("User not found");

    const posts = await Post.find({ author: user._id })
      .populate([ { path: 'author', model: 'User' }, { path: 'comments', populate: { path: 'user', model: 'User' } }])
      .sort({ creation: -1 })
      .lean();

    const commentCount = await Comment.countDocuments({ user: user._id });

    const userComments = await Comment.find({ user: user._id })
      .populate('post')
      .sort({ createdAt: -1 })
      .lean();

    // ✅ Also calculate likes and dislikes here for viewed profile
    let totalLikes = 0;
    let totalDislikes = 0;
    posts.forEach(post => {
      totalLikes += post.likes?.length || 0;
      totalDislikes += post.dislikes?.length || 0;
    });

    // Set isOwnProfile flag based on whether the profile belongs to the logged-in user

    res.render('profile', {
      layout: 'profileLayout',
      user,
      posts,
      postCount: posts.length,
      commentCount,
      totalLikes,
      totalDislikes,
      userComments,
    });
  } catch (err) {
    console.error('Error loading user profile:', err);
    res.status(500).send('Server Error');
  }
};

exports.getEditProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean(); // ✅ This is crucial
    res.render('editProfile', {
      layout: 'profileLayout',
      title: 'Edit Profile',
      user, // user is now a plain object; Handlebars can access it safely
    });
  } catch (err) {
    console.error('❌ Error loading edit profile page:', err);
    res.status(500).send('Error loading profile edit page');
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, bio } = req.body;
    const updateFields = { username, bio };

    // If a new profile picture was uploaded, update it
    if (req.file) {
      updateFields.profilePicture = req.file.filename;
    }

    await User.findByIdAndUpdate(req.user._id, updateFields);

    res.redirect('/profile');
  } catch (err) {
    console.error("❌ Error updating profile:", err);
    res.status(500).send("Error updating profile");
  }
};