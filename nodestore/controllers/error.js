exports.serverError=(req,res,next)=>{
    res.render('404', {statement:"No page Found" ,
     path:'/404',
     isAuthententicated:req.session.isLoggedIn

     })
}

exports.get500=(req,res,next)=>{
    res.status(500).render('500', {statement:"No page Found" ,
     path:'/500',
     isAuthententicated:req.session.isLoggedIn
     })
}

