const keywords = ['groups', 'drive', 'owner', 'creator', 'from', 'to', 'readable', 'writable', 
    'shareable', 'name', 'inFolder', 'folder', 'path', 'sharing',
    '-drive', '-owner', '-creator', '-from', '-to', '-readable', '-writable', 
    '-shareable', '-name', '-inFolder', '-folder', '-path', '-sharing'];

const keywordsWithUsers = ['owner', 'creator', 'from', 'to', 'readable', 'writable', 
    'shareable', '-owner', '-creator', '-from', '-to', '-readable', '-writable', '-shareable'];

//name in quotes
export default class Query {  
    
    constructor(queryString, snapshot, user, adapter) {
        this.queryString = queryString;
        this.snapshot = snapshot;
        this.writableRoles = adapter.writableRoles;
        this.groupsAllowed = adapter.groupsAllowed;
        this.groupsOn = adapter.groupsAllowed;
        this.fromAllowed = adapter.fromAllowed;
        this.drivesAllowed = adapter.multipleDrivesAllowed;
        this.user = user;
        this.operators = this.parse(queryString);
    }

    evaluate() {
        try{
            let files = this.operators.evaluate(this.snapshot, this.writableRoles, this.user);
            if(this.drivesAllowed){
                files = files.filter(e => !this.snapshot.root.files.includes(e));
            }
            return files;
        }catch(e){
            throw new Error("Incorrectly formatted query.");
        }
        
    }

    parse(queryString) {
        let i = 0;
        let operatorStack = ['('];
        let containsDrive = false;
        let containsPath = false;
        queryTraversal: while(i < queryString.length) {
            if (String(queryString.charAt(i)).trim() === '') { // if whitespace, skip
                i++;
                continue;
            }
            // check if keyword with colon
            if (queryString.charAt(i) === '(') {
                operatorStack.push('(');
                i++;
                continue;
            } else if (queryString.charAt(i) === ')') {
                i++;
                try {
                    this.popUntilParenthesis(operatorStack);
                    continue;
                } catch (e) {
                    throw new InvalidQueryError("Incorrectly formatted query.");
                }
            } else if (queryString.substring(i).indexOf('or') === 0) {
                operatorStack.push(new Operator('or'));
                i += 2;
                continue;
            } else if (queryString.substring(i).indexOf('and') === 0) {
                i += 3;
                continue;
            }
            for (let keyword of keywords) {
                if (queryString.substring(i).indexOf(keyword) === 0) {
                    i += keyword.length;
                    if (String(queryString.charAt(i)) === ':') {
                        i++;
                        while (queryString.charAt(i).trim() === '') {
                            i++;
                            if(i >= queryString.length){
                                throw new Error("Operator missing value.");
                            }
                        }
                        let parsedWord = this.parseWord(queryString, i);
                        i = parsedWord.i;
                        if(keyword === 'groups'){
                            if(!this.groupsAllowed){
                                throw new Error("Groups not supported in selected drive service.");
                            }
                            if(!(operatorStack.length === 1 && operatorStack[0] === '(')){
                                throw new Error("Group must be first conjunct in a search query.");
                            }
                            if(parsedWord.word.toLowerCase() === 'on'){
                                this.groupsOn = true;
                            }else if(parsedWord.word.toLowerCase() === 'off'){
                                this.groupsOn = false;
                            }else{
                                throw new Error('"Groups:" must be followed by "on" or "off".');
                            }
                            while (queryString.charAt(i).trim() === '') {
                                i++;
                                if(i >= queryString.length){
                                    throw new Error("Groups must be associated with other operators.");
                                }
                            }
                            if(queryString.substring(i).indexOf('and ') === 0){
                                i+=4;
                            }else{
                                throw new Error('"Groups:" must be followed by an "and".');
                            }
                        }else{
                            if(keyword.toLowerCase() === 'drive'){
                                if(!this.drivesAllowed){
                                    throw new Error("Multiple drives not supported by this service.");
                                }
                                containsDrive = true;
                            }else if(keyword.toLowerCase() === 'path'){
                                containsPath = true;
                            }
                            if(keywordsWithUsers.includes(keyword) && parsedWord.word.toLowerCase() === 'me'){
                                parsedWord.word = this.snapshot.profile[0];
                            }
                            operatorStack.push(new Operator(keyword, parsedWord.word, null, null, this.groupsOn, 
                                this.user? this.user.groupSnapshots:undefined));
                        }
                        continue queryTraversal;
                    }
                }
            }
            //assume it is a name
            let parsedWord = this.parseWord(queryString, i - 1);
            i = parsedWord.i;
            operatorStack.push(new Operator('name', parsedWord.word)); 
        }
        this.popUntilParenthesis(operatorStack);
        if (operatorStack.length !== 1) {
            throw new InvalidQueryError("Incorrectly formatted query.");
        }
        if(containsPath && this.drivesAllowed && !containsDrive){
            throw new Error("Path can only be used in conjunction with drive.");
        }
        return operatorStack[0];
    }

