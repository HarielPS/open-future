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
  useTheme,
} from '@mui/material';
import dayjs from 'dayjs';
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
        <Button variant="contained" color="primary" onClick={() => handlePayment(event)}>
          Pagar
        </Button>
      )
    );

    setRows(newRows);
  }, [events]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handlePayment = (event) => {
    // Implement the payment logic here
    console.log('Payment processing for:', event);
  };

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
              {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
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
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
