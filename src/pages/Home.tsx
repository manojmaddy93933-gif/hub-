import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Gamepad2, Trophy, Clock, Users, ArrowRight, Coffee, Monitor, Star, Quote, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
    scale: 0.98
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring", stiffness: 350, damping: 30 },
      opacity: { duration: 0.3 },
      scale: { duration: 0.4 }
    }
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0,
    scale: 0.98,
    transition: {
      x: { type: "spring", stiffness: 350, damping: 30 },
      opacity: { duration: 0.3 },
      scale: { duration: 0.4 }
    }
  })
};
import carWashImg from '../assets/images/car_wash_bay_vibe_1778742611946.png';
import gamesImg from '../assets/images/games_vibe_1778742630317.png';
import badmintonImg from '../assets/images/badminton_vibe_1778742647583.png';

import { MapSection } from '../components/MapSection';
import hubLogo from '../assets/images/hub_station_logo_glow_1781636017260.jpg';

const Home = () => {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const heroTitleVariants = {
    hidden: { opacity: 0, y: 100, rotateX: 45 },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] // Custom cubic-bezier for a "slam" effect
      }
    }
  };

  const services = [
    {
      id: 'cafe',
      title: 'AURA Cafe',
      description: 'Gourmet menu, artisan coffee, and premium social vibes.',
      icon: <Coffee size={24} />,
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop',
      link: '/bookings',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      timing: '10:00 AM - 10:00 PM'
    },
    {
      id: 'theatre',
      title: 'Birthday Theatre',
      description: 'Private luxury hall for birthdays and celebrations.',
      icon: <Monitor size={24} />,
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop',
      link: '/bookings',
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      timing: '10:00 AM - 11:00 PM'
    },
    {
      id: 'games',
      title: 'Game Zone',
      description: 'Carrom, Chess, and Ludo. Book your table now.',
      icon: <Gamepad2 size={24} />,
      image: gamesImg,
      link: '/bookings',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      timing: '10:00 AM - 10:00 PM'
    },
    {
      id: 'carwash',
      title: 'Luxe Car Wash Detailing',
      description: 'Professional 2-bay service hub with premium detailing.',
      icon: <Car size={24} />,
      image: carWashImg,
      link: '/bookings',
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      timing: '9:30 AM - 7:30 PM'
    },
    {
      id: 'badminton',
      title: 'Badminton Court',
      description: 'Professional court with flexible booking slots.',
      icon: <Trophy size={24} />,
      image: badmintonImg,
      link: '/bookings',
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
      timing: '7:00 AM - 10:00 AM & 4:00 PM - 11:00 PM'
    }
  ];



  const reviews = [
    {
      name: 'Adithya Varma',
      role: 'Regular Customer',
      content: 'The car wash quality is unmatched. I love hanging out at the AURA cafe while my SUV gets treated. The service is top-notch!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop'
    },
    {
      name: 'Priya Sharma',
      role: 'Student',
      content: 'Best place for birthday celebrations! The Private Theatre is cozy and premium. Highly recommend for any celebration.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop'
    },
    {
      name: 'Rahul Hegde',
      role: 'Software Engineer',
      content: 'I frequently visit the badminton court. The facility is well-maintained and the booking process is seamless. Highly recommend!',
      rating: 4,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1974&auto=format&fit=crop'
    },
    {
      name: 'Sneha Reddy',
      role: 'Badminton Club Captain',
      content: 'The court lighting and premium wooden flooring at Hub Station are absolute game-changers. Booking through our portal is super convenient!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1974&auto=format&fit=crop'
    },
    {
      name: 'Vikram Sen',
      role: 'Sim Gaming Enthusiast',
      content: 'The gaming lounge features top-tier PS5 rigs and high-fidelity racing simulators. It is hands-down the cleanest and most immersive hangout hub!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (isAutoplayPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex, isAutoplayPaused]);

  const stats = [
    { icon: <Clock size={20} />, label: 'Fast Service', value: '15-30 min' },
    { icon: <Users size={20} />, label: 'Capacity', value: '50+ People' },
    { icon: <Trophy size={20} />, label: 'Rating', value: '4.9/5.0' },
  ];

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src={carWashImg} 
            alt="Hero Background" 
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 to-transparent opacity-90" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10 w-full">
          <motion.div 
            initial="hidden"
            animate="visible"
            className="max-w-2xl text-slate-100"
          >
            <motion.div 
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1 }
              }}
              className="flex flex-wrap items-center gap-4 mb-8"
            >
              <div className="w-12 h-12 rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-950 p-0.5 flex items-center justify-center shadow-xl">
                <img 
                  src={hubLogo} 
                  alt="Hub Station Emblem" 
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-md px-4 py-2 rounded-full border border-accent/30 font-bold text-accent text-xs tracking-widest uppercase">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                Now Open
              </div>
            </motion.div>
            
            <motion.h1 
              variants={heroTitleVariants}
              className="text-6xl md:text-8xl font-bold leading-tight mb-6 tracking-tighter uppercase perspective-1000"
            >
              Premium <br />
              <span className="text-accent italic font-black">HUB EXPERIENCE</span>
            </motion.h1>
            <motion.p 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="text-lg text-zinc-400 mb-10 leading-relaxed max-w-lg font-medium"
            >
              A meticulously crafted space where coffee culture meets high-end service. 
              Gourmet menu, social gaming, and professional car detailing.
            </motion.p>

            <motion.div 
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1 }
              }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/bookings" className="btn-primary flex items-center gap-2">
                Book Service <ArrowRight size={20} />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats overlay */}
        <div className="absolute bottom-10 right-10 hidden lg:flex gap-10 bg-zinc-900/50 backdrop-blur-xl p-8 rounded-3xl border border-white/5">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col gap-1 items-center">
              <div className="text-accent mb-2">{stat.icon}</div>
              <p className="text-2xl font-bold text-white tracking-tighter">{stat.value}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services Grid */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-7xl mx-auto px-4 -mt-20 relative z-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <motion.div
              key={service.id}
              variants={itemVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group cursor-pointer"
            >
              <div className="bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/20 hover:border-accent/40 transition-all border border-zinc-800 p-3">
                <div className="h-44 relative overflow-hidden rounded-[2rem]">
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className={`absolute top-4 right-4 ${service.bg} ${service.color} p-2.5 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg`}>
                    {service.icon}
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-[10px] text-accent font-black tracking-widest uppercase mb-2 flex items-center gap-2">
                     <Clock size={12} /> {service.timing}
                  </p>
                  <h3 className="font-bold text-xl mb-2 uppercase tracking-tight text-slate-100">{service.title}</h3>
                  <p className="text-zinc-500 text-xs mb-6 line-clamp-2 leading-loose font-medium">
                    {service.description}
                  </p>
                  <Link 
                    to={service.link}
                    className="flex items-center justify-between font-black text-[10px] tracking-widest text-zinc-400 group-hover:text-accent transition-colors uppercase"
                  >
                    SELECT SERVICE <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>



      {/* Info Section */}
      <section className="max-w-7xl mx-auto px-4 mt-32">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-zinc-900 rounded-[3.5rem] p-12 md:p-20 relative overflow-hidden border border-zinc-800"
        >
          <div className="absolute top-0 right-0 w-1/3 h-full bg-accent opacity-5 blur-[120px]" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="w-12 h-1 text-accent bg-accent mb-8" />
              <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-8 leading-tight tracking-tighter uppercase">
                Expert <br />Service Station
              </h2>
              <p className="text-zinc-500 mb-10 leading-relaxed text-lg font-medium">
                Equipped with two high-performance bays, we deliver showroom-quality detailing. 
                Relax in our premium lounge while we treat your vehicle.
              </p>
              <div className="space-y-6">
                {[
                  { label: 'Hatchback / Sedan Wash', price: '₹500' },
                  { label: 'SUV / MPV Wash', price: '₹600' },
                  { label: 'Basic Wash', price: '₹500' },
                  { label: 'Premium Wash', price: '₹1200' },
                  { label: 'Deep Clean Service', price: '₹2200' },
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + (i * 0.1) }}
                    className="flex items-center justify-between border-b border-zinc-800 pb-4"
                  >
                    <span className="text-zinc-300 font-bold text-sm uppercase tracking-wider">{item.label}</span>
                    <span className="text-accent font-black text-lg italic">{item.price}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative"
            >
              <div className="rounded-[3rem] overflow-hidden border border-zinc-800 shadow-2xl">
                <img src={carWashImg} alt="Car Wash" className="w-full grayscale-[0.2]" />
              </div>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-accent p-8 rounded-3xl text-zinc-950 shadow-2xl flex flex-col items-center"
              >
                <p className="text-4xl font-black italic">05</p>
                <p className="text-[10px] uppercase font-black tracking-widest opacity-80 mt-1">Bays / Day</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Reviews Section */}
      <section className="bg-zinc-950 mt-32 py-32 border-y border-zinc-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-slate-100 uppercase tracking-tighter italic mb-4 animate-pulse">
              Real <span className="text-accent">Hub Stories</span>
            </h2>
            <div className="flex items-center justify-center gap-2 text-amber-500 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
            </div>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Trusted by 2000+ Premium Members</p>
          </div>

          <div 
            className="relative max-w-4xl mx-auto px-4 focus:outline-none"
            onMouseEnter={() => setIsAutoplayPaused(true)}
            onMouseLeave={() => setIsAutoplayPaused(false)}
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-accent/5 rounded-full blur-[100px] pointer-events-none -z-10" />

            <div className="relative min-h-[380px] md:min-h-[280px] flex items-center justify-center overflow-hidden">
              <AnimatePresence initial={false} mode="wait" custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="w-full"
                >
                  <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 p-8 md:p-12 rounded-[2.5rem] relative group hover:border-accent/20 transition-all shadow-xl flex flex-col md:flex-row gap-8 md:gap-12 items-center">
                    
                    {/* Big Decorative Quote Mark */}
                    <Quote className="absolute top-8 right-8 text-zinc-800/60 group-hover:text-accent/15 transition-all duration-500 transform group-hover:scale-110 pointer-events-none animate-pulse" size={72} />

                    {/* Left Column: Reviewer Avatar Capsule */}
                    <div className="flex-shrink-0 relative">
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] overflow-hidden border-2 border-zinc-800 relative z-10 group-hover:border-accent/40 transition-all duration-350">
                        <img 
                          src={reviews[currentIndex].avatar} 
                          alt={reviews[currentIndex].name} 
                          className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      {/* Interactive Cyan Halo Glow behind Avatar on hover */}
                      <div className="absolute inset-x-0 inset-y-0 bg-accent/20 blur-md rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-95 -z-10" />
                    </div>

                    {/* Right Column: Review Core Info */}
                    <div className="flex-1 w-full text-center md:text-left flex flex-col justify-between">
                      <div>
                        {/* Star Ratings */}
                        <div className="flex justify-center md:justify-start gap-1 mb-4">
                          {[...Array(5)].map((_, idx) => (
                            <Star 
                              key={idx} 
                              size={14} 
                              className={idx < reviews[currentIndex].rating ? "text-amber-500 fill-amber-500" : "text-zinc-700"}
                            />
                          ))}
                        </div>

                        {/* Testimonial Quote */}
                        <blockquote className="text-zinc-300 text-lg md:text-xl font-medium leading-relaxed italic mb-6 pr-0 md:pr-12">
                          "{reviews[currentIndex].content}"
                        </blockquote>
                      </div>

                      {/* Author Card Footer */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-zinc-800/60 pt-4">
                        <div>
                          <h4 className="text-slate-100 text-lg font-bold uppercase tracking-tight">{reviews[currentIndex].name}</h4>
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center justify-center md:justify-start gap-1.5 mt-0.5">
                            <CheckCircle2 size={11} className="text-emerald-500" /> {reviews[currentIndex].role}
                          </span>
                        </div>

                        {/* Verified Booking tag */}
                        <div className="self-center md:self-auto bg-zinc-950/80 border border-zinc-800 px-3.5 py-1.5 rounded-full">
                          <span className="text-[8px] font-black text-accent uppercase tracking-widest flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" /> Verified Booking
                          </span>
                        </div>
                      </div>

                    </div>

                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Premium Navigation and custom pagination layout */}
            <div className="flex justify-between items-center mt-8 gap-4 px-2">
              
              <button
                onClick={prevSlide}
                className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-805 text-zinc-400 hover:text-accent hover:border-accent hover:shadow-[0_0_15px_rgba(34,211,238,0.25)] focus:outline-none flex items-center justify-center transition-all cursor-pointer group"
                aria-label="Previous review"
              >
                <ChevronLeft size={20} className="transform group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <div className="flex items-center gap-2.5">
                {reviews.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDirection(idx > currentIndex ? 1 : -1);
                      setCurrentIndex(idx);
                    }}
                    className={`focus:outline-none transition-all duration-350 rounded-full cursor-pointer h-2 ${
                      idx === currentIndex 
                        ? 'w-8 bg-accent shadow-[0_0_8px_rgba(34,211,238,0.5)]' 
                        : 'w-2 bg-zinc-800 hover:bg-zinc-650'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-805 text-zinc-400 hover:text-accent hover:border-accent hover:shadow-[0_0_15px_rgba(34,211,238,0.25)] focus:outline-none flex items-center justify-center transition-all cursor-pointer group"
                aria-label="Next review"
              >
                <ChevronRight size={20} className="transform group-hover:translate-x-0.5 transition-transform" />
              </button>

            </div>

          </div>
        </div>
      </section>

      {/* Location Map Section */}
      <MapSection />
    </div>
  );
};

export default Home;
