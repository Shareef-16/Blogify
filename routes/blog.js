const { Router }=require("express");
const multer=require('multer');
const router= Router();
const Blog=require('../models/blog')
const Comment=require('../models/comment')
const upload = multer({
  storage: multer.memoryStorage(),
});

router.get('/add-new', (req, res)=>{
    return res.render('addBlog',{
        user: req.user
    })
})


router.get('/:id',async(req, res)=>{
  const blog=await Blog.findById(req.params.id).populate('createdBy');
  const comments=await Comment.find({blogId:req.params.id}).populate('createdBy')
  return res.render('blog',{
    user:req.user,
    blog,
    comments,
  })
})

router.post('/', upload.single('coverImage'), async (req, res) => {
  const { title, body } = req.body;

  const blog = await Blog.create({
    title,
    body,
    createdBy: req.user._id,
    coverImage: {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    },
  });

  return res.redirect(`/blog/${blog._id}`);
});


router.get('/image/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog || !blog.coverImage || !blog.coverImage.data) {
    return res.status(404).send('Image not found');
  }

  res.set('Content-Type', blog.coverImage.contentType);
  res.send(blog.coverImage.data);
});


router.post('/comment/:blogId', async(req,res)=>{
  await Comment.create({
    content:req.body.content,
    blogId:req.params.blogId,
    createdBy:req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`)
})


module.exports=router;