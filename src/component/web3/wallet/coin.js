"use client";
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import Web3 from 'web3';

// Function to fetch network details from the API
const getNetworkDetails = async (chainId) => {
  try {
    const response = await fetch(`/api/component/getChain?chainId=${chainId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const chain = await response.json();
    return {
      name: chain.name,
      currency: chain.nativeCurrency.symbol,
    };
  } catch (error) {
    console.error('Error fetching network details:', error);
    return {
      name: 'Unknown Network',
      currency: 'Unknown Currency',
    };
  }
};

const NetworkAndBalance = () => {
  const [network, setNetwork] = useState(null);
  const [balance, setBalance] = useState(null);
  const [currency, setCurrency] = useState('ETH');
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const storedAccount = localStorage.getItem('connectedWalletAddress');
    if (storedAccount) {
      setAccount(storedAccount);
    }
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      // Detect network change
      window.ethereum.on('chainChanged', (chainId) => {
        fetchNetworkAndBalance(web3Instance, storedAccount);
      });
    } else {
      console.log('No Ethereum provider found. Install MetaMask.');
    }
  }, []);

  const fetchNetworkAndBalance = async (web3Instance, account) => {
    if (web3Instance && account) {
      const chainId = await web3Instance.eth.getChainId();
      console.log("Current Chain ID:", chainId);
      const networkDetails = await getNetworkDetails(chainId);
      const balanceWei = await web3Instance.eth.getBalance(account);
      const balanceEth = web3Instance.utils.fromWei(balanceWei, 'ether');

      console.log("Account Balance (ETH):", balanceEth);

      setNetwork(`${networkDetails.name} (Chain ID: ${chainId})`);
      setBalance(balanceEth);
      setCurrency(networkDetails.currency);
    }
  };

  const handleCheckBalance = () => {
    if (web3 && account) {
      fetchNetworkAndBalance(web3, account);
    } else {
      console.log('Web3 or account not initialized');
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>Información de la Wallet</Typography>
      <Button variant="contained" color="primary" onClick={handleCheckBalance}>
        Verificar Saldo
      </Button>
      <Typography variant="body1">
        <strong>Red: </strong>{network}
      </Typography>
      <Typography variant="body1">
        <strong>Saldo: </strong>{balance} {currency}
      </Typography>
    </Box>
  );
};

export default NetworkAndBalance;
