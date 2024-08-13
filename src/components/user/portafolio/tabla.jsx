"use client";
import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import { Box } from '@mui/system';
import { visuallyHidden } from '@mui/utils';
import getColor from '@/themes/colorUtils';
import Loading from '@/components/loading/loading';

import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import PaymentsIcon from '@mui/icons-material/Payments';

const columns = [
  { id: 'project', label: 'Proyecto', minWidth: 170, align: 'left' }, // Align to the left
  { id: 'term', label: 'Plazo', minWidth: 50, align: 'center' },
  { id: 'investment', label: 'Inversión', minWidth: 170, align: 'center', format: (value) => `$${value.toLocaleString('en-US')}` },
  { id: 'earnings', label: 'Ingresos', minWidth: 170, align: 'center', format: (value) => `$${value.toLocaleString('en-US')}` },
  { id: 'dueDate', label: 'Fecha de Inversión', minWidth: 170, align: 'center' },
  { id: 'fecha_contrato', label: 'Fecha Contrato', minWidth: 170, align: 'center' }, // Nuevo campo de fecha
  { id: 'status', label: 'Estatus', minWidth: 170, align: 'center' },
];

const statusSeverity = {
  'Finalizado': 'success',
  'Activo': 'info',
  'Fondeo': 'warning',
  'Cancelado': 'error',
};

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort, columns } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };
  const theme = useTheme();

  return (
    <TableHead>
      <TableRow>
        {columns.map((column) => (
          <TableCell
            key={column.id}
            align={column.align}
            sortDirection={orderBy === column.id ? order : false}
            sx={{
              background: getColor(theme, 'head'),
              color: theme.palette.text.primary,
              fontWeight: 'bold',
              textAlign: column.align,
            }}
          >
            <TableSortLabel
              active={orderBy === column.id}
              direction={orderBy === column.id ? order : 'asc'}
              onClick={createSortHandler(column.id)}
            >
              {column.label}
              {orderBy === column.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default function InvestmentTable({ rows }) {
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('project');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [filteredRows, setFilteredRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const theme = useTheme();

  React.useEffect(() => {
    const fetchData = () => {
      // Simula la carga de datos
      setTimeout(() => {
        setFilteredRows(rows);
        setLoading(false);
      }, 2000); // Ajusta el tiempo de espera según tus necesidades
    };

    fetchData();
  }, [rows]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    const filtered = rows.filter((row) =>
      row.project.toLowerCase().includes(event.target.value.toLowerCase())
    );
    setFilteredRows(filtered);
  };

  const visibleRows = stableSort(filteredRows, getComparator(order, orderBy)).slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <Box>
      <Box sx={{ marginBottom: '2vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <TextField
          sx={{
            width: {
              xs: '100%',
              md: '50%'
            }
          }}
          variant="outlined"
          label="Buscar"
          multiline
          value={search}
          onChange={handleSearch}
        />
      </Box>

      <Paper sx={{
        width: '100%',
        overflow: 'hidden',
        background: getColor(theme, 'fifth'),
        border: `2px solid ${getColor(theme, 'six')}`,
        boxShadow: `0px 0px 6vh ${getColor(theme, 'shadow')}`,
      }}>
        <TableContainer>
          <Table stickyHeader aria-label="sticky table">
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              columns={columns}
            />
            <TableBody>
              {visibleRows.map((row) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.key}>
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align} style={{ textAlign: column.align }}>
                        {column.id === 'project' ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                            <Avatar src={row.img} alt={row.project} sx={{ marginRight: 2 }} />
                            {value}
                          </Box>
                        ) : column.id === 'status' ? (
                          <Alert
                            severity={statusSeverity[value]}
                            iconMapping={{
                              info: <PaymentsIcon fontSize="inherit" />,
                              warning: <CurrencyExchangeIcon fontSize="inherit" />,
                            }}
                          >
                            {value}
                          </Alert>
                        ) : (
                          column.format && typeof value === 'number' ? column.format(value) : value
                        )}
                      </TableCell>
                    );
                  })}
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
    </Box>
  );
}
