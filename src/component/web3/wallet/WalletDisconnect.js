"use client";
import React, { useEffect } from "react";

const WalletDisconnect = ({ setWalletAddress, setWalletBalance }) => {
    useEffect(() => {
        console.log('Executing WalletDisconnect useEffect...');
        clearLocalStorage();

        // Reset state
        setWalletAddress(null);
        setWalletBalance(null);

        // Disconnect logic
        // if (window.ethereum) {
        //   const web3 = new Web3(window.ethereum);
        //   web3.currentProvider.disconnect();
        // }
    }, [setWalletAddress, setWalletBalance]);

    return null; // This component doesn't render anything, so return null
};

// Function to clear local storage
export const clearLocalStorage = () => {
    console.log('Clearing local storage...');
    localStorage.removeItem('connectedWalletAddress');
    localStorage.removeItem('connectedWalletName');
    localStorage.removeItem('userId');
    // localStorage.removeItem('selectedRole');
    console.log('Local storage cleared');
};

export const clearLocalStorage_exID = () => {
    console.log('Clearing local storage...');
    localStorage.removeItem('connectedWalletAddress');
    localStorage.removeItem('connectedWalletName');
    console.log('Local storage cleared');
};

export const logoutexit = () => {
    console.log('Clearing local storage...');
    localStorage.removeItem('connectedWalletAddress');
    localStorage.removeItem('connectedWalletName');
    localStorage.removeItem('userId');
    localStorage.removeItem('selectedRole');
    console.log('Local storage cleared');
    window.location.href = '/';
};


export default WalletDisconnect;
