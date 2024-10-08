import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './CreateRoom.scss';

import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';
import { openReusableContextMenu } from '../../../client/action/navigation';
import * as roomActions from '../../../client/action/room';
import { isRoomAliasAvailable, getIdServer } from '../../../util/matrixUtil';
import { getEventCords } from '../../../util/common';

import Text from '../../atoms/text/Text';
import Button from '../../atoms/button/Button';
import Toggle from '../../atoms/button/Toggle';
import IconButton from '../../atoms/button/IconButton';
import { MenuHeader, MenuItem } from '../../atoms/context-menu/ContextMenu';
import Input from '../../atoms/input/Input';
import Spinner from '../../atoms/spinner/Spinner';
import SegmentControl from '../../atoms/segmented-controls/SegmentedControls';
import Dialog from '../../molecules/dialog/Dialog';
import SettingTile from '../../molecules/setting-tile/SettingTile';

import HashPlusIC from '../../../../public/res/ic/outlined/hash-plus.svg';
import SpacePlusIC from '../../../../public/res/ic/outlined/space-plus.svg';
import HashIC from '../../../../public/res/ic/outlined/hash.svg';
import HashLockIC from '../../../../public/res/ic/outlined/hash-lock.svg';
import HashGlobeIC from '../../../../public/res/ic/outlined/hash-globe.svg';
import SpaceIC from '../../../../public/res/ic/outlined/space.svg';
import SpaceLockIC from '../../../../public/res/ic/outlined/space-lock.svg';
import SpaceGlobeIC from '../../../../public/res/ic/outlined/space-globe.svg';
import ChevronBottomIC from '../../../../public/res/ic/outlined/chevron-bottom.svg';
import CrossIC from '../../../../public/res/ic/outlined/cross.svg';
import { useRoomNavigate } from '../../hooks/useRoomNavigate';
import { useMatrixClient } from '../../hooks/useMatrixClient';

