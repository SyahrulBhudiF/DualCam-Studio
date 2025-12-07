import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft, Eye, Save, Video } from "lucide-react";
import { toast } from "sonner";
import { updateQuestionnaire } from "@/apis/admin/questionnaires";
import { getResponsesByQuestionnaireId } from "@/apis/admin/responses";
import { Main } from "@/components/layout/main";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { createQuestionnaireSchema } from "@/libs/schemas/questionnaire";
import { QuestionTable } from "./question-table";
import type { Question, Questionnaire } from "./questionnaires.types";

interface QuestionnaireDetailProps {
	questionnaire: Questionnaire;
	questions: Question[];
}

export function QuestionnaireDetail({
	questionnaire,
	questions,
}: QuestionnaireDetailProps) {
	const queryClient = useQueryClient();

	const responsesQuery = useQuery({
		queryKey: ["admin", "questionnaire", questionnaire.id, "responses"],
		queryFn: () => getResponsesByQuestionnaireId({ data: questionnaire.id }),
	});

	const updateMutation = useMutation({
		mutationFn: updateQuestionnaire,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "questionnaires"] });
			queryClient.invalidateQueries({
				queryKey: ["admin", "questionnaire", questionnaire.id],
			});

			toast.success("Questionnaire updated successfully");
			form.reset();
		},
		onError: () => {
			toast.error("Failed to update questionnaire");
		},
	});

	const form = useForm({
		defaultValues: {
			title: questionnaire.title,
			description: questionnaire.description || "",
			is_active: questionnaire.is_active,
		},
		validators: {
			onSubmit: ({ value }) => {
				const result = createQuestionnaireSchema.safeParse(value);
				if (!result.success) {
					return result.error.issues.reduce(
						(acc, issue) => {
							const path = issue.path[0] as string;
							acc[path] = issue.message;
							return acc;
						},
						{} as Record<string, string>,
					);
				}
				return undefined;
			},
		},
		onSubmit: async ({ value }) => {
			await updateMutation.mutateAsync({
				data: {
					id: questionnaire.id,
					title: value.title,
					description: value.description || null,
					is_active: value.is_active,
				},
			});
		},
	});

	const responses = responsesQuery.data ?? [];

	return (
		<Main className="space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" asChild>
					<Link to="/admin/questionnaires">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<h2 className="text-2xl font-bold tracking-tight">
					Questionnaire Details
				</h2>
			</div>

			<Tabs defaultValue="details" className="space-y-4">
				<TabsList>
					<TabsTrigger value="details">Details</TabsTrigger>
					<TabsTrigger value="questions">
						Questions ({questions.length})
					</TabsTrigger>
					<TabsTrigger value="responses">
						Responses ({responses.length})
					</TabsTrigger>
				</TabsList>

				<TabsContent value="details" className="space-y-4">
					<div className="grid gap-6 md:grid-cols-2">
						<form
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								form.handleSubmit();
							}}
							className="space-y-4 rounded-lg border p-4"
						>
							<form.Field name="title">
								{(field) => (
									<div className="grid gap-2">
										<Label htmlFor="title">Title</Label>
										<Input
											id="title"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											required
										/>
										{field.state.meta.errors ? (
											<p className="text-sm text-red-500">
												{field.state.meta.errors.join(", ")}
											</p>
										) : null}
									</div>
								)}
							</form.Field>

							<form.Field name="description">
								{(field) => (
									<div className="grid gap-2">
										<Label htmlFor="description">Description</Label>
										<Textarea
											id="description"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{field.state.meta.errors ? (
											<p className="text-sm text-red-500">
												{field.state.meta.errors.join(", ")}
											</p>
										) : null}
									</div>
								)}
							</form.Field>

							<form.Field name="is_active">
								{(field) => (
									<div className="flex items-center gap-2">
										<Switch
											id="is_active"
											checked={field.state.value}
											onCheckedChange={field.handleChange}
										/>
										<Label htmlFor="is_active">Active</Label>
										{field.state.meta.errors ? (
											<p className="text-sm text-red-500">
												{field.state.meta.errors.join(", ")}
											</p>
										) : null}
									</div>
								)}
							</form.Field>

							<Button type="submit" disabled={updateMutation.isPending}>
								<Save className="mr-2 h-4 w-4" /> Save Changes
							</Button>
						</form>
					</div>
				</TabsContent>

				<TabsContent value="questions" className="space-y-4">
					<div className="rounded-lg border p-4">
						<QuestionTable
							data={questions}
							questionnaireId={questionnaire.id}
						/>
					</div>
				</TabsContent>

				<TabsContent value="responses" className="space-y-4">
					<div className="rounded-lg border">
						{responsesQuery.isLoading ? (
							<div className="flex items-center justify-center h-32">
								<span className="text-muted-foreground">
									Loading responses...
								</span>
							</div>
						) : responses.length === 0 ? (
							<div className="flex items-center justify-center h-32">
								<span className="text-muted-foreground">
									No responses yet for this questionnaire
								</span>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Class</TableHead>
										<TableHead>NIM</TableHead>
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
											<TableCell className="text-muted-foreground">
												{response.profile?.nim ?? "-"}
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
												{format(
													new Date(response.createdAt),
													"dd MMM yyyy HH:mm",
												)}
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
					</div>
				</TabsContent>
			</Tabs>
		</Main>
	);
}
