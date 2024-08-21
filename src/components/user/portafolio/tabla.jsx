"use client";
import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import { TableCell } from '@mui/material';
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
import ProjectModal from './modal';
import { doc, getDoc } from "firebase/firestore";
import { db } from '../../../../firebase';
import PaymentsIcon from '@mui/icons-material/Payments';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';

const columns = [
  { id: 'project', label: 'Proyecto', minWidth: 170, align: 'left' },
  { id: 'status', label: 'Estatus', minWidth: 170, align: 'center' },
];

const statusSeverity = {
  'Espera': 'custom',
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

export default function InvestmentTable({ rows }) {
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('project');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [filteredRows, setFilteredRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedProject, setSelectedProject] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const theme = useTheme();

  React.useEffect(() => {
    setFilteredRows(rows);
    setLoading(false);
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

  const handleRowClick = async (projectKey) => {
    setLoading(true);
    const projectRef = doc(db, "contrato", projectKey);
    const projectSnapshot = await getDoc(projectRef);
    if (projectSnapshot.exists()) {
      const projectData = projectSnapshot.data();
      const projectRef = projectData.id_proyecto;
      const projectDetails = await getDoc(projectRef);

      if (projectDetails.exists()) {
        const project = {
          ...projectDetails.data(),
          ...projectData
        };
        setSelectedProject(project);
        setModalOpen(true);
      }
    }
    setLoading(false);
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
                      onClick={(event) => handleRequestSort(event, column.id)}
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
            <TableBody>
              {visibleRows.map((row) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.key} onClick={() => handleRowClick(row.key)} sx={{ cursor: 'pointer' }}>
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
                          value === 'Espera' ? (
                            <Alert
                              severity="custom" // O cualquier otro valor que desees usar
                              sx={{ 
                                backgroundColor: theme.palette.mode === 'dark' ? '#2b2c08' : '#fbfde5',
                                color: theme.palette.mode === 'dark' ? '#fbfde5' : '#2b2c08',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                boxShadow: `0px 2px 4px rgba(0, 0, 0, 0.1)`,
                                '& .MuiAlert-icon': {
                                  color: theme.palette.mode === 'dark' ? '#fbfde5' : '#2b2c08',
                                },
                              }}
                              iconMapping={{
                                custom: <HourglassBottomIcon fontSize="inherit" />,
                              }}
                            >
                              {value}
                            </Alert>
                          ) : (
                            <Alert
                              severity={statusSeverity[value]}
                              iconMapping={{
                                info: <PaymentsIcon fontSize="inherit" />,
                                warning: <CurrencyExchangeIcon fontSize="inherit" />,
                              }}
                            >
                              {value}
                            </Alert>
                          )
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

      {/* Modal */}
      {selectedProject && (
        <ProjectModal open={modalOpen} onClose={() => setModalOpen(false)} project={selectedProject} />
      )}
    </Box>
  );
}
