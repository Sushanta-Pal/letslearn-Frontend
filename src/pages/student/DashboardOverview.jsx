import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { Link } from "react-router-dom";
import { 
  Zap, DollarSign, Shield, Briefcase, BookOpen, Code, Mic, 
  Award, ChevronRight, Loader2, AlertCircle 
} from "lucide-react";
import TeacherOverview from "../Teacher/TeacherOverview"; 
import CertificateModal from "./CertificateModal"; 

export default function DashboardOverview() {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("Student");
  const [role, setRole] = useState("student");
  const [stats, setStats] = useState({ xp: 0, coins: 0, rank: "Intern" });
  const [certificates, setCertificates] = useState([]);
  const [selectedCert, setSelectedCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [debugError, setDebugError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUser(user);
        
        // 1. GET USER NAME (Metadata)
        const metaName = user.user_metadata?.full_name || user.user_metadata?.name;
        const emailName = user.email?.split('@')[0];
        setFullName(metaName || emailName || "Student");

        // 2. CHECK ROLE
        const rawRole = user.app_metadata?.user_role || user.user_metadata?.user_role || 'student';
        const normalizedRole = String(rawRole).toLowerCase();
        setRole(normalizedRole);

        // 3. FETCH DATA (Student Only)
        if (normalizedRole === 'student') {
            
            const [internStatsRes, profileRes, certsRes] = await Promise.all([
                supabase.from('user_internship_stats').select('*').eq('user_id', user.id).maybeSingle(),
                supabase.from('profiles').select('total_coins').eq('id', user.id).maybeSingle(),
                supabase.from('certificates').select('*').eq('user_id', user.id).order('issued_at', { ascending: false }).limit(3)
            ]);

            const internStats = internStatsRes.data || { total_xp: 0, coins: 0, career_role: "Intern" };
            const profile = profileRes.data || { total_coins: 0 };
            const recentCerts = certsRes.data || [];

            // CALCULATION
            const totalCoins = (profile.total_coins || 0) + (internStats.coins || 0);

            setStats({
                xp: internStats.total_xp || 0,
                coins: totalCoins,
                rank: internStats.career_role || "Intern"
            });
            setCertificates(recentCerts);
        }
    } catch (error) {
        console.error("Dashboard Error:", error);
        setDebugError(error.message);
    } finally {
        setLoading(false);
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center text-[#FF4A1F]"><Loader2 className="animate-spin" size={40}/></div>;

  // --- SHOW TEACHER VIEW ---
  if (['teacher', 'creator'].includes(role)) {
      return <TeacherOverview />;
  }

  // --- SHOW STUDENT VIEW ---
  const nextRankXp = 1000; 
  const progressPercent = Math.min((stats.xp / nextRankXp) * 100, 100);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* 1. HEADER (Dynamic Name) */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white">Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4A1F] to-[#FF8C69]">{fullName}</span></h1>
           <p className="text-gray-400 mt-1">Here is what’s happening with your projects today.</p>
           {debugError && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle size={12}/> Error: {debugError}</p>}
        </div>
        <div className="flex gap-3">
            <Link to="/dashboard/internships" className="px-5 py-2 bg-[#FF4A1F] text-white rounded-lg font-bold hover:brightness-110 transition-all text-sm shadow-lg shadow-orange-900/20">
                Browse Internships
            </Link>
        </div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* XP Card */}
          <div className="bg-[#111] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-white/10 transition-all">
             <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                <Zap size={80} className="text-indigo-500"/>
             </div>
             <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Zap size={20} /></div>
                <span className="text-gray-400 font-medium uppercase tracking-wider text-xs">Experience</span>
             </div>
             <div className="text-4xl font-bold text-white mb-4 relative z-10">{stats.xp.toLocaleString()}</div>
             <div className="w-full bg-gray-800 rounded-full h-1.5 mb-2 relative z-10">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${progressPercent}%` }}></div>
             </div>
             <span className="text-xs text-gray-500 relative z-10">{nextRankXp - stats.xp} XP to Level Up</span>
          </div>

          {/* Balance Card */}
          <div className="bg-[#111] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-white/10 transition-all">
             <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                <DollarSign size={80} className="text-yellow-500"/>
             </div>
             <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400"><DollarSign size={20} /></div>
                <span className="text-gray-400 font-medium uppercase tracking-wider text-xs">Total Balance</span>
             </div>
             <div className="text-4xl font-bold text-white relative z-10">{stats.coins.toLocaleString()}</div>
             <p className="text-xs text-gray-500 mt-2 relative z-10">Combined Earnings (Practice + Jobs)</p>
          </div>

          {/* Rank Card */}
          <div className="bg-[#111] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-white/10 transition-all">
             <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                <Shield size={80} className="text-[#FF4A1F]"/>
             </div>
             <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="p-2 bg-[#FF4A1F]/10 rounded-lg text-[#FF4A1F]"><Shield size={20} /></div>
                <span className="text-gray-400 font-medium uppercase tracking-wider text-xs">Current Role</span>
             </div>
             <div className="text-3xl font-bold text-white relative z-10 capitalize">{stats.rank}</div>
             <p className="text-xs text-gray-500 mt-2 relative z-10">Promotions are automated.</p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 3. WORKSPACE HUB */}
          <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold text-white">Your Workspace</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DashboardLink to="/dashboard/internships" title="Virtual Internships" desc="Simulate real jobs." icon={Briefcase} color="text-orange-500" bg="bg-orange-500/10" />
                  <DashboardLink to="/dashboard/practice" title="Coding Arena" desc="DSA & Algorithmic challenges." icon={Code} color="text-green-500" bg="bg-green-500/10" />
                  <DashboardLink to="/dashboard/courses" title="My Courses" desc="Continue your learning path." icon={BookOpen} color="text-blue-500" bg="bg-blue-500/10" />
                  <DashboardLink to="/dashboard/interviews" title="Mock Interviews" desc="AI-powered voice interviews." icon={Mic} color="text-purple-500" bg="bg-purple-500/10" />
              </div>
          </div>

          {/* 4. CERTIFICATES SECTION */}
          <div className="lg:col-span-1">
              <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Certifications</h2>
                  <button className="text-xs text-gray-400 hover:text-white flex items-center gap-1">View All <ChevronRight size={12}/></button>
              </div>
              
              <div className="space-y-4">
                  {certificates.length === 0 ? (
                      <div className="bg-[#111] border border-dashed border-white/10 rounded-2xl p-8 text-center h-48 flex flex-col items-center justify-center">
                          <Award className="text-gray-600 mb-2 opacity-50" size={32}/>
                          <p className="text-gray-500 text-sm">No certificates earned yet.</p>
                      </div>
                  ) : (
                      certificates.map((cert) => (
                          <div 
                            key={cert.id} 
                            onClick={() => setSelectedCert(cert)}
                            className="bg-[#111] border border-white/5 p-4 rounded-2xl flex items-center gap-4 hover:border-emerald-500/30 cursor-pointer transition-all hover:bg-white/[0.02]"
                          >
                              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 border border-emerald-500/20">
                                  <Award size={20}/>
                              </div>
                              <div className="min-w-0">
                                  <h4 className="font-bold text-white text-sm truncate">{cert.title || "Certificate"}</h4>
                                  <p className="text-xs text-gray-500">Issued: {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : 'N/A'}</p>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
      </div>

      {selectedCert && (
        <CertificateModal 
          certificate={selectedCert} 
          user={user} 
          onClose={() => setSelectedCert(null)} 
        />
      )}

    </div>
  );
}

function DashboardLink({ to, title, desc, icon: Icon, color, bg }) {
    return (
        <Link to={to} className="group bg-[#111] border border-white/5 hover:border-white/20 p-5 rounded-3xl transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${bg} ${color}`}>
                    <Icon size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-white text-lg group-hover:text-[#FF4A1F] transition-colors">{title}</h3>
                    <p className="text-sm text-gray-500 mt-1 leading-snug">{desc}</p>
                </div>
            </div>
        </Link>
    )
}