import React from 'react';
import PropTypes from 'prop-types';

import { MenuHeader, MenuItem } from '../../atoms/context-menu/ContextMenu';
import CheckIC from '../../../../public/res/ic/outlined/check.svg';

function ImagePackUsageSelector({ usage, onSelect }) {
  return (
    <div>
      <MenuHeader>کاربردی</MenuHeader>
      <MenuItem
        iconSrc={usage === 'emoticon' ? CheckIC : undefined}
        variant={usage === 'emoticon' ? 'positive' : 'surface'}
        onClick={() => onSelect('emoticon')}
      >
        ایموجی
      </MenuItem>
      <MenuItem
        iconSrc={usage === 'sticker' ? CheckIC : undefined}
        variant={usage === 'sticker' ? 'positive' : 'surface'}
        onClick={() => onSelect('sticker')}
      >
        استیکر
      </MenuItem>
      <MenuItem
        iconSrc={usage === 'both' ? CheckIC : undefined}
        variant={usage === 'both' ? 'positive' : 'surface'}
        onClick={() => onSelect('both')}
      >
        هر دو
      </MenuItem>
    </div>
  );
}

ImagePackUsageSelector.propTypes = {
  usage: PropTypes.oneOf(['emoticon', 'sticker', 'both']).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default ImagePackUsageSelector;
