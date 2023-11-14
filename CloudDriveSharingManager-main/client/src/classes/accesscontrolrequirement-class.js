class AccessControlRequirement {
    constructor (profile,query, AR, AW, DR, DW, grp) {
        this.profile = profile;
        this.query = query;
        this.allowedReaders = AR;
        this.allowedWriters = AW;
        this.deniedReaders = DR;
        this.deniedWriters = DW;
        this.grp = grp
    }
}

module.exports = AccessControlRequirement;
