import React from "react";

export default function Testimonial({ cardsData: incoming }) {
  const cardsData = incoming ?? [
    {
      image: "/images/hritesh.jpg",
      name: "Hitesh Choudhary",
      handle: "@HiteshChoudhary",
      date: "October 28, 2025",
      quote:
        "Backend modules are pure gold. Cleared up my system design and database concepts. Total 'Chai aur Code' vibes.",
    },
    {
      image: "/images/sr.jpg",
      name: "Shradha Khapra",
      handle: "@shradhakhapra",
      date: "November 5, 2025",
      quote:
        "This DSA course is top-tier. A perfect resource for placement prep and self-study. Highly recommend.",
    },
    {
      image: "/images/tp.jpg",
      name: "Tanay Pratap",
      handle: "@tanaypratap",
      date: "November 10, 2025",
      quote:
        "This is true 'proof of work.' The React projects build real-world skills, not just theory. A must for any aspiring dev.",
    },
    {
      image: "/images/kk.jpg",
      name: "Kunal Kushwaha",
      handle: "@kunalstwt",
      date: "November 15, 2025",
      quote:
        "Fantastic DevOps and Open Source tracks. Love the focus on community and building in public.",
    },
  ];
  const Card = ({ card }) => (
    <article
      className="w-72 shrink-0 rounded-2xl bg-[#0B0B0B] border border-gray-800 p-4 mx-3 shadow-sm hover:shadow-lg transition-all duration-200"
      aria-labelledby={`testi-${card.name.replace(/\s+/g, "-")}`}
    >
      <header className="flex items-center gap-3">
        <img
          src={card.image}
          alt={`${card.name} avatar`}
          className="w-12 h-12 rounded-full object-cover ring-1 ring-gray-800 flex-shrink-0"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              "https://placehold.co/200x200/111/ff4a1f?text=PL";
          }}
        />
        <div className="min-w-0">
          <h4
            id={`testi-${card.name.replace(/\s+/g, "-")}`}
            className="text-sm font-semibold text-white truncate"
          >
            {card.name}
          </h4>
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <span className="truncate">{card.handle}</span>
            <span aria-hidden className="mx-1">
              •
            </span>
            <time className="text-xs" dateTime={card.date}>
              {card.date}
            </time>
          </div>
        </div>
      </header>

      <p className="mt-3 text-sm text-gray-300 leading-relaxed h-20 overflow-hidden">
        {card.quote ?? "Loved the course — highly practical and hands-on."}
      </p>

      <footer className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <a
          href="https://x.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 hover:text-[#FF4A1F] transition"
          aria-label={`View ${card.name}'s profile`}
        >
          <svg
            width="12"
            height="10"
            viewBox="0 0 11 10"
            fill="none"
            aria-hidden
          >
            <path
              d="m.027 0 4.247 5.516L0 10h.962l3.742-3.926L7.727 10H11L6.514 4.174 10.492 0H9.53L6.084 3.616 3.3 0zM1.44.688h1.504l6.64 8.624H8.082z"
              fill="currentColor"
            />
          </svg>
          <span className="underline-offset-2">Posted</span>
        </a>
        <span>{card.date}</span>
      </footer>
    </article>
  );

  return (
    <section className="w-full py-8 bg-[#070707]">
      <style>
        {`
  .marquee-track {
    display: flex;
    width: max-content;
    animation: marquee 40s linear infinite;
    will-change: transform;
  }

  .marquee-track.reverse {
    animation: marquee-reverse 40s linear infinite;
  }

  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  @keyframes marquee-reverse {
    0% { transform: translateX(-50%); }
    100% { transform: translateX(0); }
  }
`}
      </style>

      <div className="max-w-[1300px] mx-auto px-6">
        <div className="mb-6 text-center lg:text-left">
          <h3 className="text-3xl font-extrabold text-white">
            What learners say
          </h3>
          <p className="mt-2 text-gray-400 max-w-xl">
            Real feedback from people who used Placium to level up their
            skills.
          </p>
        </div>

        {/* Row 1 */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-20 pointer-events-none z-10 bg-gradient-to-r from-[#070707] to-transparent" />
          <div className="absolute inset-y-0 right-0 w-20 pointer-events-none z-10 bg-gradient-to-l from-[#070707] to-transparent" />

          <div
            className="marquee-track flex gap-2"
            aria-hidden="true"
            style={{ minWidth: "200%" }}
          >
            {[...cardsData, ...cardsData].map((c, i) => (
              <Card key={`r1-${i}-${c.name}`} card={c} />
            ))}
          </div>
        </div>

        {/* Row 2 (reverse direction for visual interest) */}
        <div className="relative mt-6 overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-20 pointer-events-none z-10 bg-gradient-to-r from-[#070707] to-transparent" />
          <div className="absolute inset-y-0 right-0 w-20 pointer-events-none z-10 bg-gradient-to-l from-[#070707] to-transparent" />

          <div className="overflow-hidden relative">
            <div className="marquee-track">
              {cardsData.map((card, index) => (
                <Card key={index} card={card} />
              ))}
              {/* duplicate for perfect loop */}
              {cardsData.map((card, index) => (
                <Card key={"dup-" + index} card={card} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
