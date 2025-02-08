import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
export const signup = async (req, res) => {
    const { fullname, email, password } = req.body;
    try {
        // Validate password length
        if(!fullname || !email || !password)
        {
            return res.status(400).json({message:"Please fill all the fields"});
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        const salt=await bcrypt.genSalt(10);
        const hashedpassword= await bcrypt.hash(password,salt);

        const newUser=new User({
            fullname: fullname,
            email: email,
            password: hashedpassword
        })

        if(newUser)
        {
            generateToken(newUser._id,res);
            await newUser.save();
            res.status(201).json({
                _id:newUser._id,
                fullname:newUser.fullname,
                email:newUser.email,
                profilepic:newUser.profilepic,
            })
        }
        else
        {   
            return res.status(400).json({message:"Invalid User Data"});
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }



};

export const login = async (req, res) => {
    const {email,password}=req.body; 
    try {
        const user=await User.findOne({email});

        if(!user)
        {
            return res.status(400).json({message:"Invalid Credentials"});

        }
        const isPasswordCorrect = await bcrypt.compare(password,user.password);

        if(!isPasswordCorrect)
        {
            return res.status(400).json({message:"Invalid Credentials"});
        }

        generateToken(user._id,res);

        res.status(200).json({
            _id:user._id,
            fullname:user.fullname,
            email:user.email,
            profilepic:user.profilepic,
        })

    } catch (error) {
        console.log("Error in Login Controller", error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({message:"Logged Out Successfully"});
    } catch (error) {
        console.log("Error in Logout Controller", error.message);
        res.status(200).json({message:"Logged Out Successfully"});
 
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilepic } = req.body;
        const userID = req.user._id;

        if (!profilepic) {
            return res.status(400).json({ message: "Profile Pic is Required" });
        }

        // UploXad the profile picture to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(profilepic);

        // Update the user's profile with the uploaded image URL
        const updatedUser = await User.findByIdAndUpdate(
            userID,
            { profilepic: uploadResponse.secure_url },
            { new: true }
        );

        // Respond with updated user data
        res.status(200).json({
            updatedUser
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating profile" });
    }
};

export const checkAuth =  (req, res) => {
    try {
        res.status(200).json(req.user);

    } catch (error) {
        console.error("Error in Check Auth Controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
