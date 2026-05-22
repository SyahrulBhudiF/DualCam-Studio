import { create } from "zustand";
import { ALL_FILTER_VALUE } from "@/libs/hooks/use-filters";

type ResponseFilterState = {
	questionnaireId: string;
	className: string;
	name: string;
	startDate: Date | undefined;
	endDate: Date | undefined;
	setFilter: <TKey extends keyof ResponseFilterValues>(
		key: TKey,
		value: ResponseFilterValues[TKey],
	) => void;
	resetFilters: () => void;
};

export type ResponseFilterValues = {
	questionnaireId: string;
	className: string;
	name: string;
	startDate: Date | undefined;
	endDate: Date | undefined;
};

const initialResponseFilters: ResponseFilterValues = {
	questionnaireId: ALL_FILTER_VALUE,
	className: ALL_FILTER_VALUE,
	name: ALL_FILTER_VALUE,
	startDate: undefined,
	endDate: undefined,
};

export const useResponseFilterStore = create<ResponseFilterState>()((set) => ({
	...initialResponseFilters,
	setFilter: (key, value) =>
		set({ [key]: value } as Pick<ResponseFilterState, typeof key>),
	resetFilters: () => set(initialResponseFilters),
}));
