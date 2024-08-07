import React, { useState, useEffect } from 'react';
import { Input, toRem } from 'folds';
import { isKeyHotkey } from 'is-hotkey';
import './Settings.scss';

import { clearCacheAndReload, logoutClient } from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import settings from '../../../client/state/settings';
import navigation from '../../../client/state/navigation';
import { toggleSystemTheme } from '../../../client/action/settings';
import { usePermissionState } from '../../hooks/usePermission';

import Text from '../../atoms/text/Text';
import IconButton from '../../atoms/button/IconButton';
import Button from '../../atoms/button/Button';
import Toggle from '../../atoms/button/Toggle';
import Tabs from '../../atoms/tabs/Tabs';
import { MenuHeader } from '../../atoms/context-menu/ContextMenu';
import SegmentedControls from '../../atoms/segmented-controls/SegmentedControls';

import PopupWindow from '../../molecules/popup-window/PopupWindow';
import SettingTile from '../../molecules/setting-tile/SettingTile';
import ImportE2ERoomKeys from '../../molecules/import-export-e2e-room-keys/ImportE2ERoomKeys';
import ExportE2ERoomKeys from '../../molecules/import-export-e2e-room-keys/ExportE2ERoomKeys';
import { ImagePackUser, ImagePackGlobal } from '../../molecules/image-pack/ImagePack';
import GlobalNotification from '../../molecules/global-notification/GlobalNotification';
import KeywordNotification from '../../molecules/global-notification/KeywordNotification';
import IgnoreUserList from '../../molecules/global-notification/IgnoreUserList';

import ProfileEditor from '../profile-editor/ProfileEditor';
import CrossSigning from './CrossSigning';
import KeyBackup from './KeyBackup';
import DeviceManage from './DeviceManage';

import SunIC from '../../../../public/res/ic/outlined/sun.svg';
import EmojiIC from '../../../../public/res/ic/outlined/emoji.svg';
import LockIC from '../../../../public/res/ic/outlined/lock.svg';
import BellIC from '../../../../public/res/ic/outlined/bell.svg';
import InfoIC from '../../../../public/res/ic/outlined/info.svg';
import PowerIC from '../../../../public/res/ic/outlined/power.svg';
import CrossIC from '../../../../public/res/ic/outlined/cross.svg';

import CinnySVG from '../../../../public/res/svg/cinny.svg';
import { confirmDialog } from '../../molecules/confirm-dialog/ConfirmDialog';
import { useSetting } from '../../state/hooks/settings';
import { settingsAtom } from '../../state/settings';
import { isMacOS } from '../../utils/user-agent';
import { KeySymbol } from '../../utils/key-symbol';
import { useMatrixClient } from '../../hooks/useMatrixClient';

