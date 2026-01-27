import { format } from "date-fns";
import { Calendar, GraduationCap, Hash, Mail, User, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { ResponseProfile } from "../responses.types";

type ProfileCardProps = {
	profile: ResponseProfile | null;
	createdAt: string;
	questionnaireTitle: string | null;
};

export function ProfileCard({
	profile,
	createdAt,
	questionnaireTitle,
}: ProfileCardProps) {
	if (!profile) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Respondent Profile</CardTitle>
					<CardDescription>Profile information not available</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center h-32 text-muted-foreground">
						No profile data
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
					<div className="min-w-0">
						<CardTitle className="flex items-center gap-2">
							<User className="h-5 w-5 shrink-0" />
							<span className="truncate">{profile.name ?? "Unknown"}</span>
						</CardTitle>
						<CardDescription>Respondent Profile</CardDescription>
					</div>
					<Badge variant="outline" className="text-xs w-fit shrink-0">
						{format(new Date(createdAt), "dd MMM yyyy HH:mm")}
					</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{profile.email && (
						<div className="flex items-start gap-2 min-w-0">
							<Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
							<div className="min-w-0">
								<div className="text-xs text-muted-foreground">Email</div>
								<div className="text-sm font-medium break-all">
									{profile.email}
								</div>
							</div>
						</div>
					)}

					{profile.nim && (
						<div className="flex items-start gap-2">
							<Hash className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
							<div>
								<div className="text-xs text-muted-foreground">NIM</div>
								<div className="text-sm font-medium">{profile.nim}</div>
							</div>
						</div>
					)}

					{profile.class && (
						<div className="flex items-start gap-2">
							<GraduationCap className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
							<div>
								<div className="text-xs text-muted-foreground">Class</div>
								<div className="text-sm font-medium">{profile.class}</div>
							</div>
						</div>
					)}

					{profile.semester && (
						<div className="flex items-start gap-2">
							<Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
							<div>
								<div className="text-xs text-muted-foreground">Semester</div>
								<div className="text-sm font-medium">{profile.semester}</div>
							</div>
						</div>
					)}

					{profile.gender && (
						<div className="flex items-start gap-2">
							<Users className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
							<div>
								<div className="text-xs text-muted-foreground">Gender</div>
								<div className="text-sm font-medium">{profile.gender}</div>
							</div>
						</div>
					)}

					{profile.age && (
						<div className="flex items-start gap-2">
							<User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
							<div>
								<div className="text-xs text-muted-foreground">Age</div>
								<div className="text-sm font-medium">{profile.age} years</div>
							</div>
						</div>
					)}
				</div>

				{questionnaireTitle && (
					<div className="mt-4 pt-4 border-t">
						<div className="text-xs text-muted-foreground mb-1">
							Questionnaire
						</div>
						<div className="text-sm font-medium">{questionnaireTitle}</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
