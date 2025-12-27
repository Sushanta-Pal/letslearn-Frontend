import React, { useRef } from 'react';
import { X, Download, Share2, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';

// ============================================================================
// 🎨 USER ASSETS CONFIGURATION
// ============================================================================

// 1. To use your own, UNCOMMENT these lines and change path:
// import logoUrl from './assets/logo.png';
// import signatureUrl from './assets/signature.png';

// 2. FOR NOW (Demo Mode): Delete these two lines when you use real imports.
const logoUrl = "https://cdn-icons-png.flaticon.com/512/993/993891.png"; 
const signatureUrl = "https://upload.wikimedia.org/wikipedia/commons/e/e4/John_Hancock_Signature.svg"; 

// ============================================================================

const CertificateModal = ({ certificate, user, onClose }) => {
  const certificateRef = useRef(null);

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
    onAfterPrint: () => console.log("Printed successfully"),
  });

  const handleLinkedInShare = () => {
    // 1. Get the URL (Note: On localhost, LinkedIn won't show a preview card, but the link works)
    const shareUrl = window.location.href; 
    
    // 2. Build the text properly
    const title = certificate?.title || 'Internship Program';
    const message = `I am proud to receive this Certificate of Completion for the ${title}! 🎓\n\nCheck it out here: ${shareUrl}`;

    // 3. Use the 'feed' endpoint which supports custom text better than 'share-offsite'
    const linkedInUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(message)}`;

    // 4. Open the popup
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
        
        {/* --- HEADER BAR --- */}
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
            <button 
              onClick={() => handleDownload()}
              className="flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-amber-600/20 text-sm"
            >
              <Download size={16} /> Download PDF
            </button>
            <button 
              onClick={handleLinkedInShare}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-lg text-sm"
            >
              <Share2 size={16} /> Share
            </button>
            <button 
              onClick={onClose} 
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors ml-2"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* --- SCROLLABLE CONTENT AREA --- */}
        <div className="flex-1 overflow-auto bg-neutral-900 p-8 flex justify-center items-start">
          
          {/* CERTIFICATE WRAPPER */}
          <div 
            ref={certificateRef}
            className="relative w-[1123px] h-[794px] bg-white text-black shrink-0 shadow-2xl mx-auto overflow-hidden"
          >
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-40 mix-blend-multiply" 
                 style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")` }}>
            </div>

            {/* Guilloche Pattern */}
            <div className="absolute inset-0 opacity-[0.03]" 
                 style={{ 
                   background: `radial-gradient(circle at center, transparent 30%, #000 100%)`, 
                   backgroundSize: '8px 8px' 
                 }}>
            </div>

            {/* Borders */}
            <div className="absolute inset-4 border-[1px] border-gray-300"></div>
            <div className="absolute inset-6 border-[8px] border-double border-[#1e3a8a]"></div>
            <div className="absolute inset-[30px] border-[1px] border-[#d97706]"></div>
            
            {/* Corners */}
            <div className="absolute top-6 left-6 w-24 h-24 border-t-[8px] border-l-[8px] border-[#d97706] rounded-tl-sm"></div>
            <div className="absolute top-6 right-6 w-24 h-24 border-t-[8px] border-r-[8px] border-[#d97706] rounded-tr-sm"></div>
            <div className="absolute bottom-6 left-6 w-24 h-24 border-b-[8px] border-l-[8px] border-[#d97706] rounded-bl-sm"></div>
            <div className="absolute bottom-6 right-6 w-24 h-24 border-b-[8px] border-r-[8px] border-[#d97706] rounded-br-sm"></div>

            {/* CONTENT LAYER */}
            <div className="relative h-full flex flex-col items-center justify-between py-12 px-20 z-10">
              
              {/* 1. Header & ID */}
              <div className="w-full flex justify-between items-start mt-4">
                 <div className="flex flex-col items-center w-32">
                    <img 
                      src={logoUrl} 
                      alt="Logo" 
                      className="h-20 w-auto object-contain mb-2"
                      onError={(e) => e.target.style.display = 'none'} 
                    />
                 </div>
                 <div className="text-right mt-2">
                   <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Serial No.</p>
                   <p className="text-xs font-bold text-[#1e3a8a] font-mono">{certificate.id ? certificate.id.slice(0, 12).toUpperCase() : "8F-1E9F66"}</p>
                 </div>
              </div>

              {/* 2. Main Title */}
              <div className="text-center -mt-8">
                <h1 className="text-7xl font-serif font-black tracking-wide text-[#1e3a8a] mb-3 drop-shadow-sm">
                  CERTIFICATE
                </h1>
                <div className="flex items-center justify-center gap-4">
                  <div className="h-[2px] w-20 bg-[#d97706]"></div>
                  <h2 className="text-2xl font-serif italic text-[#d97706] tracking-[0.2em] font-light">OF COMPLETION</h2>
                  <div className="h-[2px] w-20 bg-[#d97706]"></div>
                </div>
              </div>

              {/* 3. Recipient Name */}
              <div className="text-center w-full mb-4">
                <p className="text-gray-500 font-serif text-xl italic mb-6">This honor is proudly presented to</p>
                <div className="relative inline-block px-12">
                  <h3 className="text-6xl font-[cursive] text-gray-900 relative z-10 py-2 px-8 capitalize leading-tight" 
                      style={{ fontFamily: "'Great Vibes', cursive" }}>
                    {user?.user_metadata?.full_name || 'Your Name'}
                  </h3>
                  <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#1e3a8a] to-transparent opacity-50 mt-2"></div>
                </div>
              </div>

              {/* 4. Description */}
              <div className="text-center max-w-4xl mx-auto space-y-3">
                <p className="text-gray-600 text-lg font-serif">
                  For successfully completing the professional internship requirements in
                </p>
                <h4 className="text-3xl font-bold text-[#1e3a8a] font-serif py-1">
                  {certificate.title || 'Software Engineering Program'}
                </h4>
                <p className="text-gray-500 text-sm italic max-w-2xl mx-auto">
                  Demonstrating outstanding technical proficiency, dedication, and professional excellence throughout the duration of the program.
                </p>
              </div>

              {/* 5. Footer Section */}
              <div className="w-full flex justify-between items-end px-12 mb-4">
                
                {/* Date */}
                <div className="text-center w-64 pb-2">
                   <p className="font-serif text-xl text-gray-800 border-b-2 border-gray-300 pb-2 mb-2">
                     {new Date(certificate.issued_at || Date.now()).toLocaleDateString('en-US', { 
                       year: 'numeric', month: 'long', day: 'numeric' 
                     })}
                   </p>
                   <p className="text-xs text-[#d97706] font-bold uppercase tracking-wider">Date of Issue</p>
                </div>

                {/* --- GOLD SEAL (Position Adjusted) --- */}
                {/* Changed from 'bottom-8' (up) to 'translate-y-4' (down) */}
                <div className="relative translate-y-4 z-20">
                   <div className="w-40 h-40 rounded-full bg-gradient-to-b from-[#fbbf24] to-[#b45309] shadow-2xl flex items-center justify-center p-1.5 transform hover:scale-105 transition-transform duration-500">
                      <div className="w-full h-full border-[3px] border-white/30 border-dashed rounded-full flex items-center justify-center bg-[#d97706] bg-opacity-10 backdrop-blur-sm">
                         <div className="text-center text-white drop-shadow-md">
                            <Award size={56} className="mx-auto mb-2" strokeWidth={1.5} />
                            <p className="text-[10px] font-bold tracking-[0.2em] uppercase">Official</p>
                            <p className="text-[10px] font-bold tracking-[0.2em] uppercase">Seal</p>
                         </div>
                      </div>
                   </div>
                   {/* Ribbon Tails */}
                   <div className="absolute top-32 left-1/2 -translate-x-1/2 -z-10 flex gap-1">
                      <div className="w-8 h-12 bg-[#b45309] clip-path-ribbon shadow-lg"></div>
                      <div className="w-8 h-12 bg-[#92400e] clip-path-ribbon shadow-lg"></div>
                   </div>
                </div>

                {/* Signature */}
                <div className="text-center w-64 pb-2">
                   <div className="h-16 flex items-end justify-center mb-2">
                     <img 
                       src={signatureUrl} 
                       alt="Signature" 
                       className="h-full w-auto object-contain filter contrast-125"
                       onError={(e) => e.target.style.display = 'none'}
                     />
                   </div>
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