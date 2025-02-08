import jwt from 'jsonwebtoken';

export const generateToken = (userID, res) => {
    const token = jwt.sign({ userID }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "lax", // Allows cookies on cross-origin requests
        secure: process.env.NODE_ENV === "production", // Secure in production
    });

    return token;
};

export default generateToken;