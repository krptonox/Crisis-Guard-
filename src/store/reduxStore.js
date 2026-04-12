import { configureStore, createSlice } from '@reduxjs/toolkit';

// ── Redux store for Forensics / Evidence / User state (Project B) ─────────────
// Globe / News state continues to live in Zustand (useStore.js)

const initialState = {
  user: null,
  currentResult: null,
  evidenceList: [],
  loading: false,
};

const appSlice = createSlice({
  name: 'forensics',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setCurrentResult: (state, action) => {
      state.currentResult = action.payload;
    },
    setEvidenceList: (state, action) => {
      state.evidenceList = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setUser, setCurrentResult, setEvidenceList, setLoading } = appSlice.actions;

export const reduxStore = configureStore({
  reducer: { forensics: appSlice.reducer },
});

export default reduxStore;
