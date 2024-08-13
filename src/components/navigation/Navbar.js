"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "primereact/button";
import "primereact/resources/themes/saga-blue/theme.css"; // Importar un tema de PrimeReact
import "primereact/resources/primereact.min.css"; // Importar estilos de PrimeReact
import "primeicons/primeicons.css"; // Importar íconos de PrimeReact
import styles from "./Navbar.module.css"; // Importar el CSS module para los estilos personalizados
import ThemeToggle from "../../app/ThemeToggle";
import { useTheme } from '@mui/material/styles';

const Navbar = ({ handleVisible, handleShowModal }) => {
  const theme = useTheme();
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletName, setWalletName] = useState(null);
  const [invisible, setInvisible] = useState(false);

  const handleBadgeVisibility = () => {
    setInvisible(!invisible);
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
      setWalletName(name);
    }
  }, []);

  return (
    <div className={styles.navbar} style={{ backgroundColor: theme.palette.background.default }}>
      <div className={styles.left}>
        <i className={"pi mr-2 pi-bars"} style={{ color: theme.palette.text.primary }} onClick={handleVisible}></i>
        <Image src="/logo2.png" alt="Logo" width={40} height={40} style={{ marginLeft: '10px' }} />
      </div>
      <div className={styles.center}></div>
      <div className={styles.right}>
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative', right: '10px' }}>
          <div style={{ position: 'absolute', top: '-4px', right: '-3px', backgroundColor: 'green', width: '15px', height: '15px', borderRadius: '50%', boxShadow: `0 0 10px 2px ${theme.palette.success.main}`, zIndex: 1 }}></div>
          <Button 
            onClick={handleShowModal}
            style={{ display: 'flex', alignItems: 'center', border: `1px solid ${theme.palette.divider}`, padding: '10px', borderRadius: '10px', backgroundColor: theme.palette.primary.main, position: 'relative' }}>
            {walletAddress ? 
            <p style={{ margin: 0, color: theme.palette.primary.contrastText }}>{formatWalletAddress(walletAddress)}</p> : 
            <p style={{ margin: 0, color: theme.palette.primary.contrastText }}>Conectar wallet</p> }
          </Button>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Navbar;
