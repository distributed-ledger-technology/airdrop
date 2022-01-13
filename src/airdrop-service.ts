// https://ethereum.stackexchange.com/questions/23121/how-to-transfer-erc20-tokens-using-web3js

import Web3 from 'https://deno.land/x/web3/mod.ts'

// import _Common from 'https://jspm.dev/@ethereumjs/common'
// const Common = (_Common as any).default

// console.log(Common)

export class AirdropService {

    private web3: Web3
    private currencyContract: any
    private decimals: number = 0
    private balanceOfSender: number = 0
    private currencyName: number = 0


    public constructor(providerURL: string, currencyContractAddress: string, currencyContractABI: any, private airdropAmountPerRecipient: number, private privateKeySender: string) {
        this.web3 = new Web3(new Web3.providers.HttpProvider(providerURL))
        this.currencyContract = new this.web3.eth.Contract(currencyContractABI, currencyContractAddress)
        console.log(this.web3.eth.Contract)
    }

    public async executeAirdrop(recipients: string[]): Promise<void> {

        this.decimals = await this.currencyContract.methods.decimals().call()
        this.balanceOfSender = (await this.currencyContract.methods.balanceOf("0xa59a1e45a880504fc8a4D947702AaB6067DFEa71").call()) / 10 ** this.decimals
        this.currencyName = await this.currencyContract.methods.name().call()

        console.log(`sender has: ${this.balanceOfSender} ${this.currencyName}s`)
        const gasEstimationForTransaction = await (this.currencyContract.methods.transfer("0x1513D4cCaC767d9510947cd8A0411b3A8E2c31AF", 1)).estimateGas({ from: "0xa59a1e45a880504fc8a4D947702AaB6067DFEa71" })
        console.log(`gasEstimation: ${gasEstimationForTransaction}`)

        const medianGasPricePreviousBlocks = Number(await this.web3.eth.getGasPrice())

        console.log(`medianGasPricePreviousBlocks: ${medianGasPricePreviousBlocks}`)

        for (const recipient of recipients) {
            await this.transferAirdropAmount(recipient, gasEstimationForTransaction, medianGasPricePreviousBlocks)
            return
        }

    }

    private async transferAirdropAmount(recipient: string, gasEstimation: number, medianGasPricePreviousBlocks: number) {

        console.log(`transferring ${this.airdropAmountPerRecipient} to ${recipient}`)

        const data = this.currencyContract.methods.transfer(recipient, this.airdropAmountPerRecipient).encodeABI();

        // const gasEstimated = this.currencyContract.methods.transfer(recipient, this.airdropAmountPerRecipient).es();
        const noncePreviousTAOfSender = await this.web3.eth.getTransactionCount("0xa59a1e45a880504fc8a4D947702AaB6067DFEa71")

        // const commonInstance = new Common({ chain: { baseChain: "ropsten" as any, networkId: 3, customChain: { name: "ropsten" as any, networkId: 3, chainId: 3 } } })
        // const commonInstance = new Common({ networkId: 3, genesis: "genesis", hardforks: "hardforks", bootstrapNodes: "bootstrapNodes" })

        let rawTx = {
            "nonce": this.web3.utils.toHex(noncePreviousTAOfSender),
            "gasLimit": this.web3.utils.toHex(gasEstimation),
            "gasPrice": this.web3.utils.toHex(medianGasPricePreviousBlocks),
            "from": "0xa59a1e45a880504fc8a4D947702AaB6067DFEa71",
            "to": recipient,
            "value": "0x00",
            "data": data,
            "chainId": "0x3",
            // "common": commonInstance
        }
        // const tx = new Tx(rawTx)
        // tx.sign(this.privateKeySender)
        // let serializedTx = "0x" + tx.serialize().toString('hex');

        console.log(this.privateKeySender)
        console.log(rawTx)
        const signedTransaction = await this.web3.eth.accounts.sign(rawTx, this.privateKeySender)
        console.log(signedTransaction)

        // this.web3.eth.sendSignedTransaction(signedTransaction.transactionHash as string)
        //     .on('transactionHash', function (txHash) {
        //         console.log(`transactionHash event: ${txHash}`)
        //     }).on('receipt', function (receipt) {
        //         console.log("receipt:" + receipt);
        //     }).on('confirmation', function (confirmationNumber, receipt) {
        //         console.log("confirmationNumber:" + confirmationNumber + " receipt:" + receipt);
        //     }).on('error', function (error) {
        //         console.log(`the following error occurred: ${error}`)
        //     });

    }
}

