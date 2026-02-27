import { format } from "date-fns";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getAllResponsesWithDetails } from "@/apis/admin/responses";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ResponseDetail, ResponseListItem } from "../responses.types";

type ExportListProps = {
	responses: ResponseListItem[];
};

type ExportDetailProps = {
	response: ResponseDetail;
};

export async function exportResponsesToExcel(responses: ResponseListItem[]) {
	const XLSX = await import("xlsx");
	const data = responses.map((r) => ({
		Name: r.profile?.name ?? "-",
		Email: r.profile?.email ?? "-",
		NIM: r.profile?.nim ?? "-",
		Class: r.profile?.class ?? "-",
		Semester: r.profile?.semester ?? "-",
		Gender: r.profile?.gender ?? "-",
		Age: r.profile?.age ?? "-",
		Questionnaire: r.questionnaireTitle ?? "-",
		"Total Score": r.totalScore,
		"Has Video": r.videoPath && r.videoPath !== "null" ? "Yes" : "No",
		"Submitted At": format(new Date(r.createdAt), "dd/MM/yyyy HH:mm:ss"),
	}));

	const worksheet = XLSX.utils.json_to_sheet(data);
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, "Responses");

	const colWidths = [
		{ wch: 25 },
		{ wch: 30 },
		{ wch: 15 },
		{ wch: 15 },
		{ wch: 10 },
		{ wch: 10 },
		{ wch: 8 },
		{ wch: 30 },
		{ wch: 12 },
		{ wch: 10 },
		{ wch: 20 },
	];
	worksheet["!cols"] = colWidths;

	const filename = `responses_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx`;
	XLSX.writeFile(workbook, filename);
}

export async function exportResponseDetailToExcel(response: ResponseDetail) {
	const XLSX = await import("xlsx");
	const profileData = [
		{
			Field: "Name",
			Value: response.profile?.name ?? "-",
		},
		{
			Field: "Email",
			Value: response.profile?.email ?? "-",
		},
		{
			Field: "NIM",
			Value: response.profile?.nim ?? "-",
		},
		{
			Field: "Class",
			Value: response.profile?.class ?? "-",
		},
		{
			Field: "Semester",
			Value: response.profile?.semester ?? "-",
		},
		{
			Field: "Gender",
			Value: response.profile?.gender ?? "-",
		},
		{
			Field: "Age",
			Value: response.profile?.age ?? "-",
		},
		{
			Field: "Questionnaire",
			Value: response.questionnaire?.title ?? "-",
		},
		{
			Field: "Total Score",
			Value: response.totalScore,
		},
		{
			Field: "Submitted At",
			Value: format(new Date(response.createdAt), "dd/MM/yyyy HH:mm:ss"),
		},
	];

	const sortedDetails = [...response.details].sort(
		(a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0),
	);

	const answersData = sortedDetails.map((d, index) => ({
		"#": d.orderNumber ?? index + 1,
		Question: d.questionText ?? "-",
		Answer: d.answerText ?? "-",
		Score: d.score,
	}));

	const workbook = XLSX.utils.book_new();

	const profileSheet = XLSX.utils.json_to_sheet(profileData);
	profileSheet["!cols"] = [{ wch: 15 }, { wch: 40 }];
	XLSX.utils.book_append_sheet(workbook, profileSheet, "Profile");

	const answersSheet = XLSX.utils.json_to_sheet(answersData);
	answersSheet["!cols"] = [{ wch: 5 }, { wch: 50 }, { wch: 40 }, { wch: 8 }];
	XLSX.utils.book_append_sheet(workbook, answersSheet, "Answers");

	const safeName = (response.profile?.name ?? "unknown")
		.replace(/[^a-z0-9]/gi, "_")
		.toLowerCase();
	const filename = `response_${safeName}_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx`;
	XLSX.writeFile(workbook, filename);
}

type FullResponseData = Awaited<ReturnType<typeof getAllResponsesWithDetails>>;

