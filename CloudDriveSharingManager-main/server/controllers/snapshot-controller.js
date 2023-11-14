const mongoose = require('mongoose');
const Snapshot = require('../models/snapshot-model');
const User = require('../models/user-model');

addSnapshot = async (req, res) => {
    const payload = req.body;
    let user = await User.findOne({ profile: payload.profile });
    snapshotID = new mongoose.Types.ObjectId();
    const newSnapshot = new Snapshot({
        _id: snapshotID,
        contents: JSON.stringify(payload)
    });
    
    if (!user) {
        user = new User({
            _id: new mongoose.Types.ObjectId(),
            profile: payload.profile,
            fileSnapshotIDs: { }
        });
    }
    
    user.fileSnapshotIDs.set(snapshotID, payload.timestamp);
    await user.save();
    await newSnapshot.save();
    await mongoose.syncIndexes();
    return res.status(201).json({ success: true }).send();
}

getSnapshot = async (req, res) => {
    let snapshot = await Snapshot.findById(req.params.id);
    if (snapshot) {
        return res.status(200).json(snapshot);
    } else {
        return res.status(404).json({ 
            success: false,
            message: "getSnapshot() failed, " + req.params.id + " was not found."
        }).send();
    }
}

module.exports = {
    addSnapshot,
    getSnapshot
}
