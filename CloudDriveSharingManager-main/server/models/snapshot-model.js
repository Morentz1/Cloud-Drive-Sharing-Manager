const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SnapshotSchema = new Schema(
    {
        contents: { type: String, required: true }
    }
);

module.exports = mongoose.model("snapshot", SnapshotSchema);
