// src/hooks/useAds.js
import { useState, useEffect } from 'react';

export function useAds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with your Google Apps Script Web App URL
    const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbw9Tol7BuQBxlK-CfCr6fkxQU7Bny3XCTlI67drp5yRpydKiQ2To9hmvU-Gxj1ZI7xzXw/exec";

    fetch(SHEET_API_URL)
      .then((res) => res.json())
      .then((data) => {
        setAds(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load ads:", err);
        setLoading(false);
      });
  }, []);

  return { ads, loading };
}