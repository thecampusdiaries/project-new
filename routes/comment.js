const express = require('express');
const router = express.Router({ mergeParams: true });

const Post = require('../models/post.js');            // Mongoose model for listings
const Comment = require('../models/comment.js');              // Mongoose model for reviews

const wrapAsync = require("../utils/wrapAsync.js");         // Utility for wrapping async functions for error handling
const { validateComment, isLoggedIn, isAuthor } = require('../middleware.js')

const commentController = require('../controllers/comment.js')

// Post Review Route: Add new review to the database
router.post("/",
    isLoggedIn,
    validateComment,
    wrapAsync(commentController.writeComment)
);

// Delete Review Route
router.delete("/:commentId",
    isLoggedIn,
    isAuthor,
    wrapAsync(commentController.deleteComment)
);

module.exports = router;