const Post = require('../models/post.js')
const Comment = require('../models/comment.js')

module.exports.writeComment = async (req, res) => {
    let post = await Post.findById(req.params.id); 		// Find listing by ID
    let newComment = new Comment(req.body.comment); 				// Create new review based on request body
    newComment.author = req.user._id
    console.log(newComment)
    post.comments.push(newComment); 							// Add new review to listing's comments array
    await newComment.save(); 									// Save new review
    await post.save(); 										// Save updated listing
    console.log('Comment added'); 								// Log success message
    req.flash("success", "Comment Added Successfully !!")
    res.redirect(`/explore/${req.params.id}`); 				// Redirect to listing details page
}

module.exports.deleteComment = async (req, res) => {
    let { id, commentId } = req.params;
    await Comment.findByIdAndDelete(commentId); 		// Delete the review
    await Post.findByIdAndUpdate(id, {
        $pull: {
            comments: commentId
        }
    });
    console.log(`Comment '${commentId}' deleted`); 	// Log success message
    req.flash("success", "Comment Deleted Successfully !!")
    res.redirect(`/explore/${id}`); 				// Redirect to listing details page
}