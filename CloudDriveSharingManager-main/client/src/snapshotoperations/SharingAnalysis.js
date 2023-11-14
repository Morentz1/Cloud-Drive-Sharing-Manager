import { DeviantAnalysisResult, 
    FileFolderDifferences, 
    FileFolderDifferenceAnalysisResult,
    PermissionDifferences,
    CompareSnapshotsResults  } from "../classes/AnalysisResult";
import { File } from '../classes/file-class';

function compareSnapshots(snapshot1, snapshot2){
    let earlierSnapshot = undefined;
    let laterSnapshot = undefined;
    if(Date.parse(snapshot1.timestamp) < Date.parse(snapshot2.timestamp)){
        earlierSnapshot = snapshot1;
        laterSnapshot = snapshot2;
    }else{
        earlierSnapshot = snapshot2;
        laterSnapshot = snapshot1;
    }
    //putting all files into a map where key is their id
    let idToFileMap1 = new Map();
    makeIdToFileMap(earlierSnapshot.root, idToFileMap1);
    let idToFileMap2 = new Map();
    makeIdToFileMap(laterSnapshot.root, idToFileMap2);
    let snap2Ids = idToFileMap2.keys();
    let differences = [];
    let key = 0;
    while((key = snap2Ids.next().value) !== undefined){
        if(idToFileMap1.get(key) === undefined){
            differences.push(new PermissionDifferences(idToFileMap2.get(key), idToFileMap2.get(key).permissions));
        }else{
            let permissionDiff = comparePermissions(idToFileMap1.get(key), idToFileMap2.get(key), true);
            if(permissionDiff.addedPermissions.length !== 0 || permissionDiff.removedPermissions.length !== 0){
                differences.push(permissionDiff);
            }      
        }
    }
    return new CompareSnapshotsResults(differences, earlierSnapshot, laterSnapshot);
}

function comparePermissions(file1, file2, needToStringify){
    let permissionsMap = new Map();
    for(let permission of file1.permissions){
        permission = permission.basePermission;
        if(needToStringify){
            permissionsMap.set(JSON.stringify(permission), 1);
        }else{
            permissionsMap.set(permission, 1);
        }
    }
    for(let permission of file2.permissions){
        permission = permission.basePermission;
        if(needToStringify){
            permissionsMap.set(JSON.stringify(permission), permissionsMap.get(JSON.stringify(permission)) === undefined ? -1 : 0);
        }else{
            permissionsMap.set(permission, permissionsMap.get(permission) === undefined ? -1 : 0);
        }
    }
    let file2Removals = [...permissionsMap.entries()].filter(e => e[1] === 1).map(x => JSON.parse(x[0]));
    let file2Additions = [...permissionsMap.entries()].filter(e => e[1] === -1).map(x => JSON.parse(x[0]));
    let samePermissions = [...permissionsMap.entries()].filter(e => e[1] === 0).map(x => JSON.parse(x[0]));
    return new PermissionDifferences(file2, file2Additions, file2Removals, samePermissions);

}

function makeIdToFileMap(file, currentMap){
    currentMap.set(file.id, file);
    if(file.files !== undefined){
        for(let subFile of file.files){
            makeIdToFileMap(subFile, currentMap);
        }
    }
}

/**
 * Deviant analysis. Limitations: threshold must be above .5.
 * @param folder folder whose files to perform analysis on
 * @returns results of deviant analysis.
 */
function findDeviantSharing(folder, threshold) {
    let permissionsMap = new Map();
    for (let file of folder.files) {
        let permissionSet = JSON.stringify(file.permissions);
        if (permissionsMap.has(permissionSet)) {
            permissionsMap.set(permissionSet, [...permissionsMap.get(permissionSet), file]);
        } else {
            permissionsMap.set(permissionSet, [file]);
        }
    }
    let majority = [...permissionsMap.entries()].reduce((a, e) => e[1].length > a[1].length ? e : a);
    let deviantFiles = [];
    if (majority[1].length / folder.files.length >= threshold) {
        for (let permissionSet of permissionsMap.entries()) {
            if (permissionSet[0] !== majority[0]) {
                let fileWithMajorityPermissions = new File("", "", JSON.parse(majority[0]));
                let permissionDifferences = comparePermissions(fileWithMajorityPermissions, permissionSet[1][0], true);
                let deviantDifferences = [];
                for(let file of permissionSet[1]){
                    deviantDifferences = new PermissionDifferences(file, 
                        permissionDifferences.addedPermissions, permissionDifferences.removedPermissions, 
                        permissionDifferences.samePermissions);
                }
                deviantFiles = deviantFiles.concat(deviantDifferences);
            }
        }
    }
    majority[0] = JSON.parse(majority[0]);
    return new DeviantAnalysisResult(folder, majority, deviantFiles, threshold);
}

function findFileFolderSharingDifferences(folder){
    let folderPermissionsMap = new Map();
    let differences = [];
    for(let permission of folder.permissions){
        permission = permission.basePermission;
        permission = JSON.stringify(permission);
        folderPermissionsMap.set(permission, 1);
    }
    for(let file of folder.files) {
        let permissionsMap = new Map(folderPermissionsMap);
        for(let permission of file.permissions){
            permission = permission.basePermission;
            permission = JSON.stringify(permission);
            if(permissionsMap.has(permission)){
                permissionsMap.set(permission, 0);
            }else{
                permissionsMap.set(permission, -1);
            }
        }
        //in folder but not file
        let folderDifferences = [...permissionsMap.entries()].filter(e => e[1] === 1).map(x => JSON.parse(x[0]));
        //in file but not folder
        let fileDifferences = [...permissionsMap.entries()].filter(e => e[1] === -1).map(x => JSON.parse(x[0]));
        if(folderDifferences.length !== 0 || fileDifferences.length !== 0){
            differences.push(new FileFolderDifferences(file, fileDifferences, folderDifferences));
        }
    }
    return new FileFolderDifferenceAnalysisResult(folder, differences);
}

export { 
    compareSnapshots,
    findDeviantSharing,
    findFileFolderSharingDifferences
}
