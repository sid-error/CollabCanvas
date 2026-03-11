require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function verifyFlowUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB...");
        const user = await User.findOne({ email: "flowuser1@collabcanvas.io" });
        if (user) {
            user.isVerified = true;
            user.verificationToken = undefined;
            await user.save();
            console.log("Successfully verified flowuser1@collabcanvas.io");
        } else {
            console.log("User not found yet - the postman script hasn't run the register step.");
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

verifyFlowUser();
