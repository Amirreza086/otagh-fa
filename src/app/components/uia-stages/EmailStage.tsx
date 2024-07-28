import React, { useEffect, useCallback, FormEventHandler } from 'react';
import { Dialog, Text, Box, Button, config, Input, color, Spinner } from 'folds';
import { AuthType, MatrixError } from 'matrix-js-sdk';
import { StageComponentProps } from './types';
import { AsyncState, AsyncStatus } from '../../hooks/useAsyncCallback';
import { RequestEmailTokenCallback, RequestEmailTokenResponse } from '../../hooks/types';

function EmailErrorDialog({
  title,
  message,
  defaultEmail,
  onRetry,
  onCancel,
}: {
  title: string;
  message: string;
  defaultEmail?: string;
  onRetry: (email: string) => void;
  onCancel: () => void;
}) {
  const handleFormSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault();
    const { retryEmailInput } = evt.target as HTMLFormElement & {
      retryEmailInput: HTMLInputElement;
    };
    const t = retryEmailInput.value;
    onRetry(t);
  };

  return (
    <Dialog>
      <Box
        as="form"
        onSubmit={handleFormSubmit}
        style={{ padding: config.space.S400 }}
        direction="Column"
        gap="400"
      >
        <Box direction="Column" gap="100">
          <Text size="H4">{title}</Text>
          <Text>{message}</Text>
          <Text as="label" size="L400" style={{ paddingTop: config.space.S400 }}>
            ایمیل
          </Text>
          <Input
            name="retryEmailInput"
            variant="Background"
            size="500"
            outlined
            defaultValue={defaultEmail}
            required
          />
        </Box>
        <Button variant="Primary" type="submit">
          <Text as="span" size="B400">
            ارسال ایمیل تائیدیه
          </Text>
        </Button>
        <Button variant="Critical" fill="None" outlined type="button" onClick={onCancel}>
          <Text as="span" size="B400">
            لغو
          </Text>
        </Button>
      </Box>
    </Dialog>
  );
}

export function EmailStageDialog({
  email,
  clientSecret,
  stageData,
  emailTokenState,
  requestEmailToken,
  submitAuthDict,
  onCancel,
}: StageComponentProps & {
  email?: string;
  clientSecret: string;
  emailTokenState: AsyncState<RequestEmailTokenResponse, MatrixError>;
  requestEmailToken: RequestEmailTokenCallback;
}) {
  const { errorCode, error, session } = stageData;

  const handleSubmit = useCallback(
    (sessionId: string) => {
      const threepIDCreds = {
        sid: sessionId,
        client_secret: clientSecret,
      };
      submitAuthDict({
        type: AuthType.Email,
        threepid_creds: threepIDCreds,
        threepidCreds: threepIDCreds,
        session,
      });
    },
    [submitAuthDict, session, clientSecret]
  );

  const handleEmailSubmit = useCallback(
    (userEmail: string) => {
      requestEmailToken(userEmail, clientSecret);
    },
    [clientSecret, requestEmailToken]
  );

  useEffect(() => {
    if (email && !errorCode && emailTokenState.status === AsyncStatus.Idle) {
      requestEmailToken(email, clientSecret);
    }
  }, [email, errorCode, clientSecret, emailTokenState, requestEmailToken]);

  if (emailTokenState.status === AsyncStatus.Loading) {
    return (
      <Box direction="Column" alignItems="Center" gap="400">
        <Spinner variant="Secondary" size="600" />
        <Text style={{ color: color.Secondary.Main }}>در حال ارسال ایمیل تائیدیه...</Text>
      </Box>
    );
  }

  if (emailTokenState.status === AsyncStatus.Error) {
    return (
      <EmailErrorDialog
        title={emailTokenState.error.errcode ?? 'Verify Email'}
        message={
          emailTokenState.error?.data?.error ??
          emailTokenState.error.message ??
          'درخواست ارسال ایمیل تائیدیه ناموفق بود.'
        }
        onRetry={handleEmailSubmit}
        onCancel={onCancel}
      />
    );
  }

  if (emailTokenState.status === AsyncStatus.Success) {
    return (
      <Dialog>
        <Box style={{ padding: config.space.S400 }} direction="Column" gap="400">
          <Box direction="Column" gap="100">
            <Text size="H4">درخواست تائیدیه ارسال شد.</Text>
            <Text>{`لطفا ایمیل خود را چک کنید "${emailTokenState.data.email}" و قبل از ادامه اعتبار سنجی(تائید) کنید.`}</Text>

            {errorCode && (
              <Text style={{ color: color.Critical.Main }}>{`${errorCode}: ${error}`}</Text>
            )}
          </Box>
          <Button variant="Primary" onClick={() => handleSubmit(emailTokenState.data.result.sid)}>
            <Text as="span" size="B400">
              ادامه
            </Text>
          </Button>
        </Box>
      </Dialog>
    );
  }

  if (!email) {
    return (
      <EmailErrorDialog
        title="ایمیل ارائه دهید"
        message="لطفاً برای ارسال درخواست تأییدیه ایمیل ارائه دهید."
        onRetry={handleEmailSubmit}
        onCancel={onCancel}
      />
    );
  }

  return null;
}
