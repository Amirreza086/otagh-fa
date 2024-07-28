/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './KeyBackup.scss';

import { openReusableDialog } from '../../../client/action/navigation';
import { deletePrivateKey } from '../../../client/state/secretStorageKeys';

import Text from '../../atoms/text/Text';
import Button from '../../atoms/button/Button';
import IconButton from '../../atoms/button/IconButton';
import Spinner from '../../atoms/spinner/Spinner';
import InfoCard from '../../atoms/card/InfoCard';
import SettingTile from '../../molecules/setting-tile/SettingTile';

import { accessSecretStorage } from './SecretStorageAccess';

import InfoIC from '../../../../public/res/ic/outlined/info.svg';
import BinIC from '../../../../public/res/ic/outlined/bin.svg';
import DownloadIC from '../../../../public/res/ic/outlined/download.svg';

import { useStore } from '../../hooks/useStore';
import { useCrossSigningStatus } from '../../hooks/useCrossSigningStatus';
import { useMatrixClient } from '../../hooks/useMatrixClient';

function CreateKeyBackupDialog({ keyData }) {
  const [done, setDone] = useState(false);
  const mx = useMatrixClient();
  const mountStore = useStore();

  const doBackup = async () => {
    setDone(false);
    let info;

    try {
      info = await mx.prepareKeyBackupVersion(null, { secureSecretStorage: true });
      info = await mx.createKeyBackupVersion(info);
      await mx.scheduleAllGroupSessionsForBackup();
      if (!mountStore.getItem()) return;
      setDone(true);
    } catch (e) {
      deletePrivateKey(keyData.keyId);
      await mx.deleteKeyBackupVersion(info.version);
      if (!mountStore.getItem()) return;
      setDone(null);
    }
  };

  useEffect(() => {
    mountStore.setItem(true);
    doBackup();
  }, []);

  return (
    <div className="key-backup__create">
      {done === false && (
        <div>
          <Spinner size="small" />
          <Text>در حال ساختن پشتیبان...</Text>
        </div>
      )}
      {done === true && (
        <>
          <Text variant="h1">✅</Text>
          <Text>فایل پشتیبان با موفقیت ساخته شد.</Text>
        </>
      )}
      {done === null && (
        <>
          <Text>ساخت فایل پشتیبان ناموفق بود.</Text>
          <Button onClick={doBackup}>تلاش دوباره</Button>
        </>
      )}
    </div>
  );
}
CreateKeyBackupDialog.propTypes = {
  keyData: PropTypes.shape({}).isRequired,
};

function RestoreKeyBackupDialog({ keyData }) {
  const [status, setStatus] = useState(false);
  const mx = useMatrixClient();
  const mountStore = useStore();

  const restoreBackup = async () => {
    setStatus(false);

    let meBreath = true;
    const progressCallback = (progress) => {
      if (!progress.successes) return;
      if (meBreath === false) return;
      meBreath = false;
      setTimeout(() => {
        meBreath = true;
      }, 200);

      setStatus({ message: `Restoring backup keys... (${progress.successes}/${progress.total})` });
    };

    try {
      const backupInfo = await mx.getKeyBackupVersion();
      const info = await mx.restoreKeyBackupWithSecretStorage(backupInfo, undefined, undefined, {
        progressCallback,
      });
      if (!mountStore.getItem()) return;
      setStatus({ done: `کلیدهای پشتیبان با موفقیت بازیابی شدند (${info.imported}/${info.total}).` });
    } catch (e) {
      if (!mountStore.getItem()) return;
      if (e.errcode === 'RESTORE_BACKUP_ERROR_BAD_KEY') {
        deletePrivateKey(keyData.keyId);
        setStatus({ error: 'بازیابی نسخه پشتیبان انجام نشد. کلید نامعتبر است!', errorCode: 'BAD_KEY' });
      } else {
        setStatus({ error: 'بازیابی نسخه پشتیبان انجام نشد', errCode: 'UNKNOWN' });
      }
    }
  };

  useEffect(() => {
    mountStore.setItem(true);
    restoreBackup();
  }, []);

  return (
    <div className="key-backup__restore">
      {(status === false || status.message) && (
        <div>
          <Spinner size="small" />
          <Text>{status.message ?? 'بازنشانی کلید پشتیبانی...'}</Text>
        </div>
      )}
      {status.done && (
        <>
          <Text variant="h1">✅</Text>
          <Text>{status.done}</Text>
        </>
      )}
      {status.error && (
        <>
          <Text>{status.error}</Text>
          <Button onClick={restoreBackup}>تلاش دوباره</Button>
        </>
      )}
    </div>
  );
}
RestoreKeyBackupDialog.propTypes = {
  keyData: PropTypes.shape({}).isRequired,
};

