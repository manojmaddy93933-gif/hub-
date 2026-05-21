import React from 'react';
import { motion } from 'motion/react';
import { Car, Gamepad2, Trophy, Clock, Users, ArrowRight, Coffee, Monitor, Star, Play, Quote, CheckCircle2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import carWashImg from '../assets/images/car_wash_bay_vibe_1778742611946.png';
import gamesImg from '../assets/images/games_vibe_1778742630317.png';
import badmintonImg from '../assets/images/badminton_vibe_1778742647583.png';

import { MapSection } from '../components/MapSection';

const Home = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Search Google for the query, restricting to site if intended or just general
    // Given the prompt "add google search https: hub station app.com", we'll search hub station app specifically
    const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}+hubstationapp.com`;
    window.open(url, '_blank');
  };

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
      timing: '9:00 AM - 10:00 PM'
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
      timing: '10:00 AM - 10:00 PM'
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
      timing: '8:30 AM - 11:00 PM'
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
      timing: '10:00 AM - 7:00 PM'
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
      timing: '7AM-11AM & 4PM-11PM'
    }
  ];

  const videos = [
    {
      title: 'Car Detailing Process',
      thumbnail: 'https://images.unsplash.com/photo-1601362840469-51e4d8d59085?q=80&w=2070&auto=format&fit=crop',
      duration: '0:45',
      category: 'Pro Service'
    },
    {
      title: 'AURA Cafe Experience',
      thumbnail: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop',
      duration: '1:20',
      category: 'Lifestyle'
    },
    {
      title: 'Gaming Zone Tour',
      thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop',
      duration: '0:30',
      category: 'Virtual Tour'
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
    }
  ];

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
              className="flex flex-wrap gap-3 mb-8"
            >
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

            <motion.form 
              onSubmit={handleSearch}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="relative max-w-md mb-10 group"
            >
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-accent transition-colors">
                <Search size={20} />
              </div>
              <input 
                type="text"
                placeholder="Search hubstationapp.com..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-slate-100 placeholder:text-zinc-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all font-medium"
              />
              <button 
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-6 bg-accent text-zinc-950 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all"
              >
                Search
              </button>
            </motion.form>

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

      {/* Pro Videos Section */}
      <section className="max-w-7xl mx-auto px-4 mt-32">
        <div className="mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-100 italic uppercase tracking-tighter mb-4">
            Pro <span className="text-accent">Working Videos</span>
          </h2>
          <p className="text-sm font-black text-zinc-500 uppercase tracking-widest">See how we deliver excellence at the hub</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {videos.map((vid, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative rounded-[2rem] overflow-hidden bg-zinc-900 border border-zinc-800"
            >
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={vid.thumbnail} 
                  alt={vid.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 grayscale-[0.3]" 
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                  <div className="w-14 h-14 bg-accent/90 rounded-full flex items-center justify-center text-zinc-950 shadow-xl shadow-accent/20 group-hover:scale-110 transition-transform">
                    <Play size={24} fill="currentColor" />
                  </div>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-zinc-950/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] text-accent">
                    {vid.category}
                  </span>
                </div>
                <div className="absolute bottom-4 right-4 bg-zinc-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black text-white">
                  {vid.duration}
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-sm font-bold text-slate-100 uppercase tracking-tight">{vid.title}</h4>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

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
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-slate-100 uppercase tracking-tighter italic mb-4">
              Real <span className="text-accent">Hub Stories</span>
            </h2>
            <div className="flex items-center justify-center gap-2 text-amber-500 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
            </div>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Trusted by 2000+ Premium Members</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 p-10 rounded-[3rem] relative group hover:border-accent/30 transition-all"
              >
                <Quote className="absolute top-10 right-10 text-zinc-800 group-hover:text-accent/20 transition-colors" size={48} />
                <div className="relative z-10">
                  <div className="flex gap-1 mb-8">
                    {[...Array(review.rating)].map((_, idx) => (
                      <Star key={idx} size={12} className="text-amber-500" fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-zinc-400 text-lg leading-relaxed font-medium mb-10 italic">
                    "{review.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-zinc-800">
                      <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-slate-100 font-bold uppercase tracking-tight">{review.name}</h4>
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-1.5">
                        <CheckCircle2 size={10} className="text-emerald-500" /> {review.role}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Map Section */}
      <MapSection />
    </div>
  );
};

export default Home;
