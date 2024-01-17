"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateComment = exports.createComment = exports.likeHandler = exports.deletePost = exports.updatePost = exports.updateUser = exports.createPost = exports.getUser = exports.getAllUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const cloudinary_1 = require("cloudinary");
const Post_1 = __importDefault(require("../models/Post"));
const Comment_1 = __importDefault(require("../models/Comment"));
//GET ROUTE TO FETCH ALL THE USERS FROM THE DATABASE
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.default.find({});
        if (!users.length)
            res.status(200).json("No users found");
        const payload = users.map((user) => {
            const updatedUser = user;
            updatedUser.password = "";
            updatedUser.posts = [];
            return updatedUser;
        });
        return res.status(200).json(payload);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
exports.getAllUsers = getAllUsers;
//GET ROUTE TO FETCH A SINGLE AUTHENTICATED USER FROM THE DATABASE
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.user;
        // const user = await User.findById(id).populate("Posts");
        const user = yield User_1.default.findById(id);
        if (!user)
            res.status(400).json("User not Found");
        let payload = null;
        if (user) {
            user.password = "";
            payload = user;
        }
        return res.status(200).json(payload);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
exports.getUser = getUser;
//POST ROUTE TO CREATE A POST IN DATABASE
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.user;
        const image = req.file;
        const { title, description } = req.body;
        if (!title)
            return res.status(400).json("Title field can not be empty");
        const user = yield User_1.default.findById(id);
        if (!user)
            return res.status(400).json("User does not exist");
        let imageUrl = null;
        let fileName = null;
        if (image === null || image === void 0 ? void 0 : image.filename) {
            yield cloudinary_1.v2.uploader.upload(image.path, { folder: "postApp" }, (err, res) => {
                if (err)
                    console.log(err);
                else {
                    if (res) {
                        imageUrl = res.url;
                        fileName = res.public_id;
                    }
                }
            });
        }
        let userposts = user.posts;
        const newPost = yield Post_1.default.create({
            title,
            description,
            photo: {
                url: imageUrl,
                filename: fileName,
            },
            author: req.user.id,
        });
        yield newPost.save();
        userposts.push(newPost._id);
        yield User_1.default.findByIdAndUpdate(id, { posts: userposts });
        return res.status(200).json("Post created succesfully");
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
exports.createPost = createPost;
//PATCH ROUTE TO UPDATE USER PROFILE
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.user;
        const { userName } = req.body;
        if (userName.lenght < 5)
            return res.status(400).json("Username must be atleast 5 letters long");
        yield User_1.default.findByIdAndUpdate(id, { userName });
        return res.status(200).json("User updated successfully");
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
exports.updateUser = updateUser;
//PATCH ROUTE TO UPDATE USER POST
const updatePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
exports.updatePost = updatePost;
//DELETE ROUTE TO DELETE USER POST
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.user;
        const { postId } = req.params;
        const user = yield User_1.default.findById(id);
        if (!user)
            return res.status(400).json("User does not exist");
        const post = yield Post_1.default.findById(postId);
        if (!post)
            return res.status(400).json("Post does not exist");
        const postcomments = post.comments;
        const userPosts = user.posts;
        const updatedUserPosts = userPosts.filter((post) => {
            return post.toString() !== postId;
        });
        for (let comment of postcomments) {
            yield Comment_1.default.findByIdAndDelete(comment);
        }
        if ((_a = post.photo) === null || _a === void 0 ? void 0 : _a.url) {
            yield cloudinary_1.v2.uploader.destroy((_b = post.photo) === null || _b === void 0 ? void 0 : _b.filename, (result) => {
                console.log("res from cloudinary:-> ", result);
            });
        }
        yield Post_1.default.findByIdAndDelete(postId);
        return res.status(200).json("Post deleted successfully");
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
exports.deletePost = deletePost;
const likeHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    try {
        const { id } = req.user;
        const { postId } = req.params;
        const post = yield Post_1.default.findById(postId);
        if (!post)
            return res.status(400).json("Post not found");
        const isAlreadyLiked = (_c = post.likes) === null || _c === void 0 ? void 0 : _c.authors.indexOf(id);
        const authors = (_d = post.likes) === null || _d === void 0 ? void 0 : _d.authors;
        if (isAlreadyLiked === -1) {
            authors === null || authors === void 0 ? void 0 : authors.push(id);
            const updatedProperties = {
                likes: {
                    count: post.likes.count + 1,
                    authors,
                },
            };
            yield Post_1.default.findByIdAndUpdate(postId, {
                $set: updatedProperties,
            });
            return res.status(200).json("Successfullt liked the post");
        }
        else {
            const updatedAuthors = authors === null || authors === void 0 ? void 0 : authors.filter((author) => {
                return id != author;
            });
            const updatedProperties = {
                likes: {
                    count: post.likes.count - 1,
                    authors: updatedAuthors,
                },
            };
            yield Post_1.default.findByIdAndUpdate(postId, {
                $set: updatedProperties,
            });
            return res.status(200).json("Successfullt disliked the post");
        }
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
exports.likeHandler = likeHandler;
const createComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content } = req.body;
        const { postId } = req.params;
        if (!content)
            return res.status(400).json("Please enter your comment");
        const post = yield Post_1.default.findById(postId);
        if (!post)
            return res.status(400).json("Post does not exist");
        const newComment = yield Comment_1.default.create({
            content,
            author: req.user.id,
            atPost: postId,
        });
        yield newComment.save();
        let comments = post.comments;
        comments.push(newComment._id);
        yield Post_1.default.findByIdAndUpdate(postId, { comments });
        return res.status(200).json("Added your comment");
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
exports.createComment = createComment;
const updateComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        if (!content)
            return res.status(400).json("Please enter comment");
        const comment = yield Comment_1.default.findById(commentId);
        if (!comment)
            return res.status(400).json("Comment not found");
        yield Comment_1.default.findByIdAndUpdate(commentId, { content });
        return res.status(200).json("comment updated successfully");
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
exports.updateComment = updateComment;
