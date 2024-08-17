"use client";
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
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import { calcularGananciaMensual } from "./monto_estimado";
import Web3 from "web3";
import CurrencyConverter from "@/component/web3/wallet/CurrencyConverter";
import { db } from "../../../../firebase";
import { doc, getDocs, collection, query, where, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { Dialog as PrimeDialog } from "primereact/dialog"; // Para el modal de alerta

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
    console.error("Error fetching network details:", error);
    return {
      name: "Unknown Network",
      currency: "Unknown Currency",
    };
  }
};

const PaymentProcessor = ({ amount, contrato, walletUser, walletEmpresa, onSuccess, onError }) => {
  const handlePayment = async () => {
    if (!window.ethereum) {
      alert("No Ethereum wallet found. Please install MetaMask.");
      return;
    }

    const web3 = new Web3(window.ethereum);

    try {
      const transaction = await web3.eth.sendTransaction({
        from: walletUser,
        to: walletEmpresa,
        value: web3.utils.toWei(amount.toString(), "ether"),
        gas: 21000, // Ajustar si es necesario
      });

      onSuccess(transaction); // Llamar a la función de éxito cuando la transacción sea exitosa
    } catch (error) {
      console.error("Payment failed:", error);
      onError(error); // Llamar a la función de error cuando falle la transacción
    }
  };

  return <Button label="Confirmar Pago" onClick={handlePayment} />;
};

