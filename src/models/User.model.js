const mongoose = require("mongoose");
const { Schema } = mongoose;


const userSchema = new Schema({
    userId: { type: String, required: true },
    username: { type: String },
    name: { type: String },
}, {timestamps: true});


const User = mongoose.model("User", userSchema)
module.exports = User