    popUntilParenthesis(operatorStack) {
        let operatorsLeft = [];
        let op = '';
        while ((op = operatorStack.pop()) !== '(') {//flipping operators to get first in out
            operatorsLeft.push(op);
        }
        let currentTree = undefined;
        while (true) {
            if (operatorsLeft.length === 0) {
                if (currentTree !== undefined) {
                    operatorStack.push(currentTree);
                }
                return;
            }
            let currentOperator = operatorsLeft.pop();
            if (currentTree === undefined) {
                currentTree = currentOperator;
            } else {
                if (currentOperator.operator === 'or' && !currentOperator.right && !currentOperator.left) {
                    currentOperator.left = currentTree;
                    currentTree = currentOperator;
                    currentOperator = operatorsLeft.pop();
                    if (currentOperator === '(') {
                        throw new InvalidQueryError();
                    }
                    currentTree.right = currentOperator;
                } else { //implied and
                    let newTree = new Operator('and', undefined, currentTree, currentOperator)
                    currentTree = newTree;
                }
            }
        }
    }

    parseWord(queryString, i) {
        while (queryString.charAt(i).trim() === '') { // if whitespace, skip
            i++;
        }
        let word = "";
        if (queryString.charAt(i) === '"') {
            i++;
            try {
                while (queryString.charAt(i) !== '"') { //what if "lexi\\"
                    word += queryString.charAt(i);
                    i++;
                    if(i >= queryString.length){
                        throw new Error();
                    }
                }
            } catch(e) {
                throw new InvalidQueryError("Quotations not closed");
            }
            i++; // accounting for closing ""
        } else {
            while (queryString.charAt(i).trim() !== '' && queryString.charAt(i) !== ')') {
                word += queryString.charAt(i);
                i++;
            }
        }
        return {word: word, i: i};
    }
}

class InvalidQueryError extends Error {

}

class Operator {
    constructor(operator, value, left, right, groupsOn, groupSnapshots) {
        this.operator = operator;
        this.value = value; // null if and/or
        this.left = left;
        this.right = right;
        this.groupsOn = groupsOn;
        this.groupSnapshots = groupSnapshots;
    }

    evaluate(snapshot, writableRoles) {
        if (!this.left && !this.right) {
            switch (this.operator.toLowerCase()) {
                case 'drive':
                    // find files in specified drive
                    return this.basicFieldChecker(snapshot, this.driveQualifier, 'drive');
                case '-drive':
                    return this.basicFieldChecker(snapshot, this.notDriveQualifier, 'drive');
                case 'owner':
                    // find files owned by specified user
                    return this.basicFieldChecker(snapshot, this.equalsQualifier, 'owner');
                case '-owner':
                    return this.basicFieldChecker(snapshot, this.notEqualsQualifier, 'owner');
                case 'creator':
                    // find files created by specified user
                    return this.basicFieldChecker(snapshot, this.equalsQualifier, 'owner');
                case '-creator':
                    // find files created by specified user
                    return this.basicFieldChecker(snapshot, this.notEqualsQualifier, 'owner');
                case 'from':
                    //find files shared by specified user
                    return this.basicFieldChecker(snapshot, this.equalsQualifier, 'sharedBy');
                case '-from':
                    //find files shared by specified user
                    return this.basicFieldChecker(snapshot, this.notEqualsQualifier, 'sharedBy');
                case 'to':
                    // find files shared directly to user (not through groups or inheritted)
                    return this.to(snapshot, this.value);
                case '-to':
                    return this.notTo(snapshot, this.value);
                case 'readable':
                    return this.hasAccess(snapshot, 'read', this.value, snapshot.profile[0]);
                case '-readable':
                    return this.noAccess(snapshot, 'read', this.value);
                case 'writable':
                    // find files writable by user
                    return this.hasAccess(snapshot, 'write', this.value, writableRoles);
                case '-writable':
                    // find files writable by user
                    return this.noAccess(snapshot, 'write', this.value, writableRoles);
                case 'shareable':
                    // find files shareable by user
                    return this.shareable(snapshot, this.value);
                case '-shareable':
                    return this.notShareable(snapshot, this.value);
                case 'name':
                    // find files whose name matches 
                    return this.basicFieldChecker(snapshot, this.matchesQualifier, 'name');
                case '-name':
                    return this.basicFieldChecker(snapshot, this.notMatchesQualifier, 'name');
                case 'infolder':
                    // returns all files in specified folder regex
                    return this.inFolder(snapshot, this.value);
                case '-infolder':
                    return this.notInFolder(snapshot, this.value);
                case 'folder':
                    // find folders whose name matches regex
                    return this.basicFieldChecker(snapshot, this.folderAndEqualsQualifier, 'name');
                case '-folder':
                    return this.basicFieldChecker(snapshot, this.folderAndNotEqualsQualifier, 'name');
                case 'path':
                    // find all files with specified path
                    return this.basicFieldChecker(snapshot, this.pathQualifier, 'path');
                case '-path':
                    return this.basicFieldChecker(snapshot, this.notPathQualifier, 'path');
                case 'sharing':
                    //find files shared with anyone, none, specific users/groups/domains
                    if (this.value.toLowerCase() === "none") {
                        return this.noneSharing(snapshot, snapshot.profile[0]);
                    } else {
                        return this.userSharing(snapshot, this.value);
                    }
                case '-sharing':
                    if (this.value.toLowerCase() === "none") {
                        return this.notNoneSharing(snapshot);
                    } else {
                        return this.notUserSharing(snapshot, this.value);
                    }
                default:
                    throw new InvalidQueryError("Unrecognized operator.");
            }
        } else {
            switch (this.operator.toLowerCase()) {
                case 'and':
                    let x = this.and(this.left.evaluate(snapshot), this.right.evaluate(snapshot));
                    return x;
                case 'or':
                    return this.or(this.left.evaluate(snapshot), this.right.evaluate(snapshot));
                default:
                    throw new InvalidQueryError("Unrecognized operator.");
            }
        }
    }

