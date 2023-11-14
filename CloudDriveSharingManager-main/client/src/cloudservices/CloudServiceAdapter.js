import { Folder } from "../classes/file-class";
import FileSnapshot from "../classes/filesnapshot-class";
import Permission from "../classes/permission-class";

export class CloudServiceAdapter {
    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    roleTypes = {};

    fromAllowed = false;
    
    multipleDrivesAllowed = false;
    
    groupsAllowed = false;

    permissionTypes = {};

    writable = [];

    deploy() {
        throw new Error("deploy() must be implemented.");
    }

    deployValidatePermissions() {
        throw new Error("deployValidatePermissions() must be implemented.");
    }
    
    deployValidateACRs(files, deletePermissions, addPermissions, snapshot, acrs, writers, user, groupsAllowed) {
        const snapshotCopy = (new FileSnapshot()).deserialize(JSON.stringify(snapshot));
        for (let file of files) {
            // Search for this file in the snapshot copy.
            const target = this.snapshotSearch([snapshotCopy.root], file.id)
            if (!target) { throw new Error("Search failed."); }

            // Delete specified permissions (if they exist).
            for (let i = target.permissions.length - 1; i >= 0; i--) {
                if (deletePermissions.includes(target.permissions[i].entity) && target.permissions[i].role !== "owner") {
                    // Matching permission found, delete.
                    const deletedEntity = target.permissions.splice(i, 1)[0].entity;
                    target.permissionIds.splice(i, 1);
                    if (target instanceof Folder) {
                        this.deployValidateACRsHelper(target.files, deletedEntity, "delete");
                    }
                }
            }
            // Add all permissions to this file.
            for (let permission of addPermissions) {
                target.permissions.push(Object.assign(new Permission(), permission));
            }
            if (target instanceof Folder) {
                this.deployValidateACRsHelper(target.files, addPermissions, "add");
            }
        }
        return snapshotCopy.validate(acrs, writers, user, groupsAllowed);
    }
    snapshotSearch(files, id) {
        for (let file of files) {
            if (file.id === id) { return file; }
            if (file instanceof Folder) {
                const result = this.snapshotSearch(file.files, id);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    }
    deployValidateACRsHelper(files, permission, type) {
        switch (type) {
            case "add":
                for (let file of files) {
                    for (let p of permission) {
                        const newPermission = Object.assign(new Permission(), p);
                        newPermission.isInherited = true;
                        file.permissions.push(newPermission);
                    }
                    if (file instanceof Folder) {
                        this.deployValidateACRsHelper(file.files, permission, "add");
                    }
                }
                break;
            case "delete":
                for (let file of files) {
                    for (let i = 0; i < file.permissions.length; i++) {
                        if (file.permissions[i].entity === permission && file.permissions[i].isInherited) {
                            const deletedEntity = file.permissions.splice(i, 1)[0].entity;
                            file.permissionIds.splice(i, 1);
                            if (file instanceof Folder) {
                                this.deployValidateACRsHelper(file.files, deletedEntity, "delete");
                            }
                        }
                    }
                }
                break;
            default:
                return;
        }
    }

    takeGroupSnapshot(){
        throw new Error("takeGroupSnapshot() must be implemented.");
    }

    takeSnapshot() {
        throw new Error("takeSnapshot() must be implemented.");
    }

    getProfile() {
        throw new Error("getProfile() must be implemented.");
    }
}
