const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        profile: { type: [String], required: true },
        acrs: { type: [String], required: false },
        fileSnapshotIDs: { type: Map, required: true },
        queries: { type: [String], required: false },
        groupSnapshots: { type: [String], required: false },
        history: { type: [String], required: false }
    }
);

module.exports = mongoose.model("user", UserSchema);
