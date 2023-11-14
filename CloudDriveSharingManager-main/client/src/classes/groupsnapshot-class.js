class GroupSnapshot {
    constructor(profile, members, groupEmail, timestamp, name) {
        this.profile = profile;
        this.members = members;
        this.groupEmail = groupEmail;
        this.timestamp = timestamp;
        this.name = name;
    }
}

module.exports = GroupSnapshot;
