interface IPhoneExecutiveSummaryProps {
  dashboardTasks: any[];
  todayEvents: any[];
  urgentTasks: any[];
}

export const IPhoneExecutiveSummary = ({
  dashboardTasks,
  todayEvents,
  urgentTasks
}: IPhoneExecutiveSummaryProps) => {
  return (
    <div className="bg-card rounded-3xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-organic)] transition-all duration-300 p-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-accent hover:bg-accent/80 transition-all duration-200">
          <div className="text-4xl font-bold text-warning mb-2">
            {dashboardTasks.length}
          </div>
          <div className="text-base text-muted-foreground">Tasques pendents</div>
        </div>
        <div className="p-6 rounded-2xl bg-accent hover:bg-accent/80 transition-all duration-200">
          <div className="text-4xl font-bold text-destructive mb-2">
            {urgentTasks.length}
          </div>
          <div className="text-base text-muted-foreground">Tasques urgents</div>
        </div>
      </div>
    </div>
  );
};