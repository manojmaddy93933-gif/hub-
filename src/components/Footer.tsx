import { motion } from 'motion/react';
import { ExternalLink, Globe } from 'lucide-react';
import hubLogo from '../assets/images/hub_station_logo_glow_1781636017260.jpg';

const Footer = () => {
  return (
    <footer className="bg-zinc-950 text-zinc-500 py-12 px-6 border-t border-zinc-900 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 p-0.5 flex items-center justify-center">
            <img 
              src={hubLogo} 
              alt="Hub Station Logo" 
              className="w-full h-full object-cover rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col items-start gap-1">
            <h2 className="text-slate-100 font-black text-xl italic tracking-tighter">HUB STATION</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Premium Performance Hub</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <a 
            href="https://hubstationapp.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-accent hover:text-accent transition-all"
          >
            <Globe size={16} className="text-zinc-600 group-hover:text-accent transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-widest">hubstationapp.com</span>
            <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-700">© 2024 HUB STATION. ALL RIGHTS RESERVED.</p>
        </div>

        <div className="flex gap-6">
          {['Instagram', 'Twitter', 'Facebook'].map((social) => (
            <button key={social} className="text-[10px] font-black uppercase tracking-widest hover:text-slate-100 transition-colors">
              {social}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
