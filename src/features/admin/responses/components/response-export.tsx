import { format } from "date-fns";
import { Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
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

export function exportResponsesToExcel(responses: ResponseListItem[]) {
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

export function exportResponseDetailToExcel(response: ResponseDetail) {
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

export function ExportResponsesButton({ responses }: ExportListProps) {
	return (
		<Button
			onClick={() => exportResponsesToExcel(responses)}
			className="cursor-pointer"
		>
			<FileSpreadsheet className="h-4 w-4 mr-2" />
			Export Excel
		</Button>
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
