import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import { OutlinedInput, IconButton } from '@mui/material';

// assets
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';

// ==============================|| FILTER - INPUT ||============================== //

export const DebouncedInput = ({
  value: initialValue,
  onFilterChange,
  debounce = 500,
  size,
  startAdornment = <SearchOutlined style={{color: '#254C7D'}} />,
  ...props
}) => {
  const [value, setValue] = useState(initialValue);

  const handleInputChange = (event) => setValue(event.target.value);

  const handleClearInput = () => setValue('');

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onFilterChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line
  }, [value]);

  return (
    <OutlinedInput
      {...props}
      value={value}
      onChange={handleInputChange}
      sx={{ minWidth: 100 }}
      {...(startAdornment && { startAdornment })}
      {...(size && { size })}
      endAdornment={
        value && (
          <IconButton onClick={handleClearInput}>
            <CloseOutlined />
          </IconButton>
        )
      }
    />
  );
};

DebouncedInput.propTypes = {
  value: PropTypes.string,
  onFilterChange: PropTypes.func,
  debounce: PropTypes.number,
  size: PropTypes.string,
  startAdornment: PropTypes.node
};

export default DebouncedInput;
