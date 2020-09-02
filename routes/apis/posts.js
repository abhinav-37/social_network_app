const express = require("express");
const router = express.Router();
const Posts = require("../../models/post");
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const {
    check,
    valitadionResult,
    validationResult,
} = require("express-validator/check");
const auth = require("../../middleware/auth");

//@route POST api/posts
//@desc  for authentication
//@access Private
router.get(
    "/",
    [auth, [check("text", "text is requred").not().isEmpty()]],
    async (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status("400").json({ error: error.array() });
        }
        try {
            let user = (await User.findById(req.user.id)).isSelected(
                "-password"
            );
            const newPost = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
            };

            const post = new Posts(newPost);
            await post.save();
            res.json(post);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("server error");
        }
    }
);

module.exports = router;
