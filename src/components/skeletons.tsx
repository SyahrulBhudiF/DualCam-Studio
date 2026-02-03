import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/utils/utils";

// Card Skeleton - for dashboard cards, stats cards, etc.
export function CardSkeleton({ className }: { className?: string }) {
	return (
		<Card className={cn("", className)}>
			<CardHeader className="gap-2">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-8 w-32" />
			</CardHeader>
			<CardContent>
				<Skeleton className="h-4 w-full" />
			</CardContent>
		</Card>
	);
}

// Stats Card Skeleton - for overview statistics
export function StatsCardSkeleton() {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-4 w-4 rounded" />
			</CardHeader>
			<CardContent>
				<Skeleton className="h-8 w-20 mb-1" />
				<Skeleton className="h-3 w-32" />
			</CardContent>
		</Card>
	);
}

// Table Skeleton - for data tables
export function TableSkeleton({
	rows = 5,
	columns = 4,
}: {
	rows?: number;
	columns?: number;
}) {
	return (
		<div className="w-full space-y-3">
			{/* Header */}
			<div className="flex gap-4 px-4">
				{Array.from({ length: columns }).map((_, i) => (
					<Skeleton key={i} className="h-4 flex-1" />
				))}
			</div>
			{/* Rows */}
			{Array.from({ length: rows }).map((_, rowIndex) => (
				<div key={rowIndex} className="flex gap-4 px-4 py-3 border-b">
					{Array.from({ length: columns }).map((_, colIndex) => (
						<Skeleton
							key={colIndex}
							className={cn("h-4 flex-1", colIndex === 0 && "max-w-[200px]")}
						/>
					))}
				</div>
			))}
		</div>
	);
}

// Form Skeleton - for forms with labels and inputs
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
	return (
		<div className="space-y-6">
			{Array.from({ length: fields }).map((_, i) => (
				<div key={i} className="space-y-2">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-10 w-full" />
				</div>
			))}
			<Skeleton className="h-10 w-32" />
		</div>
	);
}

// List Skeleton - for simple lists
export function ListSkeleton({ items = 5 }: { items?: number }) {
	return (
		<div className="space-y-3">
			{Array.from({ length: items }).map((_, i) => (
				<div key={i} className="flex items-center gap-3">
					<Skeleton className="h-10 w-10 rounded-full" />
					<div className="flex-1 space-y-2">
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-3 w-1/2" />
					</div>
				</div>
			))}
		</div>
	);
}

// Chart Skeleton - for chart components
export function ChartSkeleton({ className }: { className?: string }) {
	return (
		<Card className={cn("", className)}>
			<CardHeader>
				<Skeleton className="h-5 w-32" />
				<Skeleton className="h-4 w-48" />
			</CardHeader>
			<CardContent>
				<Skeleton className="h-[300px] w-full" />
			</CardContent>
		</Card>
	);
}

// Dashboard Overview Skeleton
export function DashboardOverviewSkeleton() {
	return (
		<div className="space-y-4">
			{/* Stats Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<StatsCardSkeleton key={i} />
				))}
			</div>
			{/* Charts */}
			<div className="grid gap-4 md:grid-cols-2">
				<ChartSkeleton />
				<ChartSkeleton />
			</div>
		</div>
	);
}

// Page Header Skeleton
export function PageHeaderSkeleton() {
	return (
		<div className="mb-6 flex items-center justify-between">
			<div className="space-y-1">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-4 w-64" />
			</div>
			<Skeleton className="h-10 w-32" />
		</div>
	);
}

// Detail Page Skeleton
export function DetailPageSkeleton() {
	return (
		<div className="space-y-6">
			<PageHeaderSkeleton />
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-40" />
				</CardHeader>
				<CardContent className="space-y-4">
					{Array.from({ length: 5 }).map((_, i) => (
						<div key={i} className="flex justify-between">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-48" />
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}

// Questionnaire List Skeleton
export function QuestionnaireListSkeleton() {
	return (
		<div className="space-y-4">
			<div className="flex justify-between">
				<Skeleton className="h-10 w-64" />
				<Skeleton className="h-10 w-32" />
			</div>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 6 }).map((_, i) => (
					<Card key={i}>
						<CardHeader>
							<Skeleton className="h-5 w-3/4" />
							<Skeleton className="h-4 w-1/2" />
						</CardHeader>
						<CardContent className="space-y-2">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-2/3" />
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

// Response List Skeleton
export function ResponseListSkeleton() {
	return (
		<div className="space-y-4">
			{/* Filters */}
			<div className="flex flex-wrap gap-2">
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={i} className="h-10 w-32" />
				))}
			</div>
			{/* Table */}
			<TableSkeleton rows={10} columns={6} />
		</div>
	);
}

// Profile Card Skeleton
export function ProfileCardSkeleton() {
	return (
		<Card>
			<CardContent className="pt-6">
				<div className="flex items-center gap-4">
					<Skeleton className="h-16 w-16 rounded-full" />
					<div className="flex-1 space-y-2">
						<Skeleton className="h-5 w-40" />
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-4 w-48" />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
