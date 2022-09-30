//USER LOG CHECK
exports.adminLog = (req,res,next) => {
    if(req.session.admin){
         next()
     }
     else{
         res.redirect('/admin')
     }
 }