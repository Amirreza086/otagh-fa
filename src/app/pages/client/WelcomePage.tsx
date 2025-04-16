import React from 'react';
import { Box, Button, Icon, Icons, Text, config, toRem } from 'folds';
import { Page, PageHero, PageHeroSection } from '../../components/page';
import CinnySVG from '../../../../public/res/svg/cinny.svg';

export function WelcomePage() {
  return (
    <Page>
      <Box
        grow="Yes"
        style={{ padding: config.space.S400, paddingBottom: config.space.S700 }}
        alignItems="Center"
        justifyContent="Center"
      >
        <PageHeroSection>
          <PageHero
            icon={<img width="70" height="70" src={CinnySVG} alt="Cinny Logo" />}
            title="به پیام رسان پرنده مقاومت خوش آمدید"
            subTitle={
              <span>
                پیام رسانی غیرمتمرکز ، امن و بر پایه بستر بلاکچین برای آزادی گفتار جبهه مقاومت و مظلومان جهان
                <br></br>
                برنامه نویسی توسط امیررضا اسکندرزاده.
              </span>
            }
          >
          </PageHero>
        </PageHeroSection>
      </Box>
    </Page>
  );
}
