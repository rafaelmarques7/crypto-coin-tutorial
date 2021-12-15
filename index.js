"use strict";
const crypto = require("crypto");
class Transaction {
    constructor(from, to, ammount) {
        this.from = from;
        this.to = to;
        this.ammount = ammount;
    }
}
