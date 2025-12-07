import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { Eye, Video } from "lucide-react";
import { getResponses } from "@/apis/admin/responses";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export function DashboardResponses() {
	const responsesQuery = useQuery({
		queryKey: ["admin", "responses"],
		queryFn: () => getResponses(),
	});

	const responses = responsesQuery.data ?? [];
	const recentResponses = responses.slice(0, 20);

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Recent Responses</CardTitle>
						<CardDescription>
							Latest {recentResponses.length} responses from all questionnaires
						</CardDescription>
					</div>
					<Link to="/admin/responses">
						<Button variant="outline" size="sm" className="cursor-pointer">
							View All
						</Button>
					</Link>
				</div>
			</CardHeader>
			<CardContent>
				{responsesQuery.isLoading ? (
					<div className="flex items-center justify-center h-32">
						<span className="text-muted-foreground">Loading responses...</span>
					</div>
				) : responses.length === 0 ? (
					<div className="flex items-center justify-center h-32">
						<span className="text-muted-foreground">No responses yet</span>
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Class</TableHead>
								<TableHead>Questionnaire</TableHead>
								<TableHead>Score</TableHead>
								<TableHead>Video</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{recentResponses.map((response) => (
								<TableRow key={response.id}>
									<TableCell className="font-medium">
										{response.profile?.name ?? "-"}
									</TableCell>
									<TableCell>
										<Badge variant="outline">
											{response.profile?.class ?? "-"}
										</Badge>
									</TableCell>
									<TableCell className="max-w-[150px] truncate">
										{response.questionnaireTitle ?? "-"}
									</TableCell>
									<TableCell>
										<Badge variant="secondary">{response.totalScore}</Badge>
									</TableCell>
									<TableCell>
										{response.videoPath && response.videoPath !== "null" ? (
											<Badge variant="default" className="gap-1">
												<Video className="h-3 w-3" />
												Yes
											</Badge>
										) : (
											<Badge variant="outline">No</Badge>
										)}
									</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										{format(new Date(response.createdAt), "dd MMM yyyy HH:mm")}
									</TableCell>
									<TableCell>
										<Link
											to="/admin/responses/$responseId"
											params={{ responseId: response.id }}
										>
											<Button
												variant="ghost"
												size="sm"
												className="cursor-pointer"
											>
												<Eye className="h-4 w-4 mr-1" />
												View
											</Button>
										</Link>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
}
