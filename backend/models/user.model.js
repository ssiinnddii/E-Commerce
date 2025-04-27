import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"], //true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
    },
    cartItems: [
        {
        quantity:{
            type: Number,
            default: 1,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
    }],
    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer",
    }

}, { // this allows you to createAt and updateAt fields automatically
    timestamps: true
});

//presave hook to hash password before saving to database
userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next();
    try { 
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }  
    catch (error) {
        next(error);
    }
});
// Method to compare passwords - add this before the model creation
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };
const User = mongoose.model("User", userSchema);

export default User;