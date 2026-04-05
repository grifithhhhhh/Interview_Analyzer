const express = require("express");
const router = express.Router();

const {handleNewUser} = require("../controllers/user")



//-----------routesss------------------
router.post('/users', handleNewUser);


module.exports = router;