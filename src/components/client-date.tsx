import { format } from"date-fns";
import { useEffect, useState } from"react";

type ClientDateProps = {
	date: string | number | Date;
	formatString: string;
};

export function ClientDate({ date, formatString }: ClientDateProps) {
	const [formatted, setFormatted] = useState<string | null>(null);

	useEffect(() => {
		setFormatted(format(new Date(date), formatString));
	}, [date, formatString]);

	return <span suppressHydrationWarning>{formatted ??""}</span>;
}
