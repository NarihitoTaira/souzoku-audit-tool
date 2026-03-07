import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentDiagnoses } from "@/components/dashboard/recent-audits";
import { RiskOverview } from "@/components/dashboard/risk-overview";
import { QuickActions } from "@/components/dashboard/quick-actions";

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-in">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold gradient-text">ダッシュボード</h1>
        <p className="text-sm text-muted-foreground mt-1">
          補助金採択可能性の診断状況を一覧で確認できます
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentDiagnoses />
        </div>
        <div className="space-y-6">
          <RiskOverview />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
