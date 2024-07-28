import React, { ReactNode } from 'react';
import { IconSrc, Icons } from 'folds';
import { MatrixEvent } from 'matrix-js-sdk';
import { IMemberContent, Membership } from '../../types/matrix/room';
import { getMxIdLocalPart } from '../utils/matrix';
import { isMembershipChanged } from '../utils/room';

export type ParsedResult = {
  icon: IconSrc;
  body: ReactNode;
};

export type MemberEventParser = (mEvent: MatrixEvent) => ParsedResult;

export const useMemberEventParser = (): MemberEventParser => {
  const parseMemberEvent: MemberEventParser = (mEvent) => {
    const content = mEvent.getContent<IMemberContent>();
    const prevContent = mEvent.getPrevContent() as IMemberContent;
    const senderId = mEvent.getSender();
    const userId = mEvent.getStateKey();

    if (!senderId || !userId)
      return {
        icon: Icons.User,
        body: 'Broken membership event',
      };

    const senderName = getMxIdLocalPart(senderId);
    const userName = content.displayname || getMxIdLocalPart(userId);

    if (isMembershipChanged(mEvent)) {
      if (content.membership === Membership.Invite) {
        if (prevContent.membership === Membership.Knock) {
          return {
            icon: Icons.ArrowGoRightPlus,
            body: (
              <>
                <b>{senderName}</b>
                {' پذیرفته شده '}
                <b>{userName}</b>
                {`'s درخواست پیوستن `}
                {content.reason}
              </>
            ),
          };
        }

        return {
          icon: Icons.ArrowGoRightPlus,
          body: (
            <>
              <b>{senderName}</b>
              {' دعوت شده '}
              <b>{userName}</b> {content.reason}
            </>
          ),
        };
      }

      if (content.membership === Membership.Knock) {
        return {
          icon: Icons.ArrowGoRightPlus,
          body: (
            <>
              <b>{userName}</b>
              {' درخواست برای عضویت در این اتاق '}
              {content.reason}
            </>
          ),
        };
      }

      if (content.membership === Membership.Join) {
        return {
          icon: Icons.ArrowGoRight,
          body: (
            <>
              <b>{userName}</b>
              {' به اتاق پیوست'}
            </>
          ),
        };
      }

      if (content.membership === Membership.Leave) {
        if (prevContent.membership === Membership.Invite) {
          return {
            icon: Icons.ArrowGoRightCross,
            body:
              senderId === userId ? (
                <>
                  <b>{userName}</b>
                  {' دعوت را رد کرد '}
                  {content.reason}
                </>
              ) : (
                <>
                  <b>{senderName}</b>
                  {' rejected '}
                  <b>{userName}</b>
                  {`'s درخواست پیوستن `}
                  {content.reason}
                </>
              ),
          };
        }

        if (prevContent.membership === Membership.Knock) {
          return {
            icon: Icons.ArrowGoRightCross,
            body:
              senderId === userId ? (
                <>
                  <b>{userName}</b>
                  {' درخواست ملحق شده باطل شد '}
                  {content.reason}
                </>
              ) : (
                <>
                  <b>{senderName}</b>
                  {' لغو شد '}
                  <b>{userName}</b>
                  {`'s دعوت `}
                  {content.reason}
                </>
              ),
          };
        }

        if (prevContent.membership === Membership.Ban) {
          return {
            icon: Icons.ArrowGoLeft,
            body: (
              <>
                <b>{senderName}</b>
                {' رفع ممنوعیت '}
                <b>{userName}</b> {content.reason}
              </>
            ),
          };
        }

        return {
          icon: Icons.ArrowGoLeft,
          body:
            senderId === userId ? (
              <>
                <b>{userName}</b>
                {' اتاق را ترک کرد '}
                {content.reason}
              </>
            ) : (
              <>
                <b>{senderName}</b>
                {' لگد زد '}
                <b>{userName}</b> {content.reason}
              </>
            ),
        };
      }

      if (content.membership === Membership.Ban) {
        return {
          icon: Icons.ArrowGoLeft,
          body: (
            <>
              <b>{senderName}</b>
              {' ممنوع کردن '}
              <b>{userName}</b> {content.reason}
            </>
          ),
        };
      }
    }

    if (content.displayname !== prevContent.displayname) {
      const prevUserName = prevContent.displayname || userId;

      return {
        icon: Icons.Mention,
        body: content.displayname ? (
          <>
            <b>{prevUserName}</b>
            {' تغییر نام نمایشی به '}
            <b>{userName}</b>
          </>
        ) : (
          <>
            <b>{prevUserName}</b>
            {' نام نمایشی آنها را حذف کرد '}
          </>
        ),
      };
    }
    if (content.avatar_url !== prevContent.avatar_url) {
      return {
        icon: Icons.User,
        body: content.displayname ? (
          <>
            <b>{userName}</b>
            {' آواتار خود را تغییر داد'}
          </>
        ) : (
          <>
            <b>{userName}</b>
            {' آواتار آنها را حذف کرد '}
          </>
        ),
      };
    }

    return {
      icon: Icons.User,
      body: 'Broken membership event',
    };
  };

  return parseMemberEvent;
};
