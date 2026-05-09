import { useReducer } from "react";
import type { OnChangeFn, RowSelectionState, SortingState } from "@tanstack/react-table";
import type { Answer } from "../questionnaires.types";

type QuestionDetailState = {
	sorting: SortingState;
	rowSelection: RowSelectionState;
	globalFilter: string;
	isCreateOpen: boolean;
	editingAnswer: Answer | null;
};

type QuestionDetailAction =
	| { type: "sorting"; value: SortingState }
	| { type: "rowSelection"; value: RowSelectionState }
	| { type: "globalFilter"; value: string }
	| { type: "createOpen"; value: boolean }
	| { type: "editingAnswer"; value: Answer | null };

function questionDetailReducer(
	state: QuestionDetailState,
	action: QuestionDetailAction,
): QuestionDetailState {
	switch (action.type) {
		case "sorting":
			return { ...state, sorting: action.value };
		case "rowSelection":
			return { ...state, rowSelection: action.value };
		case "globalFilter":
			return { ...state, globalFilter: action.value };
		case "createOpen":
			return { ...state, isCreateOpen: action.value };
		case "editingAnswer":
			return { ...state, editingAnswer: action.value };
	}
}

const INITIAL_STATE: QuestionDetailState = {
	sorting: [],
	rowSelection: {},
	globalFilter: "",
	isCreateOpen: false,
	editingAnswer: null,
};

export function useQuestionDetailState() {
	const [state, dispatch] = useReducer(questionDetailReducer, INITIAL_STATE);

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
		setEditingAnswer: (value: Answer | null) =>
			dispatch({ type: "editingAnswer", value }),
	};
}
