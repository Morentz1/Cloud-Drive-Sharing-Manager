import { CloudServiceAdapter } from "./CloudServiceAdapter";

import { File, Folder } from "../classes/file-class";
import FileSnapshot from '../classes/filesnapshot-class';
import Permission from '../classes/permission-class';
import Log from "../classes/log-class";

export class DropboxCloudServiceAdapter extends CloudServiceAdapter { 
    roleTypes = {
        user: 'user'
    }
    
    permissionTypes = {
        editor: 'editor',
        viewer: 'viewer'
    }

    writable = ["owner", this.permissionTypes.editor];
    
    async deploy(files, deletePermissions, addPermissions) {
        const promises = [];
        for (let file of files) {
            // Delete specified permissions (if they exist).
            for (let i = 0; i < file.permissions.length; i++) {
                if (deletePermissions.includes(file.permissions[i].entity) && file.permissions[i].role !== "owner") {
                    // Matching permission found, delete.
                    const payload = { email: file.permissions[i].entity }
                    payload['.tag'] = 'email';
                    if (file instanceof Folder) {
                        promises.push(this.endpoint.sharingRemoveFolderMember({
                            shared_folder_id: file.id,
                            member: payload,
                            leave_a_copy: false
                        }));
                    } else {
                        promises.push(this.endpoint.sharingRemoveFileMember2({
                            file: file.id,
                            member: payload
                        }));
                    }
                }
            }
            // Add all permissions to this file.
            for (let permission of addPermissions) {
                const payload = { email: permission.entity }
                payload['.tag'] = 'email';
                const accessLevel = { }
                accessLevel['.tag'] = permission.role;
                if (file instanceof Folder) {
                    if (file.id.substring(0, 3) === "id:") {
                        file.id = (await this.endpoint.sharingShareFolder({
                            path: file.path,
                            force_async: false,
                            access_inheritance: 'inherit'
                        })).result.shared_folder_id;
                    }
                    promises.push(this.endpoint.sharingAddFolderMember({
                        shared_folder_id: file.id,
                        members: [{
                            member: payload,
                            access_level: accessLevel
                        }],
                        quiet: false
                    }));
                } else {
                    promises.push(this.endpoint.sharingAddFileMember({
                        file: file.id,
                        members: [payload],
                        access_level: accessLevel,
                        quiet: false,
                        add_message_as_comment: false
                    }));
                }
            }
        }
        await Promise.all(promises);
        return new Log(files.map(file => file.name), deletePermissions, addPermissions, (new Date()).toString());
    }
    /**
     * Given a list of `File` objects, checks whether these files have matching (up-to-date) permissions with their
     * counterparts in the cloud drive.
     * @param {File[]} files The list of files to check.
     * @returns `true` if the local files permissions match the cloud drive files permissions, and `false` otherwise.
     */
     async deployValidatePermissions(files) {
        for (let file of files) {
            let upstreamPermissions;
            try {
                if (file instanceof Folder) {
                    if (file.id.substring(0, 3) !== "id:") {
                        upstreamPermissions = (await this.endpoint.sharingListFolderMembers({ shared_folder_id: file.id })).result.users;
                    } else {
                        continue;
                    }
                } else {
                    upstreamPermissions = (await this.endpoint.sharingListFileMembers({ file: file.path })).result.users;
                }
            } catch {
                // File wasn't found.
                return false;
            }
            if (file.permissions.length !== upstreamPermissions.length) {
                return false;
            }
            outer: for (let i = 0; i < file.permissions.length; i++) {
                for (let k = 0; k < upstreamPermissions.length; k++) {
                    if (upstreamPermissions[k].user.email.toLowerCase() === file.permissions[i].entity.toLowerCase()) {
                        continue outer;
                    }
                }
                return false;
            }
        }
        return true;
    }

    async takeSnapshot() {
        let rootFile = new File("", "root", [], "", "dropbox", "SYSTEM", "/", "");
        let root = new Folder(rootFile, []);
        const topLevelFiles = (await this.endpoint.filesListFolder({ path: '' })).result.entries;
        for (let file of topLevelFiles) {
            root.files.push(await this.build(file));
        }
        return new FileSnapshot(await this.getProfile(), root, (new Date()).toString());
    }
    async build(file) {
        const permissions = [];
        let owner = (await this.getProfile())[0];
        if (file['.tag'] === 'file') {
            const result = (await this.endpoint.sharingListFileMembers({ file: file.id })).result;
            for (let permission of result.users) {
                permissions.push(
                    new Permission(
                        'user', 
                        permission.user.email, 
                        permission.access_type['.tag'],
                        permission.is_inherited,
                        true
                    )
                );
                if (permission.access_type['.tag'] === 'owner') { owner = permission.user.email; }
            }
            return new File(file.id, file.name, permissions, [], 'dropbox', owner, file.path_display, file.client_modified, "");
        } else {
            if (file.shared_folder_id) {
                const result = (await this.endpoint.sharingListFolderMembers({ shared_folder_id: file.shared_folder_id })).result;
                for (let permission of result.users) {
                    permissions.push(
                        new Permission(
                            'user', 
                            permission.user.email, 
                            permission.access_type['.tag'],
                            permission.is_inherited,
                            true
                        )
                    );
                    if (permission.access_type['.tag'] === 'owner') { owner = permission.user.email; }
                }
            } else {
                permissions.push(new Permission('user', owner, 'owner', false, true));
            }
            let children = (await this.endpoint.filesListFolder({ path: file.id })).result.entries;
            const childrenArray = []
            for (let child of children) {
                childrenArray.push(await this.build(child));
            }
            return new Folder(
                new File(
                    file.shared_folder_id ? file.shared_folder_id : file.id, 
                    file.name, 
                    permissions, 
                    [], 
                    'dropbox', 
                    owner, 
                    file.path_display, 
                    "", 
                    ""
                ), 
            childrenArray);
        }
    }

    async getProfile() {
        return [(await this.endpoint.usersGetCurrentAccount()).result.email, "Dropbox"];
    }
}
