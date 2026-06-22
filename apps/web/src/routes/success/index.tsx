import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export const Route = createFileRoute("/success/")({
	component: SuccessPage,
});

function SuccessPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md text-center shadow-lg">
				<CardHeader>
					<div className="flex justify-center mb-4">
						<CheckCircle2 className="size-16 text-primary" />
					</div>
					<CardTitle className="text-2xl font-bold text-primary">
						Submission Successful!
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-muted-foreground">
						Thank you for completing the questionnaire. Your video and answers
						have been recorded securely.
					</p>
					<Button asChild className="w-full">
						<Link to="/quiz">Back to Quiz</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
