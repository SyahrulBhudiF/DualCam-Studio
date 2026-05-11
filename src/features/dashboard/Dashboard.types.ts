export type DashboardSummary = {
	totalQuestionnaires: number;
	activeQuestionnaires: number;
	totalResponses: number;
	averageScore: number;
	totalClasses: number;
};

export type DashboardBreakdown = {
	questionnaires: {
		id: string;
		title: string;
		totalResponses: number;
		averageScore: number;
	}[];
	classes: {
		className: string;
		totalResponses: number;
		averageScore: number;
	}[];
};

export type DashboardAnalytics = {
	questions: {
		id: string;
		text: string;
		order: number | null;
		averageScore: number;
	}[];
	answers: {
		id: string;
		text: string;
		questionId: string | null;
		totalResponses: number;
		averageScore: number;
	}[];
	timeline: {
		date: string;
		totalResponses: number;
		averageScore: number;
	}[];
	video: {
		withVideo: number;
		total: number;
	};
};

export type DashboardRecentResponse = {
	id: string;
	totalScore: number;
	videoPath: string | null;
	createdAt: string;
	questionnaireId: string;
	questionnaireTitle: string | null;
	profile: {
		id: string;
		name: string | null;
		class: string | null;
		email: string | null;
		nim: string | null;
		semester: string | null;
		gender: string | null;
		age: number | null;
	} | null;
};

export type DashboardData = {
	summary: DashboardSummary;
	breakdown: DashboardBreakdown;
	analytics: DashboardAnalytics;
	recentResponses: DashboardRecentResponse[];
};
