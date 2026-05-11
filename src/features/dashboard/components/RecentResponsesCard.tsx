import { Link } from "@tanstack/react-router";
import { Eye, Video } from "lucide-react";
import { ClientDate } from "@/components/ClientDate";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/Table";
import type { DashboardRecentResponse } from "../Dashboard.types";

type RecentResponsesCardProps = {
	responses: DashboardRecentResponse[];
};

function hasVideo(videoPath: string | null) {
	return Boolean(videoPath && videoPath !== "null");
}

export function RecentResponsesCard({ responses }: RecentResponsesCardProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Recent Responses</CardTitle>
						<CardDescription>
							Latest {responses.length} responses from all questionnaires
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
				{responses.length === 0 ? (
					<div className="flex h-32 items-center justify-center">
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
							{responses.map((response) => (
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
										{hasVideo(response.videoPath) ? (
											<Badge variant="default" className="gap-1">
												<Video className="size-3" />
												Yes
											</Badge>
										) : (
											<Badge variant="outline">No</Badge>
										)}
									</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										<ClientDate
											date={response.createdAt}
											formatString="dd MMM yyyy HH:mm"
										/>
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
												<Eye className="mr-1 size-4" />
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
