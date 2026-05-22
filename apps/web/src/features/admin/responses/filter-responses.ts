import { ALL_FILTER_VALUE } from "@/libs/hooks/use-filters";
import type { ResponseListItem } from "./responses.types";

export type ResponseFilterValues = {
	questionnaireId: string;
	className: string;
	name: string;
	startDate: Date | undefined;
	endDate: Date | undefined;
};

export function filterResponses(
	responses: ResponseListItem[],
	filters: ResponseFilterValues,
) {
	return responses.filter((response) => {
		if (
			filters.questionnaireId !== ALL_FILTER_VALUE &&
			response.questionnaireId !== filters.questionnaireId
		) {
			return false;
		}

		if (
			filters.className !== ALL_FILTER_VALUE &&
			response.profile?.class !== filters.className
		) {
			return false;
		}

		if (filters.name !== ALL_FILTER_VALUE && response.profile?.name !== filters.name) {
			return false;
		}

		const createdAt = new Date(response.createdAt);
		if (filters.startDate && createdAt < filters.startDate) return false;
		if (filters.endDate) {
			const endOfDay = new Date(filters.endDate);
			endOfDay.setHours(23, 59, 59, 999);
			if (createdAt > endOfDay) return false;
		}

		return true;
	});
}
