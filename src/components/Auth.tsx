import { Eye, EyeOff } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function Auth({
	actionText,
	status,
	afterSubmit,
	emailField,
	passwordField,
	onSubmit,
}: {
	actionText: string;
	status: "pending" | "idle" | "success" | "error";
	afterSubmit?: ReactNode;
	emailField: {
		value: string;
		onBlur: () => void;
		onChange: (value: string) => void;
		errors: string[];
	};
	passwordField: {
		value: string;
		onBlur: () => void;
		onChange: (value: string) => void;
		errors: string[];
	};
	onSubmit: () => void;
}) {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<div className="fixed inset-0 bg-background flex items-center justify-center p-8">
			<Card className="w-full sm:max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl text-center">{actionText}</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						className="space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							onSubmit();
						}}
					>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								type="email"
								name="email"
								id="email"
								placeholder="example@gmail.com"
								value={emailField.value}
								onBlur={emailField.onBlur}
								onChange={(event) => emailField.onChange(event.target.value)}
							/>
						{emailField.errors.length > 0 ? (
								<p className="text-destructive text-sm">
									{emailField.errors.join(", ")}
								</p>
							) : null}
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<div className="relative">
								<Input
									type={showPassword ? "text" : "password"}
									name="password"
									id="password"
									placeholder="password123"
									className="pr-10"
									value={passwordField.value}
									onBlur={passwordField.onBlur}
									onChange={(event) =>
										passwordField.onChange(event.target.value)
									}
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute top-1/2 right-1 size-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
									aria-label={showPassword ? "Hide password" : "Show password"}
									onClick={() => setShowPassword((value) => !value)}
								>
									{showPassword ? (
										<EyeOff className="size-4" />
									) : (
										<Eye className="size-4" />
									)}
								</Button>
							</div>
							{passwordField.errors.length > 0 ? (
								<p className="text-destructive text-sm">
									{passwordField.errors.join(", ")}
								</p>
							) : null}
						</div>
						<Button
							type="submit"
							className="w-full uppercase"
							disabled={status === "pending"}
						>
							{status === "pending" ? "…" : actionText}
						</Button>
						{afterSubmit ? afterSubmit : null}
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
