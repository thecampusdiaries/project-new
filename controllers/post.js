const Post = require('../models/post.js')

module.exports.index = async (req, res) => {
    const allPosts = await Post.find({});             // Fetch all listings from the database
    res.render('post/index.ejs', { allPosts });       // Render the index view with all listings
}

module.exports.renderNewForm = (req, res) => {
    res.render('post/new.ejs');                  // Render the new listing form
}

module.exports.createPost = async (req, res, next) => {
    const url = req.file.path
    const filename = req.file.filename
    const newPost = new Post(req.body.post);       // Create a new Post object
    newPost.owner = req.user._id
    newPost.image = { url, filename }
    await newPost.save();                                // Save the new listing to the database
    req.flash("success", "New Post Created Successfully !!")
    res.redirect('/explore');                              // Redirect to the listings page after creation
}

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;                                // Extract listing ID from request parameters
    let post = await Post.findById(id);               // Find the listing by its ID
    if (!post) {
        req.flash("error", "The post you are trying to edit does not exist.")
        res.redirect('/explore')
    }
    let imgUrl = post.image.url;
    imgUrl = imgUrl.replace('/upload', '/upload/w_250')
    res.render('post/edit.ejs', { post, imgUrl });            // Render the edit form with the listing data
}

module.exports.updatePost = async (req, res) => {
    let { id } = req.params;                                          // Extract listing ID from request parameters
    let post = await Post.findByIdAndUpdate(id, { ...req.body.post });       // Update the listing in the database
    if (req.file) {
        const url = req.file.path
        const filename = req.file.filename
        console.table([url, filename])
        post.image = { url, filename }
        await post.save()
    }
    await post.save(); 
    req.flash("success", "Post Updated Successfully !!")
    res.redirect(`/explore/${id}`);                                    // Redirect to the updated listing page
}

module.exports.deletePost = async (req, res) => {
    let { id } = req.params;                                // Extract listing ID from request parameters
    await Post.findByIdAndDelete(id);                    // Delete the listing from the database
    console.log(`${id} deleted !!`);                                // Log deletion confirmation
    req.flash("success", "Post Deleted Successfully !!")
    res.redirect('/explore');                              // Redirect to the listings page after deletion
}

module.exports.showPost = async (req, res) => {
    let { id } = req.params;                                                // Extract listing ID from request parameters
    const post = await Post.findById(id)
        .populate({
            path: "comments",
            populate: {
                path: "author",
            }
        })
        .populate('owner');         // Find the listing and populate its reviews

    if (!post) {
        req.flash("error", "The post you are trying to access does not exist.")
        res.redirect('/explore')
    }
    res.render('post/show.ejs', { post });                            // Render the show view with the listing details
}