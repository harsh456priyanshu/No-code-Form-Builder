const express = require("express");
const {registerController , loginController} = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post('/register' , registerController);
router.post("/login" , loginController);
router.get("/check", authMiddleware, (req, res) => {
    res.status(200).json({ authenticated: true });
});

module.exports = router;