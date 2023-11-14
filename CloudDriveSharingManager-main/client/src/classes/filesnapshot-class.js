import { File, Folder } from "./file-class";
import Query from "../snapshotoperations/Query";
import Permission from "./permission-class";

export default class FileSnapshot {
    constructor(profile, root, timestamp) {
        this.profile = profile;
        this.root = root;
        this.timestamp = timestamp;
    }

    validate(acrs, user, adapter) {
        let writers = adapter.writableRoles;
        const violations = new Map();
        for (let acr of acrs) {
            let clear = true;
            const acrViolations = {
                ar: [],
                aw: [],
                dr: [],
                dw: []
            }
            const files = (new Query(acr.query, this, user, adapter)).evaluate()
            for (let file of files) {
                for (let permission of file.permissions) {
                    if (acr.allowedReaders.length > 0) {
                        // Check allowed readers.
                        if (!acr.allowedReaders.includes(permission.entity) 
                            && !acr.allowedReaders.includes(permission.entity.split("@").pop()))
                        {
                            acrViolations.ar.push({
                                file: file.name,
                                entity: permission.entity
                            });
                            clear = false;
                        }
                    }
                    if (acr.allowedWriters.length > 0) {
                        // Check allowed writers.
                        if (writers.includes(permission.role)
                            && !acr.allowedReaders.includes(permission.entity) 
                            && !acr.allowedReaders.includes(permission.entity.split("@").pop()))
                        {
                            acrViolations.aw.push({
                                file: file.name,
                                entity: permission.entity
                            });
                            clear = false;
                        }
                    }
                    if (acr.deniedReaders.length > 0) {
                        // Check denied readers.
                        if (acr.deniedReaders.includes(permission.entity) 
                            || acr.deniedReaders.includes(permission.entity.split("@").pop()))
                        {
                            acrViolations.dr.push({
                                file: file.name,
                                entity: permission.entity
                            });
                            clear = false;
                        }
                    }
                    if (acr.deniedWriters.length > 0) {
                        // Check denied writers.
                        if (writers.includes(permission.role)
                            && (acr.deniedWriters.includes(permission.entity) 
                            || acr.deniedWriters.includes(permission.entity.split("@").pop())))
                        {
                            acrViolations.dw.push({
                                file: file.name,
                                entity: permission.entity
                            });
                            clear = false;
                        }
                    }
                }
            }
            if (!clear) { violations.set(acr.query, acrViolations); }
        }
        return violations;
    }

    deserialize(str) {
        const obj = JSON.parse(str);
        this.profile = obj.profile;
        this.timestamp = obj.timestamp;
        this.root = new Folder(obj.root, obj.root.files)
        for (let i = 0; i < this.root.files.length; i++) {
            this.root.files[i] = this.deserializeHelper(this.root.files[i]);
        }
        return this;
    }

    deserializeHelper(obj) {
        if ('files' in obj) {
            // Deserialize folder.
            let folder = new Folder(obj, obj.files);
            folder.permissions = folder.permissions.map(p => Object.assign(new Permission(), p));
            folder.files = folder.files.map(f => this.deserializeHelper(f));
            return folder;
        } else {
            // Deserialize file.
            let file = Object.assign(new File(), obj);
            file.permissions = file.permissions.map(p => Object.assign(new Permission(), p));
            return file;
        }
    }
}