    and(list1, list2) {
        let and = [];
        let occurences = new Map();
        for (let element of list1) {
            occurences.set(element, 1);
        }
        for (let element of list2) {
            if (occurences.has(element)) {
                and.push(element);
            }
        }
        return and;
    }

    or(list1, list2) {
        let or = new Set();
        for (let element of list1) {
            or.add(element);
        }
        for (let element of list2) {
            or.add(element);
        }
        return Array.from(or);

    }

    equalsQualifier(file, field, value) {
        return value.toLowerCase() === file[field].toLowerCase();
    }
    notEqualsQualifier(file, field, value) {
        return value.toLowerCase() !== file[field].toLowerCase();
    }

    driveQualifier(file, field, value) {
        return (value.toLowerCase() === "my drive" && file[field] === "") || value.toLowerCase() === file[field].toLowerCase();
    }
    notDriveQualifier(file, field, value) {
        return !((value.toLowerCase() === "my drive" && file[field] === "") || value.toLowerCase() === file[field].toLowerCase());
    }

    pathQualifier(file, field, value) {
        return file[field].toLowerCase().indexOf(value.toLowerCase()) === 0 && file[field].charAt(value.length) === '/';
    }
    notPathQualifier(file, field, value) {
        return !(file[field].toLowerCase().indexOf(value.toLowerCase()) === 0 && file[field].charAt(value.length) === '/');
    }

    matchesQualifier(file, field, value) {
        let regex = new RegExp(value, 'i');
        return regex.test(file[field]);
    }
    notMatchesQualifier(file, field, value) {
        let regex = new RegExp(value, 'i');
        return !regex.test(file[field]);
    }

    folderAndEqualsQualifier(file, field, value) {
        return (new RegExp(value, 'i')).test(file[field]) && file.files !== undefined;
    }
    folderAndNotEqualsQualifier(file, field, value) {
        return !(new RegExp(value, 'i')).test(file[field]) && file.files !== undefined;
    }

    basicFieldChecker(file, booleanQualifier, field) {
        let files = [];
        if (file.profile !== undefined) {
            for (let rootFile of file.root.files) {
                files = files.concat(this.basicFieldChecker(rootFile, booleanQualifier, field));
            }
        } else {
            if (booleanQualifier(file, field, this.value)) {
                files.push(file);
            }
            if (file.files !== undefined) {
                for (let subFile of file.files) {
                    files = files.concat(this.basicFieldChecker(subFile, booleanQualifier, field));
                }
            }
        }
        return files;
    }

