import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LayoutState {
  currentTheme?: string;
}

export const initialState: LayoutState = {};

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    setTheme(state: LayoutState, action: PayloadAction<string>) {
      state.currentTheme = action.payload;
    },
  },
});

export const layoutActions = layoutSlice.actions;
export const layoutReducer = layoutSlice.reducer;
