import { useLocation, useNavigate } from "@tanstack/react-router";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface SignOutDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
	const navigate = useNavigate();
	const location = useLocation();

	const handleSignOut = () => {
		const currentPath = location.href;
		navigate({
			to: "/logout",
			search: { redirect: currentPath },
			replace: true,
		});
	};

	return (
		<ConfirmDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Sign out"
			desc="Are you sure you want to sign out? You will need to sign in again to access your account."
			confirmText="Sign out"
			destructive
			handleConfirm={handleSignOut}
			className="sm:max-w-sm"
		/>
	);
}
