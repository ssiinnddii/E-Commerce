import express from "express";

const router = express.Router();

router.get("/signup", (req, res) => {
    console.log("Signup route was hit");
    res.send("Sign up route called");
});

router.get("/login", (req, res) => {
    console.log("login route was hit");
    res.send("login route called");
});

router.get("/logout", (req, res) => {
    console.log("logout route was hit");
    res.send("logout route called");
});

export default router;