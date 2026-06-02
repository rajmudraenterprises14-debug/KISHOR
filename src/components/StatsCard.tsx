import { motion } from 'motion/react';
import { Briefcase, Clock, FileSpreadsheet, Hourglass } from 'lucide-react';
import { WorkLog } from '../types';

interface StatsProps {
  logs: WorkLog[];
}

export function StatsCard({ logs }: StatsProps) {
  const totalEntries = logs.length;
  const totalHours = logs.reduce((sum, log) => sum + Number(log.hours || 0), 0);
  const totalAmount = logs.reduce((sum, log) => sum + (log.totalAmount || 0), 0);
  
  const unbilledAmount = logs
    .filter((log) => log.status === 'Unbilled')
    .reduce((sum, log) => sum + (log.totalAmount || 0), 0);

  const billedAmount = logs
    .filter((log) => log.status === 'Billed')
    .reduce((sum, log) => sum + (log.totalAmount || 0), 0);

  const stats = [
    {
      title: 'Total Work Logs',
      value: totalEntries,
      subtitle: 'Recorded Tasks',
      icon: Briefcase,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      iconBg: 'bg-emerald-100',
    },
    {
      title: 'एकूण किंमत (Total Logged Value)',
      value: `₹${totalAmount.toLocaleString('en-IN')}`,
      subtitle: 'सर्व कामांची एकूण बेरीज',
      icon: Clock,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      iconBg: 'bg-indigo-100',
    },
    {
      title: 'Billed Amount',
      value: `₹${billedAmount.toLocaleString('en-IN')}`,
      subtitle: 'Invoiced Tasks',
      icon: FileSpreadsheet,
      color: 'bg-blue-50 text-blue-700 border-blue-100',
      iconBg: 'bg-blue-100',
    },
    {
      title: 'Unbilled Outstanding',
      value: `₹${unbilledAmount.toLocaleString('en-IN')}`,
      subtitle: 'Ready to Bill',
      icon: Hourglass,
      color: 'bg-amber-50 text-amber-700 border-amber-100',
      iconBg: 'bg-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className={`p-5 rounded-2xl border ${stat.color} shadow-sm flex items-center justify-between transition-all hover:shadow-md`}
          >
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold opacity-80">{stat.title}</span>
              <h3 className="text-2xl font-bold tracking-tight mt-1 font-sans">{stat.value}</h3>
              <p className="text-xs mt-1 opacity-70 font-mono">{stat.subtitle}</p>
            </div>
            <div className={`p-3 rounded-xl ${stat.iconBg} flex items-center justify-center border border-white/20`}>
              <Icon className="w-5 h-5 opacity-90" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
