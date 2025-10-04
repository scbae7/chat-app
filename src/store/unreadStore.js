import { create } from 'zustand';

export const useUnreadStore = create((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
}));
