import { Box, Icon, Icons, Text, as, color, config } from 'folds';
import React from 'react';

const warningStyle = { color: color.Warning.Main, opacity: config.opacity.P300 };
const criticalStyle = { color: color.Critical.Main, opacity: config.opacity.P300 };

export const MessageDeletedContent = as<'div', { children?: never; reason?: string }>(
  ({ reason, ...props }, ref) => (
    <Box as="span" alignItems="Center" gap="100" style={warningStyle} {...props} ref={ref}>
      <Icon size="50" src={Icons.Delete} />
      {reason ? (
        <i>این پیام حذف شده است. {reason}</i>
      ) : (
        <i>این پیام حذف شده است</i>
      )}
    </Box>
  )
);

export const MessageUnsupportedContent = as<'div', { children?: never }>(({ ...props }, ref) => (
  <Box as="span" alignItems="Center" gap="100" style={criticalStyle} {...props} ref={ref}>
    <Icon size="50" src={Icons.Warning} />
    <i>پیام پشتیبانی نشده</i>
  </Box>
));

export const MessageFailedContent = as<'div', { children?: never }>(({ ...props }, ref) => (
  <Box as="span" alignItems="Center" gap="100" style={criticalStyle} {...props} ref={ref}>
    <Icon size="50" src={Icons.Warning} />
    <i>پیام بارگیری نشد</i>
  </Box>
));

export const MessageBadEncryptedContent = as<'div', { children?: never }>(({ ...props }, ref) => (
  <Box as="span" alignItems="Center" gap="100" style={warningStyle} {...props} ref={ref}>
    <Icon size="50" src={Icons.Lock} />
    <i>رمزگشایی پیام ممکن نیست</i>
  </Box>
));

export const MessageNotDecryptedContent = as<'div', { children?: never }>(({ ...props }, ref) => (
  <Box as="span" alignItems="Center" gap="100" style={warningStyle} {...props} ref={ref}>
    <Icon size="50" src={Icons.Lock} />
    <i>این پیام هنوز رمزگشایی نشده است</i>
  </Box>
));

export const MessageBrokenContent = as<'div', { children?: never }>(({ ...props }, ref) => (
  <Box as="span" alignItems="Center" gap="100" style={criticalStyle} {...props} ref={ref}>
    <Icon size="50" src={Icons.Warning} />
    <i>پیام شکسته</i>
  </Box>
));

export const MessageEmptyContent = as<'div', { children?: never }>(({ ...props }, ref) => (
  <Box as="span" alignItems="Center" gap="100" style={criticalStyle} {...props} ref={ref}>
    <Icon size="50" src={Icons.Warning} />
    <i>پیام خالی</i>
  </Box>
));

export const MessageEditedContent = as<'span', { children?: never }>(({ ...props }, ref) => (
  <Text as="span" size="T200" priority="300" {...props} ref={ref}>
    {' (edited)'}
  </Text>
));
