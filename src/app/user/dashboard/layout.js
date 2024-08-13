"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from '@mui/material/styles';
import SideBar from "@/components/navigation/Sidebar";
import Navbar from "@/components/navigation/Navbar";
import WalletConnect from "@/component/web3/wallet/WalletConnect";
import { Modal, Backdrop, Box, Button, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import Image from "next/image";
import styles from "./Layout.module.css"; // Import styles for the modal
import WalletBalance from "@/component/web3/wallet/WalletBalance";
import WalletSwitcher from "@/component/web3/wallet/WalletSwitcher";
import NetworkAndBalance from "@/component/web3/wallet/Balance";

export default function Layout({ children }) {
  const theme = useTheme();
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [visible, setVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [switchWallet, setSwitch] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);


  const handleVisible = () => {
    setVisible(!visible);
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleShowSwitch = () => {
    handleCloseModal(); 
    setSwitch(true);
  };

  const handleCloseSwitch = () => {
    setSwitch(false);
  };

  const copyAddressToClipboard = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress).then(() => {
        alert('Direccion de wallet copiada!');
      }).catch(err => {
        console.error('Error al copiar: ', err);
      });
    } else {
      alert('No hay wallet');
    }
  };

  const formatWalletAddress = (address) => {
    if (!address) return '';
    const firstPart = address.slice(0, 6);
    const lastPart = address.slice(-5);
    return `${firstPart}....${lastPart}`;
  };

  useEffect(() => {
    // Leer los datos de localStorage
    const address = localStorage.getItem('connectedWalletAddress');
    const name = localStorage.getItem('connectedWalletName');

    if (address && name) {
      setWalletAddress(address);
      setWalletBalance(null); // Clear balance initially
    }

    if (address) {
      setWalletConnected(true);
    }
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw", backgroundColor: theme.palette.background.default}}>
      <Navbar handleVisible={handleVisible} handleShowModal={handleShowModal} />
      <SideBar visible={visible} handleVisible={handleVisible} />
      <div
        style={{
          width: "100%",
          height: '100vh',
          paddingTop: "60px",
          backgroundColor: theme.palette.background.default,
          // backgroundColor:'#A9FCAA',
           
        }}
      >
        <div style={{padding: '0 3vw 2vh 3vw', width: "100%", height: "100%", overflowY: 'auto',}}>
          {children}
        </div>
      </div>

      <Modal
        open={showModal}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Box 
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: 300, md: 400 },
            bgcolor: theme.palette.background.paper,
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            outline: 'none',
          }}
        >
          <IconButton sx={{ position: 'absolute', top: 8, right: 8 }} onClick={handleCloseModal}>
            <CloseIcon />
          </IconButton>
          <div className='flex flex-column justify-content-center align-items-center'>
            <div className={styles.circularImage}>
              <Image src="/wallets/wallet.jpg" alt="Profile Image" layout="fill" objectFit="cover" />
            </div>
            <p className='mb-0'>{formatWalletAddress(walletAddress)} </p>
            <p className='mb-5'>{walletConnected && <NetworkAndBalance />}</p>
            <div className={styles.buttonContainer}>
              <Button onClick={copyAddressToClipboard}>Copiar dirección</Button>
              <Button variant="contained" onClick={handleShowSwitch}>
                Cambiar Wallet
              </Button>
            </div>
          </div>
        </Box>
      </Modal>

      <Modal
        open={switchWallet}
        // onClose={handleCloseSwitch}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Box 
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: 300, md: 700 },
            bgcolor: theme.palette.background.paper,
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            outline: 'none',
          }}
        >
          <WalletSwitcher setWalletAddress={setWalletAddress} setWalletBalance={setWalletBalance} />
        </Box>
      </Modal>
    </div>
  );
}
