const { Router }  =require('express');
const User= require('../models/user');
const router=Router();
const Blog=require('../models/blog')

router.get('/signin', (req, res)=>{
    return res.render('signin');
});



router.get('/signup', (req, res)=>{
    return res.render('signup');
});

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const token = await User.matchPasswordAndGenerateToken(email, password);


    return res.cookie('token', token).redirect('/');
  } catch (err) {
    return res.render('signin',{
      error: "Incorrect email or password"
    });
  }
});

router.get('/logout', (req,res)=>{
  res.clearCookie('token').redirect('/');
})

router.post('/signup', async(req, res)=>{
    const {fullName, email, password}=req.body;
    await User.create({
       fullName,
       email,
       password, 
    })
    return res.redirect('/');
});

router.get('/profile', async (req, res) => {
    if (!req.user)
        return res.redirect('/user/signin');

    const user = await User.findById(req.user._id);

    const blogs = await Blog.find({
        createdBy: req.user._id
    });

    res.render('profile', {
        user,
        blogs,
    });
});



router.get('/my-blogs', async (req, res) => {
    if (!req.user) {
        return res.redirect('/user/signin');
    }

    const blogs = await Blog.find({
        createdBy: req.user._id,
    });

    res.render('myBlogs', {
        user: req.user,
        blogs,
    });
});



module.exports=router;