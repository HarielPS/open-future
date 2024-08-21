"use client";
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Button,
  Typography,
  Modal,
  Fade,
  Backdrop,
  useTheme,
} from '@mui/material';
import dayjs from 'dayjs';
import { db } from '../../../../firebase'; // Ensure this is the correct path
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import getColor from '@/themes/colorUtils';

const columns = [
  { id: 'project', label: 'Título del Proyecto', minWidth: 170, align: 'left' },
  { id: 'contractDate', label: 'Fecha de Contrato', minWidth: 170, align: 'left' },
  { id: 'paymentDate', label: 'Fecha de Pago', minWidth: 170, align: 'left' },
  { id: 'amount', label: 'Monto a Pagar', minWidth: 100, align: 'right', format: (value) => `$${value.toFixed(2)}` },
  { id: 'pay', label: 'Acción', minWidth: 100, align: 'center' },
];

function createData(project, contractDate, paymentDate, amount, payAction) {
  return { project, contractDate, paymentDate, amount, payAction };
}

export default function MonthlyPaymentTable({ events }) {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [paidIds, setPaidIds] = useState(new Set());

  useEffect(() => {
    const currentMonth = dayjs().month();
    const currentYear = dayjs().year();
    
    const filteredEvents = events?.filter(event => {
      const paymentDate = dayjs(event.date);
      return paymentDate.month() === currentMonth && paymentDate.year() === currentYear;
    }) || [];

    const newRows = filteredEvents.map(event => 
        createData(
          event.name || 'Proyecto sin nombre',
          event.contractDate ? dayjs(event.contractDate).format('DD/MM/YYYY') : '-',
          dayjs(event.date).format('DD/MM/YYYY'),
          parseFloat(event.amount) || 0,
          <Button variant="contained" color="primary" onClick={() => handleOpenModal(event, event.contractRef)}>
            Pagar
          </Button>
        )
      );
      

    setRows(newRows);
  }, [events]);

  useEffect(() => {
    // Load paid payments from Firebase to filter them out from the table
    const storedId = localStorage.getItem('userId');
    if (storedId) {
      loadPaidPayments(storedId);
    }
  }, []);

  const loadPaidPayments = async (userId) => {
    const empresaDoc = await getDoc(doc(db, "empresa", userId));
    if (empresaDoc.exists()) {
      const empresaData = empresaDoc.data();
      const pagos = empresaData.pagos || {};

      const newPaidIds = new Set(Object.keys(pagos));
      setPaidIds(newPaidIds);
    }
  };

  const handleOpenModal = (event, contractRef) => {
    console.log("Opening modal for event:", event);
    setSelectedEvent({ ...event, contractRef });  // Add contractRef to the selected event
    setOpen(true);
  };
  

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedEvent(null);
  };

  const handlePayment = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const walletAddress = localStorage.getItem('connectedWalletAddress');
  
      console.log("User ID:", userId);
      console.log("Wallet Address:", walletAddress);
      console.log("Selected Event:", selectedEvent);
  
      if (!userId || !walletAddress || !selectedEvent || !selectedEvent.contractRef) {
        console.error("User ID, wallet address, selected event, or contractRef is missing.");
        return;
      }
  
      const empresaRef = doc(db, "empresa", userId);
      const empresaDoc = await getDoc(empresaRef);
  
      console.log("Empresa Document Data:", empresaDoc.exists() ? empresaDoc.data() : "Document does not exist");
  
      if (empresaDoc.exists()) {
        console.log("Contract Reference ID:", selectedEvent.contractRef);
  
        const contractDocRef = doc(db, "contrato", selectedEvent.contractRef);
  
        const newPago = {
          estado: "pagado",
          fecha: serverTimestamp(),
          id_contrato: contractDocRef, // Ensure this is a valid DocumentReference
          monto: selectedEvent.amount,
          tipo: "salida",
          wallet: walletAddress,
        };
  
        console.log("New Payment Data:", newPago);
  
        await updateDoc(empresaRef, {
          [`pagos.${Date.now()}`]: newPago, // Create a unique ID for the payment
        });
  
        console.log("Payment successful and recorded in Firebase.");
      }
  
      handleCloseModal();
    } catch (error) {
      console.error("Error processing payment:", error);
    }
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const filteredRows = rows.filter(row => !paidIds.has(row.contractRef)); // Filter out paid rows

  if (!events || events.length === 0) {
    return <Typography>No payments for this month.</Typography>;
  }

  return (
    <Box>
      <Paper sx={{
        width: '100%',
        overflow: 'hidden',
        background: getColor(theme, 'fifth'),
        border: `2px solid ${getColor(theme, 'six')}`,
        boxShadow: `0px 0px 6vh ${getColor(theme, 'shadow')}`,
      }}>
        <TableContainer>
          <Table stickyHeader aria-label="monthly payment table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                  <TableCell align="left">{row.project}</TableCell>
                  <TableCell align="left">{row.contractDate}</TableCell>
                  <TableCell align="left">{row.paymentDate}</TableCell>
                  <TableCell align="right">{row.amount}</TableCell>
                  <TableCell align="center">{row.payAction}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Modal
        aria-labelledby="payment-modal-title"
        aria-describedby="payment-modal-description"
        open={open}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography id="payment-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
              Confirmar Pago
            </Typography>
            {selectedEvent && (
              <>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Estás a punto de pagar:
                </Typography>
                <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {selectedEvent.name || 'Proyecto sin nombre'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Monto a pagar: <strong>${parseFloat(selectedEvent.amount).toFixed(2)}</strong>
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Fecha de pago: {dayjs(selectedEvent.date).format('DD/MM/YYYY')}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 3 }}
                  onClick={handlePayment}
                >
                  Confirmar y Pagar
                </Button>
              </>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}
