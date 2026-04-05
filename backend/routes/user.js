const express = require("express");
const router = express.Router();

const {handleNewUser, handleLogin} = require("../controllers/user")



//-----------routesss------------------
router.post('/users', handleNewUser);
router.get('/userlogin',handleLogin )


module.exports = router;