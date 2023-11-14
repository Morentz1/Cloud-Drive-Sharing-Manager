import { CloudServiceAdapter } from './CloudServiceAdapter';

import { File, Folder } from '../classes/file-class';
import FileSnapshot from '../classes/filesnapshot-class';
import Permission from '../classes/permission-class';
import GroupSnapshot from '../classes/groupsnapshot-class';
import Log from '../classes/log-class';

export class GoogleCloudServiceAdapter extends CloudServiceAdapter {
    roleTypes = {
        domain: 'domain',
        user: 'user',
        group: 'group'
    }
    
    fromAllowed = true;

    multipleDrivesAllowed = true;

    groupsAllowed = true;
    
    permissionTypes = {
        writer: 'writer',
        commenter: 'commenter',
        reader: 'reader'
    }

    writable = [this.permissionTypes.writer, this.permissionTypes.fileOrganizer, 
        this.permissionTypes.organizer, "owner"
    ]
    
    /**
     * Given a list of files, for each file, deletes all permissions associated with any entity in the
     * `deletePermissions` parameter, and adds all permissions given in the `addPermissions` parameter. You must create
     * a new snapshot directly after this function call.
     * @param {File[]} files The files to operate on.
     * @param {String[]} deletePermissions The list of email addresses to delete.
     * @param {Permission[]} addPermissions The list of permissions to add.
     * @returns A `Log` object detailing this change.
     */
    async deploy(files, deletePermissions, addPermissions) {
        console.log(files, deletePermissions, addPermissions);
        const promises = [];
        for (let file of files) {
            // Delete specified permissions (if they exist).
            for (let i = file.permissions.length-1; i >= 0; i--) {
                if (deletePermissions.includes(file.permissions[i].entity) && file.permissions[i].role !== "owner") {
                    // Matching permission found, delete.
                    promises.push(this.endpoint.client.drive.permissions.delete({
                        supportsAllDrives: true,
                        fileId: file.id,
                        permissionId: file.permissionIds[i]
                    }));
                    console.log(file);
                    file.permissionIds.splice(i, 1);
                    console.log(file);
                }
            }
            // Add all permissions to this file.
            for (let permission of addPermissions) {
                promises.push(this.endpoint.client.drive.permissions.create({
                    supportsAllDrives: true,
                    fileId: file.id,
                    resource: {
                        role: permission.role,
                        type: permission.type,
                        emailAddress: permission.entity
                    }
                }));
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
                upstreamPermissions = (await this.endpoint.client.drive.permissions.list({ 
                    'fileId':file.id,
                    'supportsAllDrives':true,
                    'fields':'*' }));
            } catch {
                // File wasn't found.
                return false;
            }
            upstreamPermissions = upstreamPermissions.result.permissions;
            if (file.permissionIds.length !== upstreamPermissions.length) {
                return false;
            }
            for (let i = 0; i < upstreamPermissions.length; i++) {
                if (!file.permissionIds.includes(upstreamPermissions[i].id)) {
                    return false;
                }
            }
        }
        return true;
    }
    
    async takeGroupSnapshot(snapshotString, groupEmail, timestamp, name) {
        let members = snapshotString.match(/"mailto:[^"]*"/g);
        members = members.map(member =>  member.substring('"mailto:'.length, member.length-1));
        members = new Set(members);
        members = Array.from(members);
        return new GroupSnapshot(this.getProfile(), members, groupEmail, timestamp, name);
    }
    
    /**
     * Takes in a list of Google API files and creates a snapshot tree from it.
     * @returns A `FileSnapshot` snapshot tree.
     */
    async takeSnapshot() {
        let files = await this.retrieve();
        let parentToChildMap = new Map();
        // making map of key = parent and value = list of children
        for (let i = 0; i < files.length; i++) {
            // change this when adding to file schema
            let currentFile = await this.createFileObject(files[i]);
            if (files[i].parents === undefined) {
                files[i].parents = [""];
            }
            for (let j = 0; j < files[i].parents.length; j++) {
                if (!parentToChildMap.has(files[i].parents[j])) {
                    parentToChildMap.set(files[i].parents[j], [currentFile]);
                } else {
                    parentToChildMap.get(files[i].parents[j]).push(currentFile);
                }   
            }   
        }
        let rootFile = new File("root", "root", [], "", "", "SYSTEM", "/", "", "");
        let root = new Folder(rootFile, []);
        let myDrive = new Folder(new File(await this.getRootID(), "My Drive", [], "", "", "SYSTEM", "/My Drive", "", "SYSTEM"), []);
        root.files.push(myDrive);
        await this.snapshotHelper(parentToChildMap, myDrive);
        let sharedWithMe = new Folder(new File("", "Shared With Me", [], "", "", "SYSTEM", "/Shared With Me", "", "SYSTEM"), []);
        root.files.push(sharedWithMe);
        await this.snapshotHelper(parentToChildMap, sharedWithMe);
        let driveList = []
        try{
            driveList = await this.getDrives();
        }catch(e){
        }
        for(let drive of driveList){
            let driveFolder = new Folder(new File(drive.id, drive.name, [],
                [], drive.name, "SYSTEM", '/'.concat(drive.name), "", "SYSTEM"),[]);
            await this.snapshotHelper(parentToChildMap,driveFolder,true);
            root.files.push(driveFolder);
        }
        let snap = new FileSnapshot(
            this.getProfile(),
            root, 
            (new Date()).toString()
        );
        return snap;
    }

