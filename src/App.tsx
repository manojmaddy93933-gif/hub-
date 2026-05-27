/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Bookings from './pages/Bookings';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import QRHub from './pages/QRHub';
import StaffAttendance from './pages/StaffAttendance';
import { bookingService } from './services/bookingService';
import { playVoice } from './services/voiceService';
import { Booking } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';

function AppContent() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [completeNotification, setCompleteNotification] = useState<Booking | null>(null);

  useEffect(() => {
    if (user) {
      let isFirstLoad = true;
      const unsubscribe = bookingService.subscribeToUserBookings(user.uid, (data, changes) => {
        if (isFirstLoad) {
          isFirstLoad = false;
          return;
        }

        if (changes && Array.isArray(changes)) {
          changes.forEach(change => {
            const booking = { id: change.doc.id, ...change.doc.data() } as Booking;
            if (change.type === 'modified') {
              if (booking.status === 'completed') {
                setCompleteNotification(booking);
                playVoice(`Dear customer, your scheduled play session for ${booking.resourceName} is now completed. Thank you for booking with us!`, 'Zephyr');
                try {
                  const doneAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/911/911-preview.mp3');
                  doneAudio.volume = 0.5;
                  doneAudio.play().catch(e => console.log('Audio play failed:', e));
                } catch (err) {
                  console.error('Audio error:', err);
                }
              } else if (booking.status === 'cancelled') {
                playVoice("Your order has been cancelled.", 'Kore');
                try {
                  const cancelAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3');
                  cancelAudio.volume = 0.5;
                  cancelAudio.play().catch(e => console.log('Audio play failed:', e));
                } catch (err) {
                  console.error('Audio error:', err);
                }
              }
            }
          });
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />
      <main className="relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/bookings" 
            element={user ? <Bookings /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin" 
            element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />} 
          />
          <Route path="/attendance" element={<StaffAttendance />} />
          <Route path="/qrhub" element={<QRHub />} />
        </Routes>

        {/* Global Play Time Completed Floater Notification Panel */}
        <AnimatePresence>
          {completeNotification && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9, x: '50%', translateX: '-50%' }}
              animate={{ opacity: 1, y: 0, scale: 1, x: '50%', translateX: '-50%' }}
              exit={{ opacity: 0, y: 30, scale: 0.9, x: '50%', translateX: '-50%' }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              style={{ left: 0, right: 0 }}
              className="fixed bottom-6 mx-auto z-[999] max-w-sm md:max-w-md w-[calc(100%-2rem)] p-5 bg-zinc-950 border border-emerald-500/40 rounded-[2rem] flex flex-col gap-4 shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden"
            >
              {/* Decorative Subtle Glowing Background */}
              <div className="absolute top-0 right-0 p-4 font-black text-emerald-500/5 select-none pointer-events-none text-5xl font-sans tracking-tighter">
                PLAYDONE
              </div>

              <div className="flex gap-4 relative z-10 w-full">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center shrink-0 animate-bounce" style={{ animationDuration: '3s' }}>
                  <CheckCircle2 size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Session Completed
                  </p>
                  <h3 className="text-sm font-bold text-slate-100 uppercase italic tracking-tight mt-1 leading-tight">
                    Your time for <span className="text-accent">{completeNotification.resourceName}</span> is complete!
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed font-medium">
                    We hope you had an elite experience at Hub Station. View your booking details and history below.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-zinc-800/80 pt-3 mt-1 relative z-10">
                <button
                  onClick={() => {
                    navigate('/bookings');
                    setCompleteNotification(null);
                  }}
                  className="px-4 py-2 bg-emerald-500 text-zinc-950 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-white transition-all active:scale-95 shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  View Details
                </button>
                <button
                  onClick={() => setCompleteNotification(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-[10px] uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

