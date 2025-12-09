import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  Checkbox,
  FormControlLabel,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import bgImage from "../assets/loginBg.png";
import lightstormLogo from "../assets/LightStormFullNameLogo.png";

const CREDENTIAL_KEY = "LS_LOGIN_CRED";

const LoginPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>(
    {}
  );
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    document.title = `INDIA OSS`;

    const saved = localStorage.getItem(CREDENTIAL_KEY);
    if (saved) {
      const { username, password } = JSON.parse(saved);
      setUsername(username || "");
      setPassword(password || "");
      setRememberMe(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const newErrors: { username?: string; password?: string } = {};
    if (!username) newErrors.username = "Username required";
    if (!password) newErrors.password = "Password required";
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    // Remember Me: save only in local storage
    if (rememberMe) {
      localStorage.setItem(
        CREDENTIAL_KEY,
        JSON.stringify({ username, password })
      );
    } else {
      localStorage.removeItem(CREDENTIAL_KEY);
    }

    navigate("/", { replace: true });
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100vw" }}>
      {/* LEFT 70% */}
      {!isMobile && (
        <Box
          sx={{
            width: "70%",
            backgroundImage: `url(${bgImage})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              color: "#fff",
              textAlign: "center",
              fontWeight: 700,
              lineHeight: 1.3,
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: "3vh",
                marginRight: "33vh",
              }}
            >
              <span style={{ color: "#ff2f92", fontSize: "5vh" }}>"</span>
              Simplifying
            </span>
            <span style={{ display: "block", fontSize: "5.5vh" }}>
              NextGen Networks
              <span style={{ color: "#ff2f92", fontSize: "5vh" }}>"</span>
            </span>
          </Typography>
        </Box>
      )}

      {/* RIGHT 30% */}
      <Box
        sx={{
          width: isMobile ? "100%" : "30%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f9f9f9",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: "90%",
            maxWidth: 380,
            p: 4,
            borderRadius: 3,
          }}
        >
          {/* LOGO */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Box component="img" src={lightstormLogo} sx={{ height: 34 }} />
          </Box>

          {/* FORM (ENTER key works) */}
          <Box component="form" onSubmit={handleLogin}>
            <Stack spacing={2.5}>
              <TextField
                label="Username"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={!!errors.username}
                helperText={errors.username}
              />

              <TextField
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                }
                label="Remember Me"
              />

              <Button
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: "#a0033b",
                  "&:hover": { backgroundColor: "#7b002c" },
                }}
              >
                Login
              </Button>

              {loginError && (
                <Typography color="error" textAlign="center">
                  {loginError}
                </Typography>
              )}
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default LoginPage;


