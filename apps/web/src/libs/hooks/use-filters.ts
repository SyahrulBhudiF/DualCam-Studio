import { useReducer } from "react";

export const ALL_FILTER_VALUE = "__all__";

type FilterValue = string | Date | undefined;

type FilterState<TFilters extends Record<string, FilterValue>> = TFilters;

type FilterAction<TFilters extends Record<string, FilterValue>> =
	| { type: "set"; key: keyof TFilters; value: TFilters[keyof TFilters] }
	| { type: "reset" };

function createFilterReducer<TFilters extends Record<string, FilterValue>>(
	initialState: FilterState<TFilters>,
) {
	return function filterReducer(
		state: FilterState<TFilters>,
		action: FilterAction<TFilters>,
	): FilterState<TFilters> {
		switch (action.type) {
			case "set":
				return { ...state, [action.key]: action.value };
			case "reset":
				return initialState;
		}
	};
}

export function useFilters<TFilters extends Record<string, FilterValue>>(
	initialState: TFilters,
) {
	const [state, dispatch] = useReducer(
		createFilterReducer(initialState),
		initialState,
	);

	return {
		...state,
		setFilter: <TKey extends keyof TFilters>(
			key: TKey,
			value: TFilters[TKey],
		) => dispatch({ type: "set", key, value }),
		resetFilters: () => dispatch({ type: "reset" }),
	};
}
