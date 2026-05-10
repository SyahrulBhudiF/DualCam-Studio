import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile } from "../models/profile";

type UserState = {
	user: Partial<Profile> | null;
	setUser: (user: Partial<Profile> | null) => void;
};

export const useUserStore = create<UserState>()(
	persist(
		(set) => ({
			user: null,
			setUser: (user) => set({ user }),
		}),
		{
			name: "user-storage",
		},
	),
);
