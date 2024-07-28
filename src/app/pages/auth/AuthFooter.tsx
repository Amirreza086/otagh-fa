import React from 'react';
import { Box, Text } from 'folds';
import * as css from './styles.css';

export function AuthFooter() {
  return (
    <Box className={css.AuthFooter} justifyContent="Center" gap="400" wrap="Wrap">
      <Text as="a" size="T300" href="https://www.1nr.ir/" rel="noreferrer">
        Created By Amirreza Eskandarzadeh
      </Text>
    </Box>
  );
}
