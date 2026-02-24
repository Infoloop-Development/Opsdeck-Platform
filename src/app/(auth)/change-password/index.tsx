'use client';

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { TextField, Button, Typography, Box, Skeleton, Grid2, InputAdornment, IconButton, Paper } from '@mui/material';
import { LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { selectChangePassword, selectCurrentUser } from '@/redux/selectors';
import { changePasswordStart, fetchUserInfo } from '@/redux/slices';
import { useSearchParams } from 'next/navigation';
import { safeLocalStorageGet } from '@/utils/helpers';
import { accessTokenKey, initialFormDataChangePassword } from '@/utils/constants';
import MuiLink from '@mui/material/Link';
import Link from 'next/link';

interface FormData {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface Errors {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordPage: React.FC = () => {
  const dispatch = useDispatch();
  const { loading: changingPassword } = useSelector(selectChangePassword);

  const { data: currentUser, loading: currentUserLoading } = useSelector(selectCurrentUser);

  const searchParams = useSearchParams();

  const tokenParam = searchParams.get('token');

  const token: any = tokenParam
    ? decodeURIComponent(tokenParam)
    : safeLocalStorageGet(accessTokenKey);

  // Initializing form data with default values
  const [formData, setFormData] = useState<FormData>(initialFormDataChangePassword);

  // Initializing error messages for the form fields
  const [errors, setErrors] = useState<Errors>(initialFormDataChangePassword);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (token) {
      if (!currentUser) {
        // Fetch user info if token is present and user info is not already loaded
        dispatch(fetchUserInfo({ token }));
      }
    }
  }, [token]);

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        email: currentUser?.email || currentUser?.email,
      }));
    }
  }, [currentUser]);

  // Handler for input change to update form data and reset errors
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: '' });
  };

  // Validating the form fields before submission
  const validate = (): boolean => {
    const tempErrors: Partial<Errors> = initialFormDataChangePassword;
    let isValid = true;

    // Validate current password
    if (!formData.currentPassword) {
      tempErrors.currentPassword = 'Current password is required';
      isValid = false;
    }

    // Validate new password
    if (!formData.newPassword) {
      tempErrors.newPassword = 'New password is required';
      isValid = false;
    } else if (formData.newPassword.length < 6) {
      tempErrors.newPassword = 'Password must be at least 6 characters';
      isValid = false;
    } else if (formData.currentPassword && formData.currentPassword === formData.newPassword) {
      tempErrors.newPassword = 'New password must be different from current password';
      isValid = false;
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      tempErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.confirmPassword !== formData.newPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors((prevErrors) => ({ ...prevErrors, ...tempErrors }));
    return isValid;
  };

  // Handler for form submission to validate and process data
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validate()) {
      dispatch(
        // Assuming you have an action to change the password
        changePasswordStart({
          oldPassword: formData.currentPassword, // Send current password as oldPassword
          newPassword: formData.newPassword,
          setFormData,
          token,
        })
      );
    }
  };

  return (
    <Box
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          p: { xs: 3, sm: 5 },
          borderRadius: "16px",
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? theme.palette.background.paper
              : "#ffffff",
          border: "none !important",
          boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
        }}
      >
        <Box
        >
          <Box mb={4} textAlign="center">
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                background: "linear-gradient(90deg,#005B8E,#03D7FE)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Change Password
            </Typography>

            <Typography variant="body2" color="text.secondary" mt={1}>
              {'Enter your current and new password'}
            </Typography>
          </Box>

          {currentUserLoading && (
            <Box sx={{ mb: 2 }}>
              <Skeleton variant="rounded" height={50} sx={{ mb: 2 }} />
              <Skeleton variant="rounded" height={50} sx={{ mb: 2 }} />
              <Skeleton variant="rounded" height={50} sx={{ mb: 2 }} />
              <Skeleton variant="rounded" height={50} sx={{ mb: 2 }} />
            </Box>
          )}
          {currentUser ? (
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                onChange={handleChange}
                error={Boolean(errors.email)}
                helperText={errors.email}
                value={formData.email}
                sx={{
                  mb: 2.2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                }}
                disabled
              />

              <TextField
                required
                fullWidth
                name="currentPassword"
                label="Current Password"
                type={showCurrentPassword ? 'text' : 'password'}
                id="currentPassword"
                autoComplete="current-password"
                onChange={handleChange}
                error={Boolean(errors.currentPassword)}
                helperText={errors.currentPassword}
                value={formData.currentPassword}
                disabled={changingPassword}
                sx={{
                  mb: 2.2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        sx={{ color: "#00" }}
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                required
                fullWidth
                name="newPassword"
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                autoComplete="new-password"
                onChange={handleChange}
                error={Boolean(errors.newPassword)}
                helperText={errors.newPassword}
                value={formData.newPassword}
                disabled={changingPassword}
                sx={{
                  mb: 2.2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        sx={{ color: "#00" }}
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                onChange={handleChange}
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword}
                value={formData.confirmPassword}
                sx={{
                  mb: 2.2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                }}
                disabled={changingPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        sx={{ color: "#00" }}
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 2,
                  mb: 2,
                  height: 48,
                  borderRadius: "10px",
                  fontSize: 15,
                  fontWeight: 600,
                  textTransform: "none",
                  // background: "linear-gradient(90deg,#005B8E,#03D7FE)",
                  background: "#88dbff",
                  color: '#000',
                  boxShadow: "0 6px 18px rgba(3,215,254,0.25)",
                }}
                startIcon={<LockOutlined />}
                disabled={changingPassword}
              >
                Change Password
              </Button>
            </Box>
          ) : (
            // Send a password link
            !currentUserLoading && (
              <>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  onChange={handleChange}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  value={formData.email}
                  sx={{
                    mb: 2.2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                    },
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 2,
                    mb: 2,
                    height: 48,
                    borderRadius: "10px",
                    fontSize: 15,
                    fontWeight: 600,
                    textTransform: "none",
                    background: "#88dbff",
                    color: '#000',
                    boxShadow: "0 6px 18px rgba(3,215,254,0.25)",
                    // "&:hover": {
                    //   background: "linear-gradient(90deg,#00476f,#02c6e7)",
                    // },
                  }}
                  startIcon={<LockOutlined />}
                  disabled={changingPassword}
                  onClick={() => {
                    if (!formData.email) {
                      setErrors({
                        ...errors,
                        email: 'Email is required to send reset link',
                      });
                    } else {
                      // Dispatch an action to send password reset link
                      dispatch(
                        changePasswordStart({
                          newPassword: '',
                          setFormData,
                          token,
                          email: formData.email,
                        })
                      );
                    }
                  }}
                >
                  Send Password Reset Link
                </Button>
                <Grid2 container justifyContent="center">
                  <Typography variant="body2">
                    Login instead?
                    <MuiLink component={Link} href="/login" sx={{ ml: 1, fontWeight: 500, color: "#005B8E" }}>
                      Signin
                    </MuiLink>
                  </Typography>
                </Grid2>
              </>
            )
          )}
        </Box>
      </Paper>
    </Box >
  );
};

export default ChangePasswordPage;
