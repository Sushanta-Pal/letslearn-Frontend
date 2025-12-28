import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Share2, Award, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import { supabase } from '../../supabaseClient'; // Ensure supabase import

const logoUrl = "https://cdn-icons-png.flaticon.com/512/993/993891.png"; 
const signatureUrl = "https://upload.wikimedia.org/wikipedia/commons/e/e4/John_Hancock_Signature.svg"; 

const CertificateModal = ({ certificate, user, onClose }) => {
  const certificateRef = useRef(null);
  const [repoLink, setRepoLink] = useState(null);

  // --- NEW: FETCH REPO LINK USING SUBMISSION ID ---
  useEffect(() => {
    const fetchSubmissionDetails = async () => {
        if (!certificate?.submission_id) return;
        
        const { data, error } = await supabase
            .from('internship_submissions')
            .select('repo_link')
            .eq('id', certificate.submission_id)
            .single();

        if (data && data.repo_link) {
            setRepoLink(data.repo_link);
        }
    };
    fetchSubmissionDetails();
  }, [certificate]);

  const handleDownload = useReactToPrint({
    contentRef: certificateRef,
    documentTitle: `${user?.user_metadata?.full_name || 'Certificate'}_Internship`,
    pageStyle: `
      @page { size: landscape; margin: 0; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .print-hidden { display: none !important; }
      }
    `,
  });

  const handleLinkedInShare = () => {
    const shareUrl = window.location.href; 
    const title = certificate?.title || 'Internship Program';
    const message = `I am proud to receive this Certificate of Completion for the ${title}! 🎓\n\nCheck it out here: ${shareUrl}`;
    const linkedInUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(message)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  if (!certificate) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-6xl bg-neutral-900 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
      >
        
        {/* Header Bar */}
        <div className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700 shrink-0 z-50 shadow-md">
          <div className="text-white flex items-center gap-3">
            <div className="bg-amber-500/20 p-2 rounded-lg">
              <Award className="text-amber-500" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Certificate Preview</h3>
              <p className="text-gray-400 text-xs">Ready for download</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => handleDownload()} className="flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-lg text-sm"><Download size={16} /> Download PDF</button>
            <button onClick={onClose} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white ml-2"><X size={20} /></button>
          </div>
        </div>

        {/* Certificate Content */}
        <div className="flex-1 overflow-auto bg-neutral-900 p-8 flex justify-center items-start">
          <div ref={certificateRef} className="relative w-[1123px] h-[794px] bg-white text-black shrink-0 shadow-2xl mx-auto overflow-hidden">
            
            {/* Background Layers */}
            <div className="absolute inset-0 opacity-40 mix-blend-multiply" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")` }}></div>
            <div className="absolute inset-0 opacity-[0.03]" style={{ background: `radial-gradient(circle at center, transparent 30%, #000 100%)`, backgroundSize: '8px 8px' }}></div>
            <div className="absolute inset-6 border-[8px] border-double border-[#1e3a8a]"></div>
            
            {/* Certificate Body */}
            <div className="relative h-full flex flex-col items-center justify-between py-12 px-20 z-10">
              
              {/* Top Header */}
              <div className="w-full flex justify-between items-start mt-4">
                 <img src={logoUrl} alt="Logo" className="h-20 w-auto object-contain mb-2" onError={(e) => e.target.style.display = 'none'} />
                 <div className="text-right mt-2">
                   <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Serial No.</p>
                   <p className="text-xs font-bold text-[#1e3a8a] font-mono">{certificate.id ? certificate.id.slice(0, 12).toUpperCase() : "8F-1E9F66"}</p>
                 </div>
              </div>

              {/* Title & Name */}
              <div className="text-center -mt-8">
                <h1 className="text-7xl font-serif font-black tracking-wide text-[#1e3a8a] mb-3">CERTIFICATE</h1>
                <h2 className="text-2xl font-serif italic text-[#d97706] tracking-[0.2em] font-light">OF COMPLETION</h2>
              </div>

              <div className="text-center w-full mb-4">
                <p className="text-gray-500 font-serif text-xl italic mb-6">This honor is proudly presented to</p>
                <h3 className="text-6xl font-[cursive] text-gray-900 py-2 px-8 capitalize leading-tight" style={{ fontFamily: "'Great Vibes', cursive" }}>{user?.user_metadata?.full_name || 'Student Name'}</h3>
                <div className="w-64 mx-auto h-[1px] bg-gray-300 mt-2"></div>
              </div>

              {/* Work Proof Link (NEW) */}
              {repoLink && (
                  <div className="text-center mt-2 mb-2 print-hidden">
                      <a href={repoLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 justify-center text-xs text-blue-600 font-bold hover:underline">
                          <ExternalLink size={10} /> Verified Project Work
                      </a>
                  </div>
              )}

              <div className="text-center max-w-4xl mx-auto space-y-3">
                <p className="text-gray-600 text-lg font-serif">For successfully completing the professional internship requirements in</p>
                <h4 className="text-3xl font-bold text-[#1e3a8a] font-serif py-1">{certificate.title || 'Software Engineering Program'}</h4>
              </div>

              {/* Footer */}
              <div className="w-full flex justify-between items-end px-12 mb-4">
                <div className="text-center w-64 pb-2">
                   <p className="font-serif text-xl text-gray-800 border-b-2 border-gray-300 pb-2 mb-2">{new Date(certificate.issued_at).toLocaleDateString()}</p>
                   <p className="text-xs text-[#d97706] font-bold uppercase tracking-wider">Date of Issue</p>
                </div>
                <div className="relative translate-y-4 z-20">
                   <div className="w-40 h-40 rounded-full bg-gradient-to-b from-[#fbbf24] to-[#b45309] shadow-2xl flex items-center justify-center">
                      <Award size={56} className="text-white" />
                   </div>
                </div>
                <div className="text-center w-64 pb-2">
                   <div className="h-16 flex items-end justify-center mb-2"><img src={signatureUrl} className="h-full w-auto object-contain filter contrast-125"/></div>
                   <div className="border-b-2 border-gray-300 pb-2 w-full"></div>
                   <p className="text-xs text-[#d97706] font-bold uppercase tracking-wider mt-2">Program Director</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CertificateModal;