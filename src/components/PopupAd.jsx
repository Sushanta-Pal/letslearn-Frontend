// src/components/PopupAd.jsx
import React, { useEffect, useState } from 'react';
import { useAds } from '../hooks/useAds';
import { X, ExternalLink, Tag } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';

export default function PopupAd() {
  const { ads, loading } = useAds();
  const [showPopup, setShowPopup] = useState(false);
  
  // NEW: Store all popup ads and track which one we are looking at
  const [popupAds, setPopupAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (loading || ads.length === 0) return;

    // Filter for active popup ads
    const activePopupAds = ads.filter(ad => ad.type === 'popup');
    if (activePopupAds.length === 0) return;

    // 🟢 NEW: Shuffle the ads randomly!
    // This mixes up the order so a different ad is always first
    const shuffledAds = activePopupAds.sort(() => Math.random() - 0.5);
    
    // Save the shuffled version to state
    setPopupAds(shuffledAds);

    // --- localStorage Logic ---
    const lastSeenDate = localStorage.getItem('placium_popup_last_seen');
    const today = new Date().toDateString();

   if (lastSeenDate !== today) { 
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 3000); 
      return () => clearTimeout(timer);
    }
  }, [ads, loading]);
  // NEW: Auto-play carousel logic
  useEffect(() => {
    if (!showPopup || popupAds.length <= 1) return;

    // Change ad every 4 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % popupAds.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [showPopup, popupAds.length]);

  const handleClose = () => {
    setShowPopup(false);
    localStorage.setItem('placium_popup_last_seen', new Date().toDateString());
  };

  const handleClick = () => {
    handleClose(); 
  };

  if (!showPopup || popupAds.length === 0) return null;

  const currentAd = popupAds[currentIndex];

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-[calc(100%-32px)] sm:w-[400px] md:w-[480px] bg-white rounded-[24px] shadow-2xl overflow-hidden group"
          >
            
            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 sm:p-2.5 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-all duration-200"
            >
              <X size={20} strokeWidth={2.5} />
            </button>

            {/* NEW: Carousel Progress Indicators (Dots) */}
            {popupAds.length > 1 && (
              <div className="absolute top-4 left-0 right-0 z-20 flex justify-center gap-1.5">
                {popupAds.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1 rounded-full transition-all duration-500 ${
                      idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}

            <a href={currentAd.targetUrl} target="_blank" rel="noopener noreferrer" onClick={handleClick} className="block cursor-pointer">
              
              {/* Image Hero Section with Crossfade Animation */}
              <div className="relative h-[240px] sm:h-[280px] md:h-[320px] w-full bg-gray-900">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={currentAd.id || currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    src={currentAd.imageUrl} 
                    alt={`Ad for ${currentAd.shopName}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>
                
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10" />

                <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-6 right-4 sm:right-6 text-white z-10">
                  <motion.h3 
                    key={`title-${currentIndex}`}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight drop-shadow-md"
                  >
                    {currentAd.shopName}
                  </motion.h3>
                  <p className="text-gray-200 text-xs sm:text-sm mt-1.5 flex items-center gap-1.5 font-medium">
                    <Tag size={14} className="text-blue-400" /> Exclusive deal for students
                  </p>
                </div>
              </div>

              {/* Call to Action Section */}
              <div className="p-4 sm:p-5 md:p-6 bg-white">
                <div className="flex items-center justify-center w-full py-3.5 sm:py-4 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-[14px] font-semibold text-[15px] sm:text-base shadow-md hover:shadow-lg transition-all duration-300 gap-2">
                  Claim Offer Now
                  <ExternalLink size={18} />
                </div>
                <p className="text-center text-[11px] sm:text-xs text-gray-400 mt-3 font-medium">
                  Clicking opens details in a new tab
                </p>
              </div>

            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}