function DeleteKeyBackupDialog({ requestClose }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const mx = useMatrixClient();
  const mountStore = useStore();

  const deleteBackup = async () => {
    mountStore.setItem(true);
    setIsDeleting(true);
    try {
      const backupInfo = await mx.getKeyBackupVersion();
      if (backupInfo) await mx.deleteKeyBackupVersion(backupInfo.version);
      if (!mountStore.getItem()) return;
      requestClose(true);
    } catch {
      if (!mountStore.getItem()) return;
      setIsDeleting(false);
    }
  };

  return (
    <div className="key-backup__delete">
      <Text variant="h1">🗑</Text>
      <Text weight="medium">حذف بکاپ کلید دائمی است</Text>
      <Text>تمام کلیدهای پیام های رمزگذاری شده ذخیره شده در سرور حذف خواهند شد</Text>
      {isDeleting ? (
        <Spinner size="small" />
      ) : (
        <Button variant="danger" onClick={deleteBackup}>
          حذف کردن
        </Button>
      )}
    </div>
  );
}
DeleteKeyBackupDialog.propTypes = {
  requestClose: PropTypes.func.isRequired,
};

function KeyBackup() {
  const mx = useMatrixClient();
  const isCSEnabled = useCrossSigningStatus();
  const [keyBackup, setKeyBackup] = useState(undefined);
  const mountStore = useStore();

  const fetchKeyBackupVersion = async () => {
    const info = await mx.getKeyBackupVersion();
    if (!mountStore.getItem()) return;
    setKeyBackup(info);
  };

  useEffect(() => {
    mountStore.setItem(true);
    fetchKeyBackupVersion();

    const handleAccountData = (event) => {
      if (event.getType() === 'm.megolm_backup.v1') {
        fetchKeyBackupVersion();
      }
    };

    mx.on('accountData', handleAccountData);
    return () => {
      mx.removeListener('accountData', handleAccountData);
    };
  }, [isCSEnabled]);

  const openCreateKeyBackup = async () => {
    const keyData = await accessSecretStorage(mx, 'Create Key Backup');
    if (keyData === null) return;

    openReusableDialog(
      <Text variant="s1" weight="medium">
        ساختن کلید پشتیبان
      </Text>,
      () => <CreateKeyBackupDialog keyData={keyData} />,
      () => fetchKeyBackupVersion()
    );
  };

  const openRestoreKeyBackup = async () => {
    const keyData = await accessSecretStorage(mx, 'Restore Key Backup');
    if (keyData === null) return;

    openReusableDialog(
      <Text variant="s1" weight="medium">
        بازنشانی کلید پشتیبان
      </Text>,
      () => <RestoreKeyBackupDialog keyData={keyData} />
    );
  };

  const openDeleteKeyBackup = () =>
    openReusableDialog(
      <Text variant="s1" weight="medium">
        پاک کردن کلید پشتیبان
      </Text>,
      (requestClose) => (
        <DeleteKeyBackupDialog
          requestClose={(isDone) => {
            if (isDone) setKeyBackup(null);
            requestClose();
          }}
        />
      )
    );

  const renderOptions = () => {
    if (keyBackup === undefined) return <Spinner size="small" />;
    if (keyBackup === null)
      return (
        <Button variant="primary" onClick={openCreateKeyBackup}>
          ساختن فایل پشتیبان
        </Button>
      );
    return (
      <>
        <IconButton
          src={DownloadIC}
          variant="positive"
          onClick={openRestoreKeyBackup}
          tooltip="Restore backup"
        />
        <IconButton src={BinIC} onClick={openDeleteKeyBackup} tooltip="Delete backup" />
      </>
    );
  };

  return (
    <SettingTile
      title="رمزنگاری پیام های پشتیبان گیری شده"
      content={
        <>
          <Text variant="b3">
            در صورت از دست دادن دسترسی به جلسات خود، از کلیدهای پیام های رمزگذاری شده خود با داده های حساب خود نسخه پشتیبان آنلاین تهیه کنید. کلیدهای شما با یک کلید امنیتی منحصر به فرد ایمن می شوند
          </Text>
          {!isCSEnabled && (
            <InfoCard
              style={{ marginTop: 'var(--sp-ultra-tight)' }}
              rounded
              variant="caution"
              iconSrc={InfoIC}
              title="برای پشتیبان گیری از پیام های رمزگذاری شده خود، امضای متقاطع را تنظیم کنید."
            />
          )}
        </>
      }
      options={isCSEnabled ? renderOptions() : null}
    />
  );
}

export default KeyBackup;
