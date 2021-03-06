const express = require('express');
const router = express.Router();
const request = require('request');
const normalize = require('normalize-url');
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth');

const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Post = require('../../models/Post');

// @route   GET api/profile/me
// @desc    Get current users profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id,
        }).populate('user', ['name', 'avatar']);

        if (!profile) return res.status(400).send({ msg: 'There is no profile for this user.' });

        return res.send(profile);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server error');
    }
});

// @route   POST api/profile
// @desc    Create or update a user profile
// @access  Private
router.post(
    '/',
    [
        auth,
        [
            check('status', 'Status is required.').not().isEmpty(),
            check('skills', 'Skills is required.').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send({ errors: errors.array() });

        // Destructure the request
        const {
            website,
            skills,
            youtube,
            twitter,
            instagram,
            linkedin,
            facebook,
            // spread the rest of the fields we don't need to check
            ...rest
        } = req.body;

        // Build a profile object
        const profileFields = {
            user: req.user.id,
            website: website && website !== '' ? normalize(website, { forceHttps: true }) : '',
            skills: Array.isArray(skills)
                ? skills
                : skills.split(',').map((skill) => ' ' + skill.trim()),
            ...rest,
        };

        // Build socialFields object
        const socialFields = { youtube, twitter, instagram, linkedin, facebook };

        // normalize social fields to ensure valid url
        for (const [key, value] of Object.entries(socialFields)) {
            if (value && value.length > 0)
                socialFields[key] = normalize(value, { forceHttps: true });
        }
        // add to profileFields
        profileFields.social = socialFields;

        try {
            // Using upsert option (creates new doc if no match is found):
            let profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true, upsert: true, setDefaultsOnInsert: true },
            );
            return res.send(profile);
        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server Error');
        }
    },
);

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        return res.send(profiles);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
    }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.params.user_id,
        }).populate('user', ['name', 'avatar']);

        if (!profile) return res.status(400).send({ msg: 'Profile not found.' });

        return res.send(profile);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') return res.status(400).send({ msg: 'Profile not found.' });

        return res.status(500).send('Server Error');
    }
});

// @route   DELETE api/profile
// @desc    Delete profile, user & post
// @access  Private
router.delete('/', auth, async (req, res) => {
    try {
        // Remove user posts
        await Post.deleteMany({ user: req.user.id });

        // Remove profile
        await Profile.findOneAndRemove({ user: req.user.id });
        // Remove user
        await User.findOneAndRemove({ _id: req.user.id });

        return res.send({ msg: 'User removed.' });
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
    }
});

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put(
    '/experience',
    [
        auth,
        [
            check('title', 'Title is required.').not().isEmpty(),
            check('company', 'Company is required.').not().isEmpty(),
            check('from', 'From date is required.').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send({ errors: errors.array() });

        const { title, company, location, from, to, current, description } = req.body;

        const newExp = { title, company, location, from, to, current, description };

        try {
            const profile = await Profile.findOne({ user: req.user.id });

            profile.experience.unshift(newExp);

            await profile.save();

            return res.send(profile);
        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server error');
        }
    },
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.experience = profile.experience.filter((item) => item.id !== req.params.exp_id);

        await profile.save();

        return res.send(profile);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server error');
    }
});

// @route   PUT api/profile/education
// @desc    Add profile education
// @access  Private
router.put(
    '/education',
    [
        auth,
        [
            check('school', 'School is required.').not().isEmpty(),
            check('degree', 'Degree is required.').not().isEmpty(),
            check('fieldofstudy', 'Field of study is required.').not().isEmpty(),
            check('from', 'From date is required.').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send({ errors: errors.array() });

        const { school, degree, fieldofstudy, from, to, current, description } = req.body;

        const newEdu = { school, degree, fieldofstudy, from, to, current, description };

        try {
            const profile = await Profile.findOne({ user: req.user.id });

            profile.education.unshift(newEdu);

            await profile.save();

            return res.send(profile);
        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server error');
        }
    },
);

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.education = profile.education.filter((item) => item.id !== req.params.edu_id);

        await profile.save();

        return res.send(profile);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server error');
    }
});

// @route   GET api/profile/github/:username
// @desc    Get user repos from Github
// @access  Public
router.get('/github/:username', (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_SECRET}`,
            method: 'GET',
            headers: { 'user-agent': 'node.js' },
        };

        request(options, (error, response, body) => {
            if (error) console.error(error);

            if (response.statusCode !== 200)
                return res.status(404).send({ msg: 'No Github profile found.' });

            return res.send(JSON.parse(body));
        });
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server error');
    }
});

module.exports = router;
