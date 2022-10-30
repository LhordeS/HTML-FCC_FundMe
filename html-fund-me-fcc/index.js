import { ethers } from "./ethers-5.4.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectBtn = document.getElementById("connectButton");
const fundBtn = document.getElementById("fundButton");
const balanceBtn = document.getElementById("balanceButton");
const withdrawBtn = document.getElementById("withdrawButton");
connectBtn.onclick = connect;
fundBtn.onclick = fund;
balanceBtn.onclick = getBalance;
withdrawBtn.onclick = withdraw;

console.log(ethers);

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    connectBtn.innerHTML = "Connected!";
  } else {
    //   const message = document.createElement("h4");
    //     message.textContent = "Please install Metamask!";
    //     document.append(message);
    connectBtn.innerHTML = "Please install Metamask";
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(`Contract balance: ${ethers.utils.formatEther(balance)}`);
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      //listen for tx to finish
      await listenforTransactionMine(transactionResponse, provider);
      console.log(`Account funded with ${ethAmount} ETH`);
    } catch (error) {
      console.error(error);
    }
  }
}

async function withdraw() {
  if (typeof window.ethereum != "undefined") {
    console.log("Withdrawing all...");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenforTransactionMine(transactionResponse, provider);
      console.log("Funds sucessfully withdrawn!");
    } catch (error) {
      console.error(error, "You suck!");
    }
  }
}

function listenforTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  //listen for transaction to finish
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}
