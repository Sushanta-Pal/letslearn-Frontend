import { Link } from "react-router-dom";
import { BookOpen, Clock, Star } from "lucide-react";

export default function CourseCard({ course }) {
  const {
    id,
    slug,
    title,
    description,
    level,
    duration,
    rating,
    imageUrl,
    isTrending,
  } = course;

  return (
    <Link
      to={`/course/${slug}`}
      className="group block bg-[#0B0B0B] border border-gray-800 rounded-2xl overflow-hidden 
      transition-all duration-300 hover:shadow-[0_0_25px_-6px_#ff4a1f] hover:-translate-y-2"
    >
      {/* Thumbnail */}
      <div className="relative">
        <img
          className="h-44 w-full object-cover transition-all duration-300 group-hover:scale-[1.03]"
          src={imageUrl}
          alt={title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/600x400/111/ff4a1f?text=${encodeURIComponent(
              title
            )}`;
          }}
        />

        {/* Trending Badge */}
        {isTrending && (
          <span
            className="absolute top-3 left-3 bg-[#FF4A1F] text-black px-3 py-1 rounded-full text-[10px] 
            font-semibold flex items-center gap-1 shadow-[0_0_12px_#ff4a1f]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-2 8 10-12h-9l2-8z" fill="black" />
            </svg>
            Trending
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#FF4A1F] transition">
          {title}
        </h3>

        <p className="text-gray-400 text-sm mb-4 h-16 overflow-hidden leading-relaxed">
          {description}
        </p>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-5">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-[#FF4A1F]" />
            <span>{level}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#FF4A1F]" />
            <span>{duration}</span>
          </div>

          <div className="flex items-center gap-2">
            <Star size={16} className="text-[#FFB020]" />
            <span>{rating} / 5</span>
          </div>
        </div>

        {/* Button (full width but inside the link wrapper) */}
        <div
          className="w-full py-2 text-center rounded-md bg-[#FF4A1F] text-black font-semibold 
          shadow-[0_0_12px_-2px_#ff4a1f] group-hover:brightness-95 transition"
        >
          View Course
        </div>
      </div>
    </Link>
  );
}
