import type {
	OnChangeFn,
	RowSelectionState,
	SortingState,
} from "@tanstack/react-table";
import { useReducer } from "react";

type EditableTableState<TItem> = {
	sorting: SortingState;
	rowSelection: RowSelectionState;
	globalFilter: string;
	isCreateOpen: boolean;
	editingItem: TItem | null;
};

type EditableTableAction<TItem> =
	| { type: "sorting"; value: SortingState }
	| { type: "rowSelection"; value: RowSelectionState }
	| { type: "globalFilter"; value: string }
	| { type: "createOpen"; value: boolean }
	| { type: "editingItem"; value: TItem | null };

function createInitialState<TItem>(): EditableTableState<TItem> {
	return {
		sorting: [],
		rowSelection: {},
		globalFilter: "",
		isCreateOpen: false,
		editingItem: null,
	};
}

function editableTableReducer<TItem>(
	state: EditableTableState<TItem>,
	action: EditableTableAction<TItem>,
): EditableTableState<TItem> {
	switch (action.type) {
		case "sorting":
			return { ...state, sorting: action.value };
		case "rowSelection":
			return { ...state, rowSelection: action.value };
		case "globalFilter":
			return { ...state, globalFilter: action.value };
		case "createOpen":
			return { ...state, isCreateOpen: action.value };
		case "editingItem":
			return { ...state, editingItem: action.value };
	}
}

export function useEditableTableState<TItem>() {
	const [state, dispatch] = useReducer(
		editableTableReducer<TItem>,
		undefined,
		createInitialState,
	);

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
		setEditingItem: (value: TItem | null) =>
			dispatch({ type: "editingItem", value }),
	};
}
