import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/Select";
import { profileSchema } from "@/libs/schemas/user";
import { useQuestionnaireStore } from "@/libs/store/QuestionnaireStore";
import { useUserStore } from "@/libs/store/UserStore";

function useProfileState() {
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
			predictionOptIn: false,
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
			questionnaireStore.setPredictionOptIn(value.predictionOptIn);
			setShowInstructions(true);
		},
	});

	const handleStart = () => {
		const mode = form.getFieldValue("mode");
		const target =
			mode === "segmented" ? "/questionnaire/segmented" : "/questionnaire";
		void navigate({ to: target });
	};

	return { form, showInstructions, setShowInstructions, handleStart };
}

type ProfileForm = ReturnType<typeof useProfileState>["form"];
type TextFieldName = "email" | "name" | "nim" | "class" | "semester" | "age";

type ProfileTextFieldProps = {
	form: ProfileForm;
	name: TextFieldName;
	label: string;
	placeholder: string;
	type?: "text" | "number";
};

export function Profile() {
	const { form, showInstructions, setShowInstructions, handleStart } =
		useProfileState();

	return (
		<div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
			<ProfileCard form={form} />
			<ProfileInstructionsDialog
				open={showInstructions}
				onOpenChange={setShowInstructions}
				onStart={handleStart}
			/>
		</div>
	);
}

function ProfileCard({ form }: { form: ProfileForm }) {
	return (
		<Card className="w-full max-w-md shadow-lg">
			<CardHeader className="text-center">
				<CardTitle className="text-2xl font-bold">Student Profile</CardTitle>
				<CardDescription>
					Enter your details to start the questionnaire.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ProfileFormFields form={form} />
			</CardContent>
		</Card>
	);
}

function ProfileFormFields({ form }: { form: ProfileForm }) {
	return (
		<div className="space-y-4">
			<ProfileTextField
				form={form}
				name="email"
				label="Email"
				placeholder="ahmad@example.com"
			/>
			<ProfileTextField
				form={form}
				name="name"
				label="Full Name"
				placeholder="Ahmad"
			/>
			<ProfileTextField
				form={form}
				name="nim"
				label="NIM"
				placeholder="2141720000"
				type="number"
			/>
			<div className="grid grid-cols-2 gap-4">
				<ProfileTextField
					form={form}
					name="class"
					label="Class"
					placeholder="TI-4G"
				/>
				<ProfileTextField
					form={form}
					name="semester"
					label="Semester"
					placeholder="8"
				/>
			</div>
			<div className="grid grid-cols-2 gap-4">
				<ProfileTextField
					form={form}
					name="age"
					label="Age"
					placeholder="21"
					type="number"
				/>
				<GenderField form={form} />
			</div>
			<form.Field name="predictionOptIn">
				{(field) => {
					const checked = field.state.value;

					return (
						<div
							className="flex w-full items-start gap-3 rounded-lg border p-3 transition-colors data-[checked=true]:border-primary data-[checked=true]:bg-primary/5"
							data-checked={checked}
						>
							<Checkbox
								id="prediction-opt-in"
								checked={checked}
								onCheckedChange={(nextChecked) =>
									field.handleChange(nextChecked === true)
								}
							/>
							<div className="space-y-1 leading-none">
								<Label htmlFor="prediction-opt-in" className="cursor-pointer">
									Analisis video setelah submit
								</Label>
								<p className="text-sm text-muted-foreground">
									Jika dicentang, kamu akan diarahkan ke halaman hasil prediksi.
								</p>
							</div>
						</div>
					);
				}}
			</form.Field>
			<Button
				type="button"
				className="w-full cursor-pointer"
				size="lg"
				onClick={() => form.handleSubmit()}
			>
				Next Step
			</Button>
		</div>
	);
}

function ProfileTextField({
	form,
	name,
	label,
	placeholder,
	type = "text",
}: ProfileTextFieldProps) {
	return (
		<form.Field name={name}>
			{(field) => (
				<div className="space-y-2">
					<Label htmlFor={name}>{label}</Label>
					<Input
						id={name}
						placeholder={placeholder}
						type={type}
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
	);
}

function GenderField({ form }: { form: ProfileForm }) {
	return (
		<form.Field name="gender">
			{(field) => (
				<div className="space-y-2">
					<Label htmlFor="gender">Gender</Label>
					<Select value={field.state.value} onValueChange={field.handleChange}>
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
	);
}

function ProfileInstructionsDialog({
	open,
	onOpenChange,
	onStart,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onStart: () => void | Promise<void>;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-xl font-bold text-center mb-2">
						Petunjuk Pengerjaan Kuesioner Kebutuhan Psikologis
					</DialogTitle>
					<DialogDescription className="sr-only">
						Instruksi pengisian kuesioner.
					</DialogDescription>
				</DialogHeader>
				<InstructionsContent />
				<DialogFooter className="mt-6 sm:justify-center">
					<Button
						type="button"
						onClick={onStart}
						size="lg"
						className="w-full sm:w-auto cursor-pointer"
					>
						Mulai Mengerjakan
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function InstructionsContent() {
	return (
		<div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
			<p>
				Kuesioner ini berisi pernyataan-pernyataan tentang perasaan dan
				pengalaman anda dalam kehidupan sehari-hari, terutama terkait dengan
				kehidupan yang anda rasakan di Sekolah. Tidak ada jawaban yang benar
				atau salah. Kami hanya ingin mengetahui apa yang sedang anda alami saat
				ini.
			</p>
			<InstructionSteps />
			<p className="italic">
				Tidak perlu terlalu lama berpikir, jawablah sesuai dengan apa yang anda
				rasakan secara spontan. Jawaban anda akan sangat membantu dalam memahami
				perasaan anda terkait kebutuhan psikologis dalam kehidupan sehari-hari.
			</p>
			<div className="p-3 rounded border-2 border-primary/50 text-destructive text-xs">
				<strong>Contoh:</strong> Jika pernyataan berbunyi{" "}
				<em>"Saya merasa aman di sekolah"</em>, dan kamu merasa bahwa pernyataan
				ini sangat sesuai dengan dirimu, maka kamu dapat memilih angka 4 pada
				skala tersebut.
			</div>
		</div>
	);
}

function InstructionSteps() {
	return (
		<div className="bg-muted/50 p-4 rounded-lg border border-border">
			<strong className="block mb-2 text-foreground">Cara mengisi:</strong>
			<ol className="list-decimal pl-5 space-y-1">
				<li>Bacalah setiap pernyataan dengan cermat.</li>
				<li>Isi identitas diri yang diminta.</li>
				<li>
					Tentukan seberapa besar anda setuju atau tidak setuju dengan
					pernyataan tersebut.
				</li>
				<li>
					Beri tanda (V) atau pilih salah satu angka dari 1 hingga 4 di sebelah
					pernyataan yang sesuai dengan perasaan anda.
				</li>
				<li>
					Skala yang digunakan adalah sebagai berikut:
					<ul className="list-disc pl-5 mt-1 space-y-1">
						<li>
							<span className="font-semibold text-foreground">1</span> = Sangat
							Tidak Setuju
						</li>
						<li>
							<span className="font-semibold text-foreground">2</span> = Tidak
							Setuju
						</li>
						<li>
							<span className="font-semibold text-foreground">3</span> = Setuju
						</li>
						<li>
							<span className="font-semibold text-foreground">4</span> = Sangat
							Setuju
						</li>
					</ul>
				</li>
			</ol>
		</div>
	);
}
