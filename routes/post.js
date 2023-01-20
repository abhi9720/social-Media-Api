const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const isAuth = require("../middleware/checkAuth");
const Post = require("../model/Post");
const User = require("../model/User");


//@ router      POST api/post
// @desc        add a post
// @access      private
router.post(
    "/",
    [isAuth,
        [check("Title", "Title required").not().isEmpty()],
        [check("Description", "Description required").not().isEmpty()]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findById(req.user.id).select("-password");
            const newPost = new Post({
                Title: req.body.Title,
                Description: req.body.Description,
                name: user.name,
                user: req.user.id,
            });
            const post = await newPost.save();

            res.json(post);
        } catch (err) {
            console.error(err.message);
            res.status(500).json("Server error ");
        }
    }
);

//@ router      GET api/post/:postId
// @desc        get single  post by id
// @access      Private

router.get("/:postId", isAuth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }
        res.status(200).json(post);
    } catch (err) {
        console.error(err.message);
        if (err.kind === "ObjectId") {
            return res.status(404).json({ msg: "Post not found" });
        }
        res.status(500).json("Sever Error");
    }
});



//@ router      Delete api/post/:postId
// @desc        Delete single  post by postid
// @access      Private

router.delete("/:postId", isAuth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }

        // check post user is same as auth user
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: "User is not authorized" });
        }
        // if user matches then remove this post
        await post.remove();
        res.json({ msg: "Post deleted " });
    } catch (err) {
        console.error(err.message);
        if (err.kind === "ObjectId") {
            return res.status(404).json({ msg: "Post not found" });
        }
        res.status(500).json("Sever Error");
    }
});



module.exports = router;