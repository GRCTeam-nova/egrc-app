import PropTypes from 'prop-types';
import { API_QUERY } from '../../../config';
import { Fragment, useMemo, useState, useEffect, useRef } from 'react';
import Popover from '@mui/material/Popover';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router';
import FiltrosAvancadosMenu from './filtrosAvancadosMenu';
import AnalyticEcommerce from '../../../components/cards/statistics/AnalyticEcommerce';
import CustomerModal from '../../../sections/apps/customer/CustomerModal';
import AlertCustomerDelete from '../../../sections/apps/customer/AlertCustomerDelete';
import ExpandingUserDetail from '../../../sections/apps/customer/ExpandingUserDetail';
import { useGetCustomer } from '../../../api/processos';
import { SelectColumnVisibility } from '../../../components/third-party/react-table';
import { enqueueSnackbar } from 'notistack';
import { useLocation } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  useMediaQuery
} from '@mui/material';

// third-party
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  useReactTable
} from '@tanstack/react-table';

// project-import
import ScrollX from '../../../components/ScrollX';
import MainCard from '../../../components/MainCard';
import IconButton from '../../../components/@extended/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Mark from 'mark.js';

import {
  DebouncedInput,
  HeaderSort,
  EmptyTable,
  IndeterminateCheckbox,
  RowSelection,
  TablePagination
} from '../../../components/third-party/react-table';


// assets
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';


