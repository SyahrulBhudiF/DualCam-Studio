import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/success/")({
	component: SuccessPage,
});

function SuccessPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
			<Card className="w-full max-w-md text-center shadow-lg">
				<CardHeader>
					<div className="flex justify-center mb-4">
						<CheckCircle2 className="h-16 w-16 text-green-500" />
					</div>
					<CardTitle className="text-2xl font-bold text-green-700">
						Submission Successful!
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-slate-600">
						Thank you for completing the questionnaire. Your video and answers
						have been recorded securely.
					</p>
					<Button asChild className="w-full">
						<Link to="/">Back to Home</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
