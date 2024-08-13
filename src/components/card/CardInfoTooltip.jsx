import React from 'react';
import { Tooltip } from '@mui/material';

const CardInfoTooltip = React.forwardRef((props, ref) => {
  const { title, children } = props;

  return (
    <Tooltip title={title} arrow>
      <span ref={ref} style={{ display: 'inline-block' }}>
        {children}
      </span>
    </Tooltip>
  );
});
CardInfoTooltip.displayName = 'CardInfoTooltip';

export default CardInfoTooltip;
