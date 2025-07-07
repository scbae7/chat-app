import { create } from 'zustand';

export const useUserStore = create((set) => ({
  user: null,
  setUser: (newUser) => set({ user: newUser }),
  updateNickname: (nickname) =>
    set((state) => ({
      user: { ...state.user, displayName: nickname },
    })),
  updatePhotoURL: (photoURL) =>
    set((state) => ({
      user: { ...state.user, photoURL },
    })),
}));
