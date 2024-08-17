import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Avatar from '@mui/material/Avatar';
import { Box } from '@mui/system';
import Typography from '@mui/material/Typography';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Divider } from '@mui/material';
import { db } from '../../../../firebase';
import { getDoc, doc } from "firebase/firestore";
import getColor from '@/themes/colorUtils';

const columns = [
  { id: 'project', label: 'Proyecto', minWidth: 170, align: 'left' },
  { id: 'term', label: 'Plazo', minWidth: 50, align: 'left' },
  { id: 'date', label: 'Fecha', minWidth: 100, align: 'left' },
  { id: 'status', label: 'Estatus', minWidth: 100, align: 'center' },
  { id: 'amount', label: 'Monto', minWidth: 100, align: 'right', format: (value) => `$${value.toFixed(2)}` },
  { id: 'earnings', label: 'Ingresos', minWidth: 100, align: 'right', format: (value) => `$${value.toFixed(2)}` },
];

function createData(project, term, date, status, amount, earnings, img,tipo) {
  return { project, term, date, status, amount, earnings, img,tipo };
}

const statusColors = {
  'Pagado': 'green',
  'Atrasado': 'orange',
};

const iconColor = {
  'up': 'green',
  'right': 'blue',
  'down': 'red'
};

export default function InvestmentTable() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const theme = useTheme();

  React.useEffect(() => {
    const fetchData = async () => {
      const storedId = localStorage.getItem('userId');  // Obtener el userId desde el localStorage
      if (storedId) {
        const investorDoc = await getDoc(doc(db, "empresa", storedId));
        if (investorDoc.exists()) {
          const investorData = investorDoc.data();
          const pagos = investorData.pagos || {};  // Acceder al campo 'pagos'
  
          const newRows = [];  // Acumular resultados
  
          for (const key in pagos) {
            const pago = pagos[key];
            const contratoRef = pago.id_contrato;
  
            if (contratoRef) {
              const contratoDoc = await getDoc(contratoRef);
              if (contratoDoc.exists()) {
                const contratoData = contratoDoc.data();
                const proyectoRef = contratoData.id_proyecto;
  
                if (proyectoRef) {
                  const proyectoDoc = await getDoc(proyectoRef);
                  if (proyectoDoc.exists()) {
                    const proyectoData = proyectoDoc.data();
                    const empresaRef = proyectoData.empresa;
  
                    if (empresaRef) {
                      const empresaDoc = await getDoc(empresaRef);
                      if (empresaDoc.exists()) {
                        const empresaData = empresaDoc.data();
  
                        // Acceder al mapa inversores dentro del contrato
                        const inversores = contratoData.inversores || {};
                        const inversorData = inversores[storedId];  // Obtener los datos del inversor específico
                        const ganancia = inversorData ? inversorData.ganancia : 0;  // Obtener la ganancia, o 0 si no existe
  
                        // Construir cada fila con los datos obtenidos
                        newRows.push(createData(
                          proyectoData.titulo || 'Proyecto sin nombre',
                          contratoData.plazo || '1 mes',  // Aquí puedes ajustar el plazo si es necesario
                          new Date(pago.fecha.seconds * 1000).toLocaleDateString(),  // Formatear la fecha
                          pago.estado.charAt(0).toUpperCase() + pago.estado.slice(1),  // Capitalizar el estado
                          pago.monto,  // Monto invertido
                          ganancia,  // Monto de ganancia obtenido del contrato
                          empresaData.logo,  // Ruta de la imagen, si tienes
                          pago.tipo
                        ));
  
                        console.log("Nombre de la empresa:", empresaData.nombre);
                      } else {
                        console.error("El documento de la empresa no existe.");
                      }
                    } else {
                      console.error("El campo empresa no tiene una referencia válida.");
                    }
                  } else {
                    console.error("El documento del proyecto no existe.");
                  }
                } else {
                  console.error("El campo id_proyecto no tiene una referencia válida.");
                }
              } else {
                console.error("El documento del contrato no existe.");
              }
            } else {
              console.error("El campo id_contrato no tiene una referencia válida.");
            }
          }
  
          // Ordenar newRows por fecha de la más reciente a la más antigua
          newRows.sort((a, b) => new Date(b.date) - new Date(a.date));
  
          setRows(newRows);  // Establecer las filas en el estado
          setLoading(false);
        }
      }
    };
  
    fetchData();
  }, []);
  
  

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Paper sx={{
        width: '100%',
        overflow: 'hidden',
        height: '100%',
        boxShadow: `1px 1px 9px 10px ${getColor(theme, 'shadow')}`,
      }}>
        <TableContainer>
          <Table stickyHeader aria-label="investment table">
            <TableBody>
              {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                  <TableCell align="left" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar alt={row.project} src={row.img} sx={{ width: 40, height: 40, marginRight: 2 }} />
                    <Box>
                      <Typography variant="body1" fontWeight="bold">{row.project}</Typography>
                      <Typography variant="body2" color="textSecondary">{row.date}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color={statusColors[row.status]}>{row.status}</Typography>
                    <Divider sx={{ backgroundColor: statusColors[row.status], height: 2, marginTop: 1 }} />
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" flexDirection="column" alignItems="flex-end">
                      {/* <Box display="flex" alignItems="center">
                        <ArrowUpwardIcon sx={{ color: iconColor.up, fontSize: 16 }} />
                        <Typography variant="body1" fontWeight="bold">${row.amount}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <ArrowForwardIcon sx={{ color: iconColor.down, fontSize: 16 }} />
                        <Typography variant="body2" color="textSecondary">${row.earnings}</Typography>
                      </Box> */}
                      {row.tipo === 'entrada' ? (
                        <Box display="flex" flexDirection="column" alignItems="flex-end">
                          <Box display="flex" alignItems="center">
                            <ArrowUpwardIcon sx={{ color: iconColor.up, fontSize: 16 }} />
                            <Typography variant="body1" fontWeight="bold">${row.earnings}</Typography>
                          </Box>
                          <Box display="flex" alignItems="center">
                            <ArrowForwardIcon sx={{ color: iconColor.right, fontSize: 16 }} />
                            <Typography variant="body2" color="textSecondary">${row.amount}</Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Box display="flex" alignItems="center">
                            <ArrowDownwardIcon sx={{ color: iconColor.down, fontSize: 16 }} />
                            <Typography variant="body1" fontWeight="bold">${row.amount}</Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
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
