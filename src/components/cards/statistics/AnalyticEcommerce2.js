import PropTypes from 'prop-types';

// material-ui
import { Box, Card, Typography } from '@mui/material';

const getStylesByTitle = (title) => {
  const commonStyles = {
    fontFamily: '"Open Sans-Light", Helvetica',
    fontSize: "13px",
    fontStyle: 'normal',
    fontWeight: 400,
    textDecoration: 'underline',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: { xs: '85px', sm: '95px', md: '105px', lg: '110px' }
  };

  if (title === "Cumprimento de sentença") {
    commonStyles.whiteSpace = 'normal';
    commonStyles.lineHeight = '1.2';
    commonStyles.marginTop = '-6px';
  }

  const numberStyles = {
    fontFamily: '"Open Sans-Light", Helvetica',
    fontSize: { xs: '16px', sm: '17px', md: '18px', lg: '18px' },
    fontStyle: 'normal',
    fontWeight: 'bold',
    textDecoration: 'none'
  };

  const titleStyles = {
    "Conhecimento": { color: "#6196DB" },
    "Recursal": { color: "#C8A11A" },
    "Liminar": { color: "#4ECC8F" },
    "Cumprimento de sentença": { color: "#86B1CB" },
    "Instrutória": { color: "#9747FF" },
    "Arquivados": { color: "#676A6C" }
  };

  return {
    title: title in titleStyles ? { ...commonStyles, ...titleStyles[title] } : commonStyles,
    number: { ...numberStyles, color: titleStyles[title]?.color }
  };
};

const AnalyticEcommerce2 = ({ title, count }) => {
  const styles = getStylesByTitle(title);

  return (
    <Card sx={{ 
        p: 2.25, 
        width: { xs: '100%', sm: '90%', md: '95%', lg: 165 }, 
        height: { xs: 'auto', sm: 59, md: 59, lg: 59 }, 
        borderRadius: 3, 
        border: '0.6px solid rgba(0, 0, 0, 0.25)', 
        boxShadow: 'none',
        marginBottom: 2
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" sx={styles.title} title={title}>
          {title}
        </Typography>
        <Typography variant="h6" sx={styles.number}>
          {count}
        </Typography>
      </Box>
    </Card>
  );
};

AnalyticEcommerce2.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.string.isRequired
};

export default AnalyticEcommerce2;
