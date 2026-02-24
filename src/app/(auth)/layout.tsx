'use client';
import React, { useEffect } from 'react';
import { Box, Grid2, Paper } from '@mui/material';
import Header from '@/components/Header';
import { accessTokenKey, appbarHeight } from '@/utils/constants';
import { usePathname, useRouter } from 'next/navigation';
import { isTokenExpired, safeLocalStorageGet } from '@/utils/helpers';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = safeLocalStorageGet(accessTokenKey);

    // Redirect to projects if the user is logged in and not on the change-password route
    if (token && !isTokenExpired(token) && pathname !== '/change-password') {
      router.push('/dashboard/projects'); // Redirect to projects instead of dashboard
    }
  }, [router, pathname]);

  return (
    <>
      {/* <Header isAuthHeader /> */}
      <Grid2
        container
        component="main">
        <Box className="auth-layout" sx={{ display: 'flex', alignItems: 'center', width: '100%', height: `100vh`, overflow: 'hidden', backgroundColor: (theme) => theme.palette.background.default, }}>
          <Box sx={{ width: '40%', height: '100%', overflow: 'hidden', display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
              <img src="/images/onboard-image.jpg" alt="Onboarding" style={{ objectFit: 'cover', height: '100%', }} />
            </Box>
          </Box>
          <Box sx={{ width: { xs: '100%', md: '60%' }, height: '100%', padding: 4, }}>
            {children}
          </Box>
        </Box>
      </Grid2>
    </>
  );
}
