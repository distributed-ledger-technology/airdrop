
import { BlockchainCoin } from "../example-abis/ropsten-0xe7a4d8cb7de17e35761e870ca0f400b9946320f7.ts"
import { AirdropService } from "../src/airdrop-service.ts";

const airdropRecipients = [ // add here the Recipients
    "0xf0b879971550AC2a3A387A9DBb7CB3b7e2140903",
    "0x24AC756bA28242d082b56bd477628c4B5B5D80f2",
    "0x4eDb96bEDBe08d562A24B92336a7183fC83b8665",
    "0xBB2C72DFD6fd787FC0E3FddC1ddB7066A0B9B796",
]

const providerURL = Deno.args[0]
const privateKeySender = Deno.args[1]
const airdropService = new AirdropService(providerURL, "0xe7a4d8cb7de17e35761e870ca0f400b9946320f7", BlockchainCoin, 1 /*The Amount of 1 is one Coin*/, privateKeySender)

await airdropService.executeAirdrop(airdropRecipients)
