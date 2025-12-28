import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Award, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import { supabase } from '../../supabaseClient';
import signatureUrl from '../../assets/sushanta-sign.png'; // Ensure this path is correct
import logoUrl from '../../assets/logourl.png'; // Ensure this path is correct

const CertificateModal = ({ certificate, user, onClose }) => {
  const certificateRef = useRef(null);
  const [repoLink, setRepoLink] = useState(null);

  // --- FETCH REPO LINK ---
  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      if (!certificate?.submission_id) return;
      
      const { data } = await supabase
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

  if (!certificate) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
      {/* Inject Fonts and Custom Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        
        .font-cinzel { font-family: 'Cinzel', serif; }
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-vibes { font-family: 'Great Vibes', cursive; }
        
        .gold-gradient-text {
          background: linear-gradient(to bottom, #ca8a04, #eab308, #a16207);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .certificate-border {
          background-image: 
            linear-gradient(90deg, #1e3a8a 50%, transparent 50%),
            linear-gradient(90deg, #1e3a8a 50%, transparent 50%),
            linear-gradient(0deg, #1e3a8a 50%, transparent 50%),
            linear-gradient(0deg, #1e3a8a 50%, transparent 50%);
          background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
          background-size: 15px 4px, 15px 4px, 4px 15px, 4px 15px;
          background-position: 0px 0px, 200px 100%, 0px 100%, 100% 0px;
          animation: border-dance 4s infinite linear;
        }
      `}</style>

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
            <button onClick={() => handleDownload()} className="flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-lg text-sm transition-all">
              <Download size={16} /> Download PDF
            </button>
            <button onClick={onClose} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white ml-2 transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Certificate Content Area */}
        <div className="flex-1 overflow-auto bg-neutral-900 p-8 flex justify-center items-center">
          
          {/* THE CERTIFICATE */}
          <div ref={certificateRef} className="relative w-[1123px] h-[794px] bg-[#fffbf0] text-black shrink-0 shadow-2xl mx-auto overflow-hidden">
            
            {/* 1. Background Texture */}
            <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")` }}></div>
            
            {/* 2. Ornamental Border Container */}
            <div className="absolute inset-4 border-[3px] border-[#1e3a8a] pointer-events-none z-10">
              <div className="absolute inset-1 border border-[#ca8a04]"></div>
              {/* Corner Ornaments */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-[8px] border-l-[8px] border-[#1e3a8a]"></div>
              <div className="absolute top-0 right-0 w-16 h-16 border-t-[8px] border-r-[8px] border-[#1e3a8a]"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-[8px] border-l-[8px] border-[#1e3a8a]"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-[8px] border-r-[8px] border-[#1e3a8a]"></div>
            </div>

            {/* 3. Certificate Content */}
            <div className="relative h-full flex flex-col items-center justify-between py-16 px-24 z-20">
              
              {/* Top Section */}
              <div className="w-full flex justify-between items-start">
                  <img src={logoUrl} alt="Logo" className="h-20 w-auto object-contain opacity-90" onError={(e) => e.target.style.display = 'none'} />
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-cinzel tracking-[0.2em] uppercase">Certificate ID</p>
                    <p className="text-sm font-bold text-[#1e3a8a] font-mono">{certificate.id ? certificate.id.slice(0, 12).toUpperCase() : "8F-1E9F66"}</p>
                  </div>
              </div>

              {/* Title Section */}
              <div className="text-center -mt-6">
                <h1 className="text-6xl font-cinzel font-black tracking-wider text-[#1e3a8a] mb-2 uppercase drop-shadow-sm">
                  Certificate
                </h1>
                <div className="flex items-center justify-center gap-4">
                  <div className="h-[2px] w-12 bg-[#ca8a04]"></div>
                  <h2 className="text-2xl font-cinzel text-[#ca8a04] tracking-[0.3em] font-bold uppercase">Of Completion</h2>
                  <div className="h-[2px] w-12 bg-[#ca8a04]"></div>
                </div>
              </div>

              {/* Recipient Section */}
              <div className="text-center w-full">
                <p className="text-gray-600 font-playfair text-xl italic mb-4">This is to certify that</p>
                
                {/* Name */}
                <div className="relative inline-block px-12 pb-4">
                  <h3 className="text-7xl font-vibes text-gray-900 py-2 capitalize z-10 relative drop-shadow-md">
                    {user?.user_metadata?.full_name || 'Obito Uchiha'}
                  </h3>
                  {/* Decorative underline for name */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#1e3a8a] to-transparent opacity-50"></div>
                </div>
              </div>

              {/* Course Info */}
              <div className="text-center max-w-4xl mx-auto space-y-4">
                <p className="text-gray-600 text-lg font-playfair italic">
                  Has successfully completed all the requirements for the
                </p>
                <h4 className="text-4xl font-bold font-playfair text-[#1e3a8a] py-2 gold-gradient-text">
                  {certificate.title || 'Frontend Developer Internship'}
                </h4>
                
                {/* Proof Link */}
                {repoLink && (
                  <div className="text-center mt-2 print-hidden">
                    <a href={repoLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-200">
                       <ExternalLink size={10} /> Verified Project Work
                    </a>
                  </div>
                )}
              </div>

              {/* Footer Section (Date & Signature) */}
              <div className="w-full flex justify-between items-end mt-8 relative">
                
                {/* Date */}
                <div className="text-center w-64">
                   <p className="font-playfair text-xl text-gray-800 mb-2">
                     {new Date(certificate.issued_at).toLocaleDateString()}
                   </p>
                   <div className="h-[2px] bg-gray-300 w-full mb-2"></div>
                   <p className="text-xs text-[#ca8a04] font-cinzel font-bold uppercase tracking-widest">Date of Issue</p>
                </div>

                {/* Central Gold Seal Badge */}
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 translate-y-4">
                   <div className="relative">
                      {/* Ribbons */}
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-20 bg-[#1e3a8a] -z-10 transform -rotate-12 origin-top"></div>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-20 bg-[#1e3a8a] -z-10 transform rotate-12 origin-top"></div>
                      
                      {/* Seal Body */}
                      <div className="w-36 h-36 rounded-full bg-gradient-to-br from-[#fcd34d] via-[#b45309] to-[#78350f] shadow-xl flex items-center justify-center p-1">
                        <div className="w-full h-full rounded-full border-[2px] border-[#fff] border-dashed flex items-center justify-center bg-[#ca8a04]">
                           <Award size={48} className="text-white drop-shadow-md" />
                        </div>
                      </div>
                   </div>
                </div>

                {/* Signature - PLACEMENT FIXED */}
                <div className="text-center w-64 flex flex-col items-center justify-end">
                   {/* Signature Image: Negative margin pulls it down onto the line */}
                   <div className="h-20 w-full flex items-end justify-center overflow-visible mb-[-10px] z-10">
                      <img 
                        src={signatureUrl} 
                        alt="Signature"
                        className="h-full w-auto object-contain mix-blend-multiply filter contrast-125 pointer-events-none" 
                      />
                   </div>
                   
                   {/* The Line */}
                   <div className="h-[2px] bg-gray-300 w-full mb-2 relative z-0"></div>
                   
                   {/* Title */}
                   <p className="text-xs text-[#ca8a04] font-cinzel font-bold uppercase tracking-widest">Program Director</p>
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