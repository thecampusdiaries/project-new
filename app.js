if (process.env.NODE_ENV != 'production') {
	require('dotenv').config()
}

const express = require('express') 							// Importing Express framework
const app = express() 										// Initializing Express application
const mongoose = require('mongoose') 						// Importing Mongoose ODM for MongoDB
const path = require("path") 								// Importing path module for working with file and directory paths
const methodOverride = require("method-override") 			// Importing method-override middleware for HTTP method override support
const ejsMate = require("ejs-mate") 						// Importing ejsMate for enhanced EJS template rendering features
const session = require('express-session')
const MongoStore = require('connect-mongo')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user.js')

const ExpressError = require("./utils/ExpressError.js")  	// Importing custom ExpressError class for handling application-specific errors
app.set("view engine", "ejs") 								// Setting the view engine to EJS
app.set("views", path.join(__dirname, "views"))  			// Setting the directory for views
app.use(express.urlencoded({ extended: true })) 			// Middleware to parse URL-encoded bodies (e.g., from HTML forms)
app.use(methodOverride("_method")) 							// Middleware to override HTTP methods based on a query parameter or header
app.use(express.static(path.join(__dirname, "/public")))  	// Serving static files (e.g., CSS, images) from the public directory
app.use(express.json())  									// Middleware to parse JSON bodies
app.engine("ejs", ejsMate) 									// Configuring EJS template engine to use ejsMate for enhanced functionality
const log = console.log  									// Logging function

const ATLAS_URL = process.env.ATLASDB_URL
const PORT = process.env.PORT || 8080

// Importing routes for listings and reviews
const postsRouter = require("./routes/post.js")
const commentsRouter = require("./routes/comment.js")
const usersRouter = require("./routes/user.js")

// Function to connect to MongoDB database
async function main() {
	await mongoose.connect(ATLAS_URL)
}

// Connecting to MongoDB and starting Express server
main()
	.then(() => {
		log("mongo and express connection successful")
	})
	.catch(err => {
		log(`Error : ${err.message}`)
	})

const store = MongoStore.create({
	mongoUrl: ATLAS_URL,
	crypto: {
		secret: process.env.SECRET
	},
	touchAfter: 24 * 60 * 60
})

store.on("error", (err) => {
	log(`Error in mongo-session store ${err}`)
})

const sessionOptions = {
	store,
	secret: process.env.SECRET,
	resave: false,
	saveUninitialized: true,
	cookie: {
		expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
		maxAge: 7 * 24 * 60 * 60 * 1000,
		httpOnly: true
	}
}

app.use(session(sessionOptions))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
	res.locals.success = req.flash("success")
	res.locals.error = req.flash("error")
	res.locals.currUser = req.user
	next()
})

// Mounting listings and reviews routers
app.use("/explore", postsRouter)
app.use("/explore/:id/comments", commentsRouter)
app.use("/users", usersRouter)

app.get('/', (req, res) => {
	res.redirect('/explore')
})
// 404 Route: Catch-all for non-existent routes
app.all("*", (req, res, next) => {
	next(new ExpressError(404, "This page does not exist."))
})

// Error handling middleware: Renders error page with specific status code and message
app.use((err, req, res, next) => {
	let { statusCode = 500, message = "Something went wrong" } = err
	if (!err.message) {
		err.message = 'Oh No, Something went wrong!'
	}
	log(err)
	res.status(statusCode).render("error.ejs", { err })
})

// Starting the server and listening on specified port
app.listen(PORT, () => {
	log(`Server listening at PORT ${PORT}`)
})