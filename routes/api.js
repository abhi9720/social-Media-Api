const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const isAuth = require("../middleware/checkAuth");
const Post = require("../model/Post");
const User = require("../model/User");


//@ router    GET api/user
// @desc     login user profile
// @access   private
router.get("/user", isAuth, async (req, res) => {
    try {
        const profile = await User.findOne({ _id: req.user.id }).select("-password");
        if (!profile) {
            return res.status(400).json({
                msg: "There is no profile for this user",
            });
        }

        res.json(profile);
    } catch (err) {
        console.log(err.message);
        res.status(500).json("Server Error");
    }
});

// ---------------- follow and unfollow 

//@ router      PUT api/follow/:userId
// @desc        follow a user
// @access      Private
router.put("/follow/:userId", isAuth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        const targetUser = await User.findById(req.params.userId);
        if (!currentUser || !targetUser) {
            return res.status(400).json({ error: 'Invalid User' });
        }

        // check if the current user is already following the target user
        if (currentUser.following.includes(targetUser._id)) {
            return res.status(400).json({ error: 'You are already following this user' });
        }

        currentUser.following.push(targetUser._id);
        targetUser.followers.push(currentUser._id);
        await currentUser.save();
        await targetUser.save();
        res.status(200).json({ message: 'Successfully followed user' });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Error following user' });
    }
});


//@ router      PUT api/unfollow/:userId
// @desc        unfollow a user
// @access      Private
router.put("/unfollow/:userId", isAuth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        const targetUser = await User.findById(req.params.userId);
        if (!currentUser || !targetUser) {
            return res.status(400).json({ error: 'Invalid User' });
        }
        // check if the current user is already following the target user
        if (!currentUser.following.includes(targetUser._id)) {
            return res.status(400).json({ error: 'You are not following this user' });
        }
        currentUser.following.remove(targetUser._id);
        targetUser.followers.remove(currentUser._id);
        await currentUser.save();
        await targetUser.save();
        res.status(200).json({ message: 'Successfully unfollowed user' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Error unfollowing user' });
    }
});



// @route    PUT api/unlike/:postid
// @desc     Unlike a post
// @access   Private
router.put("/unlike/:id", isAuth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // Check if the post has not yet been liked
        if (!post.likes.some((like) => like.user.toString() === req.user.id)) {
            return res.status(400).json({ msg: "Post has not yet been liked" });
        }

        // remove the like ,return filter array which not include req.user.id
        post.likes = post.likes.filter(
            ({ user }) => user.toString() !== req.user.id
        );

        await post.save();

        return res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});


// ------------- Post apis 
//@ router      GET api/all_posts
// @desc        get all  post
// @access      Private

router.get("/all_posts", isAuth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 }); // -1 means most recent one first
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json("Sever Error");
    }
});



//@ router      PUT api/like/:postId
// @desc        Like a post
// @access      Private
router.put("/like/:postId", isAuth, async (req, res) => {
    try {
        const postId = req.params.postId;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }

        // now if post found check weather this user like this post or not

        if (
            post.likes.filter((like) => like.user.toString() === req.user.id).length >
            0
        ) {
            return res.status(404).json({ msg: "Post already liked " });
        }

        post.likes.unshift({ user: req.user.id });
        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error ");
    }
});


// @route    PUT api/unlike/:postid
// @desc     Unlike a post
// @access   Private
router.put("/unlike/:id", isAuth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // Check if the post has not yet been liked
        if (!post.likes.some((like) => like.user.toString() === req.user.id)) {
            return res.status(400).json({ msg: "Post has not yet been liked" });
        }

        // remove the like ,return filter array which not include req.user.id
        post.likes = post.likes.filter(
            ({ user }) => user.toString() !== req.user.id
        );

        await post.save();

        return res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

//---------------------------------- COMMENT ON POST  ----------------
//@ router      put api/comment/:postid
// @desc        Comment on a post
// @access      private
router.put(
    "/comment/:id",
    [isAuth, [check("text", "Text required").not().isEmpty()]],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findById(req.user.id).select("-password");
            const post = await Post.findById(req.params.id);
            const newComment = {
                text: req.body.text,
                name: user.name,
                user: req.user.id,
            };
            console.log(req.body.text);
            post.comments.unshift(newComment);
            await post.save();
            console.log(post.comments[0].text);
            res.json(post.comments);
        } catch (err) {
            console.error(err.message);
            res.status(500).json("Server error ");
        }
    }
);

module.exports = router;