export const fuzzyFilter = (row, columnId, value) => {
  // Obter o valor da célula na coluna especificada
  let cellValue = row.getValue(columnId);

  // Verificar se o valor da célula e o valor do filtro não são undefined
  if (cellValue === undefined || value === undefined) {
    // Retornar false se algum valor for undefined
    return false;
  }

  // Função para normalizar o texto removendo acentos
  const normalizeText = (text) => {
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  // Converter valores para string, normalizar e realizar a comparação
  cellValue = normalizeText(cellValue);
  const valueStr = normalizeText(value);
  
  return cellValue.includes(valueStr);
};

// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({ data, columns, processosTotal, onFormDataChange, isLoading }) {
  const navigation = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const [columnVisibility, setColumnVisibility] = useState({});
  const recordType = "Processos";
  const [sorting, setSorting] = useState([{ id: 'pasta', desc: true }]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const tableRef = useRef(null);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      globalFilter,
      columnVisibility
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    globalFilterFn: fuzzyFilter,
    debugTable: true
  });

  const backColor = alpha(theme.palette.primary.lighter, 0.1);

  useEffect(() => {
    setColumnVisibility({
      comarca: false,
      instancia: false,
      dataDistribuicao: false,
      orgao: false,
      valorCausa: false,
      segmento: false,
      acao: false,
      posicaoProcessual: false,
      area: false,
    });
  }, []);

  const verticalDividerStyle = {
    width: '0.5px',
    height: '37px',
    backgroundColor: '#98B3C3',
    opacity: '0.75',
    flexShrink: '0',
    marginRight: '0px',
    marginLeft: '7px',
  };

  useEffect(() => {
    const markInstance = new Mark(tableRef.current);

    if (globalFilter) {
      markInstance.unmark({
        done: () => {
          markInstance.mark(globalFilter);
        }
      });
    } else {
      markInstance.unmark();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalFilter, table.getRowModel().rows]);

  return (
    <MainCard content={false}>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{
          padding: 2,
          marginBottom: '2px',
          ...(matchDownSM && { '& .MuiOutlinedInput-root, & .MuiFormControl-root': { width: '100%' } })
        }}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <SelectColumnVisibility
            {...{
              getVisibleLeafColumns: table.getVisibleLeafColumns,
              getIsAllColumnsVisible: table.getIsAllColumnsVisible,
              getToggleAllColumnsVisibilityHandler: table.getToggleAllColumnsVisibilityHandler,
              getAllColumns: table.getAllColumns
            }}
          />
          <DebouncedInput
            value={globalFilter ?? ''}
            onFilterChange={(value) => setGlobalFilter(String(value))}
            placeholder={`Pesquise por nº da pasta, processo, cliente…`}
            style={{ width: '350px' }}
          />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <FiltrosAvancadosMenu onFormDataChange={onFormDataChange} />
          <div style={verticalDividerStyle}></div>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button variant="contained" onClick={(e) => {
              e.stopPropagation();
              navigation(`/apps/processos/novo-cadastro`);
            }} startIcon={<PlusOutlined />} style={{ borderRadius: '20px' }}>
              Novo Cadastro
            </Button>
          </Stack>
        </Stack>
      </Stack>
      <ScrollX>
        <div ref={tableRef}>
          <Stack>
            <RowSelection selected={Object.keys(rowSelection).length} />
            <TableContainer>
              <Table>
                <TableHead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}
                      sx={{
                        backgroundColor: isDarkMode ? '#14141' : '#F4F4F4',
                        color: isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.87)'
                      }}>
                      {headerGroup.headers.map((header) => {
                        if (header.column.columnDef.meta !== undefined && header.column.getCanSort()) {
                          Object.assign(header.column.columnDef.meta, {
                            className: header.column.columnDef.meta.className + ' cursor-pointer prevent-select'
                          });
                        }

                        return (
                          <TableCell
                            sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.6)' }}
                            key={header.id}
                            {...header.column.columnDef.meta}
                            onClick={header.column.getToggleSortingHandler()}
                            {...(header.column.getCanSort() &&
                              header.column.columnDef.meta === undefined && {
                              className: 'cursor-pointer prevent-select'
                            })}
                          >
                            {header.isPlaceholder ? null : (
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                                {header.column.getCanSort() && <HeaderSort column={header.column} />}
                              </Stack>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} sx={{ textAlign: 'center' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '50vh',
                        }}>
                          <CircularProgress />
                        </div>
                      </TableCell>
                    </TableRow>

                  ) : data ? (
                    data.length > 0 ? (
                      table.getRowModel().rows.map((row) => (
                        <Fragment key={row.id}>
                          <TableRow>
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id} {...cell.column.columnDef.meta}
                                sx={{
                                  overflow: 'hidden',
                                  color: isDarkMode ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.65)',
                                  textOverflow: 'ellipsis',
                                  fontFamily: '"Open Sans", Helvetica, sans-serif',
                                  fontSize: '13px',
                                  fontStyle: 'normal',
                                  fontWeight: 400,
                                  lineHeight: 'normal'
                                }}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                          {row.getIsExpanded() && (
                            <TableRow sx={{ bgcolor: backColor, '&:hover': { bgcolor: `${backColor} !important` } }}>
                              <TableCell colSpan={row.getVisibleCells().length}>
                                <ExpandingUserDetail data={row.original} />
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length}>
                          <EmptyTable msg="Dados não encontrados" />
                        </TableCell>
                      </TableRow>
                    )
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} sx={{ textAlign: 'center' }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>

              </Table>
            </TableContainer>
            <>
              <Divider />
              <Box sx={{ p: 2 }}>
                <TablePagination
                  {...{
                    setPageSize: table.setPageSize,
                    setPageIndex: table.setPageIndex,
                    getState: table.getState,
                    getPageCount: table.getPageCount,
                    totalItems: processosTotal,
                    recordType: recordType
                  }}
                />
              </Box>
            </>
          </Stack>
        </div>
      </ScrollX>
    </MainCard>
  );
}

ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  getHeaderProps: PropTypes.func,
  handleAdd: PropTypes.func,
  modalToggler: PropTypes.func,
  renderRowSubComponent: PropTypes.any
};

function ActionCell({ row }) {
  const navigation = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const buttonStyle = {
    border: '1px solid #1C529726'
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
      <IconButton
        aria-describedby={id}
        color="primary"
        onClick={handleClick}
        style={buttonStyle}
      >
        <MoreVertIcon />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Stack>
          <Button
            startIcon={<EditOutlined />}
            onClick={() => {
              const processoSelecionadoId = row.original.processoId;
              const numeroProcessoSelecionado = row.original.numeroProcesso;
              const pastaId = row.original.pastaId;
              navigation(`/apps/processos/editar-cadastro`, { state: { indoPara: 'EditarCadastro', processoSelecionadoId, numeroProcessoSelecionado, pastaId } });
              handleClose();
            }}
            color="primary"
          >
            Editar
          </Button>
          <Button
            startIcon={<DeleteOutlined />}
            onClick={() => {
              handleClose();
            }}
            color="error"
          >
            Deletar
          </Button>
        </Stack>
      </Popover>
    </Stack>
  );
}


// ==============================|| LISTAGEM ||============================== //

// Componente principal da página de listagem de registros
const CustomerListPage = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [formData, setFormData] = useState({});
  const { customers: lists, isLoading } = useGetCustomer(formData);
  const processosTotal = lists ? lists.length : 0;
  const [showSlider, setShowSlider] = useState(true);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [customerModal, setCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDeleteId] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.vindoDe === 'NovoCadastro') {
      enqueueSnackbar('Processo cadastrado com sucesso.', {
        variant: 'success',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  }, [location.state]);

  const handleClose = () => {
    setOpen(!open);
  };

  const handleFormDataChange = (newFormData) => {
    setFormData(newFormData);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const TagsCell = ({ row }) => {
    const tags = row.original.tags;

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return null;
    }

    const firstTag = tags[0];
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Chip
          label={firstTag.nome}
          style={{
            backgroundColor: isDarkMode ? firstTag.cor : hexToRGBA(firstTag.cor, 0.40),
            color: isDarkMode ? '#fff' : 'rgba(0, 0, 0, 0.45)',
            fontSize: '12px',
            marginRight: '4px',
            borderRadius: '8px',
          }}
        />
        {tags.length > 1 && (
          <Tooltip title={tags.slice(1).map(tag => tag.nome).join(', ')} placement="top">
            <Chip label="..." style={{ backgroundColor: '#eee', color: '#333', borderRadius: '8px' }} />
          </Tooltip>
        )}
      </Box>
    );
  };

  const hexToRGBA = (hex, opacity) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
            }}
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler(),
            }}
          />
        ),
      },
      { header: 'Pasta', accessorKey: 'pasta' },
      { header: 'Processo', accessorKey: 'numeroProcesso' },
      {
        header: 'Empresa',
        accessorFn: row => (Array.isArray(row.clientes) && row.clientes.length ? row.clientes.map(cliente => cliente.nome).join(', ') : ' '),
        cell: ({ row }) => {
          const clientes = row.original.clientes;
          return Array.isArray(clientes) && clientes.length > 0 ? (
            clientes.map((cliente, index) => <div key={index}>{cliente.nome}</div>)
          ) : (
            <div>Nenhum cliente</div>
          );
        },
      },
      { header: 'Assunto', accessorKey: 'assunto' },
      { header: 'Comarca', accessorKey: 'comarca' },
      { header: 'Área', accessorKey: 'area' },
      { header: 'UF', accessorKey: 'uf' },
      { header: 'Orgão', accessorKey: 'orgao' },
      { header: 'Ação', accessorKey: 'acao' },
      { header: 'Posição Processual', accessorKey: 'posicaoProcessual' },
      { header: 'Instância', accessorKey: 'instancia' },
      { header: 'Fase', accessorKey: 'fase' },
      { header: 'Segmento', accessorKey: 'segmento' },
      { header: 'Competência', accessorKey: 'competencia' },
      { header: 'Valor Causa', accessorKey: 'valorCausa' },
      { header: 'Dt Distribuição', accessorKey: 'dataDistribuicao' },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: (cell) => {
          switch (cell.getValue()) {
            case 'Suspenso':
              return <Chip label="Suspenso" size="small" color="error" variant="outlined" style={{ background: 'none', border: 'none', fontWeight: 'bold' }} />;
            case 'Ativo':
            case 'Ativo_':
              return <Chip label="Ativo" size="small" color="success" variant="outlined" style={{ background: 'none', border: 'none', fontWeight: 'bold' }} />;
            case 'Encerrado':
            default:
              return <Chip label="Encerrado" size="small" color="info" variant="outlined" style={{ background: 'none', border: 'none', fontWeight: 'bold' }} />;
          }
        },
      },
      {
        header: 'Tags',
        accessorKey: 'tags',
        accessorFn: row => (Array.isArray(row.tags) && row.tags.length ? row.tags.map(tag => tag.nome).join(', ') : 'Nenhuma'),
        cell: TagsCell,
      },
      {
        header: 'Ações',
        disableSortBy: true,
        cell: ({ row }) => <ActionCell row={row} />,
      },
    ],
    [TagsCell]
  );

  useEffect(() => {
    if (isInitialLoad && !isLoading) {
      setIsInitialLoad(false);
    }
  }, [isLoading, isInitialLoad]);

  const toggleSlider = () => {
    if (showSlider) {
      setTimeout(() => setShowSlider(false), 100);
    } else {
      setShowSlider(true);
    }
  };

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  
  const handleMouseDown = (e) => {
    setStartX(e.clientX);
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (Math.abs(e.clientX - startX) > 5) {
      setIsDragging(true);
    }
  };

  const handleMouseUp = (e, faseId) => {
    if (!isDragging) {
      handleFaseClick(faseId);
    }
  };


  const [activeFases, setActiveFases] = useState([]);

  const handleFaseClick = (faseId) => {
    setFormData(prevData => {
      const currentFase = Array.isArray(prevData.fase) ? prevData.fase : [];
      const isAlreadyFiltered = currentFase.includes(faseId);
      setActiveFases((prev) =>
        prev.includes(faseId)
          ? prev.filter((id) => id !== faseId)
          : [...prev, faseId]
      );
      return {
        ...prevData,
        fase: isAlreadyFiltered
          ? currentFase.filter(id => id !== faseId)
          : [...currentFase, faseId]
      };
    });
  };

  const settings = {
    dots: true,
    arrows: false,
    infinite: false,
    swipeToSlide: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_QUERY}/api/Fase/dashFase`);
        const fasesQuantitativo = await response.json();
        const processedItems = fasesQuantitativo
          .filter(fase => fase.total > 0)
          .map(fase => ({
            id: fase.id,
            title: fase.nome,
            count: fase.total,
            percentage: fase.percentual,
            color: fase.aumentou ? 'error' : 'success',
            isLoss: !fase.aumentou,
            isActive: activeFases.includes(fase.id)
          }))
          .sort((a, b) => a.title.localeCompare(b.title))
          .map((fase, index) => (
            <AnalyticEcommerce
              key={index}
              idFase={fase.id}
              title={fase.title}
              count={fase.count}
              percentage={fase.percentage}
              color={fase.color}
              isLoss={fase.isLoss}
              isActive={fase.isActive}
              onClick={() => handleFaseClick(fase.id)}
            />
          ));

        setItems(processedItems);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [activeFases]);


  return (
    <>
      <div style={{ opacity: showSlider ? 1 : 0, transition: 'opacity' }}>
        <Box mt={showSlider ? -2 : -4} mb={showSlider ? 2.5 : 0}>
          <span style={{
            color: '#1C5297',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 600,
            lineHeight: 'normal',
          }}>
            Fases
          </span>
        </Box>
        <div style={{ display: showSlider ? 'block' : 'none' }}>
          <Slider {...settings}>
            {items.map((item, index) => {
              return (
                <div
                  key={index}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={(e) => handleMouseUp(e, item.props.idFase)}
                >
                  <Grid item xs={12} sm={6} md={4} lg={3}
                    style={{ padding: 8, cursor: 'pointer', borderRadius: '8px' }}>
                    {item}
                  </Grid>
                </div>
              );
            })}
          </Slider>

        </div>
      </div>

      <div style={{ textAlign: 'right', padding: '10px 20px' }}>
        <Button
          onClick={toggleSlider}
          size="small"
          color="primary"
          style={{ minWidth: '80px', textTransform: 'none' }}
          startIcon={showSlider ? <VisibilityOffIcon /> : <VisibilityIcon />}
        >
          {showSlider ? 'Ocultar fases' : 'Mostrar fases'}
        </Button>
      </div>

      <Box>
        <span style={{
          color: '#1C5297',
          fontFamily: 'Open Sans, Helvetica, sans-serif',
          fontSize: '16px',
          fontStyle: 'normal',
          fontWeight: 600,
          lineHeight: 'normal',
          textDecoration: 'underline',
          textDecorationThickness: '2px'
        }}>
          Processos
        </span>
      </Box>

      {isInitialLoad && isLoading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
        }}>
          <CircularProgress />
        </div>
      ) : (
        <Box my={4}>
          {lists && (
            <ReactTable
              {...{
                data: lists,
                columns,
                modalToggler: () => {
                  setCustomerModal(true);
                  setSelectedCustomer(null);
                },
                processosTotal,
                onFormDataChange: handleFormDataChange,
                isLoading
              }}
            />
          )}
        </Box>
      )}
      <AlertCustomerDelete id={customerDeleteId} title={customerDeleteId} open={open} handleClose={handleClose} />
      <CustomerModal open={customerModal} modalToggler={setCustomerModal} customer={selectedCustomer} />
    </>
  );
};

export default CustomerListPage;