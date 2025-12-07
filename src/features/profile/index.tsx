import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { profileSchema } from "@/libs/schemas/user";
import { useQuestionnaireStore } from "@/libs/store/QuestionnaireStore";
import { useUserStore } from "@/libs/store/UserStore";

export function Profile() {
	const navigate = useNavigate();
	const store = useUserStore();
	const questionnaireStore = useQuestionnaireStore();
	const [showInstructions, setShowInstructions] = useState(false);

	const form = useForm({
		defaultValues: {
			email: "",
			name: "",
			nim: "",
			class: "",
			semester: "",
			age: "",
			gender: "",
			mode: "segmented",
		},
		validators: {
			onSubmit: ({ value }) => {
				const result = profileSchema.safeParse({
					email: value.email,
					name: value.name,
					nim: value.nim,
					class: value.class,
					semester: value.semester,
					age: Number(value.age),
					gender: value.gender,
				});

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
			store.setUser({
				email: value.email,
				name: value.name,
				nim: value.nim,
				class: value.class,
				semester: value.semester,
				age: Number(value.age),
				gender: value.gender,
			});

			questionnaireStore.reset();
			setShowInstructions(true);
		},
	});

	const handleStart = () => {
		const mode = form.getFieldValue("mode");

		if (mode === "segmented") {
			navigate({ to: "/questionnaire/segmented" });
		} else {
			navigate({ to: "/questionnaire" });
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
			<Card className="w-full max-w-md shadow-lg">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl font-bold">Student Profile</CardTitle>
					<CardDescription>
						Enter your details to start the questionnaire.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="space-y-6"
					>
						<form.Field name="email">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										placeholder="ahmad@example.com"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									{field.state.meta.errors?.[0] && (
										<p className="text-sm text-destructive">
											{field.state.meta.errors[0]}
										</p>
									)}
								</div>
							)}
						</form.Field>

						<form.Field name="name">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor="name">Full Name</Label>
									<Input
										id="name"
										placeholder="Ahmad"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									{field.state.meta.errors?.[0] && (
										<p className="text-sm text-destructive">
											{field.state.meta.errors[0]}
										</p>
									)}
								</div>
							)}
						</form.Field>

						<form.Field name="nim">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor="nim">NIM</Label>
									<Input
										id="nim"
										placeholder="2141720000"
										type="number"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									{field.state.meta.errors?.[0] && (
										<p className="text-sm text-destructive">
											{field.state.meta.errors[0]}
										</p>
									)}
								</div>
							)}
						</form.Field>

						<div className="grid grid-cols-2 gap-4">
							<form.Field name="class">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor="class">Class</Label>
										<Input
											id="class"
											placeholder="TI-4G"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{field.state.meta.errors?.[0] && (
											<p className="text-sm text-destructive">
												{field.state.meta.errors[0]}
											</p>
										)}
									</div>
								)}
							</form.Field>

							<form.Field name="semester">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor="semester">Semester</Label>
										<Input
											id="semester"
											placeholder="8"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{field.state.meta.errors?.[0] && (
											<p className="text-sm text-destructive">
												{field.state.meta.errors[0]}
											</p>
										)}
									</div>
								)}
							</form.Field>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<form.Field name="age">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor="age">Age</Label>
										<Input
											id="age"
											type="number"
											placeholder="21"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{field.state.meta.errors?.[0] && (
											<p className="text-sm text-destructive">
												{field.state.meta.errors[0]}
											</p>
										)}
									</div>
								)}
							</form.Field>

							<form.Field name="gender">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor="gender">Gender</Label>
										<Select
											value={field.state.value}
											onValueChange={field.handleChange}
										>
											<SelectTrigger id="gender" className="w-full">
												<SelectValue placeholder="Select" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="L">Laki-laki</SelectItem>
												<SelectItem value="P">Perempuan</SelectItem>
											</SelectContent>
										</Select>
										{field.state.meta.errors?.[0] && (
											<p className="text-sm text-destructive">
												{field.state.meta.errors[0]}
											</p>
										)}
									</div>
								)}
							</form.Field>
						</div>

						<Button type="submit" className="w-full cursor-pointer" size="lg">
							Next Step
						</Button>
					</form>
				</CardContent>
			</Card>

			<Dialog open={showInstructions} onOpenChange={setShowInstructions}>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold text-center mb-2">
							Petunjuk Pengerjaan Kuesioner Kebutuhan Psikologis
						</DialogTitle>
						<DialogDescription className="sr-only">
							Instruksi pengisian kuesioner.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
						<p>
							Kuesioner ini berisi pernyataan-pernyataan tentang perasaan dan
							pengalaman anda dalam kehidupan sehari-hari, terutama terkait
							dengan kehidupan yang anda rasakan di Sekolah. Tidak ada jawaban
							yang benar atau salah. Kami hanya ingin mengetahui apa yang sedang
							anda alami saat ini.
						</p>

						<div className="bg-muted/50 p-4 rounded-lg border border-border">
							<strong className="block mb-2 text-foreground">
								Cara mengisi:
							</strong>
							<ol className="list-decimal pl-5 space-y-2">
								<li>Bacalah setiap pernyataan dengan cermat.</li>
								<li>Isi identitas diri yang diminta.</li>
								<li>
									Tentukan seberapa besar anda setuju atau tidak setuju dengan
									pernyataan tersebut.
								</li>
								<li>
									Beri tanda (V) atau pilih salah satu angka dari 1 hingga 4 di
									sebelah pernyataan yang sesuai dengan perasaan anda.
								</li>
								<li>
									Skala yang digunakan adalah sebagai berikut:
									<ul className="list-disc pl-5 mt-1 space-y-1">
										<li>
											<span className="font-semibold text-foreground">1</span> =
											Sangat Tidak Setuju
										</li>
										<li>
											<span className="font-semibold text-foreground">2</span> =
											Tidak Setuju
										</li>
										<li>
											<span className="font-semibold text-foreground">3</span> =
											Setuju
										</li>
										<li>
											<span className="font-semibold text-foreground">4</span> =
											Sangat Setuju
										</li>
									</ul>
								</li>
							</ol>
						</div>

						<p className="italic">
							Tidak perlu terlalu lama berpikir, jawablah sesuai dengan apa yang
							anda rasakan secara spontan. Jawaban anda akan sangat membantu
							dalam memahami perasaan anda terkait kebutuhan psikologis dalam
							kehidupan sehari-hari.
						</p>

						<div className="p-3 rounded border-2 border-primary/50 text-red-400 text-xs">
							<strong>Contoh:</strong> Jika pernyataan berbunyi{" "}
							<em>"Saya merasa aman di sekolah"</em>, dan kamu merasa bahwa
							pernyataan ini sangat sesuai dengan dirimu, maka kamu dapat
							memilih angka 4 pada skala tersebut.
						</div>
					</div>

					<DialogFooter className="mt-6 sm:justify-center">
						<Button
							onClick={handleStart}
							size="lg"
							className="w-full sm:w-auto cursor-pointer"
						>
							Mulai Mengerjakan
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
