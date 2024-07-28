import React from 'react';
import PropTypes from 'prop-types';

import { MenuHeader, MenuItem } from '../../atoms/context-menu/ContextMenu';

import CheckIC from '../../../../public/res/ic/outlined/check.svg';

function NotificationSelector({
  value, onSelect,
}) {
  return (
    <div>
      <MenuHeader>اعلانات</MenuHeader>
      <MenuItem iconSrc={value === 'off' ? CheckIC : null} variant={value === 'off' ? 'positive' : 'surface'} onClick={() => onSelect('خاموش')}>خاموش</MenuItem>
      <MenuItem iconSrc={value === 'on' ? CheckIC : null} variant={value === 'on' ? 'positive' : 'surface'} onClick={() => onSelect('روشن')}>روشن</MenuItem>
      <MenuItem iconSrc={value === 'noisy' ? CheckIC : null} variant={value === 'noisy' ? 'positive' : 'surface'} onClick={() => onSelect('پر سر و صدا')}>پر سر و صدا</MenuItem>
    </div>
  );
}

NotificationSelector.propTypes = {
  value: PropTypes.oneOf(['off', 'on', 'noisy']).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default NotificationSelector;
