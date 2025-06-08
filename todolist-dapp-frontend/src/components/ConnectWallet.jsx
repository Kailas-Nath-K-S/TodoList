// src/components/ConnectWallet.jsx
import { useState } from "react";
import { ethers } from "ethers";

export default function ConnectWallet({ setWallet, setProvider }) {
  const [address, setAddress] = useState(null);

  const connect = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const addr = await signer.getAddress();

    setAddress(addr);
    setWallet(signer);
    setProvider(provider);
  };

  return (
    <div>
      {address ? (
        <p>Connected: {address}</p>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </div>
  );
}
