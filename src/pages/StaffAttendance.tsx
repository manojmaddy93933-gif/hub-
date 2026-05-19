import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserCheck, 
  UserX, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  Fingerprint,
  ArrowRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { attendanceService } from '../services/attendanceService';
import { playVoice } from '../services/voiceService';
import { Worker, Attendance } from '../types';

const StaffAttendance = () => {
  const [workerCode, setWorkerCode] = useState('');
  const [activeWorker, setActiveWorker] = useState<Worker | null>(null);
  const [lastAttendance, setLastAttendance] = useState<Attendance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!workerCode || workerCode.length < 3) return;

    setIsLoading(true);
    setMessage(null);
    try {
      const worker = await attendanceService.getWorkerByCode(workerCode);
      if (worker) {
        setActiveWorker(worker);
        const attendance = await attendanceService.getLatestAttendance(worker.id!);
        setLastAttendance(attendance);
      } else {
        setMessage({ text: 'Invalid Worker Code or Inactive', type: 'error' });
        playVoice("Invalid code. Please try again.", "Kore");
      }
    } catch (error) {
      setMessage({ text: 'Error searching for worker', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: 'checkIn' | 'checkOut') => {
    if (!activeWorker) return;

    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = Date.now();

      if (action === 'checkIn') {
        await attendanceService.markAttendance({
          workerId: activeWorker.id!,
          workerName: activeWorker.name,
          date: today,
          checkIn: now,
          status: 'present'
        });
        setMessage({ text: `Welcome, ${activeWorker.name}! Clocked in successfully.`, type: 'success' });
        playVoice(`Welcome ${activeWorker.name}. You have clocked in.`, "Zephyr");
      } else {
        if (lastAttendance?.id) {
          await attendanceService.updateAttendance(lastAttendance.id, {
            checkOut: now
          });
          setMessage({ text: `Goodbye, ${activeWorker.name}! Clocked out successfully.`, type: 'success' });
          playVoice(`Goodbye ${activeWorker.name}. You have clocked out.`, "Zephyr");
        }
      }

      // Reset after 3 seconds
      setTimeout(() => {
        reset();
      }, 4000);

    } catch (error) {
      setMessage({ text: 'Action failed. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setWorkerCode('');
    setActiveWorker(null);
    setLastAttendance(null);
    setMessage(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-20 px-6 flex items-center justify-center">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500 rounded-full blur-[150px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">
            <ShieldCheck size={14} />
            Secure Staff Terminal
          </div>
          <h1 className="text-4xl font-black text-slate-100 uppercase tracking-tighter italic">
            HUB STATION <span className="text-accent underline decoration-2 underline-offset-8">ATTENDANCE</span>
          </h1>
          <div className="mt-4 flex items-center justify-center gap-6 text-zinc-500 font-mono text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              {currentTime.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-2 text-slate-100 font-black">
              <Clock size={14} className="text-accent" />
              {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-8 shadow-2xl overflow-hidden relative">
          <AnimatePresence mode="wait">
            {!activeWorker ? (
              <motion.form 
                key="search"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSearch}
                className="space-y-8 py-4"
              >
                <div className="text-center">
                  <div className="w-24 h-24 bg-zinc-950 rounded-[2rem] border border-zinc-800 flex items-center justify-center mx-auto mb-6 shadow-inner relative group">
                    <Fingerprint size={48} className="text-zinc-700 group-hover:text-accent transition-colors duration-500" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse" />
                  </div>
                  <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight italic">Enter Worker ID</h2>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2">Personal code for attendance tracking</p>
                </div>

                <div className="relative">
                  <input 
                    type="text"
                    value={workerCode}
                    onChange={(e) => setWorkerCode(e.target.value.toUpperCase())}
                    placeholder="HUB - XXXX"
                    autoFocus
                    className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-2xl px-8 py-5 text-center text-2xl font-black tracking-[0.5em] text-slate-100 focus:border-accent outline-none transition-all placeholder:text-zinc-800 placeholder:tracking-normal uppercase"
                  />
                  <div className="absolute -bottom-1 -right-1 -left-1 h-1 bg-gradient-to-r from-transparent via-accent/20 to-transparent blur-sm" />
                </div>

                {message && message.type === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold"
                  >
                    <AlertTriangle size={18} />
                    {message.text}
                  </motion.div>
                )}

                <button 
                  type="submit"
                  disabled={isLoading || workerCode.length < 3}
                  className="w-full btn-primary h-16 rounded-2xl flex items-center justify-center gap-3 group"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="text-lg">CONTINUE</span>
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="action"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-6 p-6 bg-zinc-950 rounded-[2.5rem] border border-zinc-800">
                  <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-2xl italic">
                    {activeWorker.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tighter italic">{activeWorker.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{activeWorker.role}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-700" />
                      <span className="text-[10px] font-black text-accent uppercase tracking-widest">{activeWorker.workerCode}</span>
                    </div>
                  </div>
                </div>

                {message && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-6 rounded-3xl flex flex-col items-center gap-3 text-center border ${
                      message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                    }`}
                  >
                    {message.type === 'success' ? <UserCheck size={32} /> : <AlertTriangle size={32} />}
                    <div>
                      <p className="font-black text-sm uppercase italic">{message.text}</p>
                      <p className="text-[10px] opacity-60 mt-1 uppercase tracking-widest font-bold">System resetting in 3s...</p>
                    </div>
                  </motion.div>
                )}

                {!message && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleAction('checkIn')}
                      disabled={isLoading || (lastAttendance && !lastAttendance.checkOut)}
                      className={`h-32 rounded-3xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${
                        lastAttendance && !lastAttendance.checkOut 
                          ? 'bg-zinc-950 border-zinc-800 opacity-50 cursor-not-allowed' 
                          : 'bg-green-500/10 border-green-500/20 hover:border-green-500 group'
                      }`}
                    >
                      <UserCheck size={32} className={`${lastAttendance && !lastAttendance.checkOut ? 'text-zinc-800' : 'text-green-500 group-hover:scale-110 transition-transform'}`} />
                      <div className="text-center">
                        <span className={`block text-xs font-black uppercase tracking-widest ${lastAttendance && !lastAttendance.checkOut ? 'text-zinc-800' : 'text-green-500'}`}>CLOCK IN</span>
                        {lastAttendance && !lastAttendance.checkOut && (
                          <span className="text-[8px] font-bold text-zinc-600 block mt-1 uppercase">ALREADY IN</span>
                        )}
                      </div>
                    </button>

                    <button 
                      onClick={() => handleAction('checkOut')}
                      disabled={isLoading || !lastAttendance || (lastAttendance && lastAttendance.checkOut)}
                      className={`h-32 rounded-3xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${
                        !lastAttendance || (lastAttendance && lastAttendance.checkOut)
                          ? 'bg-zinc-950 border-zinc-800 opacity-50 cursor-not-allowed' 
                          : 'bg-amber-500/10 border-amber-500/20 hover:border-amber-500 group'
                      }`}
                    >
                      <UserX size={32} className={`${!lastAttendance || (lastAttendance && lastAttendance.checkOut) ? 'text-zinc-800' : 'text-amber-500 group-hover:scale-110 transition-transform'}`} />
                      <div className="text-center">
                        <span className={`block text-xs font-black uppercase tracking-widest ${!lastAttendance || (lastAttendance && lastAttendance.checkOut) ? 'text-zinc-800' : 'text-amber-500'}`}>CLOCK OUT</span>
                        {lastAttendance && !lastAttendance.checkOut && (
                          <span className="text-[8px] font-bold text-zinc-600 block mt-1 uppercase tracking-tighter italic">
                            SINCE {new Date(lastAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                )}

                <div className="flex justify-center">
                  <button 
                    onClick={reset}
                    className="text-[10px] font-black text-zinc-600 hover:text-slate-100 uppercase tracking-[0.3em] transition-colors"
                  >
                    CANCEL & EXIT
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-6">
          {[
            { icon: <MapPin size={16} />, label: "ZONE A", val: "ACTIVE" },
            { icon: <ShieldCheck size={16} />, label: "ENCRYPTED", val: "LINK" },
            { icon: <Clock size={16} />, label: "LIVE", val: "HUB" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl">
              <div className="text-zinc-600">{item.icon}</div>
              <div className="text-center">
                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{item.label}</p>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter italic">{item.val}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default StaffAttendance;