    getProfile() {
        return [this.endpoint.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail(), "Google Drive"];
    }

    async getRootID() {
        let response = (await this.endpoint.client.drive.files.list({
            'fields': 'files(parents),nextPageToken',
            'pageSize': 1,
            'q': "'root' in parents"
        })).result;
        if (response.files.length) {
            return response.files[0].parents[0];
        } else {
            return "";
        }
    }

    async getDrives(){
        let response = (await this.endpoint.client.drive.drives.list({
            })).result;
        return response.drives;
    }
        

    async getPermissions(fileId){
        try{
            let response = (await this.endpoint.client.drive.permissions.list({
                'fileId':fileId,
                'supportsAllDrives':true,
                'fields':'*'})).result;
            return response.permissions;
        }catch(e){
            return [];
        }     
    }

    // Returns an array of every un-trashed file accessible to the user.
    async retrieve() {
        let files = [];
        let token = "";
        do {
            let response = (await this.endpoint.client.drive.files.list({
                'fields': 'files(id,name,createdTime,permissions(*),parents,owners,sharingUser),nextPageToken',
                'pageSize': 1000,
                'pageToken': token,
                'q': 'trashed = false',
                'includeItemsFromAllDrives': true,
                'supportsAllDrives': true
            })).result;
            files = files.concat(response.files);
            token = response.nextPageToken;
        } while (token);
        return files;
    }

    async createPermissionList(permissions){
        let permissionList = [];
        let permissionIds = [];
        if (permissions !== undefined) {
            for (let permission of permissions) {
                let canShare = (permission.role === "owner"
                        || permission.role === this.permissionTypes.organizer 
                        || permission.role === this.permissionTypes.fileOrganizer
                        || permission.role === this.permissionTypes.writer);
                permissionList.push(new Permission(permission.type, permission.type === 'anyone' ? 'anyone' : 
                    permission.type === 'domain'? permission.domain : permission.emailAddress, permission.role, false, canShare));
                permissionIds.push(permission.id);
            }
        }
        return {
            permissionList:permissionList,
            permissionIds:permissionIds
        };
    }

    /**
     * Converts a Google Drive API file into a CDSM file.
     * @param file the Google Drive API file structure to convert
     * @returns CDSM File object
     */
    async createFileObject(file) {
        let id = file.id;
        let name = file.name;
        let permissions = [];
        let permissionIds = [];
        if (file.permissions === undefined) {
            file.permissions = [];
        }
        let permissionParsing = await this.createPermissionList(file.permissions);
        permissions = permissionParsing.permissionList;
        permissionIds = permissionParsing.permissionIds;
        let drive = "";
        if (file.driveId !== undefined) {
            drive = file.driveId;//if this is still "", will be populated by snapshotHelper
        }
        let owner = "N/A";
        if(file.owners !== undefined){
            owner = file.owners[0].emailAddress;
        }
        let createdTime = file.createdTime;
        let sharedBy = owner;
        if(file.sharingUser){
            sharedBy = file.sharingUser.emailAddress;
        }
        return new File(id, name, permissions, permissionIds, drive, owner, "", createdTime, sharedBy);
    }
    /**
     * Helper method to recursively make snapshot tree.
     * @param parentToChildMap Map to get subfiles
     * @param folder Folder that CDSM is currently populating
     */
    async snapshotHelper(parentToChildMap, folder, retrievePermissions) { //add paths to files
        let childrenList = parentToChildMap.get(folder.id);
        if(childrenList === undefined){//occurs if shared drive is empty
            return;
        }
        if(childrenList){
            for (let i = 0; i < childrenList.length; i++) {
                childrenList[i].path = folder.path + "/" + childrenList[i].name;
                if(childrenList[i].drive === ""){
                    childrenList[i].drive = folder.drive;
                }
                if (parentToChildMap.has(childrenList[i].id)) {
                    // childrenList[i] is folder
                    let newFolder = new Folder(childrenList[i], []);
                    childrenList[i] = newFolder;
                    this.snapshotHelper(parentToChildMap, newFolder, retrievePermissions);
                }
            }
        }
        for(let child of childrenList){
            if(child.permissions.length === 0 && retrievePermissions){
                child.permissions = await this.getPermissions(child.id);
                let permissionParsing = await this.createPermissionList(child.permissions);
                child.permissions = permissionParsing.permissionList;
                child.permissionIds = permissionParsing.permissionIds;
            }
            for(let i = 0; i < child.permissionIds.length; i++){
                if(folder.permissionIds.includes(child.permissionIds[i])){
                    child.permissions[i].isInherited = true;
                }
            }
        }
        folder.files = childrenList;
    }
}



