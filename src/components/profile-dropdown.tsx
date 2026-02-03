import { SignOutDialog } from "@/components/sign-out-dialog";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useDialogState from "@/libs/hooks/use-dialog-state";

export function ProfileDropdown() {
	const [open, setOpen] = useDialogState();

	return (
		<>
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="relative h-8 w-8 rounded-full">
						a
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56" align="end" forceMount>
					<DropdownMenuLabel className="font-normal">
						<div className="flex flex-col gap-1.5">
							<p className="text-sm leading-none font-medium">User</p>
							<p className="text-muted-foreground text-xs leading-none">
								user@example.com
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