function AppearanceSection() {
  const [, updateState] = useState({});

  const [enterForNewline, setEnterForNewline] = useSetting(settingsAtom, 'enterForNewline');
  const [messageLayout, setMessageLayout] = useSetting(settingsAtom, 'messageLayout');
  const [messageSpacing, setMessageSpacing] = useSetting(settingsAtom, 'messageSpacing');
  const [twitterEmoji, setTwitterEmoji] = useSetting(settingsAtom, 'twitterEmoji');
  const [pageZoom, setPageZoom] = useSetting(settingsAtom, 'pageZoom');
  const [isMarkdown, setIsMarkdown] = useSetting(settingsAtom, 'isMarkdown');
  const [hideMembershipEvents, setHideMembershipEvents] = useSetting(
    settingsAtom,
    'hideMembershipEvents'
  );
  const [hideNickAvatarEvents, setHideNickAvatarEvents] = useSetting(
    settingsAtom,
    'hideNickAvatarEvents'
  );
  const [mediaAutoLoad, setMediaAutoLoad] = useSetting(settingsAtom, 'mediaAutoLoad');
  const [urlPreview, setUrlPreview] = useSetting(settingsAtom, 'urlPreview');
  const [encUrlPreview, setEncUrlPreview] = useSetting(settingsAtom, 'encUrlPreview');
  const [showHiddenEvents, setShowHiddenEvents] = useSetting(settingsAtom, 'showHiddenEvents');
  const spacings = ['0', '100', '200', '300', '400', '500'];

  const [currentZoom, setCurrentZoom] = useState(`${pageZoom}`);

  const handleZoomChange = (evt) => {
    setCurrentZoom(evt.target.value);
  };

  const handleZoomEnter = (evt) => {
    if (isKeyHotkey('escape', evt)) {
      evt.stopPropagation();
      setCurrentZoom(pageZoom);
    }
    if (isKeyHotkey('enter', evt)) {
      const newZoom = parseInt(evt.target.value, 10);
      if (Number.isNaN(newZoom)) return;
      const safeZoom = Math.max(Math.min(newZoom, 150), 75);
      setPageZoom(safeZoom);
      setCurrentZoom(safeZoom);
    }
  };

  return (
    <div className="settings-appearance">
      <div className="settings-appearance__card">
        <MenuHeader>ظاهری</MenuHeader>
        <SettingTile
          title="تنظیم ظاهری مطابق سیستم عامل"
          options={
            <Toggle
              isActive={settings.useSystemTheme}
              onToggle={() => {
                toggleSystemTheme();
                updateState({});
              }}
            />
          }
          content={<Text variant="b3">بر اساس تنظیمات سیستم از حالت روشن یا تاریک استفاده کنید</Text>}
        />
        <SettingTile
          title="ظاهری"
          content={
            <SegmentedControls
              selected={settings.useSystemTheme ? -1 : settings.getThemeIndex()}
              segments={[
                { text: 'روشن' },
                { text: 'نقره‌ای' },
                { text: 'تاریک' },
                { text: 'زرد تاریک' },
              ]}
              onSelect={(index) => {
                if (settings.useSystemTheme) toggleSystemTheme();
                settings.setTheme(index);
                updateState({});
              }}
            />
          }
        />
        <SettingTile
          title="استفاده از ایموجی های توئیتر"
          options={
            <Toggle isActive={twitterEmoji} onToggle={() => setTwitterEmoji(!twitterEmoji)} />
          }
          content={<Text variant="b3">از ایموجی توییتر به جای ایموجی سیستم استفاده کنید</Text>}
        />
        <SettingTile
          title="اندازه صفحه"
          options={
            <Input
              style={{ width: toRem(150) }}
              variant={pageZoom === parseInt(currentZoom, 10) ? 'Background' : 'Primary'}
              size="400"
              type="number"
              min="75"
              max="150"
              value={currentZoom}
              onChange={handleZoomChange}
              onKeyDown={handleZoomEnter}
              outlined
              after={<Text variant="b2">%</Text>}
            />
          }
          content={
            <Text variant="b3">
              بزرگنمایی صفحه را به مقیاس رابط کاربری بین 75٪ تا 150٪ تغییر دهید. پیش فرض: 100%
            </Text>
          }
        />
      </div>
      <div className="settings-appearance__card">
        <MenuHeader>پیام های اتاق</MenuHeader>
        <SettingTile
          title="لایه پیام"
          content={
            <SegmentedControls
              selected={messageLayout}
              segments={[{ text: 'مدرن' }, { text: 'فشرده' }, { text: 'حبابی' }]}
              onSelect={(index) => setMessageLayout(index)}
            />
          }
        />
        <SettingTile
          title="فاصله پیام ها"
          content={
            <SegmentedControls
              selected={spacings.findIndex((s) => s === messageSpacing)}
              segments={[
                { text: 'No' },
                { text: 'XXS' },
                { text: 'XS' },
                { text: 'S' },
                { text: 'M' },
                { text: 'L' },
              ]}
              onSelect={(index) => {
                setMessageSpacing(spacings[index]);
              }}
            />
          }
        />
        <SettingTile
          title="از ENTER برای خط جدید استفاده کنید"
          options={
            <Toggle
              isActive={enterForNewline}
              onToggle={() => setEnterForNewline(!enterForNewline)}
            />
          }
          content={
            <Text variant="b3">{`Use ${
              isMacOS() ? KeySymbol.Command : 'Ctrl'
            } + ENTER برای ارسال پیام و ENTER برای خط جدید`}</Text>
          }
        />
        <SettingTile
          title="قالب بندی Markdown"
          options={<Toggle isActive={isMarkdown} onToggle={() => setIsMarkdown(!isMarkdown)} />}
          content={<Text variant="b3">قبل از ارسال، پیام ها را با نحو علامت گذاری قالب بندی کنید</Text>}
        />
        <SettingTile
          title="پنهان کردن رویدادهای عضویت"
          options={
            <Toggle
              isActive={hideMembershipEvents}
              onToggle={() => setHideMembershipEvents(!hideMembershipEvents)}
            />
          }
          content={
            <Text variant="b3">
              پیام‌های تغییر عضویت را از جدول زمانی اتاق مخفی کنید. (پیوستن، ترک، دعوت، لگد زدن و ممنوعیت)
            </Text>
          }
        />
        <SettingTile
          title="مخفی کردن نام/آواتار رویداد"
          options={
            <Toggle
              isActive={hideNickAvatarEvents}
              onToggle={() => setHideNickAvatarEvents(!hideNickAvatarEvents)}
            />
          }
          content={
            <Text variant="b3">پیام‌های تغییر نام و آواتار را از جدول زمانی اتاق مخفی کنید</Text>
          }
        />
        <SettingTile
          title="خاموش کردن دانلود خودکار رسانه ها"
          options={
            <Toggle isActive={!mediaAutoLoad} onToggle={() => setMediaAutoLoad(!mediaAutoLoad)} />
          }
          content={
            <Text variant="b3">برای صرفه جویی در پهنای باند، از بارگذاری خودکار تصاویر و ویدیوها جلوگیری کنید</Text>
          }
        />
        <SettingTile
          title="Url پیش نمایش"
          options={<Toggle isActive={urlPreview} onToggle={() => setUrlPreview(!urlPreview)} />}
          content={<Text variant="b3">نمایش پیش نمایش url برای پیوند در پیام ها.</Text>}
        />
        <SettingTile
          title="Url پیش نمایش در اتاق های رمزنگاری شده"
          options={
            <Toggle isActive={encUrlPreview} onToggle={() => setEncUrlPreview(!encUrlPreview)} />
          }
          content={<Text variant="b3">نمایش پیش نمایش url برای پیوند در پیام های رمزگذاری شده.</Text>}
        />
        <SettingTile
          title="نمایش رویدادهای پنهان"
          options={
            <Toggle
              isActive={showHiddenEvents}
              onToggle={() => setShowHiddenEvents(!showHiddenEvents)}
            />
          }
          content={<Text variant="b3">نمایش رویدادهای وضعیت پنهان و پیام</Text>}
        />
      </div>
    </div>
  );
}