const MaximizableDemo = ({ project, visible, onHide }) => {
  const theme = useTheme();
  const gas = 10; // Valor del gas
  const borderColor = theme.palette.mode === "dark" ? "#CFCFCF" : "#B2B2B2";
  const boxShadow =
    theme.palette.mode === "dark"
      ? "0 4px 8px rgba(255, 255, 255, 0.2)"
      : "0 4px 8px rgba(0, 0, 0, 0.2)";
  const [walletAddress, setWalletAddress] = useState("");

  const [network, setNetwork] = useState(null);
  const [balance, setBalance] = useState(null);
  const [currency, setCurrency] = useState("USD");
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [showConverter, setShowConverter] = useState(false);
  const [showConvertButton, setShowConvertButton] = useState(true);
  const [invert, setInvert] = useState("");
  const [aprox, setAprox] = useState("");
  const [contrato, setContrato] = useState(null);
  const [contratoDocId, setContratoDocId] = useState(null);
  const [showAlert, setShowAlert] = useState(false); // Estado para mostrar el modal de alerta

  const totalConGas = parseFloat(invert) + gas;

  useEffect(() => {
    const fetchContrato = async () => {
      try {
        const proyectoRef = doc(db, "proyecto", project.id);
        const contratoQuery = query(
          collection(db, "contrato"),
          where("id_proyecto", "==", proyectoRef)
        );
        const contratoSnapshot = await getDocs(contratoQuery);

        if (!contratoSnapshot.empty) {
          const contratoDoc = contratoSnapshot.docs[0];
          const contratoData = contratoDoc.data();
          setContrato(contratoData);
          setContratoDocId(contratoDoc.id);
          console.log("Contrato encontrado:", contratoData);
        } else {
          console.log("No se encontró un contrato para este proyecto.");
        }
      } catch (error) {
        console.error("Error al obtener el contrato:", error);
      }
    };

    const actualizarValor = async () => {
      const storedValue = localStorage.getItem("connectedWalletAddress");
      setWalletAddress(storedValue || "--");

      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          const accounts = await web3Instance.eth.getAccounts();
          if (accounts.length === 0) {
            setShowAlert(true); // Mostrar el modal de alerta si la wallet está bloqueada
          } else {
            setAccount(accounts[0]);
            await fetchNetworkAndBalance(web3Instance, accounts[0]);
            window.ethereum.on("chainChanged", async (chainId) => {
              await fetchNetworkAndBalance(web3Instance, accounts[0]);
            });
          }
        } catch (error) {
          console.error("Error al conectar con la wallet:", error);
          setShowAlert(true); // Mostrar el modal de alerta si ocurre un error
        }
      } else {
        console.log("No provider found. Install MetaMask.");
        setShowAlert(true); // Mostrar el modal de alerta si no hay proveedor de Ethereum
      }
    };

    fetchContrato();
    actualizarValor();
    window.addEventListener("storage", actualizarValor);

    return () => {
      window.removeEventListener("storage", actualizarValor);
      if (window.ethereum) {
        window.ethereum.removeListener("chainChanged", fetchNetworkAndBalance);
      }
    };
  }, [project]);

  useEffect(() => {
    if (contrato) {
      console.log("Estado actualizado de contrato:", contrato);
    }
  }, [contrato]);

  const handleinput = (event) => {
    const inputValue = event.target.value;
    const numericValue = inputValue.replace(/[^0-9.]/g, "");
    const valor = project.monto_pedido - project.monto_recaudado;
    console.log(project.rendimiento);

    const valueAsNumber = parseFloat(numericValue);
    const percentageRaisedAsNumber = parseFloat(project.rendimiento);

    if (valueAsNumber > valor) {
      setInvert(valor.toString());
      const gananciaMensual = calcularGananciaMensual(
        valor,
        percentageRaisedAsNumber
      );
      setAprox(gananciaMensual);
      console.log("valor: " + valor + ", Ganancia: " + gananciaMensual);
    } else {
      setInvert(numericValue);
      const gananciaMensual = calcularGananciaMensual(
        valueAsNumber,
        percentageRaisedAsNumber
      );
      setAprox(gananciaMensual);
      console.log("valor: " + valueAsNumber + ", Ganancia: " + gananciaMensual);
    }
    setShowConvertButton(true);
    setShowConverter(false);
  };

  const fetchNetworkAndBalance = async (web3Instance, account) => {
    try {
      if (web3Instance && account) {
        const chainId = await web3Instance.eth.net.getId();
        console.log("Current Chain ID:", chainId);
        const networkDetails = await getNetworkDetails(chainId);
        const balanceWei = await web3Instance.eth.getBalance(account);
        const balanceEth = web3Instance.utils.fromWei(balanceWei, "ether");

        console.log("Account Balance (ETH):", balanceEth);

        setNetwork(`${networkDetails.name} (Chain ID: ${chainId})`);
        setBalance(balanceEth);
        setCurrency(
          networkDetails.currency ? networkDetails.currency.toLowerCase() : "usd"
        );
      }
    } catch (error) {
      console.error("Error al obtener los detalles de la red y balance:", error);
      setShowAlert(true); // Mostrar el modal de alerta si ocurre un error
    }
  };

  const handleConvertClick = () => {
    setShowConverter(true);
    setShowConvertButton(false); // Ocultar el botón de conversión después de hacer clic en él
  };

  const handlePaymentSuccess = async (transaction) => {
    try {
        const userId = localStorage.getItem('userId');
        const connectedWalletName = localStorage.getItem('connectedWalletName');
        const connectedWalletAddress = localStorage.getItem('connectedWalletAddress');

        // Asegúrate de que todos los valores necesarios estén presentes antes de proceder
        if (!userId || !connectedWalletName || !connectedWalletAddress || !contratoDocId) {
            throw new Error("Faltan datos necesarios para completar la transacción.");
        }

        // Escribir en inversores en contrato
        await updateDoc(doc(db, 'contrato', contratoDocId), {
            [`inversores.${userId}`]: {
                fecha: new Date(), // Timestamp actual
                ganancia: parseFloat(aprox),  // Asegurarse de que aprox sea un número
                monto_invertido: parseFloat(invert),
                red: connectedWalletName,
                wallet: connectedWalletAddress
            }
        });

        // Actualizar proyecto
        const projectRef = doc(db, 'proyecto', project.id);
        const projectSnapshot = await getDoc(projectRef);
        const projectData = projectSnapshot.data();

        if (!projectData || !projectData.monto_recaudado) {
            throw new Error("Error al recuperar los datos del proyecto.");
        }

        const nuevoMontoRecaudado = parseFloat(projectData.monto_recaudado || 0) + parseFloat(invert);
        console.log(nuevoMontoRecaudado);
        console.log(projectData.monto_pedido);
        // alert("alto");

        const updates = {
            monto_recaudado: nuevoMontoRecaudado
        };

        if (nuevoMontoRecaudado >= projectData.monto_pedido) {
            updates.estado_proyecto = 'Activo';

            await updateDoc(doc(db, 'contrato', contratoDocId), {
                estado: 'Activo',
                fecha_contrato: new Date()
            });
        }

        await updateDoc(projectRef, updates);

        // Actualizar inversor
        const inversorRef = doc(db, 'inversor', userId);
        const inversorSnapshot = await getDoc(inversorRef);
        const inversorData = inversorSnapshot.data();
        const contratoRef = doc(db, 'contrato', contratoDocId);

        // Si no existen las estructuras, se crean
        const proyectos = inversorData.proyectos || { progreso: {}, finalizados: {} };
        const progreso = proyectos.progreso || {};

        const nuevoCampoId = Object.keys(progreso).length + 1;
        progreso[nuevoCampoId] = contratoRef;

        const nuevoMontoInvertido = parseFloat(inversorData.monto_total_invertido || 0) + parseFloat(invert);

        await updateDoc(inversorRef, {
            'proyectos.progreso': progreso,
            monto_total_invertido: nuevoMontoInvertido
        });

        // Registrar pago en inversor
        const pagos = inversorData.pagos || {};
        const nuevoPagoId = Object.keys(pagos).length + 1;
        pagos[nuevoPagoId] = {
            wallet: connectedWalletAddress,
            id_contrato: contratoRef, // Referencia completa
            fecha: new Date(),
            monto: parseFloat(invert),
            estado: 'pagado',
            tipo: 'salida'
        };

        await updateDoc(inversorRef, {
            pagos: pagos
        });

        // Registrar pago en empresa (si el proyecto se activa)
        if (updates.estado_proyecto === 'Activo') {
            const empresaRef = projectData.empresa;
            const empresaSnapshot = await getDoc(empresaRef);
            const empresaData = empresaSnapshot.data();

            if (!empresaData) {
                throw new Error("Error al recuperar los datos de la empresa.");
            }

            const empresaPagos = empresaData.pagos || {};
            const nuevoPagoEmpresaId = Object.keys(empresaPagos).length + 1;

            empresaPagos[nuevoPagoEmpresaId] = {
                wallet: connectedWalletAddress,
                id_contrato: doc(db, 'contrato', contratoDocId), // Referencia completa
                fecha: new Date(),
                monto: parseFloat(invert),
                estado: 'Pagado',
                tipo: 'entrada'
            };

            await updateDoc(empresaRef, {
                pagos: empresaPagos
            });
        }

        alert('Inversión realizada con éxito.');
        onHide(); // Ocultar el modal después de la inversión exitosa
        window.location.reload();

    } catch (error) {
        console.error('Error writing to database:', error);
        alert('Error al registrar la inversión.');
    }
};



  const handleInvestClick = async () => {
    // Aquí es donde iría la lógica de pago con la wallet, pero por ahora está comentado
    /*
    await PaymentProcessor({
      amount: totalConGas,
      contrato,
      walletUser: walletAddress,
      walletEmpresa: contrato?.wallet_empresa,
      onSuccess: handlePaymentSuccess,
      onError: () => alert('Error en la transacción'),
    });
    */

    // Simulación de la transacción exitosa
    handlePaymentSuccess();
  };

  return (
    <>
      <Dialog
        header="Project Details"
        visible={visible}
        onHide={onHide}
        maximizable
        style={{
          width: "60%",
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
                padding: "1%",
                marginRight: "1%",
              }}
            >
              <div
                style={{
                  borderRadius: "10px",
                  height: "100%",
                  width: "100%",
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
                          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
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
                        value={`${project.monto_recaudado} / ${(
                          (project.monto_recaudado / project.monto_pedido) *
                          100
                        ).toFixed(1)}%`}
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
                          value={aprox + " /mes"}
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
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleConvertClick}
                  >
                    Convertir ${totalConGas} USD a {currency}
                  </Button>
                )}
                {showConverter && (
                  <CurrencyConverter amount={totalConGas} currency={currency} />
                )}
              </Box>
              <Typography
                variant="caption"
                sx={{ fontStyle: "italic", marginTop: "1vh" }}
              >
                Se sumó un aproximado de gas de ${gas}, pero puede variar al momento
                de la operación.
              </Typography>
            </Box>
            <Box sx={{ width: "65%" }}>
              <Button
                label="Invertir"
                size="large"
                style={{ width: "100%", borderRadius: "10px" }}
                onClick={handleInvestClick}
              />
            </Box>
          </Box>
          <Typography
            variant="body2"
            sx={{ fontWeight: "light", textAlign: "center", marginTop: "2vh" }}
          >
            Al invertir, confirmas los términos de uso de open-future
          </Typography>
        </Card>
      </Dialog>

      {/* Modal de alerta para indicar que la wallet está bloqueada o hay un error */}
      <PrimeDialog
        header="Wallet Desbloqueada"
        visible={showAlert}
        onHide={() => setShowAlert(false)}
        footer={
          <div>
            <Button
              label="OK"
              icon="pi pi-check"
              onClick={() => setShowAlert(false)}
              autoFocus
            />
          </div>
        }
      >
        <p>
          Parece que tu wallet está bloqueada o no hay conexión. Por favor, desbloquea
          tu wallet y asegúrate de que esté conectada correctamente.
        </p>
      </PrimeDialog>
    </>
  );
};

MaximizableDemo.displayName = "MaximizableDemo";

export default MaximizableDemo;
