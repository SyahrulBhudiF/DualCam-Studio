import type {
	OnChangeFn,
	RowSelectionState,
	SortingState,
} from "@tanstack/react-table";
import { useReducer } from "react";
import type { Question } from "../questionnaires.types";

type QuestionTableState = {
	sorting: SortingState;
	rowSelection: RowSelectionState;
	globalFilter: string;
	isCreateOpen: boolean;
	editingQuestion: Question | null;
};

type QuestionTableAction =
	| { type: "sorting"; value: SortingState }
	| { type: "rowSelection"; value: RowSelectionState }
	| { type: "globalFilter"; value: string }
	| { type: "createOpen"; value: boolean }
	| { type: "editingQuestion"; value: Question | null };

function questionTableReducer(
	state: QuestionTableState,
	action: QuestionTableAction,
): QuestionTableState {
	switch (action.type) {
		case "sorting":
			return { ...state, sorting: action.value };
		case "rowSelection":
			return { ...state, rowSelection: action.value };
		case "globalFilter":
			return { ...state, globalFilter: action.value };
		case "createOpen":
			return { ...state, isCreateOpen: action.value };
		case "editingQuestion":
			return { ...state, editingQuestion: action.value };
	}
}

const INITIAL_STATE: QuestionTableState = {
	sorting: [],
	rowSelection: {},
	globalFilter: "",
	isCreateOpen: false,
	editingQuestion: null,
};

export function useQuestionTableState() {
	const [state, dispatch] = useReducer(questionTableReducer, INITIAL_STATE);

	const setSorting: OnChangeFn<SortingState> = (updater) =>
		dispatch({
			type: "sorting",
			value: typeof updater === "function" ? updater(state.sorting) : updater,
		});

	const setRowSelection: OnChangeFn<RowSelectionState> = (updater) =>
		dispatch({
			type: "rowSelection",
			value:
				typeof updater === "function" ? updater(state.rowSelection) : updater,
		});

	return {
		...state,
		setSorting,
		setRowSelection,
		setGlobalFilter: (value: string) =>
			dispatch({ type: "globalFilter", value }),
		setIsCreateOpen: (value: boolean) =>
			dispatch({ type: "createOpen", value }),
		setEditingQuestion: (value: Question | null) =>
			dispatch({ type: "editingQuestion", value }),
	};
}