function NotificationsSection() {
  const notifPermission = usePermissionState(
    'notifications',
    window.Notification?.permission ?? 'denied'
  );
  const [showNotifications, setShowNotifications] = useSetting(settingsAtom, 'showNotifications');
  const [isNotificationSounds, setIsNotificationSounds] = useSetting(
    settingsAtom,
    'isNotificationSounds'
  );

  const renderOptions = () => {
    if (window.Notification === undefined) {
      return (
        <Text className="settings-notifications__not-supported">
          در مرورگر شما پشتیبانی نمیشود.
        </Text>
      );
    }

    if (notifPermission === 'denied') {
      return <Text>مجوز رد شد</Text>;
    }

    if (notifPermission === 'granted') {
      return (
        <Toggle
          isActive={showNotifications}
          onToggle={() => {
            setShowNotifications(!showNotifications);
          }}
        />
      );
    }

    return (
      <Button
        variant="primary"
        onClick={() =>
          window.Notification.requestPermission().then(() => {
            setShowNotifications(window.Notification?.permission === 'granted');
          })
        }
      >
        درخواست مجوز
      </Button>
    );
  };

  return (
    <>
      <div className="settings-notifications">
        <MenuHeader>اعلانات و صداها</MenuHeader>
        <SettingTile
          title="اعلان دسکتاپ"
          options={renderOptions()}
          content={<Text variant="b3">نمایش اعلان دسکتاپ هنگام رسیدن پیام های جدید.</Text>}
        />
        <SettingTile
          title="صدای اعلانات"
          options={
            <Toggle
              isActive={isNotificationSounds}
              onToggle={() => setIsNotificationSounds(!isNotificationSounds)}
            />
          }
          content={<Text variant="b3">با رسیدن پیام‌های جدید، صدا را پخش کنید</Text>}
        />
      </div>
      <GlobalNotification />
      <KeywordNotification />
      <IgnoreUserList />
    </>
  );
}

