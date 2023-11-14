const mongoose = require('mongoose');
const User = require('../models/user-model');

addACR = async (req, res) => {
    const user = await User.findOne({ profile: req.body.profile });
    user.acrs.push(JSON.stringify(req.body));
    await user.save();
    await mongoose.syncIndexes();
    return res.status(201).json({ success: true }).send();
}

addGroupSnapshot = async (req, res) => {
    const user = await User.findOne({ profile: req.body.profile });
    for (let i = 0; i < user.groupSnapshots.length; i++) {
        if (
            JSON.parse(user.groupSnapshots[i]).groupEmail === req.body.groupEmail 
            || JSON.parse(user.groupSnapshots[i]).name === req.body.name) {
            user.groupSnapshots[i] = JSON.stringify(req.body);
            await user.save();
            await mongoose.syncIndexes();
            return res.status(201).json({ success: true }).send();
        }
    }
    user.groupSnapshots.push(JSON.stringify(req.body));
    await user.save();
    await mongoose.syncIndexes();
    return res.status(201).json({ success: true }).send();
}

addHistory = async (req, res) => {
    const user = await User.findOne({ profile: req.body.profile });
    user.history.unshift(JSON.stringify(req.body.log));
    await user.save();
    await mongoose.syncIndexes();
    return res.status(201).json({ success: true }).send();
}

addQuery = async (req, res) => {
    const user = await User.findOne({ profile: req.body.profile });
    if (user.queries.length >= 5) {
        user.queries.pop();
    }
    user.queries.unshift(req.body.query);
    await user.save();
    await mongoose.syncIndexes();
    return res.status(201).json({ success: true }).send();
}

deleteACR = async (req, res) => {
    const user = await User.findOne({ profile: req.body });
    user.acrs.splice(req.params.index, 1);
    await user.save();
    await mongoose.syncIndexes();
    return res.status(200).json({ success: true }).send();
}

deleteHistory = async (req, res) => {
    const user = await User.findOne({ profile: req.body });
    user.history = []
    await user.save();
    await mongoose.syncIndexes();
    return res.status(200).json({ success: true }).send();
}

getUser = async (req, res) => {
    const str = req.params.profile;
    const profile = [str.substring(0, str.lastIndexOf(',')), str.substring(str.lastIndexOf(',') + 1)];
    const user = await User.findOne({ profile: profile });
    if (user) {
        return res.status(200).json(user);
    } else {
        return res.status(404).json({ 
            success: false,
            message: "getUser() failed, " + req.params.profile + " was not found."
        }).send();
    }
}

module.exports = {
    addACR,
    addGroupSnapshot,
    addHistory,
    addQuery,
    deleteACR,
    deleteHistory,
    getUser,
    addGroupSnapshot
}
