class Query {
    constructor(queryString, snapshot, operators) {
        this.queryString = queryString;
        this.snapshot = snapshot;
        this.operators = operators;
    }

    parse(queryString) {
        return null;
    }

    run() {
        return null;
    }
}

module.exports = Query;
