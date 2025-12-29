import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import IconButton from '../../../components/@extended/IconButton';
import { FormControl, ListItemText, MenuItem, Menu, Tooltip, SpeedDial, useTheme, Checkbox } from '@mui/material';

const ITEM_HEIGHT = 78;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 200
    }
  }
};

// ==============================|| COLUMN VISIBILITY - ICON BUTTON ||============================== //

const SelectColumnVisibility = ({ getVisibleLeafColumns, getIsAllColumnsVisible, getToggleAllColumnsVisibilityHandler, getAllColumns }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const theme = useTheme();

  const buttonStyle = {
    border: '1px solid #1C529726'
  };

  return (
    <FormControl sx={{ width: 50 }}>
      <Tooltip title="Mostrar/Esconder Colunas">
        <IconButton
          aria-label="more"
          id="long-button"
          aria-controls={anchorEl ? 'long-menu' : undefined}
          aria-expanded={anchorEl ? 'true' : undefined}
          aria-haspopup="true"
          style={buttonStyle}
          onClick={handleClick}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="14" viewBox="0 0 18 14" fill="none">
            <path d="M1 1H6.5" stroke={theme.palette.primary.main} strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1 5H6.5" stroke={theme.palette.primary.main} strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1 9H6.5" stroke={theme.palette.primary.main} strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1 13H6.5" stroke={theme.palette.primary.main} strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11.5 1H17" stroke={theme.palette.primary.main} strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11.5 5H17" stroke={theme.palette.primary.main} strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11.5 9H17" stroke={theme.palette.primary.main} strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11.5 13H17" stroke={theme.palette.primary.main} strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </IconButton>
      </Tooltip>
      <Menu
        id="long-menu"
        MenuProps={MenuProps}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: '25ch',
          },
        }}
      >
        {getAllColumns().map(
          (column) =>
            column.columnDef.header !== 'Ações' &&
            column.id !== 'select' &&
            column.columnDef.header !== 'Processo' && (
              <MenuItem key={column.id} value={column.id} onClick={column.getToggleVisibilityHandler()}>
                <Checkbox checked={column.getIsVisible()} />
                <ListItemText primary={column.columnDef.header} />
              </MenuItem>
            )
        )}
      </Menu>
    </FormControl>
  );
};

SelectColumnVisibility.propTypes = {
  getVisibleLeafColumns: PropTypes.func,
  getIsAllColumnsVisible: PropTypes.func,
  getToggleAllColumnsVisibilityHandler: PropTypes.func,
  getAllColumns: PropTypes.func
};

export default SelectColumnVisibility;
