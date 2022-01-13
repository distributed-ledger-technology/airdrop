<script>
  import detectEthereumProvider from "https://cdn.skypack.dev/@metamask/detect-provider";
  import { onMount } from "svelte";

  let provider;
  let hasBrowserWallet = false;
  let chainId = "";
  let message = "";
  let connectedAccount = "";

  let complete = false;

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

  async function approve() {
    alert(`approving dai`);

    const transactionParameters = {
      nonce: "0x00", // ignored by MetaMask
      gasPrice: "0x09184e72a000", // customizable by user during MetaMask confirmation.
      gas: "0x2710", // customizable by user during MetaMask confirmation.
      to: "0x0000000000000000000000000000000000000000", // Required except during contract publications.
      from: ethereum.selectedAddress, // must match user's active address.
      value: "0x00", // Only required to send ether to the recipient from the initiating external account.
      data: "0x7f7465737432000000000000000000000000000000000000000000000000000000600057", // Optional, but used for defining smart contract creation and interaction.
      chainId: "0x3", // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
    };

    // txHash is a hex string
    // As with any RPC call, it may throw an error
    const txHash = await ethereum.request({
      method: "approve",
      params: [transactionParameters],
    });
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
