import {create} from "zustand";

export const useFilterStore = create((set) => ({
  search: "",
  roles: [],
  festivals: [],
  types: [],
  years: [0, 2024], // null means "ignore this filter"

  updateRoles: (roles) => set(() => ({roles: roles})),
  updateFestivals: (festivals) => set(() => ({festivals: festivals})),
  updateTypes: (types) => set(() => ({types: types})),
  updateYears: (years) => set(() => ({years: years}))
}));
