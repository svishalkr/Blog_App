var express = require('express');
var app = express();
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var methodOverride = require('method-override');
var expressSanitizer = require("express-sanitizer")                                                     // Script tag 

//-----------database mongoose connection -------------

mongoose.connect('mongodb://localhost/restful_blog_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));



app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyparser.urlencoded({extended:true}));
app.use(methodOverride("_method")); //to deal with PUT and Delete in html form because html form only support get and                                         // post request ("used something called method-override),check edit.ejs line:4  .
app.use(expressSanitizer());




//---------Database Schema -------------

var blogSchema = new mongoose.Schema({
	title : String,
	image: String,
	body : String,
	created: {type: Date, default: Date.now}
});


var Blog = mongoose.model("Blog", blogSchema);



//---------------------- Routes ---------------------------------------------

//show all blogs

app.get("/", function(req, res){
   res.redirect("/blogs"); 
});



// *****************  1 - Index Route ******************

app.get("/blogs",function(req,res){
	Blog.find({}, function(err, blogs){
		if(err)
			{
				console.log(err);
			}
		else{
			res.render("Index",{blogs:blogs});
		    }
	});
	
	
});

//------------ 2 - NEW Route ------------
app.get("/blogs/new", function(req,res){
	res.render("new");
});

//---------------- 3 - Create Route -------------------------

app.post("/blogs", function(req,res){
	//create blog
	req.body.blog.body=req.sanitize(req.body.blog.body) // using sanitizer
	Blog.create(req.body.blog,function(err,newBlog){
		if(err)
		{
			res.render("new");
		}
		else{
			res.redirect("/blogs");
		}
	});
});

//---------------------------- 4 - Show Route ------------------------

app.get("/blogs/:id", function(req,res){
	Blog.findById(req.params.id, function(err,foundBlog){
		if(err)
			{
				res.redirect("/blogs");
			}
		else
		{
			res.render("show",{blog:foundBlog});
		}
	});
});

//---------------- 5 - Edit Route ---------
 app.get("/blogs/:id/edit", function(req,res){
	 Blog.findById(req.params.id, function(err,foundBlog){
		 if(err)
			 {
				 res.render("/blogs");
			 }
		 else{
			 res.render("edit", {blog: foundBlog});
		 }
	 });
	 
 });


//-------------------- 6 - Update Route ------------------
app.put("/blogs/:id", function(req,res){
	req.body.blog.body=req.sanitize(req.body.blog.body) // using sanitizer
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err)
			{
		     res.redirect("/blogs");		
			}
		else
		{
			res.redirect("/blogs/" + req.params.id);
		}
	});
	
});

//--------------------------- 7 - Destroy(delete) --------------
app.delete("/blogs/:id",function(req,res){
	
	//destroy blog
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err)
			{
				res.redirect("/blogs");
			}
		else{
			res.redirect("/blogs");
		}
	});
	
});



app.listen(process.env.PORT,process.env.IP, function(){
	console.log("Server Started");
});


