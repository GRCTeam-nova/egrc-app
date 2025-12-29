import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import { FormControl, Grid, MenuItem, Pagination, Select, Stack, Typography } from '@mui/material';

// ==============================|| TABLE PAGINATION ||============================== //

const TablePagination = ({ getPageCount, setPageIndex, setPageSize, getState, initialPageSize, totalItems, recordType }) => {
  const [open, setOpen] = useState(false);
  let options = [10, 25, 50, 100];

  if (initialPageSize) {
    options = [...options, initialPageSize]
      .filter((item, index) => [...options, initialPageSize].indexOf(item) === index)
      .sort(function (a, b) {
        return a - b;
      });
  }

  useEffect(() => setPageSize(initialPageSize || 10), [initialPageSize, setPageSize]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleChangePagination = (event, value) => {
    setPageIndex(value - 1);
  };

  const handleChange = (event) => {
    setPageSize(Number(event.target.value));
  };

  const paginationState = getState().pagination;
  const { pageIndex, pageSize } = paginationState;

  const firstItemIndex = pageIndex * pageSize + 1;
  const lastItemIndex = Math.min((pageIndex + 1) * pageSize, totalItems);

  return (
    <Grid 
      container 
      spacing={1} 
      alignItems="center" 
      justifyContent="space-between"
      sx={{ width: 'auto' }}
    >
      <Grid item xs={4} display="flex" justifyContent="left">
        {totalItems === undefined || totalItems === null ? (
          <Typography variant="caption" color="secondary">
            Sem registros
          </Typography>
        ) : (
          <Typography variant="caption" color="secondary">
    Exibindo <span style={{ fontWeight: 'bold' }}>{firstItemIndex}</span>-
    <span style={{ fontWeight: 'bold' }}>{lastItemIndex}</span> de{' '}
    <span style={{ fontWeight: 'bold' }}>{totalItems}</span> - {recordType}
</Typography>

        )}
      </Grid>
      <Grid item xs={4} display="flex" justifyContent="center">
      <Pagination
        sx={{ '& .MuiPaginationItem-root': { my: 0.5 } }}
        count={getPageCount()}
        page={getState().pagination.pageIndex + 1}
        onChange={handleChangePagination}
        color="primary"
        variant="combined"
        showFirstButton
        showLastButton
      />
      </Grid>
      <Grid item xs={4} display="flex" justifyContent="right">
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" color="secondary">
          {recordType} por página
          </Typography>
          <FormControl sx={{ m: 1 }}>
            <Select
              id="demo-controlled-open-select"
              open={open}
              onClose={handleClose}
              onOpen={handleOpen}
              value={paginationState.pageSize}
              onChange={handleChange}
              size="small"
              sx={{ '& .MuiSelect-select': { py: 0.75, px: 1.25 } }}
            >
              {options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Grid>
    </Grid>
  );
};

TablePagination.propTypes = {
  getPageCount: PropTypes.func,
  setPageIndex: PropTypes.func,
  setPageSize: PropTypes.func,
  getState: PropTypes.func,
  initialPageSize: PropTypes.number,
  totalItems: PropTypes.number,
  recordType: PropTypes.string
};

export default TablePagination;
