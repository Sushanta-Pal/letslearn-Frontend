import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Database, Cpu, Code, Globe, Layers, BrainCircuit, Loader2 } from 'lucide-react';

const iconMap = {
  dsa: Code,
  os: Cpu,
  dbms: Database,
  cn: Globe,
  oops: Layers,
  aiml: BrainCircuit
};

export default function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase.from('courses').select('*').order('title');
      if (error) throw error;
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#FF4A1F]" size={40} /></div>;

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-800 pb-6">
        <h1 className="text-3xl font-bold text-white">Learning Paths</h1>
        <p className="text-gray-400 mt-2">Select a domain to start mastering concepts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const Icon = iconMap[course.slug] || Code;
          return (
            <div 
              key={course.id}
              onClick={() => navigate(`/student/course/${course.id}`)}
              className="group bg-[#111] border border-gray-800 hover:border-[#FF4A1F] rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-[#FF4A1F]/10 rounded-xl flex items-center justify-center text-[#FF4A1F] mb-4 group-hover:scale-110 transition-transform">
                <Icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
              <p className="text-gray-400 text-sm line-clamp-2">{course.description}</p>
              
              <div className="mt-6 flex items-center gap-2 text-sm font-bold text-gray-500 group-hover:text-white transition-colors">
                <span>Start Learning</span>
                <span className="text-[#FF4A1F]">→</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}