import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link, rootRouteId, useMatch, useRouter } from "@tanstack/react-router";
import { AlertCircle, Home, RefreshCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
	const router = useRouter();
	const isRoot = useMatch({
		strict: false,
		select: (state) => state.id === rootRouteId,
	});

	console.error(error);

	const errorMessage =
		error instanceof Error ? error.message : "An unexpected error occurred";
	const errorName = error instanceof Error ? error.name : "Error";

	return (
		<div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
						<AlertCircle className="h-8 w-8 text-destructive" />
					</div>
					<CardTitle className="text-xl">{errorName}</CardTitle>
					<CardDescription className="text-balance">
						{errorMessage}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="rounded-lg bg-muted p-3">
						<p className="text-xs text-muted-foreground font-mono break-all">
							{error instanceof Error && error.stack
								? error.stack.split("\n").slice(0, 3).join("\n")
								: "No stack trace available"}
						</p>
					</div>
				</CardContent>
				<CardFooter className="flex justify-center gap-2">
					<Button
						variant="outline"
						onClick={() => router.invalidate()}
						className="gap-2"
					>
						<RefreshCcw className="h-4 w-4" />
						Try Again
					</Button>
					{isRoot ? (
						<Button asChild className="gap-2">
							<Link to="/">
								<Home className="h-4 w-4" />
								Home
							</Link>
						</Button>
					) : (
						<Button
							variant="secondary"
							onClick={() => window.history.back()}
							className="gap-2"
						>
							<ArrowLeft className="h-4 w-4" />
							Go Back
						</Button>
					)}
				</CardFooter>
			</Card>
		</div>
	);
}
