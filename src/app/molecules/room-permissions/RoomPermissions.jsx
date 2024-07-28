import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import './RoomPermissions.scss';

import { getPowerLabel } from '../../../util/matrixUtil';
import { openReusableContextMenu } from '../../../client/action/navigation';
import { getEventCords } from '../../../util/common';

import Text from '../../atoms/text/Text';
import Button from '../../atoms/button/Button';
import { MenuHeader } from '../../atoms/context-menu/ContextMenu';
import PowerLevelSelector from '../power-level-selector/PowerLevelSelector';
import SettingTile from '../setting-tile/SettingTile';

import ChevronBottomIC from '../../../../public/res/ic/outlined/chevron-bottom.svg';

import { useForceUpdate } from '../../hooks/useForceUpdate';
import { useMatrixClient } from '../../hooks/useMatrixClient';

const permissionsInfo = {
  users_default: {
    name: 'نقش پیش فرض',
    description: 'نقش پیش فرض را برای همه اعضا تنظیم کنید.',
    default: 0,
  },
  events_default: {
    name: 'ارسال پیام ها',
    description: 'حداقل سطح توان را برای ارسال پیام در اتاق تنظیم کنید.',
    default: 0,
  },
  'm.reaction': {
    parent: 'events',
    name: 'ارسال واکنش ها',
    description: 'حداقل سطح توان را برای ارسال واکنش ها در اتاق تنظیم کنید.',
    default: 0,
  },
  redact: {
    name: ' حذف پیام های ارسال شده توسط دیگران',
    description: 'حداقل سطح توان را برای حذف پیام های اتاق تنظیم کنید.',
    default: 50,
  },
  notifications: {
    name: 'اتاق پینگ',
    description: 'حداقل سطح توان را روی اتاق پینگ تنظیم کنید.',
    default: {
      room: 50,
    },
  },
  'm.space.child': {
    parent: 'events',
    name: 'اتاق ها را در فضا مدیریت کنید',
    description: 'حداقل سطح توان را برای مدیریت اتاق ها در فضا تنظیم کنید.',
    default: 50,
  },
  invite: {
    name: 'دعوت',
    description: 'حداقل سطح قدرت را برای دعوت از اعضا تنظیم کنید.',
    default: 50,
  },
  kick: {
    name: 'لگد کردن',
    description: 'حداقل سطح قدرت را برای ضربه زدن به اعضا تنظیم کنید.',
    default: 50,
  },
  ban: {
    name: 'مسدود کردن',
    description: 'حداقل سطح قدرت را برای ممنوعیت اعضا تنظیم کنید.',
    default: 50,
  },
  'm.room.avatar': {
    parent: 'events',
    name: 'انتخاب آواتار',
    description: 'حداقل سطح توان را برای تغییر آواتار اتاق/فضا تنظیم کنید.',
    default: 50,
  },
  'm.room.name': {
    parent: 'events',
    name: 'انتخاب نام',
    description: 'حداقل سطح توان را برای تغییر نام اتاق/فضا تنظیم کنید.',
    default: 50,
  },
  'm.room.topic': {
    parent: 'events',
    name: 'انتخاب موضوع',
    description: 'حداقل سطح توان را برای تغییر موضوع اتاق/فضا تنظیم کنید.',
    default: 50,
  },
  state_default: {
    name: 'انتخاب تنظیمات',
    description: 'حداقل سطح توان را برای تغییر تنظیمات تنظیم کنید.',
    default: 50,
  },
  'm.room.canonical_alias': {
    parent: 'events',
    name: 'انتخاب آدرس انتشار یافته',
    description: 'حداقل سطح توان را برای انتشار و تنظیم آدرس اصلی تنظیم کنید.',
    default: 50,
  },
  'm.room.power_levels': {
    parent: 'events',
    name: 'انتخاب دسترسی ها',
    description: 'حداقل سطح توان را برای تغییر مجوزها تنظیم کنید.',
    default: 50,
  },
  'm.room.encryption': {
    parent: 'events',
    name: 'فعال کردن رمزنگاری اتاق',
    description: 'حداقل سطح توان را برای فعال کردن رمزگذاری اتاق تنظیم کنید.',
    default: 50,
  },
  'm.room.history_visibility': {
    parent: 'events',
    name: 'تغییر نمایان بودن تاریخچه',
    description: 'حداقل سطح توان را برای تغییر نمایان بودن تاریخچه پیام‌های اتاق تنظیم کنید.',
    default: 50,
  },
  'm.room.tombstone': {
    parent: 'events',
    name: 'آپدیت اتاق',
    description: 'حداقل سطح توان را برای ارتقای اتاق تنظیم کنید.',
    default: 50,
  },
  'm.room.pinned_events': {
    parent: 'events',
    name: 'پین کردن پیام ها',
    description: 'حداقل سطح توان را برای پین کردن پیام‌ها در اتاق تنظیم کنید.',
    default: 50,
  },
  'm.room.server_acl': {
    parent: 'events',
    name: 'انتخاب سرور ACLs',
    description: 'حداقل سطح توان را برای تغییر ACL های سرور تنظیم کنید.',
    default: 50,
  },
  'im.vector.modular.widgets': {
    parent: 'events',
    name: 'اصلاح ویجت ها',
    description: 'حداقل سطح توان را برای اصلاح ویجت‌های اتاق تنظیم کنید.',
    default: 50,
  },
};

