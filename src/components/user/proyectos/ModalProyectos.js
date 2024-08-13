"use client"
import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import getColor from "@/themes/colorUtils";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Card } from "primereact/card";
import { Image } from "primereact/image";
import Typography from "@mui/material/Typography";
import { Box } from "@mui/system";
import { FilledInput } from "@mui/material";
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import { calcularGananciaMensual } from "./monto_estimado";
import Web3 from 'web3';
import CurrencyConverter from '@/component/web3/wallet/CurrencyConverter';

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

const MaximizableDemo = ({ project, visible, onHide }) => {
  const theme = useTheme();
  const gas = 10;
  const borderColor = theme.palette.mode === "dark" ? "#CFCFCF" : "#B2B2B2";
  const boxShadow =
    theme.palette.mode === "dark"
      ? "0 4px 8px rgba(255, 255, 255, 0.2)"
      : "0 4px 8px rgba(0, 0, 0, 0.2)";
  const [walletAddress, setWalletAddress] = useState('');
  
  const [network, setNetwork] = useState(null);
  const [balance, setBalance] = useState(null);
  const [currency, setCurrency] = useState('USD');
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [showConverter, setShowConverter] = useState(false);
  const [showConvertButton, setShowConvertButton] = useState(true);
  const [invert, setInvert] = useState('');
  const [aprox, setAprox] = useState('');

  useEffect(() => {
    console.log(project);
    const actualizarValor = async() => {
      const storedValue = localStorage.getItem('connectedWalletAddress');
      setWalletAddress(storedValue || '--');

      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        await fetchNetworkAndBalance(web3Instance, storedValue);
        window.ethereum.on('chainChanged', async (chainId) => {
          await fetchNetworkAndBalance(web3Instance, storedValue);
        });
      } else {
        console.log('No provider found. Install MetaMask.');
      }
    };
    actualizarValor();
    window.addEventListener('storage', actualizarValor);
    return () => {
      window.removeEventListener('storage', actualizarValor);
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', fetchNetworkAndBalance);
      }
    };
  }, [project]);

  const handleinput = (event) => {
    const inputValue = event.target.value;
    const numericValue = inputValue.replace(/[^0-9.]/g, '');
    const valor = project.monto_pedido - project.monto_recaudado;
    console.log(project.rendimiento);

    const valueAsNumber = parseFloat(numericValue);
    const percentageRaisedAsNumber = parseFloat(project.rendimiento);

    if (valueAsNumber > valor) {
      setInvert(valor.toString());
      const gananciaMensual = calcularGananciaMensual(valor, percentageRaisedAsNumber);
      setAprox(gananciaMensual);
      console.log("valor: " + valor + ", Ganancia: " + gananciaMensual);
    } else {
      setInvert(numericValue);
      const gananciaMensual = calcularGananciaMensual(valueAsNumber, percentageRaisedAsNumber);
      setAprox(gananciaMensual);
      console.log("valor: " + valueAsNumber + ", Ganancia: " + gananciaMensual);
    }
    // Show the convert button and hide the converter
    setShowConvertButton(true);
    setShowConverter(false);
  };

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
      setCurrency(networkDetails.currency ? networkDetails.currency.toLowerCase() : 'usd');
    }
  };

  const handleConvertClick = () => {
    setShowConverter(true);
    setShowConvertButton(false); // Hide the convert button after clicking it
  };

  return (
    <Dialog
      header="Project Details"
      visible={visible}
      onHide={onHide}
      maximizable
      style={{
        width: '60%',
        color: theme.palette.text.primary,
        backgroundColor: getColor(theme, "head"),
      }}
      contentStyle={{
        color: theme.palette.text.primary,
        backgroundColor: getColor(theme, "head"),
      }}
      headerStyle={{
        color: theme.palette.text.primary,
        backgroundColor: getColor(theme, "head"),
      }}
    >
      <Card
        style={{
          background: getColor(theme, "fifth"),
          border: `1px solid ${borderColor}`,
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          boxShadow,
          color: theme.palette.text.primary,
        }}
      >
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div
            style={{
              width: "30%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: '1%',
              marginRight: '1%',
            }}
          >
            <div
              style={{
                borderRadius: "10px",
                height: '100%',
                width: '100%',
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              <Image
                src={project.imagen_solicitud}
                alt={`${project.empresa} Logo`}
                width="100%"
                height="100%"
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "70%",
              height: "100%",
            }}
          >
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Typography variant="body2" sx={{ fontWeight: "normal" }}>
                Cuenta conectada:
              </Typography>{" "}
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                {walletAddress}
              </Typography>{" "}
            </div>
            <div>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {project.empresa}
              </Typography>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                marginTop: "2vh",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "50%",
                }}
              >
                <div style={{ height: "50%" }}>
                  <Typography
                    variant="body1"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {project.titulo}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    ID_Proyecto: {project.id}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {project.duracion}
                  </Typography>
                </div>
                <div style={{ height: "50%", marginTop: "1vh" }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "600", color: "#1E5699" }}
                  >
                    Monto a invertir
                  </Typography>
                  <div className="p-inputgroup flex-1" style={{ width: "90%" }}>
                    <FormControl fullWidth variant="filled">
                      <FilledInput
                        id="filled-adornment-amount"
                        startAdornment={<InputAdornment position="start">$</InputAdornment>}
                        value={invert}
                        onChange={handleinput}
                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                      />
                    </FormControl>
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "50%",
                }}
              >
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <div
                    style={{ display: "column", width: "50%", height: "50%" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "600", color: "#1E5699" }}
                    >
                      Recaudado
                    </Typography>
                    <InputText
                      style={{ width: "80%" }}
                      disabled
                      placeholder="Disabled"
                      value={`${project.monto_recaudado} / ${((project.monto_recaudado / project.monto_pedido) * 100).toFixed(1)}%`}
                    />
                  </div>
                  <div style={{ display: "column", width: "50%" }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "600", color: "#1E5699" }}
                    >
                      Monto máximo
                    </Typography>
                    <InputText
                      disabled
                      placeholder="Disabled"
                      value={`$${project.monto_pedido}`}
                      style={{ width: "80%" }}
                    />
                  </div>
                </div>
                <div style={{ height: "50%", marginTop: "2vh" }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "600", color: "#1E5699" }}
                  >
                    Monto estimado a recibir
                  </Typography>
                  <div className="p-inputgroup flex-1" style={{ width: "90%" }}>
                    <FormControl fullWidth variant="filled">
                      <FilledInput
                        id="filled-adornment-amount"
                        startAdornment={<InputAdornment position="start">$</InputAdornment>}
                        value={aprox + ' /mes'}
                        disabled
                      />
                    </FormControl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      <Card
        style={{
          background: getColor(theme, "fifth"),
          border: `1px solid ${borderColor}`,
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          boxShadow,
          marginTop: "20px",
          color: theme.palette.text.primary,
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "auto",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignContent: "space-between",
          }}
        >
          <Box sx={{ width: "35%", textAlign: "center" }}>
            <Box sx={{ height: "auto" }}>
              <Typography variant="body2" sx={{ fontWeight: "light" }}>
                Total (send + gas)
              </Typography>
            </Box>
            <Box sx={{ height: "50%" }}>
              {showConvertButton && (
                <Button variant="contained" color="primary" onClick={handleConvertClick}>
                  Convertir ${invert} USD a {currency}
                </Button>
              )}
              {showConverter && <CurrencyConverter amount={invert} currency={currency} />}
            </Box>
          </Box>
          <Box sx={{ width: "65%" }}>
            <Button
              label="Invertir"
              size="large"
              style={{ width: "100%", borderRadius: "10px" }}
            />
          </Box>
        </Box>
        <Typography
          variant="body2"
          sx={{ fontWeight: "light", textAlign: "center", marginTop: "2vh" }}
        >
          Al invertir, confirmas los términos de uso de Growing-up
        </Typography>
      </Card>
    </Dialog>
  );
};

MaximizableDemo.displayName = 'MaximizableDemo';

export default MaximizableDemo;
