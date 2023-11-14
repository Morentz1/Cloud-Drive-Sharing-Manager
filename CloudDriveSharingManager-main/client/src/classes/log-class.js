class Log {
    /**
     * Constructs a new Log object that represents a permission deployment.
     * @param {String[]} files The files names that were changed.
     * @param {String[]} deletePermissions The entities that were deleted.
     * @param {Permission[]} addPermissions The permissions that were added.
     * @param {String} timestamp The timestamp of this change.
     */
    constructor(files, deletePermissions, addPermissions, timestamp) {
        this.files = files;
        this.deletePermissions = deletePermissions;
        this.addPermissions = addPermissions;
        this.timestamp = timestamp
    }
}

module.exports = Log;