function EmojiSection() {
  return (
    <>
      <div className="settings-emoji__card">
        <ImagePackUser />
      </div>
      <div className="settings-emoji__card">
        <ImagePackGlobal />
      </div>
    </>
  );
}

function SecuritySection() {
  return (
    <div className="settings-security">
      <div className="settings-security__card">
        <MenuHeader>امضای متقاطع و پشتیبان گیری</MenuHeader>
        <CrossSigning />
        <KeyBackup />
      </div>
      <DeviceManage />
      <div className="settings-security__card">
        <MenuHeader>صادر / وارد کردن کلیدهای رمزگذاری</MenuHeader>
        <SettingTile
          title="خروجی کلیدهای اتاق های E2E"
          content={
            <>
              <Text variant="b3">
                کلیدهای اتاق رمزگذاری سرتاسر را برای رمزگشایی پیام های قدیمی در جلسه دیگر صادر کنید. برای رمزگذاری کلیدها باید یک رمز عبور تعیین کنید که در هنگام وارد کردن استفاده می شود
              </Text>
              <ExportE2ERoomKeys />
            </>
          }
        />
        <SettingTile
          title="واردکردن کلیدهای اتاق های E2E"
          content={
            <>
              <Text variant="b3">
                {
                  "برای رمزگشایی پیام‌های قدیمی‌تر، کلیدهای اتاق E2EE را از عنصر (تنظیمات &gt; امنیت و حریم خصوصی &gt; رمزگذاری &gt; رمزنگاری) صادر کنید و آنها را در اینجا وارد کنید. کلیدهای وارد شده رمزگذاری شده اند، بنابراین برای رمزگشایی باید رمز عبوری را که تعیین کرده اید وارد کنید."
                }
              </Text>
              <ImportE2ERoomKeys />
            </>
          }
        />
      </div>
    </div>
  );
}

