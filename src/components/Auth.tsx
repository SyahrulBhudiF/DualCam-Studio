import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function Auth({
	actionText,
	onSubmit,
	status,
	afterSubmit,
}: {
	actionText: string;
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
	status: "pending" | "idle" | "success" | "error";
	afterSubmit?: React.ReactNode;
}) {
	return (
		<div className="fixed inset-0 bg-background flex items-center justify-center p-8">
			<Card className="w-full sm:max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl text-center">
						{actionText}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							onSubmit(e);
						}}
						className="space-y-4"
					>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								type="email"
								name="email"
								id="email"
								placeholder="example@gmail.com"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								type="password"
								name="password"
								id="password"
								placeholder="password123"
							/>
						</div>
						<Button
							type="submit"
							className="w-full uppercase"
							disabled={status === "pending"}
						>
							{status === "pending" ? "..." : actionText}
						</Button>
						{afterSubmit ? afterSubmit : null}
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
