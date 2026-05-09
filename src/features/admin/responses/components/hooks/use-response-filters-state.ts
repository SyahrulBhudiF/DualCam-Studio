import { useReducer } from "react";

export const ALL_FILTER_VALUE = "__all__";

type FilterState = {
	questionnaireId: string;
	className: string;
	name: string;
	startDate?: Date;
	endDate?: Date;
};

type FilterAction =
	| { type: "questionnaireId"; value: string }
	| { type: "className"; value: string }
	| { type: "name"; value: string }
	| { type: "startDate"; value?: Date }
	| { type: "endDate"; value?: Date }
	| { type: "reset" };

const INITIAL_FILTER_STATE: FilterState = {
	questionnaireId: ALL_FILTER_VALUE,
	className: ALL_FILTER_VALUE,
	name: ALL_FILTER_VALUE,
};

function filterReducer(state: FilterState, action: FilterAction): FilterState {
	switch (action.type) {
		case "questionnaireId":
			return { ...state, questionnaireId: action.value };
		case "className":
			return { ...state, className: action.value };
		case "name":
			return { ...state, name: action.value };
		case "startDate":
			return { ...state, startDate: action.value };
		case "endDate":
			return { ...state, endDate: action.value };
		case "reset":
			return INITIAL_FILTER_STATE;
	}
}

export function useResponseFiltersState() {
	const [state, dispatch] = useReducer(filterReducer, INITIAL_FILTER_STATE);

	return {
		...state,
		setQuestionnaireId: (value: string) =>
			dispatch({ type: "questionnaireId", value }),
		setClassName: (value: string) => dispatch({ type: "className", value }),
		setName: (value: string) => dispatch({ type: "name", value }),
		setStartDate: (value?: Date) => dispatch({ type: "startDate", value }),
		setEndDate: (value?: Date) => dispatch({ type: "endDate", value }),
		resetFilters: () => dispatch({ type: "reset" }),
	};
}
