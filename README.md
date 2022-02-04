# Airdrop

This module allows you to launch airdrops.

## Usage Example
The following example airdrop drops [1 MannheimCoin on Ropsten](https://ropsten.etherscan.io/address/0x7910f84868488da3377833ccaa0e5b2b42edd9a6) to each recipient.
```sh
deno run --allow-net example-airdrops/launch-airdrop-for-wwi19seb.ts <your provider url - e.g. from infura.io or via an own ethereum node> <your privateKey of the Wallet>
```

## Background Info for Solidity Smart Contract Newbies
The solidity smart contract which defines the ERC20 based MannheimCoin Currency looks as follows: 

```sol
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 < 0.9.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.4/contracts/token/ERC20/ERC20.sol";

contract MannheimCoin is ERC20 { 
    
    constructor () ERC20("MannheimCoin", "MANN") { 
        _mint(msg.sender, 2000*10**18);
    }
    
}
```  

This smart contract was developed and deployed to [Ropsten](https://ropsten.etherscan.io/address/0x7910f84868488da3377833ccaa0e5b2b42edd9a6) using the [remix online IDE](https://remix.ethereum.org/)


## Contributions are Welcome
Feel free to raise issues and to open Pull Requests.