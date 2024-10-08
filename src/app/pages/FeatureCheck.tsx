import React, { ReactNode, useEffect } from 'react';
import { Box, Dialog, Text, config } from 'folds';
import { AsyncStatus, useAsyncCallback } from '../hooks/useAsyncCallback';
import { checkIndexedDBSupport } from '../utils/featureCheck';
import { SplashScreen } from '../components/splash-screen';

export function FeatureCheck({ children }: { children: ReactNode }) {
  const [idbSupportState, checkIDBSupport] = useAsyncCallback(checkIndexedDBSupport);

  useEffect(() => {
    checkIDBSupport();
  }, [checkIDBSupport]);

  if (idbSupportState.status === AsyncStatus.Success && idbSupportState.data === false) {
    return (
      <SplashScreen>
        <Box grow="Yes" alignItems="Center" justifyContent="Center">
          <Dialog>
            <Box style={{ padding: config.space.S400 }} direction="Column" gap="400">
              <Text>ویژگی مرورگر خاموش شده</Text>
              <Text size="T300" priority="400">
                هیچ پشتیبانی IndexedDB پیدا نشد. این برنامه به IndexedDB برای ذخیره داده های جلسه به صورت محلی نیاز دارد. لطفاً مطمئن شوید که مرورگر شما از IndexedDB پشتیبانی می کند و آن را فعال کنید
              </Text>
              <Text size="T200">
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  چیست IndexedDB?
                </a>
              </Text>
            </Box>
          </Dialog>
        </Box>
      </SplashScreen>
    );
  }

  return children;
}
