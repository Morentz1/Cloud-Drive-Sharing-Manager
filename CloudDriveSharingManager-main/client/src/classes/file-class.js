class File {
    constructor(id, name, permissions, permissionIds, drive, owner, path, createdTime, sharedBy) {
        this.id = id;
        this.name = name;
        this.permissions = permissions;
        this.permissionIds = permissionIds;
        this.drive = drive;
        this.owner = owner;
        this.path = path;
        this.createdTime = createdTime;
        this.sharedBy = sharedBy;
    }
}

class Folder extends File {
    constructor(file, files) {
        super(file.id, file.name, file.permissions, file.permissionIds, file.drive, file.owner, file.path, file.createdTime, file.sharedBy);
        this.files = files;
    }
}

module.exports = {
    File,
    Folder
}