export async function exportAllResponseDetailsToExcel(responses: FullResponseData) {
	const XLSX = await import("xlsx");
	const workbook = XLSX.utils.book_new();

	// Sheet 1: Summary - All respondents with their total scores
	const summaryData = responses.map((r, index) => ({
		No: index + 1,
		Name: r.profile?.name ?? "-",
		Email: r.profile?.email ?? "-",
		NIM: r.profile?.nim ?? "-",
		Class: r.profile?.class ?? "-",
		Semester: r.profile?.semester ?? "-",
		Gender:
			r.profile?.gender === "L"
				? "Laki-laki"
				: r.profile?.gender === "P"
					? "Perempuan"
					: "-",
		Age: r.profile?.age ?? "-",
		Questionnaire: r.questionnaireTitle ?? "-",
		"Total Score": r.totalScore,
		"Submitted At": format(new Date(r.createdAt), "dd/MM/yyyy HH:mm:ss"),
	}));

	const summarySheet = XLSX.utils.json_to_sheet(summaryData);
	summarySheet["!cols"] = [
		{ wch: 5 }, // No
		{ wch: 25 }, // Name
		{ wch: 30 }, // Email
		{ wch: 15 }, // NIM
		{ wch: 12 }, // Class
		{ wch: 10 }, // Semester
		{ wch: 12 }, // Gender
		{ wch: 6 }, // Age
		{ wch: 30 }, // Questionnaire
		{ wch: 12 }, // Total Score
		{ wch: 20 }, // Submitted At
	];
	XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

	// Sheet 2: All Response Details - Flattened data with all answers
	const allDetailsData: Record<string, unknown>[] = [];

	for (const response of responses) {
		const sortedDetails = [...response.details].sort(
			(a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0),
		);

		for (const detail of sortedDetails) {
			allDetailsData.push({
				Name: response.profile?.name ?? "-",
				NIM: response.profile?.nim ?? "-",
				Class: response.profile?.class ?? "-",
				Questionnaire: response.questionnaireTitle ?? "-",
				"Question No": detail.orderNumber ?? "-",
				Question: detail.questionText ?? "-",
				Answer: detail.answerText ?? "-",
				Score: detail.score,
				"Submitted At": format(
					new Date(response.createdAt),
					"dd/MM/yyyy HH:mm:ss",
				),
			});
		}
	}

	const detailsSheet = XLSX.utils.json_to_sheet(allDetailsData);
	detailsSheet["!cols"] = [
		{ wch: 25 }, // Name
		{ wch: 15 }, // NIM
		{ wch: 12 }, // Class
		{ wch: 30 }, // Questionnaire
		{ wch: 12 }, // Question No
		{ wch: 60 }, // Question
		{ wch: 30 }, // Answer
		{ wch: 8 }, // Score
		{ wch: 20 }, // Submitted At
	];
	XLSX.utils.book_append_sheet(workbook, detailsSheet, "All Answers");

	// Sheet 3: Pivot-style - Each respondent as row, each question as column
	if (responses.length > 0 && responses[0].details.length > 0) {
		// Get unique questions from first response (assuming all have same questions)
		const firstResponse = responses[0];
		const sortedQuestions = [...firstResponse.details].sort(
			(a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0),
		);

		const pivotData = responses.map((r) => {
			const row: Record<string, unknown> = {
				Name: r.profile?.name ?? "-",
				NIM: r.profile?.nim ?? "-",
				Class: r.profile?.class ?? "-",
				Questionnaire: r.questionnaireTitle ?? "-",
			};

			// Add each question's answer as a column
			const detailsMap = new Map(r.details.map((d) => [d.orderNumber, d]));

			for (const q of sortedQuestions) {
				const detail = detailsMap.get(q.orderNumber);
				const questionLabel = `Q${q.orderNumber ?? 0}`;
				row[questionLabel] = detail?.answerText ?? "-";
				row[`${questionLabel} Score`] = detail?.score ?? 0;
			}

			row["Total Score"] = r.totalScore;
			row["Submitted At"] = format(
				new Date(r.createdAt),
				"dd/MM/yyyy HH:mm:ss",
			);

			return row;
		});

		const pivotSheet = XLSX.utils.json_to_sheet(pivotData);

		// Calculate column widths dynamically
		const baseColWidths = [
			{ wch: 25 }, // Name
			{ wch: 15 }, // NIM
			{ wch: 12 }, // Class
			{ wch: 30 }, // Questionnaire
		];

		// Add widths for each question (answer + score columns)
		for (let i = 0; i < sortedQuestions.length; i++) {
			baseColWidths.push({ wch: 20 }); // Answer
			baseColWidths.push({ wch: 10 }); // Score
		}

		baseColWidths.push({ wch: 12 }); // Total Score
		baseColWidths.push({ wch: 20 }); // Submitted At

		pivotSheet["!cols"] = baseColWidths;
		XLSX.utils.book_append_sheet(workbook, pivotSheet, "Pivot View");

		// Sheet 4: Question Legend
		const legendData = sortedQuestions.map((q) => ({
			"Question No": `Q${q.orderNumber ?? 0}`,
			"Question Text": q.questionText ?? "-",
		}));

		const legendSheet = XLSX.utils.json_to_sheet(legendData);
		legendSheet["!cols"] = [
			{ wch: 12 }, // Question No
			{ wch: 80 }, // Question Text
		];
		XLSX.utils.book_append_sheet(workbook, legendSheet, "Question Legend");
	}

	const filename = `all_responses_details_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx`;
	XLSX.writeFile(workbook, filename);
}

export function ExportResponsesButton({ responses }: ExportListProps) {
	const [isExportingDetails, setIsExportingDetails] = useState(false);

	const handleExportAllDetails = async () => {
		setIsExportingDetails(true);
		try {
			const fullData = await getAllResponsesWithDetails();
			await exportAllResponseDetailsToExcel(fullData);
			toast.success("Export berhasil!");
		} catch (error) {
			console.error("Export failed:", error);
			toast.error("Gagal mengexport data. Silakan coba lagi.");
		} finally {
			setIsExportingDetails(false);
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button className="cursor-pointer" disabled={isExportingDetails}>
					{isExportingDetails ? (
						<div className="animate-spin mr-2"><Loader2 className="h-4 w-4" /></div>
					) : (
						<FileSpreadsheet className="h-4 w-4 mr-2" />
					)}
					Export Excel
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					onClick={() => exportResponsesToExcel(responses)}
					className="cursor-pointer"
				>
					<FileSpreadsheet className="h-4 w-4 mr-2" />
					Export Summary (Ringkasan)
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={handleExportAllDetails}
					className="cursor-pointer"
					disabled={isExportingDetails}
				>
					<FileSpreadsheet className="h-4 w-4 mr-2" />
					Export All Details (Lengkap)
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function ExportResponseDetailButton({ response }: ExportDetailProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" className="cursor-pointer">
					<Download className="h-4 w-4 mr-2" />
					Export
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					onClick={() => exportResponseDetailToExcel(response)}
					className="cursor-pointer"
				>
					<FileSpreadsheet className="h-4 w-4 mr-2" />
					Export as Excel
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
