class AnalysisResult{
    constructor(type){
        this.type = type;
    }
}

class CompareSnapshotsResults extends AnalysisResult{
    constructor(fileDifferences, earlierSnapshot, laterSnapshot){
        super("compare-snapshot-results");
        this.fileDifferences = fileDifferences;
        this.earlierSnapshot = earlierSnapshot;
        this.laterSnapshot = laterSnapshot;
    }
}

class PermissionDifferences{
    constructor(file, addedPermissions, removedPermissions, samePermissions){
        this.file = file;
        this.addedPermissions = addedPermissions;
        this.removedPermissions = removedPermissions;
        this.samePermissions = samePermissions;
    }
}

class FileFolderDifferenceAnalysisResult extends AnalysisResult{
    constructor(folder, differingFiles){
        super("file-folder-difference-analysis");
        this.folder = folder;
        this.differingFiles = differingFiles;
    }
}

class FileFolderDifferences{
    constructor(file, fileDifferences, folderDifferences){
        this.file = file;
        this.fileDifferences = fileDifferences;
        this.folderDifferences = folderDifferences;
    }
}

class DeviantAnalysisResult extends AnalysisResult{
    constructor(parent, majority, deviants, threshold){
        super("deviant-analysis");
        this.parent = parent;
        this.majority = majority;//permission set held by majority of files
        this.deviants = deviants;//list of files that dont follow this permision set
        this.threshold = threshold;
    }
}

module.exports = {
    AnalysisResult,
    CompareSnapshotsResults,
    FileFolderDifferenceAnalysisResult,
    DeviantAnalysisResult,
    FileFolderDifferences,
    PermissionDifferences
}
