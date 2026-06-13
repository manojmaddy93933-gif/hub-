import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import { playVoice } from '../services/voiceService';
import { notificationService } from '../services/notificationService';
import { Booking, BookingType, BookingStatus } from '../types';
import { 
  Gamepad2, 
  Car, 
  Trophy, 
  Calendar, 
  Clock, 
  ChevronRight, 
  MapPin, 
  CheckCircle2, 
  Timer,
  AlertCircle,
  Phone,
  Upload,
  Camera,
  FileText,
  Image as ImageIcon,
  QrCode,
  IndianRupee,
  Monitor,
  Coffee,
  User as UserIcon,
  Trash2,
  X,
  Bell
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { RATES, CAR_WASH_HOURS, BADMINTON_HOURS, THEATRE_HOURS, AURA_CAFE_HOURS } from '../constants';
import PaymentQR from '../components/PaymentQR';

const Bookings = () => {
  const { user, profile } = useAuth();
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<BookingType>('game');
  const [historyTab, setHistoryTab] = useState<'active' | 'history'>('active');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<'all' | 'game' | 'carWash' | 'badminton' | 'theatre' | 'cafe'>('all');
  const [loading, setLoading] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<string>(
    notificationService.getPermissionStatus()
  );

  const [allBadmintonBookings, setAllBadmintonBookings] = useState<Booking[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (user) {
      const unsubscribe = bookingService.subscribeToBadmintonBookings((data) => {
        setAllBadmintonBookings(data);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const BADMINTON_SLOTS = ["07:00", "08:00", "09:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Get calendar details
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const getDayAvailabilityStatus = (dStr: string) => {
    const activeB = allBadmintonBookings.filter(b => b.date === dStr && b.status !== 'cancelled');
    if (activeB.length === 0) return 'free';
    
    let occupiedSlotsCount = 0;
    BADMINTON_SLOTS.forEach(slotHourStr => {
      const slotHour = parseInt(slotHourStr.split(':')[0]);
      const overlapCount = activeB.filter(b => {
        const startH = parseInt(b.startTime.split(':')[0]);
        const dur = b.duration || 1;
        return slotHour >= startH && slotHour < startH + dur;
      }).length;
      occupiedSlotsCount += Math.min(overlapCount, 1);
    });

    if (occupiedSlotsCount >= BADMINTON_SLOTS.length) return 'full';
    return 'partial';
  };

  const isSlotSelectedInForm = (slot: string) => {
    if (activeTab !== 'badminton') return false;
    const currentStartHour = parseInt(startTime.split(':')[0]);
    const formDuration = resourceId === '2 Hours' ? 2 : 1;
    const sHour = parseInt(slot.split(':')[0]);
    return sHour >= currentStartHour && sHour < currentStartHour + formDuration;
  };

  const handleEnableNotifications = async () => {
    const granted = await notificationService.requestPermission();
    setNotificationPermission(notificationService.getPermissionStatus());
    if (granted) {
      notificationService.sendNotification(
        "Notifications Activated! 🚀",
        "You will now receive automatic push notifications when your car wash starts or badminton court is confirmed!"
      );
    }
  };
  const [mobileNumber, setMobileNumber] = useState(profile?.mobileNumber || '');
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('04:00');
  const [resourceId, setResourceId] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehiclePhotoUrl, setVehiclePhotoUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [showQR, setShowQR] = useState<string | null>(null);
  const [activePendingBooking, setActivePendingBooking] = useState<Booking | null>(null);
  const [discountType, setDiscountType] = useState<string>('');

  const resetForm = () => {
    setResourceId('');
    setVehicleNumber('');
    setVehicleMake('');
    setVehicleModel('');
    setVehicleYear('');
    setVehiclePhotoUrl(null);
    setNotes('');
    setDiscountType('');
    setPolicyAccepted(false);
    setDate(new Date().toISOString().split('T')[0]);
    if (activeTab === 'carWash') {
      setStartTime('09:30');
    } else if (activeTab === 'cafe' || activeTab === 'theatre') {
      setStartTime('10:00');
    } else if (activeTab === 'badminton') {
      setStartTime('04:00');
    } else {
      setStartTime('10:00');
    }
  };

  useEffect(() => {
    if (activeTab === 'carWash') {
      setStartTime('09:30');
    } else if (activeTab === 'cafe' || activeTab === 'theatre') {
      setStartTime('10:00');
    } else if (activeTab === 'badminton') {
      setStartTime('07:00');
    } else {
      setStartTime('10:00');
    }
  }, [activeTab]);

  const generateTimeSlots = (open: string, close: string) => {
    const slots = [];
    let current = parseInt(open.split(':')[0]);
    const end = parseInt(close.split(':')[0]);
    
    for (let h = current; h < end; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const isFirstLoad = React.useRef(true);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribe = bookingService.subscribeToUserBookings(user.uid, (data) => {
        setMyBookings(data);
      });
      return () => unsubscribe();
    }
  }, [user, refreshTrigger]);

  useEffect(() => {
    const pending = myBookings.find(b => b.type === activeTab && b.status === 'pending');
    setActivePendingBooking(pending || null);
  }, [activeTab, myBookings]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000) { // ~0.8MB limit for Firestore doc safety
      alert('Image too large. Please select an image under 800KB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setVehiclePhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const getBookingPriceDetails = () => {
    if (!resourceId) return { basePrice: 0, discount: 0, finalPrice: 0, resourceName: '' };

    let price = 0;
    let name = '';

    if (activeTab === 'game') {
      const game = Object.values(RATES.GAMES).find(g => g.name === resourceId);
      price = game?.rate || 0;
      name = resourceId;
    } else if (activeTab === 'carWash') {
      const wash = RATES.CAR_WASH.find(w => w.type === resourceId);
      price = wash?.price || 0;
      name = resourceId;
    } else if (activeTab === 'badminton') {
      price = resourceId === '2 Hours' ? RATES.BADMINTON.rate2h : RATES.BADMINTON.rate1h;
      name = `Badminton Court (${resourceId})`;
    } else if (activeTab === 'theatre') {
      if (resourceId === '1 Hour') price = RATES.THEATRE.rate1h;
      else if (resourceId === '2 Hours') price = RATES.THEATRE.rate2h;
      else if (resourceId === '5 Hours') price = RATES.THEATRE.rate5h;
      else if (resourceId === 'Get Together Party') price = RATES.THEATRE.getTogether;
      name = resourceId === 'Get Together Party' ? 'Get Together Party' : `Birthday Theatre (${resourceId})`;
    } else if (activeTab === 'cafe') {
      price = RATES.CAFE.tableBooking;
      name = `AURA Cafe Table (${resourceId})`;
    }

    const discount = discountType ? Math.round(price * 0.1) : 0;
    const finalPrice = price - discount;

    return { basePrice: price, discount, finalPrice, resourceName: name };
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const [h, m] = startTime.split(':').map(Number);
    const totalMinutes = h * 60 + m;

    if (activeTab === 'carWash') {
      const minMin = 9 * 60 + 30; // 09:30 AM
      const maxMin = 19 * 60 + 30; // 07:30 PM
      if (isNaN(h) || totalMinutes < minMin || totalMinutes > maxMin) {
        alert('Car wash services are strictly available from 9:30 AM to 7:30 PM. Please select a valid time.');
        return;
      }
    } else if (activeTab === 'cafe') {
      const minMin = 10 * 60; // 10:00 AM
      const maxMin = 22 * 60; // 10:00 PM
      if (isNaN(h) || totalMinutes < minMin || totalMinutes > maxMin) {
        alert('AURA Cafe is strictly open from 10:00 AM to 10:00 PM. Please select a valid time.');
        return;
      }
    } else if (activeTab === 'theatre') {
      const minMin = 10 * 60; // 10:00 AM
      const maxMin = 23 * 60; // 11:00 PM
      if (isNaN(h) || totalMinutes < minMin || totalMinutes > maxMin) {
        alert('Birthday Theatre is strictly open from 10:00 AM to 11:00 PM. Please select a valid time.');
        return;
      }
    } else if (activeTab === 'badminton') {
      const dur = resourceId === '2 Hours' ? 2 : 1;
      const startMinutes = totalMinutes;
      const endMinutes = startMinutes + dur * 60;
      
      const inSession1 = startMinutes >= 7 * 60 && endMinutes <= 10 * 60;
      const inSession2 = startMinutes >= 16 * 60 && endMinutes <= 23 * 60;
      
      if (isNaN(h) || (!inSession1 && !inSession2)) {
        alert('Badminton Court is strictly available from 7:00 AM to 10:00 AM and 4:00 PM to 11:00 PM. Please select a valid duration and time slot within these session timings.');
        return;
      }
    } else if (activeTab === 'game') {
      const minMin = 10 * 60; // 10:00 AM
      const maxMin = 22 * 60; // 10:00 PM
      if (isNaN(h) || totalMinutes < minMin || totalMinutes > maxMin) {
        alert('Game Zone is open from 10:00 AM to 10:00 PM. Please select a valid time.');
        return;
      }
    }

    setLoading(true);

    try {
      const { basePrice, discount, finalPrice, resourceName } = getBookingPriceDetails();

      const bookingData: any = {
        userId: user.uid,
        userEmail: user.email || '',
        userName: user.displayName || 'Guest',
        userPhone: mobileNumber,
        type: activeTab,
        resourceId,
        resourceName,
        date,
        startTime,
        endTime: '', // Calculated on backend or simple offset
        duration: activeTab === 'badminton' ? (resourceId === '2 Hours' ? 2 : 1) : 
                  activeTab === 'theatre' ? (resourceId === 'Get Together Party' ? 3 : (resourceId === '5 Hours' ? 5 : (resourceId === '2 Hours' ? 2 : 1))) : 
                  activeTab === 'cafe' ? 1 : 1,
        status: 'pending',
        price: finalPrice,
        originalPrice: basePrice,
        discountType: discountType || null,
        discountAmount: discount || null,
        notes: notes.trim(),
        createdAt: Date.now(),
      };

      if (activeTab === 'carWash') {
        bookingData.vehicleNumber = vehicleNumber;
        bookingData.vehicleMake = vehicleMake;
        bookingData.vehicleModel = vehicleModel;
        bookingData.vehicleYear = vehicleYear;
        if (vehiclePhotoUrl) bookingData.vehiclePhotoUrl = vehiclePhotoUrl;
      }

      await bookingService.createBooking(bookingData as Omit<Booking, 'id'>);
      
      // Play success sound
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio play failed:', e));
      } catch (err) {
        console.error('Audio error:', err);
      }

      alert('Booking successful!');
      resetForm();
    } catch (error) {
      console.error(error);
      alert('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!user || isClearing) return;
    if (!window.confirm('Are you sure you want to clear your booking history? This cannot be undone.')) return;

    setIsClearing(true);
    try {
      await bookingService.clearUserHistory(user.uid, myBookings);
    } catch (error) {
      console.error(error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await bookingService.deleteBooking(id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelBooking = (booking: Booking) => {
    setBookingToCancel(booking);
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'ongoing': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border border-red-500/20';
      default: return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* User Profile Header */}
      <div className="lg:col-span-12 mb-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-800 shadow-2xl flex flex-col md:flex-row items-center gap-8"
        >
          <div className="relative">
            <div className="w-24 h-24 bg-zinc-950 rounded-[2rem] border-2 border-accent/20 flex items-center justify-center overflow-hidden">
               {user?.photoURL ? (
                 <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <UserIcon size={40} className="text-zinc-700" />
               )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent rounded-xl flex items-center justify-center text-zinc-950 border-4 border-zinc-900">
              <CheckCircle2 size={14} />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-black text-slate-100 uppercase tracking-tighter italic">
              {profile?.displayName || user?.displayName || 'Hub Member'}
            </h1>
            <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest mt-1">
              {user?.email}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <div className="px-4 py-2 bg-zinc-950 rounded-xl border border-zinc-800">
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Total Reservations</p>
                <p className="text-lg font-black text-slate-100 italic">{myBookings.length}</p>
              </div>
              <div className="px-4 py-2 bg-zinc-950 rounded-xl border border-zinc-800">
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Member Since</p>
                <p className="text-lg font-black text-slate-100 italic">2026</p>
              </div>
              <div className="px-4 py-2 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center gap-6 min-h-[3.25rem]">
                <div>
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">Live Alerts</p>
                  <p className="text-[10px] font-black uppercase flex items-center gap-1.5 leading-none">
                    {notificationPermission === 'granted' ? (
                      <span className="text-emerald-500">Active</span>
                    ) : notificationPermission === 'denied' ? (
                      <span className="text-red-500">Blocked</span>
                    ) : (
                      <span className="text-zinc-400">Off</span>
                    )}
                  </p>
                </div>
                {notificationPermission !== 'granted' && notificationPermission !== 'unsupported' && (
                  <button
                    onClick={handleEnableNotifications}
                    className="px-2.5 py-1 bg-accent/15 hover:bg-accent hover:text-zinc-950 text-accent font-black text-[8px] uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Bell size={10} />
                    Enable
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>



      {/* Booking Form */}
      <div className="lg:col-span-5">
        <div className="bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-800 shadow-2xl">
          <h2 className="text-2xl font-bold mb-8 uppercase tracking-tighter text-slate-100">Reserve Service</h2>
          
          <div className="flex gap-2 p-1 bg-zinc-950 rounded-2xl mb-8 border border-zinc-800/50 overflow-x-auto relative">
            {(['game', 'carWash', 'badminton', 'theatre', 'cafe'] as BookingType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setResourceId('');
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap relative z-10 ${
                  activeTab === tab ? 'text-zinc-950' : 'text-zinc-500 hover:text-slate-300'
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTabBadge"
                    className="absolute inset-0 bg-accent rounded-xl z-[-1]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {tab === 'game' && <Gamepad2 size={14} />}
                {tab === 'carWash' && <Car size={14} />}
                {tab === 'badminton' && <Trophy size={14} />}
                {tab === 'theatre' && <Monitor size={14} />}
                {tab === 'cafe' && <Coffee size={14} />}
                {tab === 'carWash' ? 'Luxe Detailing' : tab.replace(/([A-Z])/g, ' $1')}
              </button>
            ))}
          </div>

          <form onSubmit={handleBooking} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Selected Service</label>
              <select 
                required
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                className="input-field"
              >
                <option value="">Select an option</option>
                {activeTab === 'game' && Object.values(RATES.GAMES).map(g => (
                  <option key={g.name} value={g.name}>{g.name} (₹{g.rate}/hr)</option>
                ))}
                {activeTab === 'carWash' && RATES.CAR_WASH.map(w => (
                  <option key={w.type} value={w.type}>{w.type} (₹{w.price})</option>
                ))}
                {activeTab === 'badminton' && (
                  <>
                    <option value="1 Hour">1 Hour (₹{RATES.BADMINTON.rate1h})</option>
                    <option value="2 Hours">2 Hours (₹{RATES.BADMINTON.rate2h})</option>
                  </>
                )}
                {activeTab === 'theatre' && (
                  <>
                    <option value="1 Hour">1 Hour (₹{RATES.THEATRE.rate1h})</option>
                    <option value="2 Hours">2 Hours (₹{RATES.THEATRE.rate2h})</option>
                    <option value="5 Hours">5 Hours (₹{RATES.THEATRE.rate5h})</option>
                    <option value="Get Together Party">Get Together Party (₹{RATES.THEATRE.getTogether})</option>
                  </>
                )}
                {activeTab === 'cafe' && (
                  <>
                    <option value="Regular Table">Regular Table (₹{RATES.CAFE.tableBooking})</option>
                    <option value="Booth Seating">Booth Seating (₹{RATES.CAFE.tableBooking})</option>
                    <option value="Outdoor Terrace">Outdoor Terrace (₹{RATES.CAFE.tableBooking})</option>
                  </>
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3.5 text-zinc-600" size={18} />
                  <input 
                    type="date" 
                    required
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-field pl-12"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">
                  Time Slot
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-3.5 text-zinc-600 z-10" size={18} />
                  {activeTab === 'theatre' || activeTab === 'badminton' || activeTab === 'cafe' ? (
                    <select 
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="input-field pl-12"
                    >
                      <option value="">Select slot</option>
                      {(activeTab === 'theatre' ? THEATRE_HOURS : activeTab === 'cafe' ? [AURA_CAFE_HOURS] : BADMINTON_HOURS).map((range, idx) => (
                        <optgroup key={`${activeTab}-group-${idx}`} label={activeTab === 'cafe' ? 'Available Hours' : `Session ${idx + 1}`}>
                          {generateTimeSlots(range.open, range.close).map(slot => (
                            <option key={`${activeTab}-slot-${slot}-${idx}`} value={slot}>
                              {parseInt(slot.split(':')[0]) > 12 
                                ? `${parseInt(slot.split(':')[0]) - 12}:00 PM` 
                                : parseInt(slot.split(':')[0]) === 12 
                                  ? '12:00 PM' 
                                  : `${slot} AM`}
                            </option>
                          ))}
                         </optgroup>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="time" 
                      required
                      min={activeTab === 'carWash' ? '09:30' : '10:00'}
                      max={activeTab === 'carWash' ? '19:30' : '22:00'}
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="input-field pl-12"
                    />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'carWash' && activePendingBooking && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-5 bg-red-500/10 border border-red-500/20 rounded-3xl mb-8 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-20">
                    <AlertCircle size={40} className="text-red-500" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Active Pending Reservation</p>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-black text-white uppercase italic leading-none">{activePendingBooking.resourceName}</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                          {activePendingBooking.date} @ {activePendingBooking.startTime}
                        </p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleCancelBooking(activePendingBooking)}
                        className="px-5 py-2.5 bg-red-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 active:scale-95"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'carWash' && (
                <motion.div 
                  key="carWashForm"
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "circOut" }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Vehicle No.</label>
                      <input 
                        type="text" 
                        placeholder="TS XX XX XXXX"
                        required
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        className="input-field" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Year</label>
                      <input 
                        type="number" 
                        placeholder="2024"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        required
                        value={vehicleYear}
                        onChange={(e) => setVehicleYear(e.target.value)}
                        className="input-field" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Make</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Tesla"
                        required
                        value={vehicleMake}
                        onChange={(e) => setVehicleMake(e.target.value)}
                        className="input-field" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Model</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Model 3"
                        required
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        className="input-field" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Vehicle Photo</label>
                    <div className="space-y-4">
                      <div className="relative group h-20">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-full h-full rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/50 flex items-center justify-center gap-3 transition-all group-hover:border-accent/40 group-hover:bg-zinc-950">
                          <div className="p-2 bg-zinc-900 rounded-full text-zinc-600 group-hover:text-amber-500 transition-colors">
                            <Upload size={18} />
                          </div>
                          <div className="text-left">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Upload Vehicle Image</p>
                            <p className="text-[8px] text-zinc-600 mt-1 uppercase">JPG or PNG (Max 800KB)</p>
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {vehiclePhotoUrl && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative group aspect-video rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 p-2"
                          >
                            <img src={vehiclePhotoUrl} alt="Preview" className="w-full h-full object-cover rounded-[1.25rem]" />
                            <div className="absolute inset-2 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 rounded-[1.25rem]">
                              <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-1">Preview Selection</p>
                              <p className="text-xs font-bold text-white uppercase italic">
                                {vehicleMake || vehicleModel ? `${vehicleMake} ${vehicleModel}` : 'Vehicle Evidence'} {vehicleYear ? `'${vehicleYear.slice(-2)}` : ''}
                              </p>
                            </div>
                            <button 
                              type="button"
                              onClick={() => setVehiclePhotoUrl(null)}
                              className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-full text-zinc-400 hover:text-white transition-all border border-white/10"
                            >
                              <AlertCircle size={14} className="rotate-45" />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>



            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Contact Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 text-zinc-600" size={18} />
                <input 
                  type="tel" 
                  placeholder="Your mobile number"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="input-field pl-12" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Special Discount Eligibility</label>
              <select 
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="input-field cursor-pointer"
              >
                <option value="">No Special Discount</option>
                <option value="College Student">College Student (10% Off)</option>
                <option value="Medical Student">Medical Student (10% Off)</option>
                <option value="Doctor">Doctor (10% Off)</option>
                <option value="Teacher">Teacher (10% Off)</option>
              </select>
              {discountType && (
                <p className="mt-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-wider px-1">
                  🎉 10% discount applied! Please present physical ID verification at check-in.
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">
                Verification Details / Notes <span className="text-zinc-600 font-medium lowercase italic">(optional)</span>
              </label>
              <textarea 
                placeholder={discountType ? "Enter student ID, institute name, or professional registration details..." : "Enter extra notes or special requests..."}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="input-field py-3 resize-none" 
              />
            </div>

            {/* Pristine Pricing Breakdown Panel */}
            {resourceId && (
              <div className="p-5 bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800 rounded-3xl space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <IndianRupee size={48} className="text-emerald-500" />
                </div>
                
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-0.5">Estimated Charges</h3>
                
                <div className="space-y-2 text-xs divide-y divide-zinc-900/50">
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Base Fare ({getBookingPriceDetails().resourceName})</span>
                    <span className="font-bold">₹{getBookingPriceDetails().basePrice}</span>
                  </div>
                  
                  {discountType && (
                    <div className="flex justify-between items-center text-emerald-400 pt-2 font-semibold">
                      <span>Special 10% Discount ({discountType})</span>
                      <span>-₹{getBookingPriceDetails().discount}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-white pt-2 font-black text-sm">
                    <span className="uppercase tracking-wide">Total Payable</span>
                    <span className="text-emerald-500 italic">₹{getBookingPriceDetails().finalPrice}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
              <div className="flex items-center gap-2 mb-3 text-amber-500">
                <AlertCircle size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Cancellation Policy</span>
              </div>
              <ul className="text-[9px] text-zinc-500 space-y-1 mb-4 font-medium uppercase tracking-wider list-disc pl-3">
                <li>Rescheduling is subject to availability and hub discretion.</li>
              </ul>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    required
                    checked={policyAccepted}
                    onChange={(e) => setPolicyAccepted(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center transition-all peer-checked:bg-accent peer-checked:border-accent">
                    <CheckCircle2 size={12} className="text-zinc-950 opacity-0 peer-checked:opacity-100" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-zinc-400 group-hover:text-slate-200 transition-colors uppercase tracking-tight">
                  I acknowledge the cancellation policy
                </span>
              </label>
            </div>

            <div className="flex gap-4 mt-8">
              <button 
                type="button" 
                onClick={resetForm}
                className="flex-1 h-14 bg-zinc-950 border border-zinc-800 text-zinc-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-red-500/40 hover:text-red-500 transition-all flex items-center justify-center gap-2 group"
              >
                <X size={14} className="group-hover:rotate-90 transition-transform" />
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading || !policyAccepted}
                className="flex-[2] h-14 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                ) : (
                  <>Confirm Reservation <ChevronRight size={18} /></>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bookings List */}
      <div className="lg:col-span-7">
        {activeTab === 'badminton' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl mb-8 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-350"
          >
            {/* Ambient Background Radial Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-zinc-800 pb-6">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-tighter text-slate-100 flex items-center gap-2">
                  <Trophy size={20} className="text-indigo-400" />
                  Badminton Availability Board
                </h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                  Only 1 Court available — View booked slots in real-time
                </p>
              </div>
              <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-1 px-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Free</span>
                </div>
                <div className="flex items-center gap-1 px-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  </span>
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Partial</span>
                </div>
                <div className="flex items-center gap-1 px-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  </span>
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Full</span>
                </div>
              </div>
            </div>

            {/* Monthly Calendar View */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-sm font-black text-slate-100 uppercase tracking-widest italic">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </span>
                <div className="flex gap-1">
                  <button 
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-2 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    type="button"
                    onClick={handleNextMonth}
                    className="p-2 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {DAYS_OF_WEEK.map(d => (
                  <div key={d} className="text-[9px] font-black text-zinc-650 uppercase tracking-widest py-1">
                    {d}
                  </div>
                ))}
                
                {Array(firstDayIndex).fill(null).map((_, i) => (
                  <div key={`blank-${i}`} className="aspect-square bg-zinc-950/20 border border-transparent rounded-2xl" />
                ))}

                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const dayStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                  const isSelected = date === dayStr;
                  const todayStr = new Date().toISOString().split('T')[0];
                  const isPast = dayStr < todayStr;
                  const status = getDayAvailabilityStatus(dayStr);
                  
                  return (
                    <button
                      key={`day-${day}`}
                      type="button"
                      disabled={isPast}
                      onClick={() => {
                        setDate(dayStr);
                      }}
                      className={`relative aspect-square rounded-[1.25rem] border transition-all flex flex-col items-center justify-center cursor-pointer ${
                        isPast 
                          ? 'bg-zinc-950/10 border-transparent text-zinc-800 cursor-not-allowed'
                          : isSelected
                            ? 'bg-accent border-accent text-zinc-950 font-black scale-105'
                            : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900 font-bold'
                      }`}
                    >
                      <span className="text-xs">{day}</span>
                      
                      {!isPast && (
                        <span className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${
                          status === 'free' 
                            ? 'bg-emerald-500/40' 
                            : status === 'partial' 
                              ? 'bg-amber-500' 
                              : 'bg-indigo-500'
                        }`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Hourly Courts Timeline */}
            <div className="border-t border-zinc-800 pt-6">
              <div className="mb-4">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">
                  Timeline for selected date
                </span>
                <h4 className="text-sm font-black text-slate-100 uppercase tracking-tight italic flex items-center gap-2">
                  <Calendar size={14} className="text-zinc-500" />
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h4>
              </div>

              <div className="space-y-4">
                {/* Court Elite Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-3 flex items-center gap-2">
                    <span className="w-1.5 h-5 rounded-full bg-indigo-500" />
                    <div>
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 leading-none">Court Elite (A)</h5>
                      <span className="text-[8px] text-zinc-600 font-bold uppercase mt-0.5 block tracking-widest font-mono">Premium Synthetic</span>
                    </div>
                  </div>
                  <div className="md:col-span-9 grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {BADMINTON_SLOTS.map(slot => {
                      const slotHour = parseInt(slot.split(':')[0]);
                      const activeBStr = allBadmintonBookings.filter(b => b.date === date && b.status !== 'cancelled');
                      const overlapping = activeBStr.filter(b => {
                        const startH = parseInt(b.startTime.split(':')[0]);
                        const dur = b.duration || 1;
                        return slotHour >= startH && slotHour < startH + dur;
                      });
                      
                      const bookingA = overlapping[0];
                      const isBooked = !!bookingA;
                      const isOwn = isBooked && bookingA.userId === user?.uid;
                      const isSelected = isSlotSelectedInForm(slot);

                      return (
                        <button
                          key={`court-a-${slot}`}
                          type="button"
                          disabled={isBooked && !isOwn}
                          onClick={() => {
                            if (!isBooked) {
                              setStartTime(slot);
                              if (!resourceId) setResourceId('1 Hour');
                            }
                          }}
                          className={`h-11 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${isBooked && !isOwn ? '' : 'cursor-pointer'} flex flex-col items-center justify-center relative select-none ${
                            isBooked
                              ? isOwn
                                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-100 shadow-md ring-1 ring-indigo-500/20'
                                : 'bg-zinc-950 border-zinc-900/40 text-zinc-700 opacity-50'
                              : isSelected
                                ? 'bg-accent border-accent text-zinc-950 font-black shadow-md'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:bg-zinc-900 hover:text-slate-200'
                          }`}
                        >
                          <span>
                            {parseInt(slot.split(':')[0]) > 12 
                              ? `${parseInt(slot.split(':')[0]) - 12} PM` 
                              : parseInt(slot.split(':')[0]) === 12 
                                ? '12 PM' 
                                : `${parseInt(slot.split(':')[0])} AM`}
                          </span>
                          <span className={`text-[7px] mt-0.5 font-bold ${
                            isBooked
                              ? isOwn
                                ? 'text-indigo-300 font-extrabold pb-0.5'
                                : 'text-zinc-850'
                              : isSelected
                                ? 'text-zinc-900 font-extrabold pb-0.5'
                                : 'text-zinc-650'
                          }`}>
                            {isBooked ? (isOwn ? 'Mine' : 'Full') : (isSelected ? 'Selected' : 'Book')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>


              </div>
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold uppercase tracking-tighter text-slate-100">
            {historyTab === 'active' ? 'Active Sessions' : 'Booking History'}
          </h2>
          <div className="flex items-center gap-4">
            {historyTab === 'history' && myBookings.some(b => ['completed', 'cancelled'].includes(b.status)) && (
              <button
                onClick={handleClearHistory}
                disabled={isClearing}
                className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors py-2 px-3 rounded-xl hover:bg-red-500/10 font-black text-[9px] uppercase tracking-widest disabled:opacity-50"
              >
                {isClearing ? 'Clearing...' : (
                  <>
                    <Trash2 size={12} />
                    Clear History
                  </>
                )}
              </button>
            )}
            <div className="flex gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800/50 relative">
            {(['active', 'history'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setHistoryTab(t)}
                className={`py-1.5 px-6 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all relative z-10 ${
                  historyTab === t ? 'text-accent font-black' : 'text-zinc-500'
                }`}
              >
                {historyTab === t && (
                  <motion.div
                    layoutId="activeHistoryToggle"
                    className="absolute inset-0 bg-zinc-800 rounded-lg z-[-1]"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
        
        {/* Service Type Filter Chips */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-zinc-950/60 rounded-2xl mb-8 border border-zinc-800/40 items-center">
          <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 pl-3 pr-1.5 select-none whitespace-nowrap">Filter By:</span>
          {(['all', 'game', 'carWash', 'badminton', 'theatre', 'cafe'] as const).map((filterVal) => {
            const isSelected = selectedServiceFilter === filterVal;
            const label = filterVal === 'all' ? 'All Services' :
                          filterVal === 'game' ? 'Games' :
                          filterVal === 'carWash' ? 'Car Wash' :
                          filterVal === 'badminton' ? 'Badminton' :
                          filterVal === 'theatre' ? 'Theatre' : 'Cafe';
            
            const Icon = filterVal === 'all' ? Calendar :
                         filterVal === 'game' ? Gamepad2 :
                         filterVal === 'carWash' ? Car :
                         filterVal === 'badminton' ? Trophy :
                         filterVal === 'theatre' ? Monitor : Coffee;

            return (
              <button
                key={filterVal}
                onClick={() => setSelectedServiceFilter(filterVal)}
                className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all whitespace-nowrap relative ${
                  isSelected 
                    ? 'text-zinc-950 font-black' 
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="selectedServiceFilterBackground"
                    className="absolute inset-0 bg-accent rounded-xl z-0"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon size={12} className={isSelected ? 'text-zinc-950' : 'text-zinc-500 group-hover:text-zinc-300'} />
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {myBookings.filter(b => {
          const tabMatch = historyTab === 'active' 
            ? ['pending', 'ongoing'].includes(b.status)
            : ['completed', 'cancelled'].includes(b.status);
          const filterMatch = selectedServiceFilter === 'all' || b.type === selectedServiceFilter;
          return tabMatch && filterMatch;
        }).length === 0 ? (
          historyTab === 'active' ? (
            <div className="bg-zinc-900 border border-zinc-800/60 rounded-[2.5rem] p-12 flex flex-col items-center justify-center relative overflow-hidden transition-all hover:border-zinc-750">
              {/* Subtle background glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
              
              {/* Decorative concentric circles */}
              <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-dashed border-zinc-800 animate-spin" style={{ animationDuration: '40s' }} />
                <div className="absolute inset-2 rounded-full border border-zinc-800/80" />
                <div className="absolute inset-4 rounded-full border border-dashed border-zinc-850 animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }} />
                <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center shadow-lg relative z-10 text-sky-400">
                  <Calendar size={20} className="animate-pulse" />
                </div>
                {/* Accent dots */}
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-sky-500/30" />
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500/30" />
              </div>
              
              <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest mb-1.5">
                No {selectedServiceFilter !== 'all' ? (selectedServiceFilter === 'carWash' ? 'Car Wash' : selectedServiceFilter) : ''} Active Sessions
              </h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider max-w-xs mx-auto leading-relaxed text-center">
                You have no pending or ongoing {selectedServiceFilter !== 'all' ? (selectedServiceFilter === 'carWash' ? 'car wash' : selectedServiceFilter) : ''} bookings right now. Use the form on the left to schedule a new one.
              </p>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800/60 rounded-[2.5rem] p-12 flex flex-col items-center justify-center relative overflow-hidden transition-all hover:border-zinc-750">
              {/* Subtle background glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              
              {/* Layered receipt/history silhouette */}
              <div className="relative w-28 h-24 mb-6 flex items-center justify-center">
                {/* Back card */}
                <div className="absolute w-14 h-16 bg-zinc-950/40 border border-zinc-850 rounded-xl transform -rotate-12 translate-x-[-12px] opacity-40" />
                {/* Forward card */}
                <div className="absolute w-14 h-16 bg-zinc-950/60 border border-zinc-800 rounded-xl transform rotate-12 translate-x-[12px] opacity-60" />
                {/* Front main card */}
                <div className="absolute w-16 h-18 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl flex flex-col justify-between p-2.5 z-10 transform scale-105">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
                    <span className="w-5 h-1 bg-zinc-800 rounded-full" />
                    <span className="w-2 h-2 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <span className="w-1 h-1 rounded-full bg-amber-200" />
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="block w-10 h-0.5 bg-zinc-850 rounded-full" />
                    <span className="block w-8 h-0.5 bg-zinc-850 rounded-full" />
                    <span className="block w-6 h-0.5 bg-zinc-850 rounded-full" />
                  </div>
                  <div className="flex justify-end pt-1 border-t border-zinc-900">
                    <span className="w-4 h-1 bg-zinc-800 rounded-full" />
                  </div>
                </div>
                {/* Overlay clock icon */}
                <div className="absolute bottom-1 right-2 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-500 z-20 shadow-md">
                  <Clock size={12} className="animate-pulse" />
                </div>
              </div>
              
              <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest mb-1.5">
                {selectedServiceFilter !== 'all' ? (selectedServiceFilter === 'carWash' ? 'Car Wash' : selectedServiceFilter) : ''} History Empty
              </h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider max-w-xs mx-auto leading-relaxed text-center">
                You do not have any past completed or cancelled {selectedServiceFilter !== 'all' ? (selectedServiceFilter === 'carWash' ? 'car wash' : selectedServiceFilter) : ''} sessions under this account yet.
              </p>
            </div>
          )
        ) : (
          <motion.div layout className="space-y-4">
            <AnimatePresence mode="popLayout">
              {myBookings
                .filter(b => {
                  const tabMatch = historyTab === 'active' 
                    ? ['pending', 'ongoing'].includes(b.status)
                    : ['completed', 'cancelled'].includes(b.status);
                  const filterMatch = selectedServiceFilter === 'all' || b.type === selectedServiceFilter;
                  return tabMatch && filterMatch;
                })
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((booking, idx) => (
                <motion.div 
                  key={booking.id ? `mybook-${booking.id}-${idx}` : `mybook-${idx}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="bg-zinc-900 rounded-[2rem] p-6 shadow-sm border border-zinc-800 hover:border-accent/40 transition-all"
                >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      booking.type === 'game' ? 'bg-blue-500/10 text-blue-400' :
                      booking.type === 'carWash' ? 'bg-emerald-500/10 text-emerald-400' : 
                      booking.type === 'badminton' ? 'bg-indigo-500/10 text-indigo-400' : 
                      booking.type === 'cafe' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {booking.type === 'game' ? <Gamepad2 size={24} /> :
                       booking.type === 'carWash' ? <Car size={24} /> : 
                       booking.type === 'badminton' ? <Trophy size={24} /> : 
                       booking.type === 'cafe' ? <Coffee size={24} /> : <Monitor size={24} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-slate-100 italic uppercase tracking-tight">{booking.resourceName}</h4>
                      <div className="flex items-center gap-4 mt-1 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {booking.date}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {booking.startTime}</span>
                      </div>
                      {booking.discountType && (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest mt-2">
                          🌱 {booking.discountType} (10% Off)
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-xl italic text-slate-100">₹{booking.price}</span>
                      {booking.status === 'pending' && historyTab === 'active' && (
                        <button 
                          onClick={() => handleCancelBooking(booking)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-500 transition-all hover:text-white group"
                          title="Cancel Booking"
                        >
                          <X size={12} className="group-hover:rotate-90 transition-transform" />
                          Cancel
                        </button>
                      )}
                      {historyTab === 'history' && (
                        <button 
                          onClick={() => handleDeleteBooking(booking.id!)}
                          className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* QR Code Actions */}
                {!['completed', 'cancelled'].includes(booking.status) && (
                  <div className="mt-4">
                    <button 
                      onClick={() => {
                        setShowQR(showQR === booking.id ? null : booking.id!);
                      }}
                      className="w-full py-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center gap-3 hover:border-accent/40 transition-all group/qr"
                    >
                      <QrCode size={18} className="text-zinc-600 group-hover/qr:text-accent transition-colors" />
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover/qr:text-slate-100">
                        {showQR === booking.id ? 'Hide ID' : 'Check-in QR'}
                      </span>
                    </button>
                  </div>
                )}

                <AnimatePresence>
                  {showQR === booking.id && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, height: 0 }}
                      animate={{ opacity: 1, scale: 1, height: 'auto' }}
                      exit={{ opacity: 0, scale: 0.95, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 p-8 bg-white rounded-3xl flex flex-col items-center justify-center shadow-2xl">
                          <QRCodeSVG 
                            value={booking.id!} 
                            size={200}
                            level="H"
                            includeMargin={true}
                          />
                          <p className="mt-6 text-[10px] font-black text-zinc-900 uppercase tracking-[0.2em] text-center">
                            Scan at the hub counter to check-in
                          </p>
                          <div className="mt-2 text-[8px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                            Booking ID: {booking.id?.slice(-8).toUpperCase()}
                          </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>


                 {booking.vehicleNumber && (
                    <div className="mt-4 pt-4 border-t border-zinc-800">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">
                        <div className="flex flex-col">
                          <span className="text-zinc-600 mb-1">Vehicle NO.</span>
                          <span className="text-slate-300">{booking.vehicleNumber}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-zinc-600 mb-1">Make</span>
                          <span className="text-slate-300">{booking.vehicleMake || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-zinc-600 mb-1">Model</span>
                          <span className="text-slate-300">{booking.vehicleModel}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-zinc-600 mb-1">Year</span>
                          <span className="text-slate-300">{booking.vehicleYear || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                 )}

                {booking.notes && (
                  <div className="mt-4 p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2 text-zinc-500">
                      <FileText size={12} />
                      <span className="text-[8px] font-black uppercase tracking-widest">Inspection Notes</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed font-medium">{booking.notes}</p>
                  </div>
                )}

                {booking.vehiclePhotoUrl && (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-800">
                     <img 
                       src={booking.vehiclePhotoUrl} 
                       alt="Vehicle Evidence" 
                       className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                       onClick={() => window.open(booking.vehiclePhotoUrl, '_blank')}
                     />
                  </div>
                )}
              </motion.div>
            ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      <AnimatePresence>
        {bookingToCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => setBookingToCancel(null)}
            />
            
            {/* Modal content body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
              className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden z-10"
            >
              {/* Subtle warning glow */}
              <div className="absolute top-0 right-1/4 w-32 h-32 bg-red-500/10 rounded-full blur-[64px] pointer-events-none" />
              
              <div className="flex flex-col items-center text-center">
                {/* Visual warning icon */}
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-3xl flex items-center justify-center text-red-500 mb-6">
                  <AlertCircle size={32} />
                </div>
                
                <h3 className="text-xl font-black text-slate-100 uppercase tracking-wider mb-2">Cancel Booking?</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed mb-6">
                  This action is subject to our standard cancellation policy.
                </p>
                
                {/* Booking Details Card inside Modal */}
                <div className="w-full bg-zinc-900/60 border border-zinc-850/60 rounded-2xl p-4 mb-8 text-left space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      bookingToCancel.type === 'game' ? 'bg-blue-500/10 text-blue-400' :
                      bookingToCancel.type === 'carWash' ? 'bg-emerald-500/10 text-emerald-400' : 
                      bookingToCancel.type === 'badminton' ? 'bg-indigo-500/10 text-indigo-400' : 
                      bookingToCancel.type === 'cafe' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {bookingToCancel.type === 'game' ? <Gamepad2 size={20} /> :
                       bookingToCancel.type === 'carWash' ? <Car size={20} /> : 
                       bookingToCancel.type === 'badminton' ? <Trophy size={20} /> : 
                       bookingToCancel.type === 'cafe' ? <Coffee size={20} /> : <Monitor size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100 uppercase tracking-tight italic">{bookingToCancel.resourceName}</h4>
                      <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">
                        {bookingToCancel.type === 'carWash' ? 'Car Wash' : bookingToCancel.type} Service
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-850/50 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <div>
                      <span className="text-[8px] text-zinc-650 block mb-0.5">Date</span>
                      <span className="text-slate-300 flex items-center gap-1.5"><Calendar size={11} className="text-zinc-500" /> {bookingToCancel.date}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-zinc-650 block mb-0.5">Time</span>
                      <span className="text-slate-300 flex items-center gap-1.5"><Clock size={11} className="text-zinc-500" /> {bookingToCancel.startTime}</span>
                    </div>
                  </div>
                </div>
                
                {/* Modal Actions */}
                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => setBookingToCancel(null)}
                    disabled={cancellingId !== null}
                    className="w-full py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-750 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                  >
                    Keep Booking
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (bookingToCancel.id) {
                        setCancellingId(bookingToCancel.id);
                        try {
                          await bookingService.updateBookingStatus(bookingToCancel.id, 'cancelled');
                          setBookingToCancel(null);
                        } catch (error) {
                          console.error(error);
                          alert('Failed to cancel booking.');
                        } finally {
                          setCancellingId(null);
                        }
                      }
                    }}
                    disabled={cancellingId !== null}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-slate-100 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all hover:shadow-lg hover:shadow-red-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {cancellingId === bookingToCancel.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-slate-100 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Confirm Cancel'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Bookings;
