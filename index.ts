import * as crypto from "crypto";

const minerData = {
    algorithm: "SHA256",
    lengthBinary: 256,
    powLength: 16,
}

function hexToBinary(hex: string, expectedLength: number) {
    // convert to binary
    // use BigInt library, because any number larger than 9*10^15 will be truncated by javascript
    let bin = BigInt("0x" + hex).toString(2)
    
    // add leading zeros if the binary is not of the expected length
    const numBytesMissing = expectedLength - bin.length
    if (numBytesMissing > 0) {
        bin = "0".repeat(numBytesMissing) + bin
    }
    return bin
}

class Transaction {
    constructor(
        public from: string, 
        public to: string, 
        public ammount: number
    ) {}

    toString() {
        return JSON.stringify(this)
    }
}

class Block {
    constructor(
        public previousHash: string,
        public transaction: Transaction,
        public date = Date.now(),
        public nonce = 0 // this will be updated by the mine function
    ) {}

    get header() {
        // return all fields except the nonce
        return {
            previousHash: this.previousHash,
            transaction: this.transaction,
            date: this.date,
        }
    }

    get hash() {
        const blockStr = JSON.stringify(this.header)
        const hash = crypto.createHash("SHA256")
        hash.update(blockStr).end()

        return hash.digest('hex')
    }

    /**
     * Mining works by trying to find a nonce, so that
     * when you hash the combination of the block headerer and the nonce
     * you get a hash with meets a certain criteria 
     * (the criteria is usually a hash that contains a number of trailing zero's)
     * @returns 
     */
    mine() {
        let nonce = 0
        console.log("⛏️ Mining...")

        while (true) {
            // generate hash based on block header and nonce
            const dataToHash = JSON.stringify(this.header) + nonce.toString()
            const hashHex = crypto.createHash(minerData.algorithm).update(dataToHash).digest('hex')
            const hashBinary = hexToBinary(hashHex, minerData.lengthBinary)

            // check if hash passes the mining condition
            if (this.isValidProofOfWork(hashBinary)) {
                console.log(`Found solution, nonce: ${nonce}`)
                this.nonce = nonce
                return
            }
            nonce += 1
        }
    }

    /**
     * Checks if the binary hash starts with a given number of zero's (set by the minerData.powLength)
     * @param hashBinary - string
     * @returns true if it does, false if it does not
     */
    isValidProofOfWork(hashBinary: string) {
        return hashBinary.substring(0, minerData.powLength) === "0".repeat(minerData.powLength)
    }
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

    get lastBlock() {
        return this.chain[this.chain.length-1]
    }

    addBlock(transaction: Transaction, payerPublicKey: string, signature: Buffer) {
        // generate a signature verifier based on the SHA256 algorithm and transaction data
        const verifier = crypto.createVerify("SHA256")
        verifier.update(transaction.toString())

        // verify that the signature was generated by the owner of the payerPublicKey
        const isValidSignature = verifier.verify(payerPublicKey, signature)

        // generate new block only if signature is valid
        if (isValidSignature) {
            const prevHash = this.lastBlock.hash
            const newBlock = new Block(prevHash, transaction)
            newBlock.mine()
            this.chain.push(newBlock)
        }
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

    sendMoney(ammount: number, payeePublicKey: string) {
        const transaction = new Transaction(this.publicKey, payeePublicKey, ammount)
        
        // create a signature based on the transaction data using SHA256 algorithm
        const sign = crypto.createSign('SHA256')
        sign.update(transaction.toString()).end() 

        // sign the transaction using the private key
        const signature = sign.sign(this.privateKey)

        // add transaction to block chain
        Chain.instance.addBlock(transaction, this.publicKey, signature)
    }
}

// Example usage
const satoshi = new Wallet()
const raf = new Wallet()
const lucy = new Wallet()

console.log(Chain.instance)

satoshi.sendMoney(50, raf.publicKey)
raf.sendMoney(25, lucy.publicKey)
lucy.sendMoney(10, satoshi.publicKey)

console.log(Chain.instance)
