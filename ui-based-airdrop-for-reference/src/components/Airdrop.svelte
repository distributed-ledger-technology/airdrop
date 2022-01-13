<script>
  import detectEthereumProvider from "https://cdn.skypack.dev/@metamask/detect-provider";
  import { onMount } from "svelte";
  // import Web3 from "https://deno.land/x/web3@v0.7.4/mod.ts";

  let provider;
  let hasBrowserWallet = false;
  let chainId = "";
  let message = "";
  let connectedAccount = "";

  let complete = false;

  const airdropRecipients = [
    "0x1513D4cCaC767d9510947cd8A0411b3A8E2c31AF",
    "0x944Cd9E2a19C84FA3DfbcFF7F0cbDAC5d335406c",
    "0x5ebde6A2B67274847F8B509B5e51adb0F1c17515",
    "0xF3BC6baD1F682e45D150E93e0446e1C05444BE0A",
    "0x7Ea947Cd95B262ee405634e9F745e144926b9Dc6",
    "0xBC789270f670b86cf438f722A7Ef8F4F87663053",
    "0xBc51b93F958763E6B3A765bF5165a4181CdE6679",
    "0x48568970C24a9eDD4C774C1d896719ba39F03117",
    "0xC0A243687218f11fF1B515c45697c7c459F1Bf75",
    "0x230144D7E750ec1bbCCa3b22fE993457C8d52e5B",
    "0xB5f5Ebf222Fa2Ae3Ca827E24BEFa7eB50Bf8a10F",
    "0x251D21e03E49174960F3230bDA31B83aaCB26969",
    "0xF9E854E7c18f0CE7c2f0EE994F4A8a0ff7157562",
    "0x7e5c8d73b1a5caF1F7Fe31DAbA41b8D310CC25Be",
    "0xF3BC6baD1F682e45D150E93e0446e1C05444BE0A",
    "0xDcDf541545F4A8E5FD6A996E911246A4267A9D51",
    "0x8CAc96dfe186231fa965193FE2537296bA79FCF6",
    "0xa6306C28AF7aaB9E052faAFB27CBa729811EbcA0",
    "0x20a156521EEC90eafAE8Ed1342dB4d9f8E270B21",
    "0x3B98f143f7b521646DF42A847F9d0cAE2C299eF7",
    "0xFC0Cc4e4E913cd95c3980F2ec2Cb72287aaedaCD",
    "0x96FD355847401D77c6F00be4663DAC5C47eeE94E",
    "0xa572f251DDF9E56F6217CF1c337b245B004F7fB3",
    "0xD0E879Dd9F37aD2db610D424Af4450c69001c0ba",
  ];

  onMount(async () => {
    provider = await detectEthereumProvider();

    if (provider) {
      // hasBrowserWallet = provider.isConnected(); // potentially obsolete
      hasBrowserWallet = true;
      chainId = await provider.request({
        method: "eth_chainId",
      });
      provider
        .request({ method: "eth_accounts" })
        .then(handleAccountsChanged)
        .catch((err) => {
          console.error(err);
        });
    } else {
      message = `In order to use this service, you need an Ethereum Browserwallet.`;
    }
    complete = true;

    provider.on("accountsChanged", handleAccountsChanged); // emitted also on page load.
    provider.on("chainChanged", (chainId) => window.location.reload());
  });

  function handleAccountsChanged(accounts) {
    connectedAccount = accounts;
    console.log(JSON.stringify(accounts));
  }

  function connect() {
    provider
      .request({ method: "eth_requestAccounts" })
      .then(handleAccountsChanged)
      .catch((err) => {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log("Please connect to MetaMask.");
        } else {
          console.error(err);
        }
      });
  }

  async function send(recipient) {
    alert(`sending 1 MANN to ${recipient}`);

    const data = this.currencyContract.methods
      .transfer(recipient, this.airdropAmountPerRecipient)
      .encodeABI();

    const transactionParameters = {
      nonce: "0x00", // ignored by MetaMask
      gasPrice: "0x182142c4e", // customizable by user during MetaMask confirmation.
      gas: "0x21000", // customizable by user during MetaMask confirmation.
      // gasLimit: "0xcc60",
      to: recipient, // Required except during contract publications.
      from: ethereum.selectedAddress, // must match user's active address.
      value: "0x00", // Only required to send ether to the recipient from the initiating external account.
      data: "0x7f7465737432000000000000000000000000000000000000000000000000000000600057", // Optional, but used for defining smart contract creation and interaction.
      chainId: "0x3", // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
    };

    const txHash = await ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });

    alert(`txHash: ${txHash}`);
  }
</script>

<div id="metamask">
  <h4>Optimize Metamask Interaction</h4>
  {#if message === ""}
    <table>
      <tr>
        <th>Has Browserwallet</th>
        <th>chainId</th>
        <th>connectedAccount</th>
        <th>Mannheim Coin Balance</th>
      </tr>

      <td>
        {hasBrowserWallet}
      </td>
      <td>
        {chainId}
      </td>
      <td>
        <a
          href="https://etherscan.io/address/{connectedAccount}"
          target="_blank"
        >
          {connectedAccount}
        </a>
      </td>
      <td> 2 MANN </td>
    </table>

    <h1>Recipients</h1>

    <table>
      <tr>
        <th> Recipient Wallet Address </th>
        <th> Action </th>
      </tr>

      {#each airdropRecipients as recipient}
        <tr>
          <td> {recipient} </td>
          <td>
            <button on:click={() => send(recipient)}>
              Send Airdrop Amount
            </button>
          </td>
        </tr>
      {/each}
    </table>
  {:else}
    {message}
    <p />
    Option 1: Use
    <a href="https://brave.com" target="_blank">https://brave.com</a>
    <p />
    Option 2: Use
    <a href="https://metamask.io" target="_blank">https://metamask.io</a>
  {/if}

  <p />

  {#if connectedAccount == "" && complete && hasBrowserWallet}
    <button on:click={connect}>Connect To Your Browserwallet</button>
  {/if}

  <!-- <button on:click={disconnect}>Disconnect From Browserwallet </button> -->
</div>

<style>
  table {
    font-family: arial, sans-serif;
    border-collapse: collapse;
    width: 100%;
  }

  td,
  th {
    border: 1px solid #dddddd;
    text-align: left;
    padding: 8px;
  }

  tr:nth-child(even) {
    background-color: #dddddd;
  }

  button {
    text-align: center;
  }
  #metamask {
    text-align: center;
  }
</style>
