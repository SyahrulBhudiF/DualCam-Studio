import { toast } from "sonner";
import type { DashboardData } from "../Dashboard.types";

export async function exportDashboardToExcel({
	summary,
	breakdown,
	analytics,
}: DashboardData) {
	const exportPromise = import("xlsx").then((XLSX) => {
		const summarySheetData = [
			["Metric", "Value"],
			["Total Questionnaires", summary.totalQuestionnaires],
			["Active Questionnaires", summary.activeQuestionnaires],
			["Total Responses", summary.totalResponses],
			["Average Score", summary.averageScore],
			["Total Classes", summary.totalClasses],
		];

		const questionnaireSheetData = [
			["Questionnaire", "Total Responses", "Average Score"],
			...breakdown.questionnaires.map((q) => [
				q.title,
				q.totalResponses,
				q.averageScore,
			]),
		];

		const classSheetData = [
			["Class", "Total Responses", "Average Score"],
			...breakdown.classes.map((c) => [
				c.className,
				c.totalResponses,
				c.averageScore,
			]),
		];

		const questionSheetData = [
			["Order", "Question", "Average Score"],
			...analytics.questions
				.toSorted((a, b) => (a.order ?? 0) - (b.order ?? 0))
				.map((q) => [q.order ?? "", q.text, q.averageScore]),
		];

		const answersSheetData = [
			["Answer", "Question Id", "Total Responses", "Average Score"],
			...analytics.answers.map((a) => [
				a.text,
				a.questionId ?? "",
				a.totalResponses,
				a.averageScore,
			]),
		];

		const timelineSheetData = [
			["Date", "Total Responses", "Average Score"],
			...analytics.timeline.map((t) => [
				t.date,
				t.totalResponses,
				t.averageScore,
			]),
		];

		const wb = XLSX.utils.book_new();

		XLSX.utils.book_append_sheet(
			wb,
			XLSX.utils.aoa_to_sheet(summarySheetData),
			"Summary",
		);
		XLSX.utils.book_append_sheet(
			wb,
			XLSX.utils.aoa_to_sheet(questionnaireSheetData),
			"Questionnaires",
		);
		XLSX.utils.book_append_sheet(
			wb,
			XLSX.utils.aoa_to_sheet(classSheetData),
			"Classes",
		);
		XLSX.utils.book_append_sheet(
			wb,
			XLSX.utils.aoa_to_sheet(questionSheetData),
			"Questions",
		);
		XLSX.utils.book_append_sheet(
			wb,
			XLSX.utils.aoa_to_sheet(answersSheetData),
			"Answers",
		);
		XLSX.utils.book_append_sheet(
			wb,
			XLSX.utils.aoa_to_sheet(timelineSheetData),
			"Timeline",
		);

		XLSX.writeFile(wb, "dashboard-analytics.xlsx");
	});

	toast.promise(exportPromise, {
		loading: "Preparing dashboard export…",
		success: "Dashboard export ready",
		error: "Failed to export dashboard",
	});

	await exportPromise;
}
