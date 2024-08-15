"use client";
import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Button, Divider } from '@mui/material';
import Web3 from 'web3';

const wallets = [
  {
    name: 'MetaMask',
    icon: '/wallets/metamask.svg',
    check: () => window.ethereum && (window.ethereum.isMetaMask || (window.ethereum.providers && window.ethereum.providers.some(provider => provider.isMetaMask))),
  },
  {
    name: 'Coinbase Wallet',
    icon: '/wallets/coinbase.svg',
    check: () => window.ethereum && (window.ethereum.isCoinbaseWallet || (window.ethereum.providers && window.ethereum.providers.some(provider => provider.isCoinbaseWallet))),
  },
  {
    name: 'Trust Wallet',
    icon: '/wallets/Trust.svg',
    check: () => window.ethereum && (window.ethereum.isTrust || (window.ethereum.providers && window.ethereum.providers.some(provider => provider.isTrust))),
  },
  {
    name: 'OKX Wallet',
    icon: '/wallets/okx.svg',
    check: () => window.ethereum && (window.ethereum.isOkxWallet || (window.ethereum.providers && window.ethereum.providers.some(provider => provider.isOkxWallet))),
  },
  {
    name: 'Bitget Wallet',
    icon: '/wallets/bitget.svg',
    check: () => window.ethereum && (window.ethereum.isBitgetWallet || (window.ethereum.providers && window.ethereum.providers.some(provider => provider.isBitgetWallet))),
  },
  {
    name: 'TokenPocket',
    icon: '/wallets/TP.svg',
    check: () => window.ethereum && (window.ethereum.isTokenPocket || (window.ethereum.providers && window.ethereum.providers.some(provider => provider.isTokenPocket))),
  },
  {
    name: 'XDEFI Wallet',
    icon: '/wallets/xdefi.svg',
    check: () => window.ethereum && (window.ethereum.isXDEFI || (window.ethereum.providers && window.ethereum.providers.some(provider => provider.isXDEFI))),
  },
  {
    name: 'Frontier Wallet',
    icon: '/wallets/frontier.svg',
    check: () => window.ethereum && (window.ethereum.isFrontier || (window.ethereum.providers && window.ethereum.providers.some(provider => provider.isFrontier))),
  },
  {
    name: 'Coin98 Wallet',
    icon: '/wallets/Coin98.svg',
    check: () => window.ethereum && (window.ethereum.isCoin98 || (window.ethereum.providers && window.ethereum.providers.some(provider => provider.isCoin98))),
  },
];

const WalletConnect = ({ onWalletConnected }) => {
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [selectedWallet, setSelectedWallet] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
    } else {
      console.log('No Ethereum provider found. Install MetaMask.');
    }
  }, []);

  const getProvider = (wallet) => {
    if (window.ethereum.providers && window.ethereum.providers.length) {
      return window.ethereum.providers.find(provider => {
        switch (wallet.name) {
          case 'MetaMask':
            return provider.isMetaMask;
          case 'Coinbase Wallet':
            return provider.isCoinbaseWallet;
          case 'Trust Wallet':
            return provider.isTrust;
          case 'OKX Wallet':
            return provider.isOkxWallet;
          case 'Bitget Wallet':
            return provider.isBitgetWallet;
          case 'TokenPocket':
            return provider.isTokenPocket;
          case 'XDEFI Wallet':
            return provider.isXDEFI;
          case 'Frontier Wallet':
            return provider.isFrontier;
          case 'Coin98 Wallet':
            return provider.isCoin98;
          default:
            return null;
        }
      });
    }
    return window.ethereum;
  };

  const handleWalletClick = async (wallet) => {
    try {
      setSelectedWallet(wallet.name);
      const provider = getProvider(wallet);
      if (!provider) {
        alert(`${wallet.name} is not installed!`);
        setSelectedWallet(null); // Habilita de nuevo la selección si no se encuentra el proveedor
        return;
      }

      // alert(`Provider found for ${wallet.name}`);

      if (web3) {
        console.log(`Attempting to connect to ${wallet.name}...`);

        await provider.request({ method: 'eth_requestAccounts' });
        const web3Instance = new Web3(provider);
        const accounts = await web3Instance.eth.getAccounts();
        const walletAddress = accounts[0];

        console.log('Connected account:', walletAddress);

        localStorage.setItem('connectedWalletAddress', walletAddress);
        localStorage.setItem('connectedWalletName', wallet.name);

        setConnectedWallet(walletAddress);

        if (onWalletConnected) {
          onWalletConnected(wallet.name, walletAddress);
        }

        // Redirect to user dashboard
        // window.location.href = '/user/dashboard/inicio';

      } else {
        console.log(`Ethereum object not found for ${wallet.name}`);
      }
    } catch (error) {
      console.error(`Error connecting to ${wallet.name}:`, error);
      setSelectedWallet(null); // Habilita de nuevo la selección si hay un error
    }
  };

  const handleResetSelection = () => {
    setSelectedWallet(null);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>Connect a Wallet</Typography>
        {selectedWallet && (
          <Button variant="contained" sx={{ mt: 4 }} onClick={handleResetSelection}>
            Reset Selection
          </Button>
        )}
        <List>
          {wallets.map(wallet => (
            <ListItem 
              button 
              key={wallet.name} 
              onClick={() => handleWalletClick(wallet)} 
              disabled={selectedWallet && selectedWallet !== wallet.name}
            >
              <ListItemIcon sx={{ minWidth: '40px', textAlign: 'center' }}>
                <Box sx={{ background: 'white', padding: '4px', borderRadius: 3 }}>
                  <img src={wallet.icon} alt={wallet.name} width={24} height={24} />
                </Box>
              </ListItemIcon>
              <ListItemText primary={wallet.name} />
            </ListItem>
          ))}
        </List>
        
      </Box>
      <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>What is a Wallet?</Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>A Home for your Digital Assets</Typography>
          <Typography variant="body2" sx={{ color: '#757575' }}>Wallets are used to send, receive, store, and display digital assets like Ethereum and NFTs.</Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>A New Way to Log In</Typography>
          <Typography variant="body2" sx={{ color: '#757575' }}>Instead of creating new accounts and passwords on every website, just connect your wallet.</Typography>
        </Box>
        <Button 
          variant="contained" 
          sx={{ mt: 4 }} 
          onClick={() => window.location.href = 'https://materialbitcoin.com/blog/crear-wallet-criptomonedas/'}
        >
          Get a Wallet
        </Button>
      </Box>
    </Box>
  );
};

export default WalletConnect;
