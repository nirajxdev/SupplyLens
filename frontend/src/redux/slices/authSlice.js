import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getCurrentUser,
  login as loginRequest,
  googleLogin as googleLoginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "../../Instance/API.js";

export const checkAuth = createAsyncThunk("auth/checkAuth", async (_, { rejectWithValue }) => {
  try {
    const data = await getCurrentUser();
    return data.user;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const loginUser = createAsyncThunk("auth/login", async (credentials, thunkAPI) => {
  try {
    const data = await loginRequest(credentials);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || "Login failed");
  }
});

export const googleLoginUser = createAsyncThunk("auth/googleLogin", async (credential, thunkAPI) => {
  try {
    const data = await googleLoginRequest(credential);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || "Google Login failed");
  }
});

export const registerUser = createAsyncThunk("auth/register", async (payload, thunkAPI) => {
  try {
    const data = await registerRequest(payload);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || "Register failed");
  }
});

export const logoutUser = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    await logoutRequest();
    return;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || "Logout failed");
  }
});

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  checkingAuth: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(checkAuth.pending, (state) => {
        state.checkingAuth = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.checkingAuth = false;
        state.user = action.payload?.user ?? action.payload ?? null;
        state.isAuthenticated = Boolean(state.user);
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.checkingAuth = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.user ?? action.payload ?? null;
        state.isAuthenticated = Boolean(state.user);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      })
      .addCase(googleLoginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLoginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.user ?? action.payload ?? null;
        state.isAuthenticated = Boolean(state.user);
      })
      .addCase(googleLoginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Google Login failed";
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        // User must log in separately
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Register failed";
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Logout failed";
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
