// src/pages/Teacher/TeacherOverview.jsx
import React from "react";
import { 
  Users, BookOpen, DollarSign, Activity, 
  PlusCircle, FileText, Briefcase, ArrowRight 
} from "lucide-react";
import { Link } from "react-router-dom";

export default function TeacherOverview() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-bold text-white">Instructor Dashboard</h1>
           <p className="text-gray-400">Manage your content and students.</p>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} title="Total Students" value="1,240" trend="+12%" color="orange" />
        <StatCard icon={BookOpen} title="Active Courses" value="8" trend="Active" color="blue" />
        <StatCard icon={DollarSign} title="Total Revenue" value="$12,450" trend="+8.5%" color="green" />
        <StatCard icon={Activity} title="Completion Rate" value="85%" trend="+2.4%" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions Panel */}
        <div className="lg:col-span-1 bg-[#111] border border-white/5 rounded-3xl p-8 h-full">
          <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
          <div className="space-y-4">
            <QuickActionButton to="/dashboard/teacher/create-internship" icon={Briefcase} label="Post Internship" color="text-orange-500" bg="bg-orange-500/10" />
            <QuickActionButton to="/dashboard/teacher/add-question" icon={PlusCircle} label="Add Coding Question" color="text-blue-500" bg="bg-blue-500/10" />
            <QuickActionButton to="/dashboard/teacher/manage-courses" icon={BookOpen} label="Manage Courses" color="text-purple-500" bg="bg-purple-500/10" />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-[#111] border border-white/5 rounded-3xl overflow-hidden p-8">
          <h3 className="text-xl font-bold text-white mb-6">Student Activity Log</h3>
          <div className="space-y-4">
               {[
                 { student: "Alex Doe", action: "Submitted", target: "React Basics Assignment", time: "2 mins ago" },
                 { student: "Sarah Smith", action: "Enrolled", target: "Advanced Node.js", time: "1 hour ago" },
                 { student: "John Brown", action: "Completed", target: "Python Internship Task 1", time: "3 hours ago" },
               ].map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                      <div>
                          <p className="text-sm text-white font-medium"><span className="text-gray-400">{activity.student}</span> {activity.action.toLowerCase()}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.target}</p>
                      </div>
                      <span className="text-xs text-gray-600 font-mono">{activity.time}</span>
                  </div>
               ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, trend, color="orange" }) {
  const colorStyles = {
    orange: { text: "text-[#FF4A1F]", bg: "bg-[#FF4A1F]/10" },
    green: { text: "text-emerald-500", bg: "bg-emerald-500/10" },
    blue: { text: "text-blue-500", bg: "bg-blue-500/10" },
    purple: { text: "text-purple-500", bg: "bg-purple-500/10" },
  };
  const style = colorStyles[color] || colorStyles.orange;

  return (
    <div className="bg-[#111] p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${style.bg} ${style.text}`}>
          <Icon size={24} />
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded bg-white/5 ${trend.includes('+') ? 'text-green-500' : 'text-gray-500'}`}>
           {trend}
        </span>
      </div>
      <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</p>
      <h4 className="text-3xl font-bold mt-1 text-white">{value}</h4>
    </div>
  );
}

function QuickActionButton({ to, icon: Icon, label, color, bg }) {
    return (
        <Link to={to} className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#1A1A1A] hover:bg-[#222] border border-white/5 hover:border-white/10 transition-all group">
            <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${bg} ${color}`}>
                    <Icon size={20} />
                </div>
                <span className="font-bold text-gray-200">{label}</span>
            </div>
            <ArrowRight size={18} className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
    );
}