import React, { useRef } from 'react';
import { X, Download, Award, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';

const CertificateModal = ({ certificate, user, onClose }) => {
  // 1. Initialize ref with null
  const certificateRef = useRef(null);

  // 2. FIXED: Use 'contentRef' instead of 'content'
  const handleDownload = useReactToPrint({
    contentRef: certificateRef, 
    documentTitle: `${user?.user_metadata?.full_name || 'Certificate'}_Internship`,
    onAfterPrint: () => console.log("Printed successfully"), // Optional callback
  });

  if (!certificate) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-4xl bg-white text-black rounded-lg shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Toolbar */}
        <div className="flex justify-between items-center p-4 bg-gray-100 border-b shrink-0">
          <h3 className="font-bold text-gray-700">Certificate Preview</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => handleDownload()} // Ensure function is called
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium transition-colors"
            >
              <Download size={16} /> Download PDF
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas */}
        <div className="overflow-auto bg-gray-500/10 p-8 flex justify-center">
          <div 
            ref={certificateRef} // 3. Ensure this Ref is attached to the printable div
            className="w-[800px] h-[600px] bg-white border-[10px] border-double border-indigo-900 p-10 relative shadow-xl text-center flex flex-col items-center justify-center shrink-0 print:m-0 print:shadow-none print:border-none"
            style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')" }}
          >
            {/* Corner Decorations */}
            <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-yellow-600"></div>
            <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-yellow-600"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-yellow-600"></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-yellow-600"></div>

            {/* Content */}
            <Award size={64} className="text-yellow-600 mb-4" />
            
            <h1 className="text-5xl font-serif font-bold text-indigo-900 mb-2 uppercase tracking-wider">Certificate</h1>
            <h2 className="text-xl text-gray-500 font-serif mb-8 italic">of Completion</h2>

            <p className="text-lg text-gray-600 mb-2">This is to certify that</p>
            <h3 className="text-4xl font-bold text-gray-900 border-b-2 border-gray-300 pb-2 px-10 mb-6 font-serif uppercase">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </h3>

            <p className="text-lg text-gray-600 mb-4">Has successfully completed the internship program:</p>
            <h4 className="text-2xl font-bold text-indigo-800 mb-8">{certificate.title || "Software Engineering Internship"}</h4>

            <div className="flex justify-between w-full px-16 mt-12 items-end">
              <div className="text-center">
                <div className="border-t border-gray-400 w-48 mx-auto pt-2">
                  <p className="font-bold text-indigo-900 text-lg">Program Director</p>
                </div>
              </div>

              <div className="text-center">
                 <ShieldCheck size={40} className="mx-auto text-indigo-900/50 mb-2" />
                 <p className="text-[10px] text-gray-400">ID: {certificate.id.slice(0, 8)}</p>
                 <p className="text-[10px] text-gray-400">Date: {new Date(certificate.issued_at).toLocaleDateString()}</p>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CertificateModal;