import { useRouteContext } from "@tanstack/react-router";
import { SignOutDialog } from "@/components/SignOutDialog";
import { Button } from "@/components/ui/Button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/Tooltip";
import useDialogState from "@/libs/hooks/use-dialog-state";

export function ProfileDropdown() {
	const [open, setOpen] = useDialogState();
	const { user } = useRouteContext({ from: "__root__" });
	const email = user?.email || "user@example.com";
	const name = email.split("@")[0] || "User";
	const initials = name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("") || "U";

	return (
		<>
			<DropdownMenu modal={false}>
				<Tooltip>
					<TooltipTrigger asChild>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="relative size-8 rounded-full p-0"
							>
								<span className="bg-primary text-primary-foreground flex aspect-square size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold leading-none">
									{initials}
								</span>
							</Button>
						</DropdownMenuTrigger>
					</TooltipTrigger>
					<TooltipContent>Open user menu</TooltipContent>
				</Tooltip>
				<DropdownMenuContent className="w-56" align="end" forceMount>
					<DropdownMenuLabel className="font-normal">
						<div className="flex flex-col gap-1.5">
							<p className="text-sm leading-none font-medium">{name}</p>
							<p className="text-muted-foreground text-xs leading-none">
								{email}
							</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem variant="destructive" onClick={() => setOpen(true)}>
						Sign out
						<DropdownMenuShortcut className="text-current">
							⇧⌘Q
						</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<SignOutDialog open={!!open} onOpenChange={setOpen} />
		</>
	);
}
