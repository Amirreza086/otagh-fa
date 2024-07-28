/* eslint-disable react/jsx-one-expression-per-line */
import React, { useState } from 'react';
import './CrossSigning.scss';
import FileSaver from 'file-saver';
import { Formik } from 'formik';

import { openReusableDialog } from '../../../client/action/navigation';
import { copyToClipboard } from '../../../util/common';
import { clearSecretStorageKeys } from '../../../client/state/secretStorageKeys';

import Text from '../../atoms/text/Text';
import Button from '../../atoms/button/Button';
import Input from '../../atoms/input/Input';
import Spinner from '../../atoms/spinner/Spinner';
import SettingTile from '../../molecules/setting-tile/SettingTile';

import { authRequest } from './AuthRequest';
import { useCrossSigningStatus } from '../../hooks/useCrossSigningStatus';
import { useMatrixClient } from '../../hooks/useMatrixClient';

const failedDialog = () => {
  const renderFailure = (requestClose) => (
    <div className="cross-signing__failure">
      <Text variant="h1">❌</Text>
      <Text weight="medium">امضای متقاطع تنظیم نشد. لطفا دوباره تلاش کنید.</Text>
      <Button onClick={requestClose}>بستن</Button>
    </div>
  );

  openReusableDialog(
    <Text variant="s1" weight="medium">
      راه اندازی امضای متقاطع
    </Text>,
    renderFailure
  );
};

const securityKeyDialog = (key) => {
  const downloadKey = () => {
    const blob = new Blob([key.encodedPrivateKey], {
      type: 'text/plain;charset=us-ascii',
    });
    FileSaver.saveAs(blob, 'security-key.txt');
  };
  const copyKey = () => {
    copyToClipboard(key.encodedPrivateKey);
  };

  const renderSecurityKey = () => (
    <div className="cross-signing__key">
      <Text weight="medium">لطفاً این کلید امنیتی را در جایی امن ذخیره کنید.</Text>
      <Text className="cross-signing__key-text">{key.encodedPrivateKey}</Text>
      <div className="cross-signing__key-btn">
        <Button variant="primary" onClick={() => copyKey(key)}>
          کپی
        </Button>
        <Button onClick={() => downloadKey(key)}>دانلود</Button>
      </div>
    </div>
  );

  // Download automatically.
  downloadKey();

  openReusableDialog(
    <Text variant="s1" weight="medium">
      کلید امنیتی
    </Text>,
    () => renderSecurityKey()
  );
};

