const Post = require('../models/Post');
const fs = require('fs');
const path = require('path');

exports.createPost = async (req, res) => {
  try {
    const { title, content, type } = req.body;
    let image = '';
    if (req.file) {
      image = req.file.filename;
    }
    const post = new Post({ title, content, type, image });
    await post.save();
    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    // Attach full image URL if image exists
    const postsWithImageUrl = posts.map(post => ({
      ...post.toObject(),
      imageUrl: post.image ? `${req.protocol}://${req.get('host')}/uploads/${post.image}` : null
    }));
    res.json(postsWithImageUrl);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    // Remove image file if exists
    if (post.image) {
      const imgPath = path.join(__dirname, '../uploads/', post.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.title = req.body.title;
    post.content = req.body.content;
    post.type = req.body.type;
    if (req.file) {
      // Remove old image
      if (post.image) {
        const oldImgPath = path.join(__dirname, '../uploads/', post.image);
        if (fs.existsSync(oldImgPath)) fs.unlinkSync(oldImgPath);
      }
      post.image = req.file.filename;
    }
    await post.save();
    res.json({ message: 'Post updated', post });
  } catch (error) {
    res.status(500).json({ message: 'Error updating post', error });
  }
};

exports.getBuyerVisiblePosts = async (req, res) => {
  try {
    const posts = await Post.find({ isBuyerVisible: true }).sort({ createdAt: -1 }).limit(5);
    if (posts.length > 0) {
      // Attach imageUrl if image exists
      const postsWithImageUrl = posts.map(post => ({
        ...post.toObject(),
        imageUrl: post.image ? `${req.protocol}://${req.get('host')}/uploads/${post.image}` : null
      }));
      return res.json(postsWithImageUrl);
    } else {
      // Return default Plasticle post if none are visible
      return res.json([
        {
          _id: 'default',
          title: 'Welcome to Plasticle!',
          content: 'Stay tuned for exciting updates and news from Plasticle Corporation.',
          type: 'news',
          image: null,
          imageUrl: null,
          createdAt: new Date(),
          isBuyerVisible: true
        }
      ]);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching buyer-visible posts', error });
  }
};

exports.toggleBuyerVisibility = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const currentlyVisible = await Post.countDocuments({ isBuyerVisible: true });
    // If trying to cancel (set to false)
    if (post.isBuyerVisible && currentlyVisible <= 1) {
      return res.status(400).json({ message: 'At least one post must be visible in the buyer dashboard.' });
    }
    // If trying to post (set to true)
    if (!post.isBuyerVisible && currentlyVisible >= 5) {
      return res.status(400).json({ message: 'Only 5 posts can be visible in the buyer dashboard at a time.' });
    }
    post.isBuyerVisible = !post.isBuyerVisible;
    await post.save();
    res.json({ message: 'Buyer dashboard visibility updated', post });
  } catch (error) {
    res.status(500).json({ message: 'Error updating buyer dashboard visibility', error });
  }
};

exports.getDefaultBuyerPost = (req, res) => {
  res.json({
    _id: 'default',
    title: 'Welcome to Plasticle!',
    content: 'Stay tuned for exciting updates and news from Plasticle Corporation.',
    type: 'news',
    image: null,
    createdAt: new Date(),
    isBuyerVisible: true
  });
};

