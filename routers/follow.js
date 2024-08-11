const express = require("express");
const router = express.Router();

const FollowControler = require("../controller/follow");
const middlewareAutentication=require("../middlewares/auth")

//Definir router

router.get('/prueba-follower',FollowControler.pruebaFollow);
router.post('/save',middlewareAutentication.auth,FollowControler.save);
router.delete('/unfollow/:id?',middlewareAutentication.auth,FollowControler.deleteFollow);
router.get("/following/:id?/:page?", middlewareAutentication.auth, FollowControler.following);
router.get("/followers/:id?/:page?", middlewareAutentication.auth, FollowControler.followers);





//exportar router

module.exports = router;