const express = require("express");
const { route } = require("./posts");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const { findOneAndUpdate } = require("../../models/Profile");
const { Router, response } = require("express");
const config = require("config");
const request = require("request");

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
                return res.json(profile);
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

//@route GET api/profile/user/:profile_id
//@desc  To get a profile with an id
//@access Public
router.get("/user/:profile_id", async (req, res) => {
    let profile = await Profile.findOne({
        user: req.params.profile_id,
    }).populate("user", ["name", "avatar"]);
    if (profile) {
        res.json(profile);
    } else {
        console.error("profile not found");
        res.status("400").json("profile for this user is not present");
    }
});

//@route DELETE api/profile/
//@desc  To DELETE a profile with an id
//@access private
router.delete("/", auth, async (req, res) => {
    try {
        //To delete a profile
        await Profile.findOneAndRemove({ user: req.user.id });
        //To delete an user
        await User.findOneAndRemove({ _id: req.user.id });

        return res.json({ msg: "user deleted successfully" });
    } catch (error) {
        console.log(error);
        return res.send(500).send("cannot delete user");
    }
});

//@route PUT api/profile/experiance
//@desc  To add experiance to the profile
//@access private
router.put(
    "/experiance",
    [
        auth,
        [
            check("title", "title is required").not().isEmpty(),
            check("company", "company is required").not().isEmpty(),
            check("from", "start date is required").not().isEmpty(),
        ],
    ],
    async (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status("400").json({ error: errors.array() });
        }

        let experiance = {};

        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description,
        } = req.body;

        if (title) experiance.title = title;
        if (company) experiance.company = company;
        if (location) experiance.location = location;
        if (from) experiance.from = from;
        if (to) experiance.to = to;
        if (current) experiance.current = current;
        if (description) experiance.description = description;
        try {
            let profile = await Profile.findOne({ user: req.user.id });
            profile.experiance.unshift(experiance);
            await profile.save();
            res.json(profile);
        } catch (error) {
            console.error(error);
        }
    }
);

//@route DELETE api/profile/experiance/:exp_id
//@desc  To DELETE a experiance with an id
//@access private

router.delete("/experiance/:exp_id", auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.experiance.map((items) => {
            if (items.id === req.params.exp_id) {
                let requiredIndex = profile.experiance.indexOf(items);
                profile.experiance.splice(requiredIndex, 1);

                profile.save().then(res.json({ profile }));
            }
        });
    } catch (error) {
        console.error(error);
    }
});

//@route PUT api/profile/education
//@desc  To add education to the profile
//@access private
router.put(
    "/education",
    [
        auth,
        [
            check("school", "school is required").not().isEmpty(),
            check("degree", "degree is required").not().isEmpty(),
            check("fieldofstudy", "fieldofstudy is required").not().isEmpty(),
            check("from", "start date is required").not().isEmpty(),
        ],
    ],
    async (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status("400").json({ error: errors.array() });
        }

        let education = {};

        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description,
        } = req.body;

        if (school) education.school = school;
        if (degree) education.degree = degree;
        if (fieldofstudy) education.fieldofstudy = fieldofstudy;
        if (from) education.from = from;
        if (to) education.to = to;
        if (current) education.current = current;
        if (description) education.description = description;
        try {
            let profile = await Profile.findOne({ user: req.user.id });
            profile.education.unshift(education);
            await profile.save();
            res.json(profile);
        } catch (error) {
            console.error(error);
        }
    }
);

//@route DELETE api/profile/education/:edu_id
//@desc  To DELETE an education with an id
//@access private

router.delete("/education/:edu_id", auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.education.map((items) => {
            if (items.id === req.params.edu_id) {
                let requiredIndex = profile.education.indexOf(items);
                profile.education.splice(requiredIndex, 1);

                profile.save().then(res.json({ profile }));
            }
        });
    } catch (error) {
        console.error(error);
    }
});

//@route GET api/profile/github/:username
//@desc  get user repos from github
//@access public

router.get("/github/:username", (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${
                req.params.username
            }/repos?per_page=5&sort=created:asc&client_id=${config.get(
                "githubClientId"
            )}&client_secret=${config.get("githubSecret")}`,
            method: "GET",
            headers: { "user-agent": "node.js" },
        };
        request(options, (error, response, body) => {
            if (error) console.error(error);

            if (response.statusCode !== 200) {
                res.json({ msg: "github profile doesnot exist" });
            } else {
                res.json(JSON.parse(body));
            }
        });
    } catch (err) {
        console.error(err);
    }
});

module.exports = router;