const roomPermsGroups = {
  'General Permissions': ['users_default', 'events_default', 'm.reaction', 'redact', 'notifications'],
  'Manage members permissions': ['invite', 'kick', 'ban'],
  'Room profile permissions': ['m.room.avatar', 'm.room.name', 'm.room.topic'],
  'Settings permissions': ['state_default', 'm.room.canonical_alias', 'm.room.power_levels', 'm.room.encryption', 'm.room.history_visibility'],
  'Other permissions': ['m.room.tombstone', 'm.room.pinned_events', 'm.room.server_acl', 'im.vector.modular.widgets'],
};

const spacePermsGroups = {
  'General Permissions': ['users_default', 'm.space.child'],
  'Manage members permissions': ['invite', 'kick', 'ban'],
  'Space profile permissions': ['m.room.avatar', 'm.room.name', 'm.room.topic'],
  'Settings permissions': ['state_default', 'm.room.canonical_alias', 'm.room.power_levels'],
};

function useRoomStateUpdate(roomId) {
  const [, forceUpdate] = useForceUpdate();
  const mx = useMatrixClient();

  useEffect(() => {
    const handleStateEvent = (event) => {
      if (event.getRoomId() !== roomId) return;
      forceUpdate();
    };

    mx.on('RoomState.events', handleStateEvent);
    return () => {
      mx.removeListener('RoomState.events', handleStateEvent);
    };
  }, [mx, roomId]);
}

function RoomPermissions({ roomId }) {
  useRoomStateUpdate(roomId);
  const mx = useMatrixClient();
  const room = mx.getRoom(roomId);
  const pLEvent = room.currentState.getStateEvents('m.room.power_levels')[0];
  const permissions = pLEvent.getContent();
  const canChangePermission = room.currentState.maySendStateEvent('m.room.power_levels', mx.getUserId());
  const myPowerLevel = room.getMember(mx.getUserId())?.powerLevel ?? 100;

  const handlePowerSelector = (e, permKey, parentKey, powerLevel) => {
    const handlePowerLevelChange = (newPowerLevel) => {
      if (powerLevel === newPowerLevel) return;

      const newPermissions = { ...permissions };
      if (parentKey) {
        newPermissions[parentKey] = {
          ...permissions[parentKey],
          [permKey]: newPowerLevel,
        };
      } else if (permKey === 'notifications') {
        newPermissions[permKey] = {
          ...permissions[permKey],
          room: newPowerLevel,
        };
      } else {
        newPermissions[permKey] = newPowerLevel;
      }

      mx.sendStateEvent(roomId, 'm.room.power_levels', newPermissions);
    };

    openReusableContextMenu(
      'bottom',
      getEventCords(e, '.btn-surface'),
      (closeMenu) => (
        <PowerLevelSelector
          value={powerLevel}
          max={myPowerLevel}
          onSelect={(pl) => {
            closeMenu();
            handlePowerLevelChange(pl);
          }}
        />
      ),
    );
  };

  const permsGroups = room.isSpaceRoom() ? spacePermsGroups : roomPermsGroups;
  return (
    <div className="room-permissions">
      {
        Object.keys(permsGroups).map((groupKey) => {
          const groupedPermKeys = permsGroups[groupKey];
          return (
            <div className="room-permissions__card" key={groupKey}>
              <MenuHeader>{groupKey}</MenuHeader>
              {
                groupedPermKeys.map((permKey) => {
                  const permInfo = permissionsInfo[permKey];

                  let powerLevel = 0;
                  let permValue = permInfo.parent
                    ? permissions[permInfo.parent]?.[permKey]
                    : permissions[permKey];

                  if (permValue === undefined) permValue = permInfo.default;

                  if (typeof permValue === 'number') {
                    powerLevel = permValue;
                  } else if (permKey === 'notifications') {
                    powerLevel = permValue.room ?? 50;
                  }
                  return (
                    <SettingTile
                      key={permKey}
                      title={permInfo.name}
                      content={<Text variant="b3">{permInfo.description}</Text>}
                      options={(
                        <Button
                          onClick={
                            canChangePermission
                              ? (e) => handlePowerSelector(e, permKey, permInfo.parent, powerLevel)
                              : null
                          }
                          iconSrc={canChangePermission ? ChevronBottomIC : null}
                        >
                          <Text variant="b2">
                            {`${getPowerLabel(powerLevel) || 'دنبال کننده'} - ${powerLevel}`}
                          </Text>
                        </Button>
                      )}
                    />
                  );
                })
              }
            </div>
          );
        })
      }
    </div>
  );
}

RoomPermissions.propTypes = {
  roomId: PropTypes.string.isRequired,
};

export default RoomPermissions;