    inFolder(file, folderRegex) {
        let files = [];
        if (file.profile !== undefined) {
            for (let rootFile of file.root.files) {
                files = files.concat(this.inFolder(rootFile, folderRegex));
            }
        } else {
            if (file.files !== undefined && (new RegExp(folderRegex, 'i')).test(file.name)) {
                for (let subFile of file.files) {
                    files = files.concat(this.listFromFileTree(subFile));
                }
            } else {
                if (file.files !== undefined) {
                    for (let subFile of file.files) {
                        files = files.concat(this.inFolder(subFile, folderRegex));
                    }
                }
            }
        }
        return files;
    }
    notInFolder(file, folderRegex) {
        let files = [];
        if (file.profile !== undefined) {
            for (let rootFile of file.root.files) {
                files = files.concat(this.notInFolder(rootFile, folderRegex));
            }
        } else {
            files.push(file);
            if (!(file.files !== undefined && (new RegExp(folderRegex, 'i')).test(file.name))) {
                for (let subFile of file.files) {
                    files = files.concat(this.notInFolder(subFile));
                }
            }
        }
        return files;
    }
    
    listFromFileTree(file) {
        let files = [];
        files.push(file);
        if (file.files !== undefined) {
            for (let subFiles of file.files) {
                files = files.concat(this.listFromFileTree(subFiles));
            }
        }
        return files;
    }

    hasAccess(file, accessType, user, writableRoles, userLoggedIn) { 
        let files = [];
        if (file.profile !== undefined) {
            let validEntities = [user.toLowerCase()];
            if(this.groupsOn){
                for(let gsnap of this.groupSnapshots){
                    if(gsnap.members.includes(user)){
                        validEntities.push(gsnap.groupEmail);
                        validEntities.push(gsnap.name);
                    }
                }
            }
            for (let rootFile of file.root.files) {
                files = files.concat(this.hasAccess(rootFile, accessType, validEntities, writableRoles, userLoggedIn));
            }
        } else {
            if (file.permissions.length === 0 && accessType === 'read' && user === userLoggedIn) { 
                files.push(file);
            }
            for (let permission of file.permissions) {
                if (user.includes(permission.entity.toLowerCase())) {
                    if((accessType === 'read') || (accessType === 'write' && writableRoles.includes(permission.role))){
                        files.push(file);
                        break;
                    }
                }
            }
            if (file.files !== undefined) {
                for (let subFile of file.files) {
                    files = files.concat(this.hasAccess(subFile, accessType, user, writableRoles, userLoggedIn));
                }
            }
        }
        return files;
    }
    noAccess(file, accessType, user, writableRoles) {
        let files = [];
        if (file.profile !== undefined) {
            let validEntities = [user.toLowerCase()];
            if(this.groupsOn){
                for(let gsnap of this.groupSnapshots){
                    if(gsnap.members.includes(user)){
                        validEntities.push(gsnap.groupEmail);
                        validEntities.push(gsnap.name);
                    }
                }
            }   
            for (let rootFile of file.root.files) {
                files = files.concat(this.noAccess(rootFile, accessType, validEntities, writableRoles));
            }
        } else {
            let canPush = true;
            for (let permission of file.permissions) {
                if (user.includes(permission.entity.toLowerCase())) {
                    if((accessType === 'read') || (accessType === 'write' && writableRoles.includes(permission.role))){
                    canPush = false;
                    break;
                    }
                }
            }
            if (canPush) {
                files.push(file);
            }
            if (file.files !== undefined) {
                for (let subFile of file.files) {
                    files = files.concat(this.noAccess(subFile, accessType, user, writableRoles));
                }
            }
        }
        return files;
    }

    to(file, user) {
        let files = [];
        if (file.profile !== undefined) {
            for (let rootFile of file.root.files) {
                files = files.concat(this.to(rootFile, user));
            }
        } else {
            for (let permission of file.permissions) {
                if (permission.entity.toLowerCase() === user.toLowerCase() && !permission.isInherited) {
                    files.push(file);
                    break;
                }
            }
            if (file.files !== undefined) {
                for (let subFile of file.files) {
                    files = files.concat(this.to(subFile, user));
                }
            }
        }
        return files;
    }

    notTo(file, user) {
        let files = [];
        if(file.profile !== undefined) {
            for (let rootFile of file.root.files) {
                files = files.concat(this.notTo(rootFile, user));
            }
        } else {
            let canPush = true;
            for (let permission of file.permissions) {
                if (permission.entity.toLowerCase() === user.toLowerCase() && !permission.isInherited) {
                    canPush = false;
                    break;
                }
            }
            if (canPush) {
                files.push(file);
            }
            if (file.files !== undefined) {
                for (let subFile of file.files) {
                    files = files.concat(this.notTo(subFile, user));
                }
            }
        }
        return files;
    }
    
