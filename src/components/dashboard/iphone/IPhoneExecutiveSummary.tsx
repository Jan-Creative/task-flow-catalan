import { CheckCircle, AlertTriangle, Calendar } from "lucide-react";

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
  console.log('IPhoneExecutiveSummary rendering:', {
    dashboardTasks: dashboardTasks?.length,
    todayEvents: todayEvents?.length,
    urgentTasks: urgentTasks?.length
  });
  
  return (
    <div className="bg-card rounded-3xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-organic)] transition-all duration-300 p-4">
      <div className="flex items-center justify-between gap-3">
        {/* Pending Tasks */}
        <div className="flex-1 flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border border-emerald-500/20 hover:from-emerald-500/15 hover:to-teal-600/15 transition-all duration-200">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/20">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">
              {dashboardTasks.length}
            </div>
            <div className="text-xs text-muted-foreground">Pendents</div>
          </div>
        </div>

        {/* Urgent Tasks */}
        <div className="flex-1 flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-600/10 border border-red-500/20 hover:from-red-500/15 hover:to-orange-600/15 transition-all duration-200">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-red-500/20 to-orange-600/20">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">
              {urgentTasks.length}
            </div>
            <div className="text-xs text-muted-foreground">Urgents</div>
          </div>
        </div>

        {/* Today Events */}
        <div className="flex-1 flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-500/20 hover:from-blue-500/15 hover:to-purple-600/15 transition-all duration-200">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20">
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">
              {todayEvents.length}
            </div>
            <div className="text-xs text-muted-foreground">Avui</div>
          </div>
        </div>
      </div>
    </div>
  );
};