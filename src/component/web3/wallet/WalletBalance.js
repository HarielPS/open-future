"use client";
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

const WalletBalance = ({ walletAddress, decimals = 4 }) => {
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (window.ethereum && walletAddress) {
        const web3 = new Web3(window.ethereum);
        try {
          const balanceWei = await web3.eth.getBalance(walletAddress);
          const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
          setBalance(parseFloat(balanceEth).toFixed(decimals));
        } catch (error) {
          console.error("Error fetching balance:", error);
          setBalance(null);
        }
      }
    };

    fetchBalance();
  }, [walletAddress, decimals]);

  return (
    <div>
      {balance !== null ? `${balance} ETH` : 'Loading balance...'}
    </div>
  );
};

export default WalletBalance;
