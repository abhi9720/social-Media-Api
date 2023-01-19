const express = require("express");
const router = express.Router();
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");



const { check, validationResult } = require("express-validator");

//@ router  GET api/auth
// @desc    register user 
// @access public
router.post(
    "/register",
    check("name", "Name is required").notEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
        "password",
        "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            let user = await User.findOne({ email });

            if (user) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: "User already exists" }] });
            }



            user = new User({
                name,
                email,
                password,
            });

            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password, salt);

            await user.save();

            const payload = {
                user: {
                    id: user.id,
                },
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: "10h" },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);


//@ router  GET api/auth
// @desc   Authenticate user and get token
// @access public
router.post(
    "/",
    [
        check("email", "Please include a valid email").isEmail(),
        check("password", "Password is required ").exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;



        try {
            let user = await User.findOne({ email });

            if (!user) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: "Invalid Credentials" }] });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: "Invalid Credentials" }] });
            }

            const payload = {
                user: {
                    id: user.id,
                },
            };


            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: "10h" },
                (err, token) => {
                    if (err) throw err;
                    return res.status(200).json({ token });
                }
            );
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error ");
        }
    }
);

module.exports = router;