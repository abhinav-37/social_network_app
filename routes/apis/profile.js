const express = require("express");
const { route } = require("./posts");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const { findOneAndUpdate } = require("../../models/Profile");
const { Router } = require("express");

//@route get api/profile/me
//@desc  for authentication
//@access Private
router.get("/me", auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id,
        }).populate("user", ["name", "avatar"]);

        if (!profile) {
            return res.status(400).json({ msg: "userprofile not found" });
        } else {
            res.json(profile);
        }
    } catch (error) {
        console.error(error.message);
        res.status(500);
    }
});

//@route POST api/profile
//@desc  for registering a user profile
//@access Private

router.post(
    "/",
    [
        auth,
        [
            check("status", "status is required").not().isEmpty(),
            check("skills", "skills is requred").not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }

        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkdin,
        } = req.body;

        //build profile object
        let profileFields = {};
        profileFields.user = req.user.id;

        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        if (skills) {
            profileFields.skills = skills
                .split(",")
                .map((skill) => skill.trim());
        }
        //build social object
        profileFields.social = {};
        if (youtube) profileFields.social.youtube = youtube;
        if (facebook) profileFields.social.facebook = facebook;
        if (twitter) profileFields.social.twitter = twitter;
        if (instagram) profileFields.social.instagram = instagram;
        if (linkdin) profileFields.social.linkdin = linkdin;

        try {
            let profile = await Profile.findOne({ user: req.user.id });

            if (profile) {
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                );
                return res.json(profile);
            } else {
                profile = new Profile(profileFields);
                await profile.save();
                return res.json(proflie);
            }
        } catch (error) {
            console.log(error);
            res.json(500).send("server error");
        }
    }
);

//@route GET api/profile
//@desc  To get all the profiles
//@access Public

router.get("/", async (req, res) => {
    try {
        let profiles = await Profile.find().populate("user", [
            "name",
            "avatar",
        ]);
        return res.json(profiles);
    } catch (error) {
        console.error(errors.message);
        return res.json("500").send("server error");
    }
});

module.exports = router;
