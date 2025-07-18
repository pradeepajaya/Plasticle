const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const upload = require('../middleware/upload');

router.post('/add', upload.single('image'), postController.createPost);

// Get all posts
router.get('/', postController.getAllPosts);

// Delete post by ID and remove image file
router.delete('/:id', postController.deletePost);

// Update post by ID, optionally replace image
router.put('/:id', upload.single('image'), postController.updatePost);

// Get up to 5 posts that are buyer-visible, or the default post if none
router.get('/buyer-visible', postController.getBuyerVisiblePosts);

// Toggle a post's buyer visibility (admin only)
router.put('/:id/buyer-visibility', postController.toggleBuyerVisibility);

// Get the default Plasticle post (for buyer dashboard fallback)
router.get('/default-buyer', postController.getDefaultBuyerPost);

module.exports = router;
