// https://ethereum.stackexchange.com/questions/23121/how-to-transfer-erc20-tokens-using-web3js

import Web3 from 'https://deno.land/x/web3/mod.ts'

import _Common from 'https://jspm.dev/@ethereumjs/common'
const Common = (_Common as any).default

export class AirdropService {

    private web3: Web3
    private currencyContract: any
    private decimals: number = 0
    private balanceOfSender: number = 0
    private currencyName: number = 0


    public constructor(providerURL: string, private currencyContractAddress: string, currencyContractABI: any, private airdropAmountPerRecipient: number, private privateKeySender: string) {
        this.web3 = new Web3(new Web3.providers.HttpProvider(providerURL))
        this.web3.eth.defaultCommon = new Common({ chain: "ropsten" })
        this.currencyContract = new this.web3.eth.Contract(currencyContractABI, currencyContractAddress)
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

        let rawTx = {
            "nonce": noncePreviousTAOfSender,
            "gasLimit": this.web3.utils.toHex(gasEstimation),
            "gasPrice": this.web3.utils.toHex(medianGasPricePreviousBlocks),
            "from": "0xa59a1e45a880504fc8a4D947702AaB6067DFEa71",
            "to": this.currencyContractAddress, // send transaction to contract
            "value": "0x00",
            "data": data,
            "chainId": 3 // use ropsten testnet
        }
        console.log(rawTx)

        const signedTransaction = await this.web3.eth.accounts.signTransaction(rawTx, this.privateKeySender)
        console.log(signedTransaction)

        this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction as string)
            .on('transactionHash', function (txHash) {
                console.log(`transactionHash event: ${txHash}`)
            }).on('receipt', function (receipt) {
                console.log("receipt:" + JSON.stringify(receipt));
            }).on('confirmation', function (confirmationNumber, receipt) {
                console.log("confirmationNumber:" + confirmationNumber + " receipt:" + JSON.stringify(receipt));
            }).on('error', function (error) {
                console.log(`the following error occurred: ${error}`)
            });
    }
}
