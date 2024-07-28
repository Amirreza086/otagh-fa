import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './RoomHistoryVisibility.scss';


import Text from '../../atoms/text/Text';
import RadioButton from '../../atoms/button/RadioButton';
import { MenuItem } from '../../atoms/context-menu/ContextMenu';
import { useMatrixClient } from '../../hooks/useMatrixClient';

const visibility = {
  WORLD_READABLE: 'world_readable',
  SHARED: 'shared',
  INVITED: 'invited',
  JOINED: 'joined',
};

const items = [{
  iconSrc: null,
  text: 'هر کسی (از جمله مهمانان)',
  type: visibility.WORLD_READABLE,
}, {
  iconSrc: null,
  text: 'اعضا (همه پیام ها)',
  type: visibility.SHARED,
}, {
  iconSrc: null,
  text: 'اعضا (پیام بعد از دعوت)',
  type: visibility.INVITED,
}, {
  iconSrc: null,
  text: 'اعضا (پیام پس از عضویت)',
  type: visibility.JOINED,
}];


function useVisibility(roomId) {
  const mx = useMatrixClient();
  const room = mx.getRoom(roomId);

  const [activeType, setActiveType] = useState(room.getHistoryVisibility());
  useEffect(() => {
    setActiveType(room.getHistoryVisibility());
  }, [room]);

  const setVisibility = useCallback((item) => {
    if (item.type === activeType.type) return;
    setActiveType(item.type);
    mx.sendStateEvent(
      roomId, 'm.room.history_visibility',
      {
        history_visibility: item.type,
      },
    );
  }, [mx, activeType, roomId]);

  return [activeType, setVisibility];
}

function RoomHistoryVisibility({ roomId }) {
  const [activeType, setVisibility] = useVisibility(roomId);
  const mx = useMatrixClient();
  const userId = mx.getUserId();
  const room = mx.getRoom(roomId);
  const { currentState } = room;

  const canChange = currentState.maySendStateEvent('m.room.history_visibility', userId);

  return (
    <div className="room-history-visibility">
      {
        items.map((item) => (
          <MenuItem
            variant={activeType === item.type ? 'positive' : 'surface'}
            key={item.type}
            iconSrc={item.iconSrc}
            onClick={() => setVisibility(item)}
            disabled={(!canChange)}
          >
            <Text varient="b1">
              <span>{item.text}</span>
              <RadioButton isActive={activeType === item.type} />
            </Text>
          </MenuItem>
        ))
      }
      <Text variant="b3">تغییرات در نمایان بودن سابقه فقط برای پیام‌های بعدی اعمال می‌شود. قابل مشاهده بودن تاریخ موجود هیچ تأثیری نخواهد داشت.</Text>
    </div>
  );
}

RoomHistoryVisibility.propTypes = {
  roomId: PropTypes.string.isRequired,
};

export default RoomHistoryVisibility;
