import * as XLSX from "xlsx";
import type { DashboardProps } from "./types";

export function exportDashboardToExcel({
	summary,
	breakdown,
	analytics,
}: DashboardProps) {
	const summarySheetData = [
		["Metric", "Value"],
		["Total Questionnaires", summary?.totalQuestionnaires ?? 0],
		["Active Questionnaires", summary?.activeQuestionnaires ?? 0],
		["Total Responses", summary?.totalResponses ?? 0],
		["Average Score", summary?.averageScore ?? 0],
		["Total Classes", summary?.totalClasses ?? 0],
	];

	const questionnaireSheetData = [
		["Questionnaire", "Total Responses", "Average Score"],
		...(breakdown?.questionnaires ?? []).map((q) => [
			q.title,
			q.totalResponses,
			q.averageScore,
		]),
	];

	const classSheetData = [
		["Class", "Total Responses", "Average Score"],
		...(breakdown?.classes ?? []).map((c) => [
			c.className,
			c.totalResponses,
			c.averageScore,
		]),
	];

	const questionSheetData = [
		["Order", "Question", "Average Score"],
		...(analytics?.questions ?? [])
			.slice()
			.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
			.map((q) => [q.order ?? "", q.text, q.averageScore]),
	];

	const answersSheetData = [
		["Answer", "Question Id", "Total Responses", "Average Score"],
		...(analytics?.answers ?? []).map((a) => [
			a.text,
			a.questionId ?? "",
			a.totalResponses,
			a.averageScore,
		]),
	];

	const timelineSheetData = [
		["Date", "Total Responses", "Average Score"],
		...(analytics?.timeline ?? []).map((t) => [
			t.date,
			t.totalResponses,
			t.averageScore,
		]),
	];

	const wb = XLSX.utils.book_new();

	const summaryWs = XLSX.utils.aoa_to_sheet(summarySheetData);
	XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

	const questionnairesWs = XLSX.utils.aoa_to_sheet(questionnaireSheetData);
	XLSX.utils.book_append_sheet(wb, questionnairesWs, "Questionnaires");

	const classesWs = XLSX.utils.aoa_to_sheet(classSheetData);
	XLSX.utils.book_append_sheet(wb, classesWs, "Classes");

	const questionsWs = XLSX.utils.aoa_to_sheet(questionSheetData);
	XLSX.utils.book_append_sheet(wb, questionsWs, "Questions");

	const answersWs = XLSX.utils.aoa_to_sheet(answersSheetData);
	XLSX.utils.book_append_sheet(wb, answersWs, "Answers");

	const timelineWs = XLSX.utils.aoa_to_sheet(timelineSheetData);
	XLSX.utils.book_append_sheet(wb, timelineWs, "Timeline");

	XLSX.writeFile(wb, "dashboard-analytics.xlsx");
}
