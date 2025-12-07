import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown, Eye, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { ResponseListItem } from "../responses.types";

export function getResponseColumns(): ColumnDef<ResponseListItem>[] {
	return [
		{
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && "indeterminate")
					}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					aria-label="Select all"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Select row"
				/>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "profile.name",
			id: "name",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="cursor-pointer"
				>
					Name
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => (
				<div className="font-medium">{row.original.profile?.name ?? "-"}</div>
			),
		},
		{
			accessorKey: "profile.class",
			id: "class",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="cursor-pointer"
				>
					Class
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => (
				<Badge variant="outline">{row.original.profile?.class ?? "-"}</Badge>
			),
		},
		{
			accessorKey: "profile.nim",
			id: "nim",
			header: "NIM",
			cell: ({ row }) => (
				<span className="text-muted-foreground">
					{row.original.profile?.nim ?? "-"}
				</span>
			),
		},
		{
			accessorKey: "questionnaireTitle",
			id: "questionnaire",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="cursor-pointer"
				>
					Questionnaire
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => (
				<div className="max-w-[200px] truncate">
					{row.original.questionnaireTitle ?? "-"}
				</div>
			),
		},
		{
			accessorKey: "totalScore",
			id: "score",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="cursor-pointer"
				>
					Score
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => (
				<Badge variant="secondary">{row.original.totalScore}</Badge>
			),
		},
		{
			accessorKey: "videoPath",
			id: "video",
			header: "Video",
			cell: ({ row }) => {
				const hasVideo =
					row.original.videoPath && row.original.videoPath !== "null";
				return hasVideo ? (
					<Badge variant="default" className="gap-1">
						<Video className="h-3 w-3" />
						Yes
					</Badge>
				) : (
					<Badge variant="outline">No</Badge>
				);
			},
		},
		{
			accessorKey: "createdAt",
			id: "date",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="cursor-pointer"
				>
					Date
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => (
				<span className="text-muted-foreground text-sm">
					{format(new Date(row.original.createdAt), "dd MMM yyyy HH:mm")}
				</span>
			),
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => (
				<Link
					to="/admin/responses/$responseId"
					params={{ responseId: row.original.id }}
				>
					<Button variant="ghost" size="sm" className="cursor-pointer">
						<Eye className="h-4 w-4 mr-1" />
						View
					</Button>
				</Link>
			),
		},
	];
}
