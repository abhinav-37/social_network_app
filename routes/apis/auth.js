const express = require("express");
const { route } = require("./posts");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

//@route get api/auth
//@desc  for authentication
//@access public
router.get("/", auth, (req, res) => {
    try {
        User.findById(req.user.id)
            .select("-password")
            .then((user) => {
                res.json({ user });
            });
    } catch (error) {
        console.error(error);
        res.status(500).send("server error");
    }
});
//@route    POST api/users
//@desc     for authenticating users
//@access   public
router.post(
    "/",
    [
        check("email", "please include a valid email").isEmail(),
        check("password", "password is required").exists(),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
        } else {
        }
        //getting the input from the user
        const { email, password } = req.body;

        //finding the user from the database
        User.findOne({ email }, (err, user) => {
            if (!user) {
                res.status(400).json({
                    errors: [{ msg: "Invalid credentials" }],
                });
            } else {
                //if the user is found in the database

                //we will compare the password using the bcrypt compare
                bcrypt.compare(password, user.password, function (err, result) {
                    if (result) {
                        //if the result is true then this will happen

                        //jwt token creation
                        const payload = {
                            user: {
                                id: user.id,
                            },
                        };

                        jwt.sign(
                            payload,
                            config.get("jwtConfig"),
                            { expiresIn: 3600 },
                            (err, token) => {
                                if (err) return err;
                                res.json({ token });
                            }
                        );
                    } else {
                        res.status(400).json({
                            errors: [{ msg: "Invalid credentials" }],
                        });
                    }
                });
            }
        });
    }
);

module.exports = router;
