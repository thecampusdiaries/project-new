const Post = require("./models/post.js");
const Comment = require("./models/comment.js");
const { postSchema, commentSchema } = require('./schema.js');              // Import validation schema for listings
const ExpressError = require('./utils/ExpressError.js');       // Custom error handler

// Middleware to validate incoming listing data
module.exports.validatePost = (req, res, next) => {
  console.log("11111111111111111111111111111111111111111111111")
  let { error } = postSchema.validate(req.body);                   // Validate req.body against listingSchema
  if (error) {
    let errMsg = error.details.map(el => el.message).join(',');     // Format error messages
    throw new ExpressError(400, errMsg);                            // Throw an error if validation fails
  } else {
    return next();                                                  // Proceed to the next middleware if validation passes
  }
};

// Middleware for validating review data using Joi
module.exports.validateComment = (req, res, next) => {
  let { error } = commentSchema.validate(req.body);                    // Joi schema validations
  if (error) {
    let errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errMsg);                            // Throw 400 error with Joi validation message
  } else {
    next(); 														// Proceed to the next middleware
  }
};
// Auth
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl
    req.flash('error', `Please log in to perform the action.`);
    return res.redirect('/users/login');
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl
  }
  return next()
}

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params
  let post = await Post.findById(id)

  if (!post.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this post")
    return res.redirect(`/explore/${id}`)
  }
  return next()
}

module.exports.isAuthor = async (req, res, next) => {
  let { id, commentId } = req.params
  let comment = await Comment.findById(commentId)

  if (!comment.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of this comment")
    return res.redirect(`/explore/${id}`)
  }
  return next()
}