function CrossSigningSetup() {
  const initialValues = { phrase: '', confirmPhrase: '' };
  const [genWithPhrase, setGenWithPhrase] = useState(undefined);
  const mx = useMatrixClient();

  const setup = async (securityPhrase = undefined) => {
    setGenWithPhrase(typeof securityPhrase === 'string');
    const recoveryKey = await mx.createRecoveryKeyFromPassphrase(securityPhrase);
    clearSecretStorageKeys();

    await mx.bootstrapSecretStorage({
      createSecretStorageKey: async () => recoveryKey,
      setupNewKeyBackup: true,
      setupNewSecretStorage: true,
    });

    const authUploadDeviceSigningKeys = async (makeRequest) => {
      const isDone = await authRequest('Setup cross signing', async (auth) => {
        await makeRequest(auth);
      });
      setTimeout(() => {
        if (isDone) securityKeyDialog(recoveryKey);
        else failedDialog();
      });
    };

    await mx.bootstrapCrossSigning({
      authUploadDeviceSigningKeys,
      setupNewCrossSigning: true,
    });
  };

  const validator = (values) => {
    const errors = {};
    if (values.phrase === '12345678') {
      errors.phrase = 'درباره 87654321 ?';
    }
    if (values.phrase === '87654321') {
      errors.phrase = 'داری باهاش ​​بازی میکنی 🔥';
    }
    const PHRASE_REGEX = /^([^\s]){8,127}$/;
    if (values.phrase.length > 0 && !PHRASE_REGEX.test(values.phrase)) {
      errors.phrase = 'عبارت باید دارای 8 تا 127 کاراکتر بدون فاصله باشد';
    }
    if (values.confirmPhrase.length > 0 && values.confirmPhrase !== values.phrase) {
      errors.confirmPhrase = "عبارت مطابقت ندارد.";
    }
    return errors;
  };

  return (
    <div className="cross-signing__setup">
      <div className="cross-signing__setup-entry">
        <Text>
          ما یک را تولید خواهیم کرد <b>کلید امنیتی</b>, که می‌توانید برای مدیریت پشتیبان‌گیری پیام‌ها و تأیید جلسه استفاده کنید
        </Text>
        {genWithPhrase !== false && (
          <Button variant="primary" onClick={() => setup()} disabled={genWithPhrase !== undefined}>
            تولید کلید
          </Button>
        )}
        {genWithPhrase === false && <Spinner size="small" />}
      </div>
      <Text className="cross-signing__setup-divider">یا</Text>
      <Formik
        initialValues={initialValues}
        onSubmit={(values) => setup(values.phrase)}
        validate={validator}
      >
        {({ values, errors, handleChange, handleSubmit }) => (
          <form
            className="cross-signing__setup-entry"
            onSubmit={handleSubmit}
            disabled={genWithPhrase !== undefined}
          >
            <Text>
              همچنین می توانید را تنظیم کنید <b>عبارت امنیتی </b>
              بنابراین لازم نیست کلید امنیتی طولانی را به خاطر بسپارید و به صورت اختیاری کلید را به عنوان پشتیبان ذخیره کنید.
            </Text>
            <Input
              name="phrase"
              value={values.phrase}
              onChange={handleChange}
              label="Security Phrase"
              type="password"
              required
              disabled={genWithPhrase !== undefined}
            />
            {errors.phrase && (
              <Text variant="b3" className="cross-signing__error">
                {errors.phrase}
              </Text>
            )}
            <Input
              name="confirmPhrase"
              value={values.confirmPhrase}
              onChange={handleChange}
              label="Confirm Security Phrase"
              type="password"
              required
              disabled={genWithPhrase !== undefined}
            />
            {errors.confirmPhrase && (
              <Text variant="b3" className="cross-signing__error">
                {errors.confirmPhrase}
              </Text>
            )}
            {genWithPhrase !== true && (
              <Button variant="primary" type="submit" disabled={genWithPhrase !== undefined}>
                تنظیم عبارت و تولید کلید
              </Button>
            )}
            {genWithPhrase === true && <Spinner size="small" />}
          </form>
        )}
      </Formik>
    </div>
  );
}

const setupDialog = () => {
  openReusableDialog(
    <Text variant="s1" weight="medium">
      امضای متقاطع را تنظیم کنید
    </Text>,
    () => <CrossSigningSetup />
  );
};

function CrossSigningReset() {
  return (
    <div className="cross-signing__reset">
      <Text variant="h1">✋🧑‍🚒🤚</Text>
      <Text weight="medium">بازنشانی کلیدهای امضای متقاطع دائمی است.</Text>
      <Text>
        هرکسی که با آنها تأیید شده است هشدارهای امنیتی را می بیند و پشتیبان پیام شما از بین می رود. تقریباً مطمئناً نمی خواهید این کار را انجام دهید، مگر اینکه از دست داده باشید <b>کلید امنیتی</b> یا{' '}
        <b>عبارت امنیتی</b> و هر جلسه ای که می توانید از آن امضا بگیرید.
      </Text>
      <Button variant="danger" onClick={setupDialog}>
        بازنشانی
      </Button>
    </div>
  );
}

const resetDialog = () => {
  openReusableDialog(
    <Text variant="s1" weight="medium">
      بازنشانی امضای متقاطع
    </Text>,
    () => <CrossSigningReset />
  );
};

function CrossSignin() {
  const isCSEnabled = useCrossSigningStatus();
  return (
    <SettingTile
      title="Cross signing"
      content={
        <Text variant="b3">
          برای تأیید و پیگیری همه جلسات خود تنظیم کنید. همچنین برای تهیه نسخه پشتیبان از پیام رمزگذاری شده مورد نیاز است
        </Text>
      }
      options={
        isCSEnabled ? (
          <Button variant="danger" onClick={resetDialog}>
            بازنشانی
          </Button>
        ) : (
          <Button variant="primary" onClick={setupDialog}>
            نصب
          </Button>
        )
      }
    />
  );
}

export default CrossSignin;
