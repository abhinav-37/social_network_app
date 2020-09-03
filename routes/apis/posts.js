const express = require("express");
const router = express.Router();
const Posts = require("../../models/post");
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const {
    check,
    valitadionResult,
    validationResult,
} = require("express-validator");
const auth = require("../../middleware/auth");
const { json } = require("express");
const { restart } = require("nodemon");

//@route POST api/posts
//@desc  for posting posts
//@access Private
router.post(
    "/",
    [auth, [check("text", "text is requred").not().isEmpty()]],
    async (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status("400").json({ error: error.array() });
        }
        try {
            let user = await User.findById(req.user.id).select("-password");
            const newPost = new Posts({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id,
            });
            await newPost.save();
            res.json(newPost);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("server error");
        }
    }
);

//@route get api/posts
//@desc  for getting posts
//@access Private
router.get("/", auth, async (req, res) => {
    try {
        let post = await Posts.find().sort({ date: -1 });
        res.json(post);
    } catch (error) {
        console.error(error);
    }
});

//@route get api/posts/:id
//@desc  for getting posts
//@access Private

router.get("/:id", auth, async (req, res) => {
    try {
        const post = await Posts.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: "post not found" });
        }
        res.json(post);
    } catch (error) {
        console.error(error.message);
        if (err.kind === "objectId") {
            return res.status(404).json({ msg: "post not found" });
        }
        res.status(500).send("server error");
    }
});

//@route DELETE api/posts/:id
//@desc  for Deleting posts
//@access Private
router.delete("/:id", auth, async (req, res) => {
    try {
        let post = await Posts.findById(req.params.id);

        if (post.user.toString() !== req.user.id) {
            return res
                .status(401)
                .json({ msg: "not authorized to delte the post" });
        } else {
            await post.remove();
            return res.json({ msg: "post successfully removed" });
        }
        res.json(post);
    } catch (error) {
        console.error(error);
    }
});

//@route put api/posts/likes/:post_id
//@desc  for adding likes
//@access Private
router.put("/likes/:post_id", auth, async (req, res) => {
    try {
        const post = await Posts.findById(req.params.post_id);
        //check if the post is already liked

        if (
            post.likes.filter((like) => like.user.toString() === req.user.id)
                .length > 0
        ) {
            return res
                .status(400)
                .json({ msg: "post is already liked by the user" });
        } else {
            post.likes.unshift({ user: req.user.id });
            await post.save();
            res.json(post);
        }
    } catch (error) {
        if (error.kind === "ObjectId") {
            res.status(404).json({ msg: "post not found" });
        } else {
            console.error(error);
            res.status(500).send("server error");
        }
    }
});

//@route put api/posts/unlike/:post_id
//@desc  for removing likes
//@access Private
router.put("/unlike/:post_id", auth, async (req, res) => {
    try {
        const post = await Posts.findById(req.params.post_id);
        //check if the post is already liked

        if (
            post.likes.filter((like) => like.user.toString() === req.user.id)
                .length === 0
        ) {
            return res
                .status(400)
                .json({ msg: "post is not liked so cannot be unlikeed." });
        } else {
            let indexForRemoval = post.likes
                .map((like) => like.user.toString())
                .indexOf(req.user.id);

            await post.likes.splice(indexForRemoval, 1);
            await post.save();
            res.json(post);
        }
    } catch (error) {
        if (error.kind === "ObjectId") {
            res.status(404).json({ msg: "post not found" });
        } else {
            console.error(error);
            res.status(500).send("server error");
        }
    }
});

//@route POST api/posts/comment/:id
//@desc  for posting comments
//@access Private
router.post(
    "/comment/:id",
    [auth, [check("text", "text is requred").not().isEmpty()]],
    async (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status("400").json({ error: error.array() });
        }
        try {
            let user = await User.findById(req.user.id).select("-password");
            console.log(user);
            const post = await Posts.findById(req.params.id);

            let newComment = {
                user: req.user.id,
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
            };

            post.comments.unshift(newComment);

            await post.save();

            res.json(post);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("server error");
        }
    }
);

//@route DELETE api/posts/comment/:id/:comment_id
//@desc  for removing comments
//@access Private
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
    try {
        const post = await Posts.findById(req.params.id);
        //check if the post has that comment

        const comment = post.comments.find(
            (comment) => comment.id === req.params.comment_id
        );

        if (!comment) {
            res.status(400).json({ msg: "comment doesnot exist" });
        } else {
            if (comment.user.toString() !== req.user.id) {
                res.status(400).json({
                    msg: "user not authorised to delete the comment",
                });
            } else {
                const commentIndex = post.comments.findIndex(
                    (comment) => comment.id === req.params.comment_id
                );
                post.comments.splice(commentIndex, 1);
                await post.save();
                res.json(post);
            }
        }
    } catch (error) {
        if (error.kind === "ObjectId") {
            res.status(404).json({ msg: "post not found" });
        } else {
            console.error(error);
            res.status(500).send("server error");
        }
    }
});
module.exports = router;
