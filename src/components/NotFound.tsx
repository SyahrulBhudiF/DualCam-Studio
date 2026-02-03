import { Link } from "@tanstack/react-router";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface NotFoundProps {
	children?: React.ReactNode;
	title?: string;
	description?: string;
}

export function NotFound({
	children,
	title = "Page Not Found",
	description = "The page you are looking for does not exist or has been moved.",
}: NotFoundProps) {
	return (
		<div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
						<FileQuestion className="h-8 w-8 text-muted-foreground" />
					</div>
					<CardTitle className="text-xl">{title}</CardTitle>
					<CardDescription className="text-balance">
						{children || description}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="rounded-lg bg-muted/50 p-4 text-center">
						<p className="text-6xl font-bold text-muted-foreground/50">404</p>
					</div>
				</CardContent>
				<CardFooter className="flex justify-center gap-2">
					<Button
						variant="outline"
						onClick={() => window.history.back()}
						className="gap-2"
					>
						<ArrowLeft className="h-4 w-4" />
						Go Back
					</Button>
					<Button asChild className="gap-2">
						<Link to="/">
							<Home className="h-4 w-4" />
							Home
						</Link>
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
