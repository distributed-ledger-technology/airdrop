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
    private airdropAmountPerRecipient: BigInt = BigInt(0)
    private walletofSender: string = "0x5A8639f5Fd6EA11d81b4215c4ca47775bD761dC5" // enter here the wallet address of the sender

    public constructor(providerURL: string, private currencyContractAddress: string, currencyContractABI: any, private amountPerRecipient: number, private privateKeySender: string) {
        this.web3 = new Web3(new Web3.providers.WebsocketProvider(providerURL))
        this.web3.eth.defaultCommon = new Common({ chain: "ropsten" })
        this.currencyContract = new this.web3.eth.Contract(currencyContractABI, currencyContractAddress)
    }

    public async executeAirdrop(recipients: string[]): Promise<void> {
        
        this.decimals = await this.currencyContract.methods.decimals().call() 
        this.airdropAmountPerRecipient = BigInt(this.amountPerRecipient * 10**this.decimals) // multiply the amount by 10**decimals to transfer the correct amount
                
        this.balanceOfSender = (await this.currencyContract.methods.balanceOf(this.walletofSender).call()) / 10 ** this.decimals
        this.currencyName = await this.currencyContract.methods.name().call()
        
        // get the transaction count
        var noncePreviousTAOfSender = await this.web3.eth.getTransactionCount(this.walletofSender)

        for (const recipient of recipients) {
            
            console.log(`sender has: ${this.balanceOfSender} ${this.currencyName}s`)
            
            // calculation of the gasestimation for the transaction for every single recipient
            const gasEstimationForTransaction = await (this.currencyContract.methods.transfer(recipient, this.airdropAmountPerRecipient)).estimateGas({ from: this.walletofSender })
            console.log(`gasEstimation: ${gasEstimationForTransaction}`)

            const medianGasPricePreviousBlocks = Number(await this.web3.eth.getGasPrice())

            console.log(`medianGasPricePreviousBlocks: ${medianGasPricePreviousBlocks}`)
            await this.transferAirdropAmount(recipient, gasEstimationForTransaction, medianGasPricePreviousBlocks,noncePreviousTAOfSender)
            noncePreviousTAOfSender=noncePreviousTAOfSender+1 //increment the transaction count
        }   
    }

    private async transferAirdropAmount(recipient: string, gasEstimation: number, medianGasPricePreviousBlocks: number, noncePreviousTAOfSender: number) {

        console.log(`transferring ${this.amountPerRecipient} to ${recipient}`)

        const data = this.currencyContract.methods.transfer(recipient, this.airdropAmountPerRecipient).encodeABI();

        let rawTx = {
            "nonce": noncePreviousTAOfSender,
            "gasLimit": this.web3.utils.toHex(gasEstimation),
            "gasPrice": this.web3.utils.toHex(medianGasPricePreviousBlocks),
            "from": this.walletofSender,
            "to": this.currencyContractAddress, // send transaction to contract
            "value": "0x00",
            "data": data,
            "chainId": 3 // use ropsten testnet
        }
        console.log(rawTx)

        const signedTransaction = await this.web3.eth.accounts.signTransaction(rawTx, this.privateKeySender)
        console.log(`signed Transaction: `)
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

        return 0;
    }
}
