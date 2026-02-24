'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Grid2,
  Divider,
  Link as MuiLink,
  CircularProgress,
  InputAdornment,
  IconButton,
  Paper,
} from '@mui/material';
import Link from 'next/link';
import NextLink from 'next/link';
import { ArrowBackIosNewRounded, EmailOutlined, Height, LockOutlined, LoginOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { loginStart } from '@/redux/slices';
import { selectAuthLoading } from '@/redux/selectors';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material';
import { head } from 'lodash';

// Type definitions for form data and errors
interface FormData {
  email: string;
  password: string;
}

interface Errors {
  email: string;
  password: string;
}

const SignInPage: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const loading = useSelector(selectAuthLoading);

  // Initializing form data with default values
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  // Initializing error messages for the form fields
  const [errors, setErrors] = useState<Errors>({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Handler for input change to update form data and reset errors
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: '' });
  };

  // Validating the form fields before submission
  const validate = (): boolean => {
    const tempErrors: Partial<Errors> = { email: '', password: '' };
    let isValid = true;

    // Email validation
    if (!formData.email) {
      tempErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Email is not valid';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      tempErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors((prevErrors) => ({ ...prevErrors, ...tempErrors }));
    return isValid;
  };

  // Handler for form submission to validate and process data
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validate()) {
      dispatch(loginStart({ formData, router }));
    }
  };
  const theme = useTheme();

  const handleBack = () => {
    if (typeof window !== "undefined") {
      window.location.href = "https://opsdeck.app/";
    }
  };
  return (
    <Box
    >
      {/* Login Card */}
      <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2, width: '50%' }}>
            <IconButton
              onClick={handleBack}
              sx={{
                mr: 'auto',
                borderRadius: "10px",
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.06)"
                    : "#f5f7fb",
                "&:hover": {
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.12)"
                      : "#e9eef5",
                },
              }}
            >
              <ArrowBackIosNewRounded sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
          <a href={'/'}
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            <img
              src={
                theme.palette.mode === "dark"
                  ? "/images/logo_white.png"
                  : "/images/logo_dark.png"
              }
              height={40}
              alt="Opsdeck Logo"
            />
          </a>
          {/* Heading */}
          <Box mb={4} textAlign="center">
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                // background: "linear-gradient(90deg, #005B8E 0%, #03D7FE 100%)",
                // WebkitBackgroundClip: "text",
                // WebkitTextFillColor: "transparent",
                color: "#00b2ff",
              }}
            >
              Sign In
            </Typography>

            <Typography variant="body2" color="text.secondary" mt={1}>
              Welcome! Please sign in to your account.
            </Typography>
          </Box>

          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 2 }}>
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
              sx={{ mb: 3 }}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              onChange={handleChange}
              error={Boolean(errors.password)}
              helperText={errors.password}
              value={formData.password}
              sx={{ mb: 1 }}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {/* Forgot Password */}
            <Box textAlign="right" mb={3}>
              <MuiLink
                component={Link}
                href="/change-password"
                underline="hover"
                sx={{
                  fontSize: 13,
                  color: "#00b2ff",
                  fontWeight: 500,
                }}
              >
                Forgot Password?
              </MuiLink>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={16} color="inherit" /> : <LoginOutlined />
              }
              sx={{
                height: 48,
                borderRadius: "100px",
                fontSize: 15,
                fontWeight: 600,
                textTransform: "none",
                // background: "linear-gradient(90deg, #005B8E 0%, #03D7FE 100%)",
                background: "#88dbff",
                color: '#000',
                boxShadow: "0 6px 18px rgba(3,215,254,0.25)",
              }}
            >
              Sign In
            </Button>

            <Divider sx={{ my: 3 }} />

            <Grid2 container justifyContent="center">
              <Typography variant="body2">
                Signup instead?
                <MuiLink component={Link} href="/signup" sx={{ ml: 1, fontWeight: 500, color: "#00b2ff" }}>
                  Signup
                </MuiLink>
              </Typography>
            </Grid2>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SignInPage;