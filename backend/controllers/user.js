const User = require("../models/userSchema");
const bcrypt = require("bcrypt");

async function handleNewUser(req, res) {
    const body = req.body;
     
    try{
      if (
        !body ||
        !body.firstName ||
        !body.lastName ||
        !body.role||
        !body.gender ||
        !body.email ||
        !body.password 
    ){
        console.log("all fields are required")
        return res.status(400).json({msg: "All fields are required"})
    }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(body.password,saltRounds);

        const newUser = await User.create({
        firstName: body.firstName,
        lastName: body.lastName,
        gender: body.gender,
        email: body.email,
        role: body.role,
        password: hashedPassword,
        

    });
      const {password: pwd, ...safeUser } = newUser.toObject()
      return res.status(201).json(safeUser)
    
    }catch(err) {
      return res.status(500).json({ msg: err.message });
    }
    
}


async function handleLogin(req,res) {
  console.log("handlelogin is working ------------------------------------------")
    const {email, password, role}= req.body
  if(role === "user"){

        const user = await User.findOne({ email });
        if (!student) {
        return res.status(404).json({ msg: "user not found" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("is match: ", isMatch)
      console.log("password: ", password)
      console.log("admin: ", user.password)    
      if (!isMatch) {
        return res.status(401).json({ msg: "Wrong password" });
      }
        //create jwt 
      const token = generateToken(student,role);
      console.log(token)
    // send this token to browser
      res.cookie("token", token,{
        httpOnly: true,
        secure: false,   
        sameSite: "lax",
      });
      const {password  : pwd, ...safeUser } = user.toObject()
      console.log("safeUser: ",safeUser)
      return res.status(200).json({user: safeUser})
      
  }
  
  if(role === "admin") {
    const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(404).json({ msg: "Admin not found" });
  }
  const isMatch = await bcrypt.compare(password, admin.password);
  console.log("password: ", password)
  console.log("admin: ", admin.password)
      if (!isMatch) {
        return res.status(401).json({ msg: "Wrong password" });
      }
    //create jwt 
   const token = generateToken(admin,role);

 // send this token to browser
    res.cookie("token", token,{
        httpOnly: true,
        secure: false,   
        sameSite: "lax",
      });

    const safeStudents = allStudent.map(student => {
    const { password : pwd, ...s } = student.toObject();
    return s;
  }); 
  const {password : pwd, ...safeAdmin } = admin.toObject()
    return res.status(200).json({Data: {admin:safeAdmin,StudentData: safeStudents, courseData: allCourses , assignmentData : allAssignments}})
  }
  
  }

  module.exports = {handleNewUser,
  }