function CreateRoomContent({ isSpace, parentId, onRequestClose }) {
  const [joinRule, setJoinRule] = useState(parentId ? 'restricted' : 'invite');
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [creatingError, setCreatingError] = useState(null);
  const { navigateRoom, navigateSpace } = useRoomNavigate();

  const [isValidAddress, setIsValidAddress] = useState(null);
  const [addressValue, setAddressValue] = useState(undefined);
  const [roleIndex, setRoleIndex] = useState(0);

  const addressRef = useRef(null);

  const mx = useMatrixClient();
  const userHs = getIdServer(mx.getUserId());

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const { target } = evt;

    if (isCreatingRoom) return;
    setIsCreatingRoom(true);
    setCreatingError(null);

    const name = target.name.value;
    let topic = target.topic.value;
    if (topic.trim() === '') topic = undefined;
    let roomAlias;
    if (joinRule === 'عمومی') {
      roomAlias = addressRef?.current?.value;
      if (roomAlias.trim() === '') roomAlias = undefined;
    }

    const powerLevel = roleIndex === 1 ? 101 : undefined;

    try {
      const data = await roomActions.createRoom(mx, {
        name,
        topic,
        joinRule,
        alias: roomAlias,
        isEncrypted: isSpace || joinRule === 'عمومی' ? false : isEncrypted,
        powerLevel,
        isSpace,
        parentId,
      });
      setIsCreatingRoom(false);
      setCreatingError(null);
      setIsValidAddress(null);
      setAddressValue(undefined);
      onRequestClose();
      if (isSpace) {
        navigateSpace(data.room_id);
      } else {
        navigateRoom(data.room_id);
      }
    } catch (e) {
      if (e.message === 'خطا : نویسه‌های نامعتبر در نام مستعار اتاق') {
        setCreatingError('اخطار : نویسه های نامعتبر در آدرس');
        setIsValidAddress(false);
      } else if (e.message === 'خطا : نام مستعار اتاق قبلاً گرفته شده است') {
        setCreatingError('اخطار : این آدرس در حال حاضر در حال استفاده است');
        setIsValidAddress(false);
      } else setCreatingError(e.message);
      setIsCreatingRoom(false);
    }
  };

  const validateAddress = (e) => {
    const myAddress = e.target.value;
    setIsValidAddress(null);
    setAddressValue(e.target.value);
    setCreatingError(null);

    setTimeout(async () => {
      if (myAddress !== addressRef.current.value) return;
      const roomAlias = addressRef.current.value;
      if (roomAlias === '') return;
      const roomAddress = `#${roomAlias}:${userHs}`;

      if (await isRoomAliasAvailable(mx, roomAddress)) {
        setIsValidAddress(true);
      } else {
        setIsValidAddress(false);
      }
    }, 1000);
  };

  const joinRules = ['invite', 'محدود شده', 'public'];
  const joinRuleShortText = ['دعوت', 'محدود شده', 'عمومی'];
  const joinRuleText = [
    'خصوصی (فقط دعوت)',
    'محدود شده (عضو فضا می تواند بپیوندد)',
    'عمومی (هر کسی می تواند بپیوندد)',
  ];
  const jrRoomIC = [HashLockIC, HashIC, HashGlobeIC];
  const jrSpaceIC = [SpaceLockIC, SpaceIC, SpaceGlobeIC];
  const handleJoinRule = (evt) => {
    openReusableContextMenu('bottom', getEventCords(evt, '.btn-surface'), (closeMenu) => (
      <>
        <MenuHeader>اختیار (نحوه پیوستن)</MenuHeader>
        {joinRules.map((rule) => (
          <MenuItem
            key={rule}
            variant={rule === joinRule ? 'positive' : 'surface'}
            iconSrc={
              isSpace ? jrSpaceIC[joinRules.indexOf(rule)] : jrRoomIC[joinRules.indexOf(rule)]
            }
            onClick={() => {
              closeMenu();
              setJoinRule(rule);
            }}
            disabled={!parentId && rule === 'restricted'}
          >
            {joinRuleText[joinRules.indexOf(rule)]}
          </MenuItem>
        ))}
      </>
    ));
  };

  return (
    <div className="create-room">
      <form className="create-room__form" onSubmit={handleSubmit}>
        <SettingTile
          title="اختیار"
          options={
            <Button onClick={handleJoinRule} iconSrc={ChevronBottomIC}>
              {joinRuleShortText[joinRules.indexOf(joinRule)]}
            </Button>
          }
          content={
            <Text variant="b3">{`انتخاب کنید چه کسی می تواند به این بپیوندد ${isSpace ? 'فضا' : 'اتاق'}.`}</Text>
          }
        />
        {joinRule === 'public' && (
          <div>
            <Text className="create-room__address__label" variant="b2">
              {isSpace ? 'آدرس فضا' : 'آدرس اتاق'}
            </Text>
            <div className="create-room__address">
              <Text variant="b1">#</Text>
              <Input
                value={addressValue}
                onChange={validateAddress}
                state={isValidAddress === false ? 'error' : 'normal'}
                forwardRef={addressRef}
                placeholder="آدرس_من"
                required
              />
              <Text variant="b1">{`:${userHs}`}</Text>
            </div>
            {isValidAddress === false && (
              <Text className="create-room__address__tip" variant="b3">
                <span
                  style={{ color: 'var(--bg-danger)' }}
                >{`#${addressValue}:${userHs} در حال حاضر در حال استفاده است`}</span>
              </Text>
            )}
          </div>
        )}
        {!isSpace && joinRule !== 'public' && (
          <SettingTile
            title="رمزگذاری سرتاسر را فعال کنید"
            options={<Toggle isActive={isEncrypted} onToggle={setIsEncrypted} />}
            content={
              <Text variant="b3">
                بعداً نمی‌توانید این را غیرفعال کنید. پل‌ها و بیشتر ربات‌ها هنوز کار نمی‌کنند.
              </Text>
            }
          />
        )}
        <SettingTile
          title="نقش خود را انتخاب کنید"
          options={
            <SegmentControl
              selected={roleIndex}
              segments={[{ text: 'مدیر' }, { text: 'موسس' }]}
              onSelect={setRoleIndex}
            />
          }
          content={
            <Text variant="b3">انتخاب مدیر 100 سطح قدرت را تنظیم می کند در حالی که موسس 200 سطح قدرت را تنظیم می کند.</Text>
          }
        />
        <Input name="topic" minHeight={174} resizable label="Topic (optional)" />
        <div className="create-room__name-wrapper">
          <Input name="name" label={`${isSpace ? 'فضا' : 'اتاق'} نام`} required />
          <Button
            disabled={isValidAddress === false || isCreatingRoom}
            iconSrc={isSpace ? SpacePlusIC : HashPlusIC}
            type="submit"
            variant="primary"
          >
            ساختن
          </Button>
        </div>
        {isCreatingRoom && (
          <div className="create-room__loading">
            <Spinner size="small" />
            <Text>{`Creating ${isSpace ? 'فضا' : 'اتاق'}...`}</Text>
          </div>
        )}
        {typeof creatingError === 'string' && (
          <Text className="create-room__error" variant="b3">
            {creatingError}
          </Text>
        )}
      </form>
    </div>
  );
}
CreateRoomContent.defaultProps = {
  parentId: null,
};
CreateRoomContent.propTypes = {
  isSpace: PropTypes.bool.isRequired,
  parentId: PropTypes.string,
  onRequestClose: PropTypes.func.isRequired,
};

function useWindowToggle() {
  const [create, setCreate] = useState(null);

  useEffect(() => {
    const handleOpen = (isSpace, parentId) => {
      setCreate({
        isSpace,
        parentId,
      });
    };
    navigation.on(cons.events.navigation.CREATE_ROOM_OPENED, handleOpen);
    return () => {
      navigation.removeListener(cons.events.navigation.CREATE_ROOM_OPENED, handleOpen);
    };
  }, []);

  const onRequestClose = () => setCreate(null);

  return [create, onRequestClose];
}

function CreateRoom() {
  const [create, onRequestClose] = useWindowToggle();
  const { isSpace, parentId } = create ?? {};
  const mx = useMatrixClient();
  const room = mx.getRoom(parentId);

  return (
    <Dialog
      isOpen={create !== null}
      title={
        <Text variant="s1" weight="medium" primary>
          {parentId ? room.name : 'Home'}
          <span style={{ color: 'var(--tc-surface-low)' }}>
            {` — ساختن ${isSpace ? 'فضا' : 'اتاق'}`}
          </span>
        </Text>
      }
      contentOptions={<IconButton src={CrossIC} onClick={onRequestClose} tooltip="Close" />}
      onRequestClose={onRequestClose}
    >
      {create ? (
        <CreateRoomContent isSpace={isSpace} parentId={parentId} onRequestClose={onRequestClose} />
      ) : (
        <div />
      )}
    </Dialog>
  );
}

export default CreateRoom;
