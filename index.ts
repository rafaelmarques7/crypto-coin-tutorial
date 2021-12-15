import * as crypto from "crypto";

class Transaction {
    constructor(
        public from: string, 
        public to: string, 
        public ammount: number
    ) {}
}

class Block {
    constructor(
        public previousHash: string,
        public transaction: Transaction,
        public date = Date.now(),
        // public nonce: number, 
    ) {}
}

class Chain {
    // there can only be one chain - singleton 
    public static instance = new Chain()

    chain: Block[]

    constructor() {
        this.chain = [
            // Genesis block
            new Block("", new Transaction("Genesis", "Satoshi", 100))
        ]
    }

    addBlock() {
        return
    }
}

class Wallet {
    public publicKey: string
    public privateKey: string

    constructor() {
        const keyPair = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        })

        this.publicKey = keyPair.publicKey
        this.privateKey = keyPair.privateKey
    }
}