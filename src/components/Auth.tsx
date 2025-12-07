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
		<div className="fixed inset-0 bg-white dark:bg-black flex items-center justify-center p-8">
			<div className="bg-black dark:bg-white p-8 rounded-lg shadow-md shadow-black dark:shadow-gray-500 items-center w-full h-fit sm:max-w-full md:max-w-1/2 lg:max-w-1/3">
				<h1 className="text-2xl font-bold mb-4 text-white dark:text-black text-center">
					{actionText}
				</h1>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						onSubmit(e);
					}}
					className="space-y-4"
				>
					<div>
						<label
							htmlFor="email"
							className="block text-md text-white dark:text-black py-1"
						>
							Email
						</label>
						<input
							type="email"
							name="email"
							id="email"
							placeholder="example@gmail.com"
							className="px-2 py-2 w-full rounded-sm border border-gray-500/20 bg-gray-950 dark:bg-white text-white dark:text-black text-sm"
						/>
					</div>
					<div>
						<label
							htmlFor="password"
							className="block text-md text-white dark:text-black py-1"
						>
							Password
						</label>
						<input
							type="password"
							name="password"
							id="password"
							placeholder="password123"
							className="px-2 py-2 w-full rounded-sm border border-gray-500/20 bg-gray-950 dark:bg-white text-white dark:text-black text-sm"
						/>
					</div>
					<button
						type="submit"
						className="w-full bg-white dark:bg-black text-black dark:text-white rounded-sm py-2 font-bold uppercase"
						disabled={status === "pending"}
					>
						{status === "pending" ? "..." : actionText}
					</button>
					{afterSubmit ? afterSubmit : null}
				</form>
			</div>
		</div>
	);
}
