const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
//@route    POST api/users
//@desc     for registering users
//@access   public
router.post(
    "/",
    [
        check("name", "Please give a name").not().isEmpty(),
        check("email", "please include a valid email").isEmail(),
        check(
            "password",
            "please enter a password with 6 or more characters"
        ).isLength({ min: 6 }),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
        } else {
        }
        const { name, email, password } = req.body;

        User.findOne({ email }, (err, user) => {
            if (user) {
                res.status(400).json({
                    errors: [{ msg: "email already exists" }],
                });
            } else {
                const avatar = gravatar.url(email, {
                    s: "200",
                    r: "pg",
                    d: "mm",
                });

                let user = new User({
                    name,
                    email,
                    avatar,
                    password,
                });
                //hashing the password and saving in the database
                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(password, salt, function (err, hash) {
                        user.password = hash;
                        user.save()
                            .then((user) => {
                                // res.json({ user });
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
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                    });
                });
            }
        });
    }
);

module.exports = router;