    noneSharing(file, email) {
        let files = [];
        if (file.profile !== undefined) {
            for (let rootFile of file.root.files) {
                files = files.concat(this.noneSharing(rootFile, email));
            }
        } else {
            if (file.permissions.length === 1) {
                if (file.permissions[0].entity === email) {
                    files.push(file);
                }
            }
            if (file.files !== undefined) {
                for (let subFile of file.files) {
                    files = files.concat(this.noneSharing(subFile, email));
                }
            }
        }
        return files;
    }

    notNoneSharing(file) {
        let files = [];
        if (file.profile !== undefined) {
            for (let rootFile of file.root.files) {
                files = files.concat(this.notNoneSharing(rootFile));
            }
        } else {
            if (file.permissions.length !== 1) { 
                files.push(file);
            }
            if (file.files !== undefined) {
                for(let subFile of file.files) {
                    files = files.concat(this.notNoneSharing(subFile));
                }
            }
        }
        return files;
    }

    userSharing(file, user) { 
        let files = [];
        if (file.profile !== undefined) {
            let validEntities = [user.toLowerCase()];
            if(this.groupsOn){
                for(let gsnap of this.groupSnapshots){
                    if(gsnap.members.includes(user)){
                        validEntities.push(gsnap.groupEmail);
                        validEntities.push(gsnap.name);
                        
                    }
                }
            }  
            for (let rootFile of file.root.files) {
                files = files.concat(this.userSharing(rootFile, validEntities));
            }
        } else {
            for (let permission of file.permissions) {
                if (user.includes(permission.entity.toLowerCase())) {
                    files.push(file);
                    break;
                }
            }
            if (file.files !== undefined) {
                for (let subFile of file.files) {
                    files = files.concat(this.userSharing(subFile, user));
                }
            }
        }
        return files;
    }

    notUserSharing(file, user) {
        let files = [];
        if (file.profile !== undefined) {
            let validEntities = [user.toLowerCase()];
            if(this.groupsOn){
                for(let gsnap of this.groupSnapshots){
                    if(gsnap.members.includes(user)){
                        validEntities.push(gsnap.groupEmail);
                        validEntities.push(gsnap.name);
                    }
                }
            }  
            for (let rootFile of file.root.files) {
                files = files.concat(this.notUserSharing(rootFile, validEntities));
            }
        } else {
            let canPush = true;
            for (let permission of file.permissions) {
                if (user.includes(permission.entity.toLowerCase())) {
                    canPush = false;
                    break;
                }
            }
            if (canPush) {
                files.push(file);
            }
            if (file.files !== undefined) {
                for (let subFile of file.files) {
                    files = files.concat(this.notUserSharing(subFile, user));
                }
            }
        }
        return files;
    }

    shareable(file, user) { 
        let files = [];
        if (file.profile !== undefined) {// is snapshot
            let validEntities = [user.toLowerCase()];
            if(this.groupsOn){
                for(let gsnap of this.groupSnapshots){
                    if(gsnap.members.includes(user)){
                        validEntities.push(gsnap.groupEmail);
                        validEntities.push(gsnap.name);
                    }
                }
            }  
            for (let rootFile of file.root.files) {
                files = files.concat(this.shareable(rootFile, validEntities));
            }
        } else {
            for (let permission of file.permissions) {
                if (user.includes(permission.entity.toLowerCase()) && permission.canShare) {
                    files.push(file);
                    break;
                }
            }
            if (file.files !== undefined) {
                for (let subFile of file.files) {
                    files = files.concat(this.shareable(subFile, user));
                }
            }
        }
        return files;
    }

    notShareable(file, user) {
        let files = [];
        if (file.profile !== undefined) {
            let validEntities = [user.toLowerCase()];
            if(this.groupsOn){
                for(let gsnap of this.groupSnapshots){
                    if(gsnap.members.includes(user)){
                        validEntities.push(gsnap.groupEmail);
                        validEntities.push(gsnap.name);
                    }
                }
            }  
            for (let rootFile of file.root.files) {
                files = files.concat(this.notShareable(rootFile, validEntities));
            }
        } else {
            let canPush = true;
            for (let permission of file.permissions) {
                if (user.includes(permission.entity.toLowerCase()) && permission.canShare) {
                    canPush = false;
                    break;
                }
            }
            if (canPush) {
                files.push(file);
            }
            if (file.files !== undefined) {
                for (let subFile of file.files) {
                    files = files.concat(this.notShareable(subFile, user));
                }
            }
        }
        return files;
    }
}
