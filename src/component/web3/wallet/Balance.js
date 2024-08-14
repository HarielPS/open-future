"use client";
import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import Web3 from 'web3';

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
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeWeb3 = async () => {
      const storedAccount = localStorage.getItem('connectedWalletAddress');
      if (storedAccount) {
        setAccount(storedAccount);
      }
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        try {
          await fetchNetworkAndBalance(web3Instance, storedAccount);
          window.ethereum.on('chainChanged', async (chainId) => {
            await fetchNetworkAndBalance(web3Instance, storedAccount);
          });
        } catch (err) {
          console.error('Failed to fetch network and balance:', err);
          setError('Unable to retrieve wallet information. Please ensure your wallet is unlocked.');
        }
      } else {
        console.log('No Ethereum provider found. Install MetaMask.');
        setError('No Ethereum provider found. Please install MetaMask.');
      }
    };
    initializeWeb3();
  }, []);

  const fetchNetworkAndBalance = async (web3Instance, account) => {
    if (web3Instance && account) {
      try {
        const chainId = await web3Instance.eth.getChainId();
        const networkDetails = await getNetworkDetails(chainId);
        const balanceWei = await web3Instance.eth.getBalance(account);
        const balanceEth = web3Instance.utils.fromWei(balanceWei, 'ether');

        setNetwork(`${networkDetails.name} (Chain ID: ${chainId})`);
        setBalance(balanceEth);
        setCurrency(networkDetails.currency);
      } catch (err) {
        console.error('Error fetching chain ID or balance:', err);
        setError('Unable to retrieve wallet information. Please ensure your wallet is unlocked.');
      }
    } else {
      setError('No account or web3 instance available.');
    }
  };

  return (
    <Box>
      {error ? (
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      ) : (
        <>
          <Typography variant="body1">
            <strong>Red: </strong>{network}
          </Typography>
          <Typography variant="body1">
            <strong>Saldo: </strong>{balance} {currency}
          </Typography>
        </>
      )}
    </Box>
  );
};

export default NetworkAndBalance;
