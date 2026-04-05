const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true,
        
    },
    gender : {
        type: String,
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    }

},

{timestamps: true}

)

const User = mongoose.model("user", userSchema);
module.exports = User;