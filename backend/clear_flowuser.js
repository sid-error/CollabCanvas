const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteOne({ email: "flowuser1@collabcanvas.io" });
    console.log("Deleted old flowuser1");
    await mongoose.disconnect();
}
run();