function AboutSection() {
  const mx = useMatrixClient();

  return (
    <div className="settings-about">
      <div className="settings-about__card">
        <MenuHeader>اپلیکیشن</MenuHeader>
        <div className="settings-about__branding">
          <img width="60" height="60" src={CinnySVG} alt="Otagh logo" />
          <div>
            <Text variant="h2" weight="medium">
              پیام رسان اتاق
              <span
                className="text text-b3"
                style={{ margin: '0 var(--sp-extra-tight)' }}
              >{`v${cons.version}`}</span>
            </Text>
            <Text>پیام رسانی امن، غیرمتمرکز و سریع بر پایه بلاکچین جهت یک تجربه خوب پیام رسانی امن و سریع.</Text>
            <br></br>
            <Text>ساخته شده توسط امیررضا اسکندرزاده</Text>

            <div className="settings-about__btns">
              <Button onClick={() => clearCacheAndReload(mx)} variant="danger">
                حذف حافظه پنهان و بارگزاری مجدد
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="settings-about__card">
        <MenuHeader>منابع</MenuHeader>
        <div className="settings-about__credits">
          <ul>
            <li>
              {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
              <Text>
                The{' '}
                <a
                  href="https://github.com/matrix-org/matrix-js-sdk"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  matrix-js-sdk
                </a>{' '}
                is ©{' '}
                <a href="https://matrix.org/foundation" rel="noreferrer noopener" target="_blank">
                  The Matrix.org Foundation C.I.C
                </a>{' '}
                used under the terms of{' '}
                <a
                  href="http://www.apache.org/licenses/LICENSE-2.0"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Apache 2.0
                </a>
                .
              </Text>
            </li>
            <li>
              {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
              <Text>
                The{' '}
                <a
                  href="https://github.com/mozilla/twemoji-colr"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  twemoji-colr
                </a>{' '}
                font is ©{' '}
                <a href="https://mozilla.org/" target="_blank" rel="noreferrer noopener">
                  Mozilla Foundation
                </a>{' '}
                used under the terms of{' '}
                <a
                  href="http://www.apache.org/licenses/LICENSE-2.0"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Apache 2.0
                </a>
                .
              </Text>
            </li>
            <li>
              {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
              <Text>
                The{' '}
                <a href="https://twemoji.twitter.com" target="_blank" rel="noreferrer noopener">
                  Twemoji
                </a>{' '}
                emoji art is ©{' '}
                <a href="https://twemoji.twitter.com" target="_blank" rel="noreferrer noopener">
                  Twitter, Inc and other contributors
                </a>{' '}
                used under the terms of{' '}
                <a
                  href="https://creativecommons.org/licenses/by/4.0/"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  CC-BY 4.0
                </a>
                .
              </Text>
            </li>
            <li>
              {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
              <Text>
                The{' '}
                <a
                  href="https://material.io/design/sound/sound-resources.html"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Material sound resources
                </a>{' '}
                are ©{' '}
                <a href="https://google.com" target="_blank" rel="noreferrer noopener">
                  Google
                </a>{' '}
                used under the terms of{' '}
                <a
                  href="https://creativecommons.org/licenses/by/4.0/"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  CC-BY 4.0
                </a>
                .
              </Text>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export const tabText = {
  APPEARANCE: 'ظاهر',
  NOTIFICATIONS: 'اعلانات',
  EMOJI: 'ایموجی',
  SECURITY: 'امنیت',
  ABOUT: 'درباره',
};
const tabItems = [
  {
    text: tabText.APPEARANCE,
    iconSrc: SunIC,
    disabled: false,
    render: () => <AppearanceSection />,
  },
  {
    text: tabText.NOTIFICATIONS,
    iconSrc: BellIC,
    disabled: false,
    render: () => <NotificationsSection />,
  },
  {
    text: tabText.EMOJI,
    iconSrc: EmojiIC,
    disabled: false,
    render: () => <EmojiSection />,
  },
  {
    text: tabText.SECURITY,
    iconSrc: LockIC,
    disabled: false,
    render: () => <SecuritySection />,
  },
  {
    text: tabText.ABOUT,
    iconSrc: InfoIC,
    disabled: false,
    render: () => <AboutSection />,
  },
];

function useWindowToggle(setSelectedTab) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const openSettings = (tab) => {
      const tabItem = tabItems.find((item) => item.text === tab);
      if (tabItem) setSelectedTab(tabItem);
      setIsOpen(true);
    };
    navigation.on(cons.events.navigation.SETTINGS_OPENED, openSettings);
    return () => {
      navigation.removeListener(cons.events.navigation.SETTINGS_OPENED, openSettings);
    };
  }, []);

  const requestClose = () => setIsOpen(false);

  return [isOpen, requestClose];
}

function Settings() {
  const [selectedTab, setSelectedTab] = useState(tabItems[0]);
  const [isOpen, requestClose] = useWindowToggle(setSelectedTab);
  const mx = useMatrixClient();

  const handleTabChange = (tabItem) => setSelectedTab(tabItem);
  const handleLogout = async () => {
    if (
      await confirmDialog(
        'خارج شدن',
        'آیا مطمئن هستید که می خواهید از جلسه خود خارج شوید؟',
        'خارج شدن',
        'danger'
      )
    ) {
      logoutClient(mx);
    }
  };

  return (
    <PopupWindow
      isOpen={isOpen}
      className="settings-window"
      title={
        <Text variant="s1" weight="medium" primary>
          تنظیمات
        </Text>
      }
      contentOptions={
        <>
          <Button variant="danger" iconSrc={PowerIC} onClick={handleLogout}>
            خارج شدن
          </Button>
          <IconButton src={CrossIC} onClick={requestClose} tooltip="Close" />
        </>
      }
      onRequestClose={requestClose}
    >
      {isOpen && (
        <div className="settings-window__content">
          <ProfileEditor userId={mx.getUserId()} />
          <Tabs
            items={tabItems}
            defaultSelected={tabItems.findIndex((tab) => tab.text === selectedTab.text)}
            onSelect={handleTabChange}
          />
          <div className="settings-window__cards-wrapper">{selectedTab.render()}</div>
        </div>
      )}
    </PopupWindow>
  );
}

export default Settings;
