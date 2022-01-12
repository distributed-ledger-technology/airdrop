// https://ethereum.stackexchange.com/questions/23121/how-to-transfer-erc20-tokens-using-web3js

import Web3 from 'https://deno.land/x/web3/mod.ts'

export class AirdropService {

    private web3: Web3
    private currencyContract: any
    private decimals: number = 0
    private balanceOfSender: number = 0
    private currencyName: number = 0


    public constructor(providerURL: string, currencyContractAddress: string, currencyContractABI: any, private airdropAmountPerRecipient: number) {
        this.web3 = new Web3(new Web3.providers.HttpProvider(providerURL))
        this.currencyContract = new this.web3.eth.Contract(currencyContractABI, currencyContractAddress)
    }

    public async executeAirdrop(recipients: string[]): Promise<void> {

        this.decimals = await this.currencyContract.methods.decimals().call()
        this.balanceOfSender = (await this.currencyContract.methods.balanceOf("0xa59a1e45a880504fc8a4D947702AaB6067DFEa71").call()) / 10 ** this.decimals
        this.currencyName = await this.currencyContract.methods.name().call()

        console.log(`sender has: ${this.balanceOfSender} ${this.currencyName}s`)

        for (const recipient of recipients) {
            await this.transferAirdropAmount(recipient)
        }

    }

    private async transferAirdropAmount(recipient: string) {

        console.log(`transferring ${this.airdropAmountPerRecipient} to ${recipient}`)

        let data = this.currencyContract.methods.transfer(recipient, this.airdropAmountPerRecipient).encodeABI();

        // let rawTx = {
        //     "nonce": this.web3.utils.toHex(nonce),
        //     "gasPrice": "0x3b9aca00",
        //     "gasLimit": this.web3.utils.toHex(gasLimit),
        //     "to": contractAddress,
        //     "value": "0x00",
        //     "data": data,
        // }
        // const tx = new Tx(rawTx)
        // tx.sign(privateKey)
        // let serializedTx = "0x" + tx.serialize().toString('hex');
        // web3.eth.sendSignedTransaction(serializedTx).on('transactionHash', function (txHash) {

        // }).on('receipt', function (receipt) {
        //     console.log("receipt:" + receipt);
        // }).on('confirmation', function (confirmationNumber, receipt) {
        //     //console.log("confirmationNumber:" + confirmationNumber + " receipt:" + receipt);
        // }).on('error', function (error) {

        // });

    }
}

