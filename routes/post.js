const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');             // Utility function to handle async functions
const { isLoggedIn, isOwner, validatePost } = require('../middleware.js')
const postController = require('../controllers/post.js')

const multer = require('multer')
const { storage } = require('../cloudeConfig.js')
const upload = multer({ storage })

router.get('/new', isLoggedIn, postController.renderNewForm);

router
    .route("/")
    .get(wrapAsync(postController.index))
    .post(
        isLoggedIn,
        upload.single('post[image]'),
        validatePost,                                            // Middleware to validate incoming data
        wrapAsync(postController.createPost)
    )

router
    .route("/:id")
    .get(wrapAsync(postController.showPost))
    .put(
        isLoggedIn,
        isOwner,
        upload.single('post[image]'),
        validatePost,                                                        // Middleware to validate incoming data
        wrapAsync(postController.updatePost)
    )
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(postController.deletePost)
    )

router.get('/:id/edit',
    isLoggedIn,
    isOwner,
    wrapAsync(postController.renderEditForm)
);

module.exports = router;