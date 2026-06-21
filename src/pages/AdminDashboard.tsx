import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { bookingService } from '../services/bookingService';
import { attendanceService } from '../services/attendanceService';
import { cafeService } from '../services/cafeService';
import { playVoice } from '../services/voiceService';
import { Booking, BookingStatus, BookingType, Worker, Attendance, StaffSchedule, CafeMenuItem } from '../types';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  PlayCircle, 
  Search,
  Filter,
  MapPin,
  ChevronDown,
  QrCode,
  Scan,
  IndianRupee,
  Lock,
  ArrowRight,
  ShieldAlert,
  CreditCard,
  Banknote,
  Smartphone,
  Phone,
  Mail,
  User,
  Info,
  Bell,
  BellRing,
  Trash2,
  Gamepad2,
  Car,
  Trophy,
  Monitor,
  Coffee,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserMinus,
  Briefcase,
  Plus,
  AlertTriangle,
  CameraOff,
  Fingerprint,
  Activity,
  History,
  Wifi,
  Volume2,
  VolumeX,
  Terminal,
  Download,
  Timer,
  HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PaymentQR from '../components/PaymentQR';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'new' | 'update' | 'cancel';
  time: number;
}

interface RecentScanItem {
  id: string;
  time: string;
  resourceName: string;
  userName: string;
  type: string;
}

const getServiceDisplayName = (type: string) => {
  const types: Record<string, string> = {
    'game': 'Game',
    'carWash': 'Car Wash',
    'badminton': 'Badminton',
    'theatre': 'Theatre',
    'cafe': 'Cafe'
  };
  return types[type] || type;
};

const getServiceIcon = (type: string, size = 20) => {
  switch (type) {
    case 'game': return <Gamepad2 size={size} />;
    case 'carWash': return <Car size={size} />;
    case 'badminton': return <Trophy size={size} />;
    case 'theatre': return <Monitor size={size} />;
    case 'cafe': return <Coffee size={size} />;
    default: return <Users size={size} />;
  }
};

const getServiceColor = (type: string) => {
  switch (type) {
    case 'game': return 'bg-blue-500';
    case 'carWash': return 'bg-accent';
    case 'badminton': return 'bg-emerald-500';
    case 'theatre': return 'bg-purple-500';
    case 'cafe': return 'bg-amber-500';
    default: return 'bg-zinc-500';
  }
};

const getServiceTextColor = (type: string) => {
  switch (type) {
    case 'game': return 'text-blue-500';
    case 'carWash': return 'text-accent';
    case 'badminton': return 'text-emerald-500';
    case 'theatre': return 'text-purple-500';
    case 'cafe': return 'text-amber-500';
    default: return 'text-zinc-500';
  }
};

interface SessionCountdownProps {
  checkedInAt?: number;
  duration: number; // in hours
}

const SessionCountdown: React.FC<SessionCountdownProps> = ({ checkedInAt, duration }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isOvertime, setIsOvertime] = useState<boolean>(false);
  const [percentRemaining, setPercentRemaining] = useState<number>(100);

  useEffect(() => {
    if (!checkedInAt) {
      setTimeLeft('—');
      return;
    }

    const durationMs = duration * 60 * 60 * 1000;
    const targetTime = checkedInAt + durationMs;

    const calculateTime = () => {
      const now = Date.now();
      const diff = targetTime - now;

      // Percentage calculation (max 100, min 0)
      const percent = Math.max(0, Math.min(100, (diff / durationMs) * 100));
      setPercentRemaining(percent);

      if (diff <= 0) {
        setIsOvertime(true);
        const absDiff = Math.abs(diff);
        const hours = Math.floor(absDiff / (1000 * 60 * 60));
        const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);
        
        const pad = (n: number) => n.toString().padStart(2, '0');
        setTimeLeft(`+${hours > 0 ? `${hours}:` : ''}${pad(minutes)}:${pad(seconds)}`);
      } else {
        setIsOvertime(false);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const pad = (n: number) => n.toString().padStart(2, '0');
        setTimeLeft(`${hours > 0 ? `${hours}:` : ''}${pad(minutes)}:${pad(seconds)}`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [checkedInAt, duration]);

  if (!checkedInAt) {
    return (
      <div className="flex items-center gap-1.5 text-zinc-650 font-mono text-[9px] mt-2">
        <Timer size={11} />
        <span>No start timestamp</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-1 mt-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 font-black uppercase tracking-widest text-[8px] text-zinc-500">
          <Timer size={10} className={isOvertime ? "text-red-500 animate-pulse" : "text-sky-400"} />
          <span className={isOvertime ? "text-red-400" : ""}>{isOvertime ? "Session Overtime" : "Time Left"}</span>
        </div>
        <span className={`font-mono text-[10px] font-black tracking-wider leading-none ${isOvertime ? "text-red-500 animate-pulse" : "text-sky-400"}`}>
          {timeLeft}
        </span>
      </div>
      
      {/* Premium progress bar progression tracking */}
      <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900 flex p-[0.5px]">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isOvertime 
              ? 'bg-red-500 animate-pulse' 
              : percentRemaining > 50 
                ? 'bg-sky-500' 
                : percentRemaining > 15 
                  ? 'bg-amber-400' 
                  : 'bg-orange-500 animate-pulse'
          }`}
          style={{ width: `${isOvertime ? 100 : percentRemaining}%` }}
        />
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const bookingsRef = React.useRef<Booking[]>([]);

  useEffect(() => {
    bookingsRef.current = bookings;
  }, [bookings]);

  const [filter, setFilter] = useState<BookingStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<BookingType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [assignBayBookingId, setAssignBayBookingId] = useState<string | null>(null);
  const [showAdminPaymentQR, setShowAdminPaymentQR] = useState<{ amount?: number; bookingId?: string } | boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<'blocked' | 'notFound' | null>(null);
  const [showScannerHelp, setShowScannerHelp] = useState(false);
  const [scannedBooking, setScannedBooking] = useState<Booking | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [successAnimationId, setSuccessAnimationId] = useState<string | null>(null);
  const [alertsEnabled, setAlertsEnabled] = useState(() => {
    return localStorage.getItem('system_alerts_enabled') !== 'false';
  });

  const toggleAlerts = () => {
    const newValue = !alertsEnabled;
    setAlertsEnabled(newValue);
    localStorage.setItem('system_alerts_enabled', String(newValue));
  };
  
  // Security State
  const [isVerified, setIsVerified] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentScans, setRecentScans] = useState<RecentScanItem[]>([]);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'upcoming' | 'last7' | 'custom'>('all');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [activeView, setActiveView] = useState<'bookings' | 'payments' | 'calendar' | 'workers' | 'cafeMenu' | 'monitor'>('monitor');
  const [monitorLogs, setMonitorLogs] = useState<{ id: string; time: string; message: string; type: 'info' | 'success' | 'warn' | 'error' }[]>([]);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [viewDate, setViewDate] = useState(new Date());
  
  // Workers Attendance State
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [schedules, setSchedules] = useState<StaffSchedule[]>([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [workerSubView, setWorkerSubView] = useState<'attendance' | 'schedule'>('attendance');
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [newWorker, setNewWorker] = useState({ 
    name: '', 
    role: '', 
    contact: '', 
    workerCode: '',
    joiningDate: new Date().toISOString().split('T')[0] 
  });
  const [newSchedule, setNewSchedule] = useState<Omit<StaffSchedule, 'id' | 'createdAt'>>({
    workerId: '',
    workerName: '',
    workerRole: '',
    date: new Date().toISOString().split('T')[0],
    shift: 'morning',
    serviceType: undefined,
    notes: ''
  });
  const [isSubmittingWorker, setIsSubmittingWorker] = useState(false);
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);

  // Cafe Menu State
  const [menuItems, setMenuItems] = useState<CafeMenuItem[]>([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<CafeMenuItem | null>(null);
  const [newMenuItem, setNewMenuItem] = useState({ name: '', category: '', price: 0, imageUrl: '', isAvailable: true });
  const [isSubmittingMenu, setIsSubmittingMenu] = useState(false);

  useEffect(() => {
    let scanner: any = null;
    let isMounted = true;

    if (isScannerOpen) {
      const checkAndStartCamera = async () => {
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            if (isMounted) setCameraError('notFound');
            return;
          }

          const devices = await navigator.mediaDevices.enumerateDevices();
          const hasCamera = devices.some(device => device.kind === 'videoinput');

          if (!hasCamera) {
            if (isMounted) setCameraError('notFound');
            return;
          }

          // Test access
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            if (isMounted) setCameraError(null);
          } catch (err: any) {
            console.log("Camera userMedia error:", err);
            if (isMounted) {
              if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.name === 'SecurityError') {
                setCameraError('blocked');
              } else {
                setCameraError('notFound');
              }
            }
          }
        } catch (err) {
          if (isMounted) setCameraError('blocked');
        }

        try {
          scanner = new Html5QrcodeScanner(
            "qr-reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
          );

          const onScanSuccess = (decodedText: string) => {
            handleScanResult(decodedText);
            scanner.clear();
          };

          const onScanFailure = (error: any) => {
            // quiet fail
          };

          scanner.render(onScanSuccess, onScanFailure);
          if (isMounted) setIsCameraActive(true);
        } catch (err) {
          console.error("Scanner render fail:", err);
          if (isMounted) setCameraError('blocked');
        }
      };

      checkAndStartCamera();

      return () => {
        isMounted = false;
        setIsCameraActive(false);
        setCameraError(null);
        if (scanner) {
          scanner.clear().catch(err => console.log("Failed to clear scanner", err));
        }
      };
    }
  }, [isScannerOpen]);

  const handleScanResult = (result: string) => {
    setIsScannerOpen(false);
    
    const scannedId = result.trim();
    if (!scannedId) return;

    // Look up the booking matching this ID (case-insensitive)
    const found = bookingsRef.current.find(b => b.id === scannedId || b.id?.toLowerCase() === scannedId.toLowerCase());
    
    if (found) {
      setScannedBooking(found);
      setScanError(null);
      
      try {
        const successAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/911/911-preview.mp3');
        successAudio.volume = 0.5;
        successAudio.play().catch(e => console.log('Audio play failed:', e));
      } catch (err) {
        console.error('Audio error:', err);
      }
      
      if (alertsEnabled) {
        playVoice(`Ticket identified for ${found.userName}.`, 'Zephyr');
      }

      // Save to recent scans list (keep last 5)
      const nowScanTime = new Date().toLocaleTimeString();
      setRecentScans(prev => [
        {
          id: found.id || Math.random().toString(36).substring(2, 9),
          time: nowScanTime,
          resourceName: found.resourceName || 'Unknown Resource',
          userName: found.userName || 'Guest',
          type: found.type,
        },
        ...prev
      ].slice(0, 5));

      // Record to Monitor Logs
      const logId = Math.random().toString(36).substring(2, 9);
      const nowStr = new Date().toLocaleTimeString();
      setMonitorLogs(prev => [
        {
          id: logId,
          time: nowStr,
          message: `🔍 Identified: ${found.userName} (${getServiceDisplayName(found.type)} - ${found.resourceName})`,
          type: 'success'
        },
        ...prev
      ]);
    } else {
      setScannedBooking(null);
      setScanError(`No ticket or service booking found for: "${scannedId}"`);
      
      try {
        const errorAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3');
        errorAudio.volume = 0.5;
        errorAudio.play().catch(e => console.log('Audio play failed:', e));
      } catch (err) {
        console.error('Audio error:', err);
      }
      
      if (alertsEnabled) {
        playVoice("Warning. Ticket not found.", 'Kore');
      }

      // Record warnings/errors to logs
      const logId = Math.random().toString(36).substring(2, 9);
      const nowStr = new Date().toLocaleTimeString();
      setMonitorLogs(prev => [
        {
          id: logId,
          time: nowStr,
          message: `⚠️ QR Check Failed. Code: ${scannedId} unknown.`,
          type: 'error'
        },
        ...prev
      ]);
    }
  };

  useEffect(() => {
    if (scannedBooking) {
      const refreshed = bookings.find(b => b.id === scannedBooking.id);
      if (refreshed && JSON.stringify(refreshed) !== JSON.stringify(scannedBooking)) {
        setScannedBooking(refreshed);
      }
    }
  }, [bookings, scannedBooking]);

  // Auto-dismiss scanner feedback success or error alerts after 3 seconds of being displayed
  useEffect(() => {
    if (scannedBooking) {
      const timer = setTimeout(() => {
        setScannedBooking(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [scannedBooking]);

  useEffect(() => {
    if (scanError) {
      const timer = setTimeout(() => {
        setScanError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [scanError]);

  const isFirstLoad = React.useRef(true);

  useEffect(() => {
    const unsubscribe = bookingService.subscribeToAllBookings((data, changes) => {
      if (!isVerified) return;

      setBookings(data);

      const timeStr = new Date().toLocaleTimeString();

      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        setMonitorLogs([
          { id: `init-${Date.now()}-${Math.random()}`, time: timeStr, message: `Synchronized ${data.length} active records from cloud database nodes.`, type: 'success' },
          { id: `listening-${Date.now()}-${Math.random()}`, time: timeStr, message: "Real-time sync listeners are now fully active & listening.", type: 'info' }
        ]);
        return;
      }

      if (changes) {
        changes.forEach((change: any) => {
          const booking = { id: change.doc.id, ...change.doc.data() } as Booking;
          
          if (change.type === 'added') {
            const isCafeOrder = booking.type === 'cafe';
            const logMsg = isCafeOrder 
              ? `☕ Live Cafe Order: ${booking.userName} ordered ${booking.resourceName}`
              : `➕ Live Booking: ${booking.userName} reserved slot for ${getServiceDisplayName(booking.type)} (${booking.resourceName})`;
            
            setMonitorLogs(prev => [
              { id: `log-${Date.now()}-${Math.random()}`, time: timeStr, message: logMsg, type: 'success' },
              ...prev
            ].slice(0, 50));

            addNotification({
              id: `new-${booking.id}-${Date.now()}`,
              title: isCafeOrder ? '☕ NEW CAFE ORDER' : `New Booking: ${booking.userName} - ${getServiceDisplayName(booking.type)}`,
              message: isCafeOrder ? `${booking.userName} ordered ${booking.resourceName}` : `Reserved ${booking.resourceName}`,
              type: 'new',
              time: Date.now()
            });

            if (isCafeOrder) {
              playVoice(`New cafe order from ${booking.userName}.`, 'Puck');
            } else {
              playVoice(`New booking from ${booking.userName} for ${getServiceDisplayName(booking.type)}.`, 'Zephyr');
            }
          } else if (change.type === 'modified') {
            const oldBooking = bookingsRef.current.find(b => b.id === booking.id);
            if (oldBooking) {
              if (oldBooking.status !== booking.status) {
                const stepMsg = `🔄 Real-time Update: ${booking.userName}'s ${getServiceDisplayName(booking.type)} is now ${booking.status.toUpperCase()}`;
                
                setMonitorLogs(prev => [
                  { id: `log-${Date.now()}-${Math.random()}`, time: timeStr, message: stepMsg, type: booking.status === 'cancelled' ? 'error' : 'warn' },
                  ...prev
                ].slice(0, 50));

                if (booking.status === 'cancelled') {
                  addNotification({
                    id: `cancel-${booking.id}-${Date.now()}`,
                    title: 'Booking Cancelled',
                    message: `${booking.userName}'s order for ${booking.resourceName} has been cancelled.`,
                    type: 'cancel',
                    time: Date.now()
                  });
                  playVoice(`Attention. ${booking.userName}'s booking for ${getServiceDisplayName(booking.type)} has been cancelled.`, 'Zephyr');
                } else {
                  addNotification({
                    id: `update-${booking.id}-${Date.now()}`,
                    title: 'Status Updated',
                    message: `${booking.userName}'s ${getServiceDisplayName(booking.type)} is now ${booking.status}`,
                    type: 'update',
                    time: Date.now()
                  });
                  playVoice(`${booking.userName}'s ${getServiceDisplayName(booking.type)} is now ${booking.status}.`, 'Zephyr');
                }
              }
            }
          }
        });
      }
    });
    return () => unsubscribe();
  }, [isVerified]);

  // Overdue Monitor to alert admin of missed schedules
  const alertedOverdueRef = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!isVerified || bookings.length === 0) return;

    const checkOverdue = async () => {
      const now = new Date();
      // Only check today's bookings that are past their start time
      const today = now.toISOString().split('T')[0];
      
      const overdueBookings = bookings.filter(b => {
        if (!['pending', 'ongoing'].includes(b.status)) return false;
        if (b.date !== today) return false; // Only automated alerts for current day
        if (alertedOverdueRef.current.has(b.id!)) return false;

        try {
          const scheduledTime = new Date(`${b.date}T${b.startTime}`);
          // Consider overdue if more than 15 minutes past scheduled start
          return scheduledTime.getTime() + (15 * 60 * 1000) < now.getTime();
        } catch (e) {
          return false;
        }
      });

      for (const booking of overdueBookings) {
        alertedOverdueRef.current.add(booking.id!);
        
        // Show UI Notification
        addNotification({
          id: `overdue-${booking.id}-${Date.now()}`,
          title: '⚠️ OVERDUE ALERT',
          message: `${booking.userName}'s session is past scheduled time!`,
          type: 'cancel', 
          time: Date.now()
        });

        // Voice Alert
        playVoice(`Attention. ${booking.userName}'s ${getServiceDisplayName(booking.type)} is now overdue.`, 'Zephyr');

        // Email Alert to Admin
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: 'manojmaddy93933@gmail.com', // Updated for testing with specific verified recipient
              subject: `⚠️ OVERDUE ACTION REQUIRED: ${booking.userName}`,
              html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 15px; background-color: #fafafa;">
                  <h2 style="color: #e11d48; margin-top: 0;">Automated Overdue Alert</h2>
                  <p style="color: #444;">The following booking is past its scheduled start time and requires immediate attention.</p>
                  <div style="background: white; padding: 15px; border-radius: 10px; border: 1px solid #ddd;">
                    <p style="margin: 5px 0;"><strong>Customer:</strong> ${booking.userName}</p>
                    <p style="margin: 5px 0;"><strong>Service:</strong> ${getServiceDisplayName(booking.type)}</p>
                    <p style="margin: 5px 0;"><strong>Scheduled:</strong> ${booking.date} at ${booking.startTime}</p>
                    <p style="margin: 5px 0;"><strong>Current Status:</strong> <span style="text-transform: uppercase; color: #f59e0b;">${booking.status}</span></p>
                  </div>
                  <p style="font-size: 12px; color: #888; margin-top: 20px;">This is an automated system notification from Hub Station HQ.</p>
                </div>
              `
            })
          });
        } catch (err) {
          console.error('Failed to send overdue email notification:', err);
        }
      }
    };

    const interval = setInterval(checkOverdue, 60000); // Check every minute
    checkOverdue();

    return () => clearInterval(interval);
  }, [isVerified, bookings]);

  const addNotification = (notif: Notification) => {
    setNotifications(prev => [notif, ...prev].slice(0, 5));
    
    // Play notification sound depending on type
    try {
      let soundUrl = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'; // new booking sound
      if (notif.type === 'cancel') {
        soundUrl = 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3'; // alert sound
      } else if (notif.type === 'update') {
        soundUrl = 'https://assets.mixkit.co/active_storage/sfx/1117/1117-preview.mp3'; // updated indicator
      }

      const audio = new Audio(soundUrl);
      audio.volume = 0.4;
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (err) {
      console.error('Audio error:', err);
    }

    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
    }, 5000);
  };

  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm('Delete this booking record permanently?')) return;
    try {
      await bookingService.deleteBooking(id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear ALL completed/cancelled bookings from history?')) return;
    try {
      const historyBookings = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));
      const promises = historyBookings.map(b => bookingService.deleteBooking(b.id!));
      await Promise.all(promises);
    } catch (error) {
      console.error(error);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/verify-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });

      if (response.ok) {
        setIsVerified(true);
        localStorage.setItem('office_session', 'active_' + Date.now());
      } else {
        setError('Incorrect security passcode');
      }
    } catch (err) {
      setError('Connection error. Try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Optional: Check for existing session
  useEffect(() => {
    const session = localStorage.getItem('office_session');
    if (session && session.startsWith('active_')) {
      const timestamp = parseInt(session.split('_')[1]);
      // Session valid for 1 hour
      if (Date.now() - timestamp < 3600000) {
        setIsVerified(true);
      } else {
        localStorage.removeItem('office_session');
      }
    }
  }, []);

  useEffect(() => {
    if (activeView === 'workers' && isVerified) {
      const fetchData = async () => {
        try {
          const workersList = await attendanceService.getAllWorkers();
          setWorkers(workersList);
          const attendanceList = await attendanceService.getAttendanceByDate(attendanceDate);
          setAttendance(attendanceList);
          const schedulesList = await attendanceService.getSchedulesByDate(attendanceDate);
          setSchedules(schedulesList);
        } catch (error) {
          console.error('Error fetching workers/attendance/schedules:', error);
        }
      };
      fetchData();
    }
  }, [activeView, attendanceDate, isVerified]);

  useEffect(() => {
    if (activeView === 'cafeMenu' && isVerified) {
      const unsubscribe = cafeService.subscribeMenuItems((items) => {
        setMenuItems(items);
      });
      return () => unsubscribe();
    }
  }, [activeView, isVerified]);

  const toggleBookingSelection = (id: string) => {
    setSelectedBookings(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedBookings.length === filteredBookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(filteredBookings.map(b => b.id!));
    }
  };

  const handleBulkStatusUpdate = async (status: BookingStatus) => {
    if (!window.confirm(`Update ${selectedBookings.length} bookings to ${status}?`)) return;
    try {
      const promises = selectedBookings.map(id => bookingService.updateBookingStatus(id, status));
      await Promise.all(promises);
      setSelectedBookings([]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Permanently delete ${selectedBookings.length} records?`)) return;
    try {
      const promises = selectedBookings.map(id => bookingService.deleteBooking(id));
      await Promise.all(promises);
      setSelectedBookings([]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddWorker = async () => {
    if (!newWorker.name || !newWorker.role) return;
    setIsSubmittingWorker(true);
    try {
      await attendanceService.addWorker({
        name: newWorker.name,
        role: newWorker.role,
        contact: newWorker.contact,
        workerCode: newWorker.workerCode.toUpperCase() || `HUB${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        joiningDate: newWorker.joiningDate,
        isActive: true,
        createdAt: Date.now()
      });
      setNewWorker({ 
        name: '', 
        role: '', 
        contact: '', 
        workerCode: '',
        joiningDate: new Date().toISOString().split('T')[0] 
      });
      setShowAddWorker(false);
      const workersList = await attendanceService.getAllWorkers();
      setWorkers(workersList);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingWorker(false);
    }
  };

  const handleMarkAttendance = async (workerId: string, workerName: string, status: 'present' | 'absent' | 'half-day') => {
    try {
      await attendanceService.markAttendance({
        workerId,
        workerName,
        date: attendanceDate,
        status,
        checkIn: Date.now()
      });
      const attendanceList = await attendanceService.getAttendanceByDate(attendanceDate);
      setAttendance(attendanceList);
    } catch (error) {
      console.error(error);
    }
  };

  const handleExportAttendance = () => {
    // Define CSV headers
    const headers = [
      'Employee Code',
      'Name',
      'Role',
      'Contact',
      'Date',
      'Status',
      'Check In',
      'Check Out',
      'Notes'
    ];

    // Map workers to CSV rows
    const rows = workers.map(worker => {
      const record = attendance.find(a => a.workerId === worker.id);
      
      // Status formatting
      let statusText = 'Unmarked';
      if (record?.status === 'present') statusText = 'Present';
      else if (record?.status === 'half-day') statusText = 'Half Day';
      else if (record?.status === 'absent') statusText = 'Absent';

      // Time formatting
      const formatTime = (ts: number | undefined) => {
        if (!ts) return 'N/A';
        try {
          return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch (err) {
          return 'N/A';
        }
      };

      const checkInTime = record?.checkIn ? formatTime(record.checkIn) : 'N/A';
      const checkOutTime = record?.checkOut ? formatTime(record.checkOut) : 'N/A';
      const notesText = record?.notes ? record.notes.replace(/"/g, '""') : '';

      return [
        worker.workerCode || 'N/A',
        worker.name,
        worker.role,
        worker.contact || 'N/A',
        attendanceDate,
        statusText,
        checkInTime,
        checkOutTime,
        notesText
      ];
    });

    // Helper to sanitize cell values to handle quotes, commas, new lines
    const sanitizeValue = (val: string) => {
      if (val.includes(',') || val.includes('\n') || val.includes('"')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    // Construct CSV Content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => sanitizeValue(cell)).join(','))
    ].join('\n');

    // Download flow
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Attendance_Report_${attendanceDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteWorker = async (id: string) => {
    if (!window.confirm('Remove this employee from the system? Historical attendance will be preserved.')) return;
    try {
      await attendanceService.deleteWorker(id);
      const workersList = await attendanceService.getAllWorkers();
      setWorkers(workersList);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddSchedule = async () => {
    if (!newSchedule.workerId || !newSchedule.shift) return;
    setIsSubmittingSchedule(true);
    try {
      await attendanceService.addSchedule({
        ...newSchedule,
        createdAt: Date.now()
      } as any);
      setShowAddSchedule(false);
      setNewSchedule({
        ...newSchedule,
        workerId: '',
        workerName: '',
        workerRole: '',
        notes: ''
      });
      const schedulesList = await attendanceService.getSchedulesByDate(attendanceDate);
      setSchedules(schedulesList);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await attendanceService.deleteSchedule(id);
      const schedulesList = await attendanceService.getSchedulesByDate(attendanceDate);
      setSchedules(schedulesList);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddMenuItem = async () => {
    if (!newMenuItem.name || !newMenuItem.category || newMenuItem.price <= 0) return;
    setIsSubmittingMenu(true);
    try {
      if (editingMenuItem) {
        await cafeService.updateMenuItem(editingMenuItem.id!, {
          ...newMenuItem,
          price: Number(newMenuItem.price)
        });
      } else {
        await cafeService.addMenuItem({
          ...newMenuItem,
          price: Number(newMenuItem.price)
        });
      }
      setShowAddMenu(false);
      setEditingMenuItem(null);
      setNewMenuItem({ name: '', category: '', price: 0, imageUrl: '', isAvailable: true });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingMenu(false);
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!window.confirm('Delete this item from the menu?')) return;
    try {
      await cafeService.deleteMenuItem(id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleMenuAvailability = async (id: string, currentStatus: boolean) => {
    try {
      await cafeService.toggleAvailability(id, currentStatus);
    } catch (error) {
      console.error(error);
    }
  };

  if (!isVerified) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-zinc-900 rounded-[3rem] p-10 border border-zinc-800 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-accent/30" />
          
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-20 h-20 bg-zinc-950 rounded-[2rem] border border-zinc-800 flex items-center justify-center text-accent mb-6 shadow-inner ring-4 ring-zinc-900/50">
              <Lock size={32} />
            </div>
            <h2 className="text-3xl font-black text-slate-100 uppercase tracking-tighter italic mb-2">Office Access</h2>
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-black">Authorized Staff Personnel Only</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Security Passcode</label>
              <input 
                type="password"
                placeholder="••••"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
                className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-2xl py-5 px-6 text-2xl font-black tracking-[0.5em] text-center text-slate-100 focus:border-accent/50 focus:ring-0 transition-all placeholder:text-zinc-800"
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500"
              >
                <ShieldAlert size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={isVerifying || !passcode}
              className={`w-full py-5 rounded-[2rem] flex items-center justify-center gap-3 transition-all ${
                isVerifying || !passcode 
                  ? 'bg-zinc-800 text-zinc-600 grayscale cursor-not-allowed' 
                  : 'bg-accent text-zinc-950 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <span className="text-[12px] font-black uppercase tracking-widest">Verify & Enter</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-8 text-center text-[8px] font-bold text-zinc-600 uppercase tracking-widest leading-loose">
            Security logs are recorded. <br />
            Unauthorized access attempts are reported.
          </p>
        </motion.div>
      </div>
    );
  }

  const handleStatusUpdate = async (id: string, status: BookingStatus, extraData?: any) => {
    if (status === 'completed') {
      setSuccessAnimationId(id);
      const bObj = bookings.find(b => b.id === id);
      const isCarWash = bObj?.type === 'carWash';
      await bookingService.updateBookingStatus(id, status, { 
        ...extraData,
        paymentStatus: extraData?.paymentStatus || 'paid', // Default to paid on completion if not specified
        ...(isCarWash ? { washPhase: 'Done' } : {})
      });
      setTimeout(() => setSuccessAnimationId(null), 1500);
    } else if (status === 'ongoing') {
      const bObj = bookings.find(b => b.id === id);
      const isCarWash = bObj?.type === 'carWash';
      await bookingService.updateBookingStatus(id, status, {
        checkedInAt: Date.now(),
        ...(isCarWash ? { washPhase: 'In Progress' } : {}),
        ...extraData
      });
    } else {
      await bookingService.updateBookingStatus(id, status, extraData);
    }
  };

  const handlePaymentUpdate = async (id: string, paymentStatus: 'unpaid' | 'pending' | 'paid', paymentMethod?: 'upi' | 'cash' | 'card') => {
    await bookingService.updateBookingStatus(id, bookings.find(b => b.id === id)?.status || 'pending', { 
      paymentStatus,
      paymentMethod 
    });
  };
  


  const handleStartCarWash = async (bookingId: string, bay: string) => {
    await handleStatusUpdate(bookingId, 'ongoing', { 
      bay
    });
    setAssignBayBookingId(null);
  };

  const filteredBookings = bookings.filter(b => {
    const matchesFilter = filter === 'all' || b.status === filter;
    const matchesType = typeFilter === 'all' || b.type === typeFilter;
    
    let matchesDate = true;
    const today = new Date();
    const tzoffset = today.getTimezoneOffset() * 60000; 
    const localToday = (new Date(today.getTime() - tzoffset)).toISOString().split('T')[0];
    
    if (dateFilter === 'today') {
      matchesDate = b.date === localToday;
    } else if (dateFilter === 'upcoming') {
      matchesDate = b.date > localToday;
    } else if (dateFilter === 'last7') {
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const localSevenDaysAgo = (new Date(sevenDaysAgo.getTime() - tzoffset)).toISOString().split('T')[0];
      matchesDate = b.date >= localSevenDaysAgo && b.date <= localToday;
    } else if (dateFilter === 'custom') {
      if (customRange.start && customRange.end) {
        matchesDate = b.date >= customRange.start && b.date <= customRange.end;
      } else if (customRange.start) {
        matchesDate = b.date >= customRange.start;
      } else if (customRange.end) {
        matchesDate = b.date <= customRange.end;
      }
    }

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      b.userName.toLowerCase().includes(searchLower) || 
      b.resourceName.toLowerCase().includes(searchLower) ||
      (b.id || '').toLowerCase().includes(searchLower) ||
      (b.userPhone || '').toLowerCase().includes(searchLower) ||
      (b.userEmail || '').toLowerCase().includes(searchLower);
      
    return matchesFilter && matchesType && matchesDate && matchesSearch;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    ongoing: bookings.filter(b => b.status === 'ongoing').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    totalRevenue: bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + (b.price || 0), 0)
  };

  const serviceWiseStats = ['game', 'carWash', 'badminton', 'theatre', 'cafe'].map(type => {
    const serviceBookings = bookings.filter(b => b.type === type);
    const revenue = serviceBookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (b.price || 0), 0);
    
    return {
      type,
      label: getServiceDisplayName(type) === type ? type.charAt(0).toUpperCase() + type.slice(1) : getServiceDisplayName(type),
      count: serviceBookings.length,
      revenue
    };
  }).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Real-time Notifications */}
      <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3 w-80 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className={`p-4 rounded-2xl border pointer-events-auto shadow-2xl backdrop-blur-md flex gap-4 overflow-hidden relative pb-5 ${
                notif.type === 'new' ? 'bg-blue-500/10 border-blue-500/30' :
                notif.type === 'cancel' ? 'bg-red-500/10 border-red-500/30' :
                'bg-amber-500/10 border-amber-500/30'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                notif.type === 'new' ? 'bg-blue-500/20 text-blue-400' :
                notif.type === 'cancel' ? 'bg-red-500/20 text-red-500' :
                'bg-amber-500/20 text-amber-500'
              }`}>
                {notif.type === 'new' ? <BellRing size={20} /> : <Bell size={20} />}
              </div>
              <div className="flex-grow">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-100 mb-1">{notif.title}</p>
                <p className="text-xs font-medium text-zinc-400 leading-relaxed pr-4">{notif.message}</p>
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-2">Just Now</p>
              </div>
              <button 
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                className="absolute top-2 right-2 text-zinc-600 hover:text-zinc-400 p-1 pointer-events-auto cursor-pointer z-10"
              >
                <XCircle size={14} />
              </button>

              {/* Progress Bar of Dismiss Countdown */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-950/30 overflow-hidden">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className={`h-full ${
                    notif.type === 'new' ? 'bg-blue-500' :
                    notif.type === 'cancel' ? 'bg-red-500' :
                    'bg-amber-500'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-bold mb-2 uppercase tracking-tighter text-slate-100 italic">Office App</h2>
          <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest leading-tight">Admin Control Panel</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Link 
            to="/qrhub"
            className="flex items-center gap-3 px-6 py-4 rounded-[2rem] border border-zinc-800 bg-zinc-900 text-slate-100 transition-all shadow-2xl hover:border-accent/40"
          >
            <QrCode size={20} />
            <span className="text-[10px] uppercase tracking-widest font-black">Hub Flyer</span>
          </Link>

          <button 
            onClick={() => setShowAdminPaymentQR(!showAdminPaymentQR)}
            className={`flex items-center gap-3 px-6 py-4 rounded-[2rem] border transition-all shadow-2xl ${
              showAdminPaymentQR ? 'bg-green-500 border-green-400 text-white' : 'bg-zinc-900 border-zinc-800 text-slate-100 font-black'
            }`}
          >
            <IndianRupee size={20} />
            <span className="text-[10px] uppercase tracking-widest font-black">
              {showAdminPaymentQR ? 'Hide Payment' : 'Payment QR'}
            </span>
          </button>

          <button 
            onClick={toggleAlerts}
            className={`flex items-center gap-3 px-6 py-4 rounded-[2rem] border transition-all shadow-2xl ${
              alertsEnabled ? 'bg-zinc-900 border-emerald-500/40 text-emerald-500 hover:border-emerald-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
            }`}
          >
            {alertsEnabled ? <Volume2 size={20} className="animate-pulse" /> : <VolumeX size={20} />}
            <span className="text-[10px] uppercase tracking-widest font-black">
              {alertsEnabled ? 'Alerts ON' : 'Alerts OFF'}
            </span>
          </button>

          <div className="bg-zinc-900 px-6 py-4 rounded-[2rem] border border-zinc-800 flex items-center gap-6 shadow-2xl">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-black mb-1">Queue</p>
              <p className="text-2xl font-black text-amber-500 leading-none">{stats.pending}</p>
            </div>
            <div className="w-px h-8 bg-zinc-800" />
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-black mb-1">Active</p>
              <p className="text-2xl font-black text-blue-500 leading-none">{stats.ongoing}</p>
            </div>
            <div className="w-px h-8 bg-zinc-800" />
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-black mb-1">Revenue</p>
              <p className="text-2xl font-black text-emerald-500 leading-none">₹{stats.totalRevenue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Statistics Analytics */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center text-accent">
            <Info size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-100 uppercase tracking-tighter italic">Service Insights</h3>
            <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Cross-department performance metrics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {serviceWiseStats.map((s, idx) => (
            <motion.div 
              key={s.type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-zinc-900 border border-zinc-800 rounded-[1.5rem] p-5 hover:border-accent/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-700 group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                  {getServiceIcon(s.type, 20)}
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">Bookings</p>
                  <p className="text-lg font-black text-slate-100 italic">{s.count}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-zinc-800/50">
                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">{s.label} Revenue</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-emerald-500 italic">₹{s.revenue}</p>
                  <div className="text-[8px] font-bold text-zinc-700 px-2 py-0.5 bg-zinc-950 rounded-md border border-zinc-800">
                    {s.count > 0 ? Math.round((s.revenue / stats.totalRevenue || 1) * 100) : 0}% share
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="flex gap-4 mb-8 border-b border-zinc-800 overflow-x-auto">
        <button 
          onClick={() => setActiveView('monitor')}
          className={`pb-4 px-6 text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2.5 shrink-0 ${activeView === 'monitor' ? 'text-accent border-b-2 border-accent' : 'text-zinc-600 hover:text-zinc-400'}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          Live Monitor
        </button>
        <button 
          onClick={() => setActiveView('bookings')}
          className={`pb-4 px-6 text-sm font-black uppercase tracking-widest transition-all shrink-0 ${activeView === 'bookings' ? 'text-accent border-b-2 border-accent' : 'text-zinc-600 hover:text-zinc-400'}`}
        >
          Bookings
        </button>
        <button 
          onClick={() => setActiveView('calendar')}
          className={`pb-4 px-6 text-sm font-black uppercase tracking-widest transition-all ${activeView === 'calendar' ? 'text-accent border-b-2 border-accent' : 'text-zinc-600 hover:text-zinc-400'}`}
        >
          Calendar
        </button>
        <button 
          onClick={() => setActiveView('payments')}
          className={`pb-4 px-6 text-sm font-black uppercase tracking-widest transition-all ${activeView === 'payments' ? 'text-accent border-b-2 border-accent' : 'text-zinc-600 hover:text-zinc-400'}`}
        >
          Payment History
        </button>
        <button 
          onClick={() => setActiveView('workers')}
          className={`pb-4 px-6 text-sm font-black uppercase tracking-widest transition-all ${activeView === 'workers' ? 'text-accent border-b-2 border-accent' : 'text-zinc-600 hover:text-zinc-400'}`}
        >
          Attendance
        </button>
        <button 
          onClick={() => setActiveView('cafeMenu')}
          className={`pb-4 px-6 text-sm font-black uppercase tracking-widest transition-all ${activeView === 'cafeMenu' ? 'text-accent border-b-2 border-accent' : 'text-zinc-600 hover:text-zinc-400'}`}
        >
          Cafe Menu
        </button>
      </div>

      <AnimatePresence>
        {!!showAdminPaymentQR && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-12 flex justify-center"
          >
            <div className="max-w-sm w-full">
              <PaymentQR 
                amount={typeof showAdminPaymentQR === 'object' ? showAdminPaymentQR.amount : undefined} 
                bookingId={typeof showAdminPaymentQR === 'object' ? showAdminPaymentQR.bookingId : undefined} 
              />
              
              {typeof showAdminPaymentQR === 'object' && showAdminPaymentQR.amount && (
                <div className="mt-4 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-center">
                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Amount Due</p>
                   <p className="text-xl font-black text-slate-100 italic">₹{showAdminPaymentQR.amount}</p>
                </div>
              )}

              <button 
                onClick={() => setShowAdminPaymentQR(false)}
                className="w-full mt-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-slate-100 transition-colors"
                id="close-payment-qr"
              >
                Close Payment Display
              </button>
            </div>
          </motion.div>
        )}

        {isScannerOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md"
          >
            <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-100 uppercase tracking-tighter italic">QR SCANNER</h3>
                  <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Scan customer booking ID</p>
                </div>
                <button 
                  onClick={() => setIsScannerOpen(false)}
                  className="p-3 bg-zinc-800 text-zinc-400 rounded-2xl hover:text-slate-100 cursor-pointer"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className={`relative group/scanner overflow-hidden rounded-[20px] p-[3px] bg-zinc-950 transition-all duration-500 ${
                cameraError === 'blocked'
                  ? 'animate-neon-pulse-red'
                  : cameraError === 'notFound'
                  ? 'animate-neon-pulse-amber'
                  : 'animate-neon-pulse'
              }`}>
                {/* Rotating holographic neon background border */}
                <div className={`absolute -inset-[150%] rounded-full opacity-70 pointer-events-none transition-all duration-500 animate-neon-rotate ${
                  cameraError === 'blocked'
                    ? 'bg-[conic-gradient(from_0deg,transparent_20%,#ef4444_40%,#ef4444_50%,#dc2626_60%,transparent_80%)]'
                    : cameraError === 'notFound'
                    ? 'bg-[conic-gradient(from_0deg,transparent_20%,#f59e0b_40%,#f59e0b_50%,#d97706_60%,transparent_80%)]'
                    : 'bg-[conic-gradient(from_0deg,transparent_20%,#f59e0b_40%,#f59e0b_50%,#d97706_60%,transparent_80%)]'
                }`} />

                <div className="relative bg-zinc-900 rounded-[17px] overflow-hidden">
                  <div 
                    id="qr-reader" 
                    className="bg-zinc-900 rounded-[17px] overflow-hidden border-0 transition-all duration-300 min-h-[300px]"
                  ></div>

                  {/* High-tech visual scanning line animation */}
                  {isScannerOpen && !cameraError && (
                    <motion.div
                      initial={{ top: "0%" }}
                      animate={{ top: "100%" }}
                      transition={{
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 2.8,
                        ease: "easeInOut"
                      }}
                      className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-accent to-transparent shadow-[0_0_15px_rgba(245,158,11,0.95),_0_0_6px_rgba(245,158,11,0.65)] z-20 pointer-events-none"
                    />
                  )}

                  {/* Floating help icon / tooltip */}
                  {!cameraError && (
                    <div className="absolute top-3.5 right-3.5 z-30 flex items-center gap-2 group/tooltip">
                      <span className="opacity-0 scale-90 translate-x-2 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 group-hover/tooltip:translate-x-0 bg-zinc-950/95 text-amber-500 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-zinc-850 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-2xl">
                        Scan Tips
                      </span>
                      <button
                        onClick={() => setShowScannerHelp(true)}
                        className="w-10 h-10 rounded-xl bg-zinc-950/80 hover:bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 flex items-center justify-center text-amber-500 hover:text-amber-400 shadow-xl active:scale-90 transition-all cursor-pointer group"
                        title="Scanning quick guidelines"
                        id="open-scan-help-btn"
                        type="button"
                      >
                        <HelpCircle size={16} className="animate-pulse" />
                      </button>
                    </div>
                  )}

                  {/* High-tech corner bracket decorative elements over the reader */}
                  <div className={`absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 rounded-tl pointer-events-none z-10 transition-colors duration-350 ${
                    cameraError === 'blocked' ? 'border-red-500' : cameraError === 'notFound' ? 'border-amber-500' : 'border-accent'
                  }`} />
                  <div className={`absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 rounded-tr pointer-events-none z-10 transition-colors duration-350 ${
                    cameraError === 'blocked' ? 'border-red-500' : cameraError === 'notFound' ? 'border-amber-500' : 'border-accent'
                  }`} />
                  <div className={`absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 rounded-bl pointer-events-none z-10 transition-colors duration-350 ${
                    cameraError === 'blocked' ? 'border-red-500' : cameraError === 'notFound' ? 'border-amber-500' : 'border-accent'
                  }`} />
                  <div className={`absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 rounded-br pointer-events-none z-10 transition-colors duration-350 ${
                    cameraError === 'blocked' ? 'border-red-500' : cameraError === 'notFound' ? 'border-amber-500' : 'border-accent'
                  }`} />

                  {/* Camera Error Visual Overlay */}
                  {cameraError && (
                    <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-sm rounded-[17px] flex flex-col items-center justify-center p-6 text-center z-20">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                        cameraError === 'blocked' 
                          ? 'bg-red-550/10 text-red-400 border border-red-500/20' 
                          : 'bg-amber-550/10 text-amber-400 border border-amber-500/20'
                      } animate-bounce`} style={{ animationDuration: '3s' }}>
                        {cameraError === 'blocked' ? <CameraOff size={24} /> : <AlertTriangle size={24} />}
                      </div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-150 mb-1.5">
                        {cameraError === 'blocked' ? 'Camera Access Blocked' : 'Camera Not Found'}
                      </h4>
                      <p className="text-[10px] text-zinc-400 max-w-xs leading-relaxed mb-4">
                        {cameraError === 'blocked' 
                          ? 'Camera permission has been denied. Please click the camera block icon in your browser URL bar to allow accesses.' 
                          : 'No video sources detected. Please connect, enable, or select your system camera.'}
                        {typeof window !== 'undefined' && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) && (
                          <span className="block mt-2.5 pt-2 border-t border-zinc-800/60 text-amber-400 font-black uppercase tracking-wider text-[8px] leading-normal">
                            ⚠️ iOS Notice: Apple security blocks camera inside sandboxed preview iframes. If this persists, please tap "Open in New Tab" at the top of your screen to scan in standalone mode!
                          </span>
                        )}
                      </p>
                      <button 
                        onClick={() => {
                          setIsScannerOpen(false);
                          setTimeout(() => setIsScannerOpen(true), 150);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-zinc-800 to-zinc-850 hover:from-white hover:to-white hover:text-zinc-950 text-slate-100 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all cursor-pointer border border-zinc-750/30"
                      >
                        Reconnect Devices
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className={`mt-8 p-4 rounded-2xl border transition-colors duration-300 ${
                cameraError === 'blocked' 
                  ? 'bg-red-950/20 border-red-900/40 text-red-400' 
                  : cameraError === 'notFound'
                  ? 'bg-amber-950/20 border-amber-900/40 text-amber-400' 
                  : 'bg-zinc-950/50 border-zinc-800 text-zinc-400'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="relative flex h-2 w-2">
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
                      cameraError === 'blocked' 
                        ? 'bg-red-400' 
                        : cameraError === 'notFound'
                        ? 'bg-amber-400' 
                        : 'bg-accent'
                    }`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${
                      cameraError === 'blocked' 
                        ? 'bg-red-500' 
                        : cameraError === 'notFound'
                        ? 'bg-amber-500' 
                        : 'bg-accent'
                    }`}></span>
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none">
                    {cameraError === 'blocked' 
                      ? 'Camera Access: Blocked / Denied' 
                      : cameraError === 'notFound'
                      ? 'Camera hardware not found'
                      : 'Camera Active: Scan QR code'}
                  </p>
                </div>
              </div>

              {/* Recent Scans Session Live-Feed */}
              <div className="mt-6 pt-5 border-t border-zinc-850">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <History size={13} className="text-accent animate-pulse" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Recent Scans ({recentScans.length})
                  </h4>
                </div>

                {recentScans.length === 0 ? (
                  <div className="py-4 px-4 bg-zinc-950/40 rounded-2xl border border-zinc-850/40 text-center">
                    <p className="text-[9px] font-bold text-zinc-650 uppercase tracking-widest leading-normal">
                      Waiting for successful codes...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {recentScans.map((scan, idx) => (
                      <div 
                        key={`${scan.id}-${scan.time}-${idx}`}
                        className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-850/40 flex items-center justify-between gap-3 hover:bg-zinc-950/80 hover:border-zinc-800 transition-all duration-200"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-1.5 rounded-lg flex items-center justify-center shrink-0 ${
                            scan.type === 'game' ? 'bg-amber-500/10 text-amber-500' :
                            scan.type === 'carWash' ? 'bg-blue-500/10 text-blue-500' :
                            scan.type === 'badminton' ? 'bg-emerald-500/10 text-emerald-500' :
                            scan.type === 'theatre' ? 'bg-purple-500/10 text-purple-500' :
                            scan.type === 'cafe' ? 'bg-yellow-500/10 text-yellow-500' :
                            'bg-zinc-500/10 text-zinc-500'
                          }`}>
                            {getServiceIcon(scan.type, 11)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-200 leading-tight truncate">
                              {scan.resourceName}
                            </p>
                            <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5 leading-none truncate">
                              {scan.userName}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="inline-block py-0.5 px-2 bg-zinc-900 border border-zinc-800 rounded text-[8px] font-black font-mono text-zinc-400 uppercase tracking-widest">
                            {scan.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* QR Alignment Quick Guidelines Modal */}
        <AnimatePresence>
          {showScannerHelp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-zinc-950/95 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col gap-6"
              >
                {/* Visual Accent Layer */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
                <div className="absolute top-0 right-0 p-4 font-black text-amber-500/5 select-none pointer-events-none text-7xl font-sans tracking-tighter">
                  GUIDANCE
                </div>

                {/* Header */}
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl flex items-center justify-center">
                      <HelpCircle size={20} className="animate-spin" style={{ animationDuration: '6s' }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-100 uppercase tracking-tighter italic">ALIGNMENT FIELD GUIDE</h3>
                      <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Master rapid QR identification</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowScannerHelp(false)}
                    className="p-2.5 bg-zinc-850 rounded-xl text-zinc-400 hover:text-slate-100 transition-colors cursor-pointer flex items-center justify-center"
                    id="close-scan-help-btn"
                  >
                    <XCircle size={18} />
                  </button>
                </div>

                {/* Content body / list of tips */}
                <div className="space-y-4 my-2 relative z-10">
                  {/* Tip 1 */}
                  <div className="flex gap-4 p-3 bg-zinc-950/50 rounded-2xl border border-zinc-850">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                      <Smartphone size={16} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-200 mb-0.5">Keep Screens Parallel</h4>
                      <p className="text-[9px] text-zinc-400 uppercase tracking-wider leading-relaxed">
                        Hold the smartphone screen directly parallel to the camera lens rather than angling or tilting it.
                      </p>
                    </div>
                  </div>

                  {/* Tip 2 */}
                  <div className="flex gap-4 p-3 bg-zinc-950/50 rounded-2xl border border-zinc-850">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                      <Scan size={16} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-200 mb-0.5">Use 4-8 Inch Standard Distance</h4>
                      <p className="text-[9px] text-zinc-400 uppercase tracking-wider leading-relaxed">
                        Hold the QR code 10-20 cm away. Placing the screen too close prevents camera auto-focus.
                      </p>
                    </div>
                  </div>

                  {/* Tip 3 */}
                  <div className="flex gap-4 p-3 bg-zinc-950/50 rounded-2xl border border-zinc-850">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                      <Info size={16} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-200 mb-0.5">Reduce Glare & Raise brightness</h4>
                      <p className="text-[9px] text-zinc-400 uppercase tracking-wider leading-relaxed">
                        Avoid intense overhead light beams casting direct reflections, and ensure the customer's phone display isn't too dim.
                      </p>
                    </div>
                  </div>

                  {/* Tip 4 */}
                  <div className="flex gap-4 p-3 bg-zinc-950/50 rounded-2xl border border-zinc-850">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                      <Activity size={16} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-200 mb-0.5">Hold Steady For Half-Second</h4>
                      <p className="text-[9px] text-zinc-400 uppercase tracking-wider leading-relaxed">
                        Minimize shakes or rapid sweeps. Steady holding allows the frame interpreter to snap-recognize the pattern.
                      </p>
                    </div>
                  </div>

                  {/* Tip 5 for iOS/Safari Iframe constraint */}
                  {typeof window !== 'undefined' && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) && (
                    <div className="flex gap-4 p-3 bg-amber-500/5 rounded-2xl border border-amber-500/20">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                        <Smartphone size={16} />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-0.5">iOS Safari notice</h4>
                        <p className="text-[9px] text-zinc-400 uppercase tracking-wider leading-relaxed">
                          Apple restricts camera use inside sandboxed preview frames. If the camera stays black or says denied, click <span className="text-amber-400 font-bold">"Open App in New Tab"</span> at the top of your builder tool to run natively.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer action button */}
                <button
                  type="button"
                  onClick={() => setShowScannerHelp(false)}
                  className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-white hover:to-white hover:text-zinc-950 text-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer border border-amber-500/30 font-sans"
                >
                  Resume Scanning
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scanned Booking Detail Presentation Dialog */}
        <AnimatePresence>
          {scannedBooking && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-950/95 backdrop-blur-md"
            >
              <div className="max-w-lg w-full bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col gap-6">
                
                {/* Visual Accent Layer */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-accent to-emerald-500" />
                <div className="absolute top-0 right-0 p-4 font-black text-emerald-500/5 select-none pointer-events-none text-7xl font-sans tracking-tighter">
                  VERIFIED
                </div>

                {/* Header */}
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center animate-bounce" style={{ animationDuration: '3s' }}>
                      <QrCode size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-100 uppercase tracking-tighter italic">TICKET IDENTIFIED</h3>
                      <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Incoming Service Ticket Verified</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setScannedBooking(null)}
                    className="p-3 bg-zinc-800 text-zinc-400 hover:text-slate-100 rounded-2xl cursor-pointer"
                  >
                    <XCircle size={18} />
                  </button>
                </div>

                {/* Customer Snapshot */}
                <div className="p-5 bg-zinc-950 rounded-3xl border border-zinc-850 flex items-start gap-4">
                  <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-2xl flex items-center justify-center font-sans font-black text-lg">
                    {scannedBooking.userName?.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[8px] font-black text-accent uppercase tracking-widest">Customer Details</p>
                    <h4 className="text-sm font-black text-slate-100 mt-0.5 truncate">{scannedBooking.userName}</h4>
                    <p className="text-[10px] text-zinc-500 font-semibold tracking-wide mt-1 font-mono">
                      ID: {scannedBooking.id}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      scannedBooking.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                      scannedBooking.status === 'ongoing' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse' :
                      scannedBooking.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {scannedBooking.status}
                    </span>
                  </div>
                </div>

                {/* Detail Specifications Roster */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-950/40 border border-zinc-850 rounded-2xl">
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Service & Resource</p>
                    <p className="text-xs font-black text-slate-200 mt-1 uppercase tracking-tight flex items-center gap-1.5">
                      <span className={getServiceTextColor(scannedBooking.type)}>●</span>
                      {scannedBooking.resourceName}
                    </p>
                  </div>
                  <div className="p-4 bg-zinc-950/40 border border-zinc-850 rounded-2xl">
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Scheduled Time</p>
                    <p className="text-xs font-bold text-slate-200 mt-1 uppercase flex items-center gap-1.5">
                      <Clock size={12} className="text-zinc-500 font-bold" />
                      {scannedBooking.startTime} ({scannedBooking.duration || 1}h)
                    </p>
                  </div>
                  <div className="p-4 bg-zinc-950/40 border border-zinc-850 rounded-2xl">
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Scheduled Date</p>
                    <p className="text-xs font-bold text-slate-200 mt-1 flex items-center gap-1.5">
                      <CalendarIcon size={12} className="text-zinc-500" />
                      {scannedBooking.date}
                    </p>
                  </div>
                  <div className="p-4 bg-zinc-950/40 border border-zinc-850 rounded-2xl flex flex-col justify-between">
                    <div>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Total Bill</p>
                      <p className="text-xs font-black text-emerald-400 mt-1 italic">
                        ₹{scannedBooking.price}
                      </p>
                    </div>
                    {scannedBooking.discountType && (
                      <span className="text-[7.5px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase mt-1 leading-none tracking-tight">
                        🌱 {scannedBooking.discountType} Discount Rate
                      </span>
                    )}
                  </div>
                </div>

                {/* Verification/Note logs */}
                {scannedBooking.notes && (
                  <div className="p-4 bg-zinc-950/20 border border-zinc-800/60 rounded-2xl">
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Ticket Notes & Verifications</p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold mt-1">"{scannedBooking.notes}"</p>
                  </div>
                )}

                {/* Payment Status Segment & Action */}
                <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-3xl flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Payment Condition</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-2 h-2 rounded-full ${scannedBooking.paymentStatus === 'paid' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                      <span className="text-xs font-black text-slate-200 uppercase tracking-wide leading-none">
                        {scannedBooking.paymentStatus || 'unpaid'}
                      </span>
                    </div>
                  </div>
                  {scannedBooking.paymentStatus !== 'paid' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setShowAdminPaymentQR({ amount: scannedBooking.price, bookingId: scannedBooking.id! });
                          setScannedBooking(null);
                        }}
                        className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-bold text-[9px] uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                      >
                        Show QR
                      </button>
                      <button
                        onClick={async () => {
                          await bookingService.updateBookingStatus(scannedBooking.id!, scannedBooking.status, { paymentStatus: 'paid', paymentMethod: 'cash' });
                          // Logs
                          const logId = Math.random().toString(36).substring(2, 9);
                          setMonitorLogs(prev => [
                            { id: logId, time: new Date().toLocaleTimeString(), message: `💸 Scanned Cash Received: Marked ID ${scannedBooking.id?.slice(-6).toUpperCase()} as Paid.`, type: 'info' },
                            ...prev
                          ]);
                        }}
                        className="px-3 py-1.5 bg-emerald-500 text-zinc-950 font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-white transition-all active:scale-95 cursor-pointer shadow-md shadow-emerald-500/20"
                      >
                        Paid (Cash)
                      </button>
                    </div>
                  ) : (
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest border border-emerald-500/30 bg-emerald-500/5 px-3 py-1.5 rounded-xl">
                      ✓ TRANSACTION COMPLETED
                    </span>
                  )}
                </div>

                {/* Main Process Execution Status Controls */}
                <div className="border-t border-zinc-800/80 pt-5 flex flex-col gap-3">
                  {scannedBooking.status === 'pending' && (
                    <button
                      onClick={async () => {
                        await bookingService.updateBookingStatus(scannedBooking.id!, 'ongoing', { 
                          checkedInAt: Date.now(),
                          ...(scannedBooking.type === 'carWash' ? { washPhase: 'In Progress' } : {})
                        });
                        playVoice(`Session started for ${scannedBooking.userName}. Welcome to Hub Station!`, 'Zephyr');
                        // Logs
                        const logId = Math.random().toString(36).substring(2, 9);
                        setMonitorLogs(prev => [
                          { id: logId, time: new Date().toLocaleTimeString(), message: `🚀 Checked-in: Started session for ${scannedBooking.userName}`, type: 'success' },
                          ...prev
                        ]);
                        setScannedBooking(null);
                      }}
                      className="w-full py-4 bg-accent text-zinc-950 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-accent/20 animate-pulse hover:animate-none"
                    >
                      <PlayCircle size={16} />
                      Check-in & Commence Session
                    </button>
                  )}

                  {scannedBooking.status === 'ongoing' && (
                    <button
                      onClick={async () => {
                        await bookingService.updateBookingStatus(scannedBooking.id!, 'completed', {
                          ...(scannedBooking.type === 'carWash' ? { washPhase: 'Done' } : {})
                        });
                        playVoice(`Session completed for ${scannedBooking.userName}. Thank you!`, 'Zephyr');
                        // Logs
                        const logId = Math.random().toString(36).substring(2, 9);
                        setMonitorLogs(prev => [
                          { id: logId, time: new Date().toLocaleTimeString(), message: `🏁 Released: Completed session for ${scannedBooking.userName}`, type: 'info' },
                          ...prev
                        ]);
                        setScannedBooking(null);
                      }}
                      className="w-full py-4 bg-emerald-500 text-zinc-950 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      <CheckCircle2 size={16} />
                      Finish & Release Slot
                    </button>
                  )}

                  {scannedBooking.status === 'completed' && (
                    <div className="text-center p-3 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      ✓ This session has already been completed & released.
                    </div>
                  )}

                  {scannedBooking.status === 'cancelled' && (
                    <div className="text-center p-3 bg-red-950/10 border border-red-900/20 rounded-2xl text-[10px] font-bold text-red-500 uppercase tracking-widest">
                      ⚠️ This ticket was cancelled.
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <button
                      onClick={() => {
                        setScannedBooking(null);
                        setIsScannerOpen(true);
                      }}
                      className="py-3 bg-zinc-850 hover:bg-zinc-800 text-slate-100 font-bold text-[9px] uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center"
                    >
                      Scan Another
                    </button>
                    <button
                      onClick={() => setScannedBooking(null)}
                      className="py-3 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-slate-200 font-bold text-[9px] uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scan Error presentation dialog */}
        <AnimatePresence>
          {scanError && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md"
            >
              <div className="max-w-md w-full bg-zinc-900 border border-red-500/30 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col gap-6">
                
                {/* Visual Accent Layer */}
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/10 text-red-00 border border-red-500/20 rounded-2xl flex items-center justify-center">
                      <ShieldAlert size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-100 uppercase tracking-tighter italic">SCAN FAILED</h3>
                      <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Code Verification Warning</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setScanError(null)}
                    className="p-3 bg-zinc-800 text-zinc-400 hover:text-slate-100 rounded-2xl cursor-pointer"
                  >
                    <XCircle size={18} />
                  </button>
                </div>

                <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-850 text-center">
                  <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                    {scanError}
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setScanError(null);
                      setIsScannerOpen(true);
                    }}
                    className="flex-1 py-3 bg-red-500 text-zinc-950 font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-white transition-all active:scale-95 cursor-pointer shadow-md shadow-red-500/20 text-center"
                  >
                    Scan Again
                  </button>
                  <button
                    onClick={() => setScanError(null)}
                    className="flex-1 py-3 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-bold text-[9px] uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center"
                  >
                    Dismiss
                  </button>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatePresence>

      {activeView === 'monitor' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left columns: Monitor main counters and incoming lists */}
          <div className="lg:col-span-2 space-y-8">
            {/* Connection Diagnostics Banner */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/30 to-accent/30" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500">
                  <Activity size={24} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest">REAL-TIME MONITOR DESK</h3>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Firestore Pipeline Connection: <span className="text-emerald-500 animate-pulse">online</span></p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsScannerOpen(true)}
                  className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl border border-accent/30 bg-accent/10 hover:bg-accent hover:text-zinc-950 text-[10px] font-black uppercase tracking-widest text-accent transition-all shadow-md cursor-pointer group"
                  id="scan-ticket-monitor-btn"
                >
                  <Scan size={14} className="animate-pulse group-hover:transform group-hover:scale-110 transition-transform" />
                  Scan Ticket QR
                </button>
                <div className="text-right">
                  <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Pipeline Sync</p>
                  <p className="text-xs font-mono text-zinc-400 leading-none">{new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            </div>

            {/* Service occupy slot counters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center">
                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Waiting Queue</p>
                <p className="text-2xl font-black text-orange-500 leading-none">{bookings.filter(b => b.status === 'pending').length}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center">
                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Active In Bays</p>
                <p className="text-2xl font-black text-blue-500 leading-none">{bookings.filter(b => b.status === 'ongoing').length}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center">
                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Completed Today</p>
                <p className="text-2xl font-black text-emerald-500 leading-none">{bookings.filter(b => b.status === 'completed').length}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center">
                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Cancelled Sessions</p>
                <p className="text-2xl font-black text-red-500 leading-none">{bookings.filter(b => b.status === 'cancelled').length}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center col-span-2 sm:col-span-1 lg:col-span-1">
                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Advance Pre-Bookings</p>
                <p className="text-2xl font-black text-purple-500 leading-none">{bookings.filter(b => b.date > (new Date().toISOString().split('T')[0])).length}</p>
              </div>
            </div>

            {/* Active Ongoing Sessions List */}
            <div>
              <div className="flex items-center justify-between mb-4 px-2">
                <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Slot Workloads ({bookings.filter(b => b.status === 'ongoing').length})
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.filter(b => b.status === 'ongoing').map((booking, idx) => (
                  <div key={booking.id ? `ongoing-id-${booking.id}-${idx}` : `ongoing-idx-${idx}`} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[12.5rem] h-auto hover:border-accent/40 transition-colors">
                    <div className="absolute top-0 right-0 p-4">
                      <span className="text-[8px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                        {getServiceDisplayName(booking.type)}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-100 uppercase tracking-tight truncate pr-16">{booking.userName}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">{booking.resourceName}</p>
                      <p className="text-[8px] font-mono text-zinc-600 uppercase mt-1">ID: {booking.id?.substring(0, 8)}</p>
                      
                      {/* Premium Countdown and Progression Display */}
                      <SessionCountdown checkedInAt={booking.checkedInAt || booking.createdAt} duration={booking.duration || 1} />
                    </div>
                    <div className="pt-4 border-t border-zinc-950 flex items-center justify-between gap-2 mt-4">
                      <div className="flex items-center gap-1.5 text-emerald-500">
                        <Clock size={12} className="animate-spin" style={{ animationDuration: '4s' }} />
                        <span className="text-[10px] font-mono font-black uppercase">Active Slot</span>
                      </div>
                      <button
                        onClick={() => handleStatusUpdate(booking.id!, 'completed')}
                        className="px-4 py-2 bg-emerald-500 text-zinc-950 font-black text-[9px] uppercase tracking-wider rounded-xl transition-all hover:bg-white active:scale-95 cursor-pointer"
                      >
                        Finish & Release
                      </button>
                    </div>
                  </div>
                ))}
                {bookings.filter(b => b.status === 'ongoing').length === 0 && (
                  <div className="col-span-full py-12 text-center bg-zinc-900/40 border border-zinc-800 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center p-8">
                    <Activity size={32} className="text-zinc-800 mb-2 opacity-30" />
                    <p className="text-[10px] font-black text-zinc-550 uppercase tracking-widest">No active workloads in bays currently</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pending Check-in Pipeline Queue */}
            <div>
              <div className="flex items-center justify-between mb-4 px-2">
                <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  Upcoming Session Queue ({bookings.filter(b => b.status === 'pending').length})
                </h4>
              </div>
              <div className="space-y-3">
                {bookings.filter(b => b.status === 'pending').slice(0, 8).map((booking, idx) => (
                  <div key={booking.id ? `pending-id-${booking.id}-${idx}` : `pending-idx-${idx}`} className="bg-zinc-900 border border-zinc-805 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400">
                        {getServiceIcon(booking.type, 20)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-100">{booking.userName}</p>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mt-0.5">
                          {getServiceDisplayName(booking.type)} • {booking.resourceName} • Sch: {booking.startTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button 
                        onClick={() => handleStatusUpdate(booking.id!, 'ongoing')}
                        className="flex-1 sm:flex-none px-4 py-2 bg-accent text-zinc-950 font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-white active:scale-95 transition-all"
                      >
                        Start Session
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(booking.id!, 'cancelled')}
                        className="px-3.5 py-2 border border-zinc-800 hover:bg-zinc-850 hover:text-red-500 text-zinc-650 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
                {bookings.filter(b => b.status === 'pending').length === 0 && (
                  <div className="py-12 text-center bg-zinc-900/40 border border-zinc-800 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center p-8">
                    <CheckCircle2 size={32} className="text-zinc-800 mb-2 opacity-30" />
                    <p className="text-[10px] font-black text-zinc-550 uppercase tracking-widest">Incoming dispatch channel completely clear!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column: Indicators and Raw live transactions terminal */}
          <div className="space-y-8">
            {/* Connection Telemetry Indicators */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-6">
              <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4 px-1 flex items-center gap-2">
                <Wifi size={14} className="text-accent animate-pulse" />
                Live Status Indicators
              </h4>
              <div className="space-y-4">
                <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Database Sync</p>
                    <p className="text-xs font-bold text-slate-100">Firestore Listener Node</p>
                  </div>
                  <span className="text-[8px] font-black px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 uppercase tracking-widest animate-pulse">
                    CONNECTED
                  </span>
                </div>
                <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Telemetry Rate</p>
                    <p className="text-xs font-bold text-slate-100">Sync Signal Stream</p>
                  </div>
                  <span className="text-[8px] font-mono font-bold text-accent">
                    REAL-TIME
                  </span>
                </div>
              </div>
            </div>

            {/* Live System Operation terminal ticker */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-6 flex flex-col h-[480px]">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
                <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Terminal size={14} className="text-emerald-500" />
                  REAL-TIME PIPELINE LOGS
                </h4>
                <button 
                  onClick={() => setMonitorLogs([])}
                  className="text-[9px] font-black text-zinc-500 hover:text-red-500 uppercase tracking-widest transition-colors"
                >
                  Clear Logs
                </button>
              </div>
              
              <div className="flex-1 bg-zinc-950 border border-zinc-850 rounded-2xl p-4 font-mono text-[10px] leading-relaxed overflow-y-auto space-y-3 shadow-inner">
                <AnimatePresence initial={false}>
                  {monitorLogs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                      className="flex gap-2 items-start"
                    >
                      <span className="text-zinc-600 shrink-0 select-none">[{log.time}]</span>
                      <span className={
                        log.type === 'success' ? 'text-emerald-400 font-bold' :
                        log.type === 'warn' ? 'text-amber-500 font-bold' :
                        log.type === 'error' ? 'text-red-500 font-bold' :
                        'text-sky-400'
                      }>
                        {log.message}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {monitorLogs.length === 0 && (
                  <p className="text-zinc-700 italic text-center pt-24 font-sans select-none">No transactions recorded yet in current session...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : activeView === 'bookings' ? (
        <>
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl h-full">
            <input 
              type="checkbox" 
              checked={selectedBookings.length === filteredBookings.length && filteredBookings.length > 0}
              onChange={toggleAllSelection}
              className="w-5 h-5 accent-accent cursor-pointer"
            />
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">Select All</span>
          </div>
          <div className="relative flex-1 w-full flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 text-zinc-600" size={18} />
              <input 
                type="text" 
                placeholder="Search bookings..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12"
              />
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsScannerOpen(true)}
                className="flex items-center gap-3 px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-accent hover:text-accent transition-all whitespace-nowrap"
              >
                <Scan size={16} />
                Scan QR
              </button>
              
              <div className={`flex items-center gap-2 px-4 py-3 bg-zinc-900 border ${
                isCameraActive ? 'border-emerald-500/30 text-emerald-400' : 'border-zinc-800 text-zinc-500'
              } rounded-2xl transition-all duration-300 select-none shadow-md`}>
                <span className="relative flex h-2 w-2">
                  <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isCameraActive ? 'animate-ping bg-emerald-400' : 'bg-transparent'
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    isCameraActive ? 'bg-emerald-500' : 'bg-zinc-700'
                  }`}></span>
                </span>
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">
                  {isCameraActive ? 'Camera Active' : 'Standby'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 p-1 bg-zinc-900 rounded-2xl border border-zinc-800 overflow-x-auto">
            {(['all', 'today', 'upcoming', 'last7', 'custom'] as const).map((df) => (
              <button
                key={df}
                onClick={() => setDateFilter(df)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  dateFilter === df ? 'bg-zinc-800 text-slate-100' : 'hover:bg-zinc-800 border-transparent text-zinc-500'
                }`}
              >
                {df === 'last7' ? 'Last 7 Days' : df === 'upcoming' ? 'Pre-Bookings' : df}
              </button>
            ))}
          </div>
        </div>

        {dateFilter === 'custom' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex gap-4 items-center overflow-hidden"
          >
            <input 
              type="date"
              className="input-field max-w-[200px]"
              value={customRange.start}
              onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
            />
            <span className="text-zinc-500 font-bold uppercase text-[10px]">TO</span>
            <input 
              type="date"
              className="input-field max-w-[200px]"
              value={customRange.end}
              onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
            />
          </motion.div>
        )}

        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex gap-2 p-1 bg-zinc-900 rounded-2xl border border-zinc-800 flex-1 overflow-x-auto">
            {(['all', 'game', 'carWash', 'badminton', 'theatre', 'cafe'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t as BookingType | 'all')}
                className={`whitespace-nowrap flex-1 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  typeFilter === t ? 'bg-blue-500 text-white' : 'hover:bg-zinc-800 text-zinc-500'
                }`}
              >
                {t === 'carWash' ? 'CAR WASH' : t === 'all' ? 'ALL SERVICES' : t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex gap-2 p-1 bg-zinc-900 rounded-2xl border border-zinc-800 flex-1 overflow-x-auto">
            {(['all', 'pending', 'ongoing', 'completed', 'cancelled'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s as BookingStatus | 'all')}
                className={`whitespace-nowrap flex-1 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === s ? 'bg-accent text-zinc-950' : 'hover:bg-zinc-800 text-zinc-500'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {(filter === 'completed' || filter === 'all') && bookings.some(b => ['completed', 'cancelled'].includes(b.status)) && (
            <button 
              onClick={handleClearHistory}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-[2rem] border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-all font-black text-[10px] uppercase tracking-widest shrink-0"
            >
              <Trash2 size={16} />
              Clear History
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredBookings.map((booking, idx) => (
          <motion.div 
            key={booking.id ? `filtered-id-${booking.id}-${idx}` : `filtered-idx-${idx}`}
            layout
            className={`bg-zinc-900 rounded-[2.5rem] p-8 border transition-all shadow-sm relative overflow-hidden ${
              selectedBookings.includes(booking.id!) ? 'border-accent ring-1 ring-accent/30' : 'border-zinc-800'
            }`}
          >
            {/* Selection Checkbox */}
            <div className="absolute top-8 left-8 z-10">
              <input 
                type="checkbox" 
                checked={selectedBookings.includes(booking.id!)}
                onChange={() => toggleBookingSelection(booking.id!)}
                className="w-6 h-6 accent-accent cursor-pointer opacity-0 group-hover:opacity-100 peer"
              />
              <div className={`w-6 h-6 rounded-lg pointer-events-none flex items-center justify-center transition-all ${
                selectedBookings.includes(booking.id!) ? 'bg-accent border-accent' : 'bg-zinc-950 border border-zinc-700'
              }`}>
                {selectedBookings.includes(booking.id!) && <CheckCircle2 size={14} className="text-zinc-950" />}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-6 pl-12">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-700 group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                  {getServiceIcon(booking.type, 32)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold text-xl text-slate-100 italic">{booking.userName}</h4>
                    <span className="text-[10px] flex items-center gap-1.5 font-black text-amber-500 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20 uppercase tracking-widest">
                       {getServiceIcon(booking.type, 12)}
                       {getServiceDisplayName(booking.type)}
                    </span>
                    {booking.id === 'booking_id_123' && (
                      <span className={`text-[10px] flex items-center gap-1.5 font-black px-3 py-1 rounded-full border uppercase tracking-widest ${
                        booking.status === 'pending' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                        booking.status === 'ongoing' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                        booking.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                        'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        Status: {booking.status}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-widest">
                    {booking.userEmail} {booking.userPhone && `• ${booking.userPhone}`}
                  </p>
                  <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest mb-1">ID: {booking.id}</p>
                  <p className="text-slate-300 font-black uppercase tracking-tight text-sm mb-2">{booking.resourceName}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">

                    {booking.bay && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                        <PlayCircle size={10} className="text-blue-400" />
                        <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">{booking.bay}</span>
                      </div>
                    )}
                    {booking.paymentStatus === 'paid' ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <CheckCircle2 size={10} className="text-emerald-400" />
                        <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">
                          Paid {booking.paymentMethod && `via ${booking.paymentMethod.toUpperCase()}`}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full">
                        <IndianRupee size={10} className="text-zinc-500" />
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Unpaid</span>
                      </div>
                    )}
                    {booking.discountType && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-full text-emerald-400 font-sans">
                        <span className="text-[8px] font-black uppercase tracking-widest">🌱 {booking.discountType} (-10%)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 text-right">
                <div className="flex items-center gap-4 mb-2">
                   <div className="flex flex-col items-end">
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">Schedule</p>
                      <p className="text-sm font-bold text-slate-400">{booking.date} @ {booking.startTime}</p>
                   </div>
                   <div className={`w-3 h-3 rounded-full animate-pulse ${
                     booking.status === 'pending' ? 'bg-orange-500' : 
                     booking.status === 'ongoing' ? 'bg-blue-500' : 'bg-green-500'
                   }`} />
                </div>
                
                <div className="flex gap-2">
                  {booking.status === 'pending' && (
                    <button 
                      onClick={() => {
                        if (booking.type === 'carWash') {
                          setAssignBayBookingId(booking.id!);
                        } else {
                          handleStatusUpdate(booking.id!, 'ongoing')
                        }
                      }}
                      className="p-3 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20"
                      title="Start Service"
                    >
                      <PlayCircle size={20} />
                    </button>
                  )}
                  {booking.status === 'ongoing' && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {booking.type === 'carWash' && (
                        <>
                          <button 
                            onClick={() => setAssignBayBookingId(booking.id!)}
                            className="p-3 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20"
                            title="Assign/Change Bay"
                          >
                            <Car size={20} />
                          </button>
                          
                          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                            {(['In Progress', 'Detailing'] as const).map((phase) => {
                              const isActive = booking.washPhase === phase || (!booking.washPhase && phase === 'In Progress');
                              return (
                                <button
                                  key={phase}
                                  onClick={() => handleStatusUpdate(booking.id!, 'ongoing', { washPhase: phase })}
                                  className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                    isActive
                                      ? 'bg-accent text-zinc-950 font-black shadow-md'
                                      : 'text-zinc-500 hover:text-slate-200'
                                  }`}
                                  title={`Move to ${phase}`}
                                >
                                  {phase}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  {(booking.status === 'pending' || booking.status === 'ongoing') && (
                    <button 
                      onClick={() => handleStatusUpdate(booking.id!, 'completed')}
                      className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-zinc-900 transition-all border border-emerald-500/20 flex items-center justify-center min-w-[44px]"
                      title="Complete Service"
                    >
                      <AnimatePresence mode="wait">
                        {successAnimationId === booking.id ? (
                          <motion.div
                            key="success"
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1.2, rotate: 0 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                          >
                            <CheckCircle2 size={20} className="fill-emerald-500/20" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="default"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <CheckCircle2 size={20} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  )}
                  <button 
                    onClick={() => handleStatusUpdate(booking.id!, 'cancelled')}
                    className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                    title="Cancel Booking"
                  >
                    <XCircle size={20} />
                  </button>
                  <button 
                    onClick={() => setShowAdminPaymentQR({ amount: booking.price, bookingId: booking.id! })}
                    className="p-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all border border-green-500/20"
                    title="Show Payment QR"
                  >
                    <IndianRupee size={20} />
                  </button>
                  <button 
                    onClick={() => handleDeleteBooking(booking.id!)}
                    className="p-3 bg-red-900/10 text-red-900 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-900/20"
                    title="Delete Record Permanently"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Payment & Customer Info Expansion */}
            <div className="mt-8 pt-8 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Customer Info Card */}
              <div className="space-y-4">
                <h5 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                  <User size={12} />
                  Customer Intelligence
                </h5>
                <div className="bg-zinc-950/50 rounded-2xl p-4 border border-zinc-800/50 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                      <Mail size={14} />
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">Email Address</p>
                      <p className="text-[11px] font-bold text-slate-300">{booking.userEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                      <Phone size={14} />
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">Mobile Contact</p>
                      <p className="text-[11px] font-bold text-slate-300">{booking.userPhone || 'Not Provided'}</p>
                    </div>
                  </div>
                  {booking.notes && (
                    <div className="flex items-start gap-3 pt-2">
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-500/50 mt-1">
                        <Info size={14} />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">Customer Notes</p>
                        <p className="text-[10px] font-medium text-amber-500/80 leading-relaxed italic">"{booking.notes}"</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Control Card */}
              <div className="space-y-4">
                <h5 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                  <CreditCard size={12} />
                  Payment Resolution
                </h5>
                <div className="bg-zinc-950/50 rounded-2xl p-4 border border-zinc-800/50">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-tight">Total Due: ₹{booking.price}</p>
                    <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${
                      booking.paymentStatus === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {booking.paymentStatus || 'UNPAID'}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => handlePaymentUpdate(booking.id!, 'paid', 'upi')}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                        booking.paymentMethod === 'upi' ? 'bg-accent border-accent text-zinc-950' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                      }`}
                    >
                      <Smartphone size={16} />
                      <span className="text-[8px] font-black uppercase tracking-widest">UPI</span>
                    </button>
                    <button 
                      onClick={() => handlePaymentUpdate(booking.id!, 'paid', 'cash')}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                        booking.paymentMethod === 'cash' ? 'bg-green-500 border-green-400 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                      }`}
                    >
                      <Banknote size={16} />
                      <span className="text-[8px] font-black uppercase tracking-widest">Cash</span>
                    </button>
                    <button 
                      onClick={() => handlePaymentUpdate(booking.id!, 'unpaid')}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all bg-zinc-950 border-zinc-800 text-zinc-600 hover:border-red-500/30 font-black`}
                    >
                      <XCircle size={16} />
                      <span className="text-[8px] font-black uppercase tracking-widest">Reset</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>


            {assignBayBookingId === booking.id && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-6 bg-zinc-950 rounded-[2rem] border border-zinc-800 shadow-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h5 className="text-[12px] font-black text-slate-100 uppercase tracking-widest italic">Select Assignment Bay</h5>
                    <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1">Car Wash Station Management</p>
                  </div>
                  <button 
                    onClick={() => setAssignBayBookingId(null)}
                    className="p-2 text-zinc-500 hover:text-slate-100 transition-colors"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['BAY 1', 'BAY 2'].map((bay) => (
                    <button
                      key={bay}
                      onClick={() => handleStartCarWash(booking.id!, bay)}
                      className="group relative overflow-hidden bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-accent transition-all text-center"
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-accent/10 group-hover:bg-accent/50 transition-colors" />
                      <p className="text-[14px] font-black text-slate-100 group-hover:text-accent transition-colors">{bay}</p>
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1">Assign</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedBookings.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[150] w-[90%] max-w-2xl"
          >
            <div className="bg-zinc-950 border border-accent/30 rounded-[2rem] p-4 shadow-2xl flex flex-wrap items-center justify-between gap-4 backdrop-blur-xl">
              <div className="flex items-center gap-4 px-4">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-zinc-950 font-black">
                  {selectedBookings.length}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-100">Items Selected</p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleBulkStatusUpdate('ongoing')}
                  className="px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all"
                >
                  Start All
                </button>
                <button 
                  onClick={() => handleBulkStatusUpdate('completed')}
                  className="px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-zinc-950 transition-all"
                >
                  Complete All
                </button>
                <button 
                  onClick={() => handleBulkStatusUpdate('cancelled')}
                  className="px-4 py-2 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                >
                  Cancel All
                </button>
                <div className="w-px h-8 bg-zinc-800 mx-2" />
                <button 
                  onClick={handleBulkDelete}
                  className="p-3 bg-red-900/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </>
      ) : activeView === 'calendar' ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
            <div>
              <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tighter italic mb-2">Schedule Navigator</h3>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Multi-service event monitoring</p>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mr-8 p-3 bg-zinc-950/50 rounded-2xl border border-zinc-800/50">
                {['game', 'carWash', 'badminton', 'theatre', 'cafe'].map(type => (
                  <div key={type} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getServiceColor(type)}`} />
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">{getServiceDisplayName(type)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 bg-zinc-950 p-2 rounded-2xl border border-zinc-800">
                <button 
                  onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                  className="p-2 text-zinc-500 hover:text-accent transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-100 min-w-[150px] text-center italic">
                  {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </p>
                <button 
                  onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                  className="p-2 text-zinc-500 hover:text-accent transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-[10px] font-black text-zinc-600 uppercase tracking-widest pb-4">
                {day}
              </div>
            ))}
            {(() => {
              const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
              const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
              const days = [];
              
              const today = new Date();
              const localTodayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];

              for (let i = 0; i < firstDayOfMonth; i++) {
                days.push(<div key={`empty-${i}`} className="h-32 bg-zinc-950/20 rounded-2xl" />);
              }

              for (let d = 1; d <= daysInMonth; d++) {
                const dayDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
                const dateStr = new Date(dayDate.getTime() - dayDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
                const dayBookings = bookings.filter(b => b.date === dateStr);
                const isToday = dateStr === localTodayStr;

                // Group by type for summary
                const typeCounts = dayBookings.reduce((acc, curr) => {
                  acc[curr.type] = (acc[curr.type] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);

                days.push(
                  <button
                    key={`day-${dateStr}`}
                    onClick={() => {
                      setDateFilter('custom');
                      setCustomRange({ start: dateStr, end: dateStr });
                      setActiveView('bookings');
                    }}
                    className={`h-32 p-4 rounded-2xl border transition-all flex flex-col items-start gap-2 group relative overflow-hidden ${
                      isToday ? 'bg-accent/5 border-accent' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span className={`text-sm font-black z-10 ${isToday ? 'text-accent' : 'text-zinc-500 group-hover:text-slate-100'}`}>
                      {d}
                    </span>
                    
                    <div className="flex flex-col gap-1 w-full z-10 overflow-hidden">
                      {Object.entries(typeCounts).map(([type, count]) => (
                        <div 
                          key={type}
                          className={`flex items-center justify-between px-2 py-0.5 rounded-md ${getServiceColor(type)}/10 border border-${getServiceTextColor(type).split('-')[1]}-500/20`}
                        >
                          <div className={`w-1 h-1 rounded-full ${getServiceColor(type)}`} />
                          <span className={`text-[8px] font-black ${getServiceTextColor(type)} uppercase`}>{count}</span>
                        </div>
                      ))}
                    </div>

                    {dayBookings.length === 0 && (
                      <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[7px] font-black text-zinc-700 uppercase tracking-widest">No Events</span>
                      </div>
                    )}
                    
                    {dayBookings.length > 0 && (
                      <div className="mt-auto w-full flex justify-between items-center text-[8px] font-black uppercase tracking-tighter">
                         <span className="text-zinc-400 italic">{dayBookings.length} Total</span>
                         <Plus size={10} className="text-accent" />
                      </div>
                    )}
                  </button>
                );
              }
              return days;
            })()}
          </div>
        </div>
      ) : activeView === 'payments' ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl">
          <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tighter italic mb-6">Payment History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Date</th>
                  <th className="py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Booking ID</th>
                  <th className="py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Service</th>
                  <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Amount</th>
                  <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Method</th>
                </tr>
              </thead>
              <tbody>
                {bookings.filter(b => b.paymentStatus === 'paid').map((b, idx) => (
                  <tr key={b.id ? `paid-${b.id}-${idx}` : `paid-${idx}`} className="border-b border-zinc-800/50 group hover:bg-zinc-800/20 transition-colors">
                    <td className="py-4 text-sm font-bold text-slate-300">{b.date}</td>
                    <td className="py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">{b.id}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-500">{getServiceIcon(b.type, 14)}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{getServiceDisplayName(b.type)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm font-black italic text-emerald-500">₹{b.price}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-full text-[8px] font-black uppercase tracking-widest text-slate-300">
                        {b.paymentMethod || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
                {bookings.filter(b => b.paymentStatus === 'paid').length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <p className="text-sm font-bold text-zinc-600 uppercase tracking-widest">No payment records found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeView === 'workers' ? (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tighter italic mb-2">Staff Operations</h3>
              <div className="flex gap-4">
                <button 
                  onClick={() => setWorkerSubView('attendance')}
                  className={`text-[10px] font-black uppercase tracking-widest transition-all pb-1 ${workerSubView === 'attendance' ? 'text-accent border-b-2 border-accent' : 'text-zinc-600 hover:text-zinc-400'}`}
                >
                  Attendance logs
                </button>
                <button 
                  onClick={() => setWorkerSubView('schedule')}
                  className={`text-[10px] font-black uppercase tracking-widest transition-all pb-1 ${workerSubView === 'schedule' ? 'text-accent border-b-2 border-accent' : 'text-zinc-600 hover:text-zinc-400'}`}
                >
                  Worker scheduling
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <input 
                type="date" 
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="input-field max-w-[200px]"
              />
              <button 
                onClick={handleExportAttendance}
                className="flex items-center gap-3 px-6 py-3 bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-accent hover:text-accent transition-all cursor-pointer"
                title={`Export ${attendanceDate} Attendance as CSV`}
              >
                <Download size={16} />
                Export Attendance
              </button>
              <a 
                href="/attendance"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 bg-zinc-950 border border-zinc-800 text-zinc-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-accent hover:text-accent transition-all"
              >
                <Fingerprint size={16} />
                Open Terminal
              </a>
              {workerSubView === 'attendance' ? (
                <button 
                  onClick={() => setShowAddWorker(!showAddWorker)}
                  className="flex items-center gap-3 px-6 py-3 bg-accent text-zinc-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-accent/90 transition-all"
                >
                  <Plus size={16} />
                  Add Employee
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setShowAddSchedule(!showAddSchedule);
                    setNewSchedule(prev => ({ ...prev, date: attendanceDate }));
                  }}
                  className="flex items-center gap-3 px-6 py-3 bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all"
                >
                  <CalendarIcon size={16} />
                  Assign Shift
                </button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showAddWorker && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Employee Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      className="input-field"
                      value={newWorker.name}
                      onChange={(e) => setNewWorker({...newWorker, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Role</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Car Wash Detailer"
                      className="input-field"
                      value={newWorker.role}
                      onChange={(e) => setNewWorker({...newWorker, role: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Contact</label>
                    <input 
                      type="text" 
                      placeholder="Mobile number"
                      className="input-field"
                      value={newWorker.contact}
                      onChange={(e) => setNewWorker({...newWorker, contact: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Joining Date</label>
                    <input 
                      type="date"
                      className="input-field"
                      value={newWorker.joiningDate}
                      onChange={(e) => setNewWorker({...newWorker, joiningDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Worker Personal ID (Optional)</label>
                    <input 
                      type="text"
                      placeholder="e.g. HUB001"
                      className="input-field"
                      value={newWorker.workerCode}
                      onChange={(e) => setNewWorker({...newWorker, workerCode: e.target.value.toUpperCase()})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <button 
                    onClick={() => setShowAddWorker(false)}
                    className="px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-slate-100"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddWorker}
                    disabled={isSubmittingWorker || !newWorker.name || !newWorker.role}
                    className="px-8 py-3 bg-zinc-950 border border-accent text-accent rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-zinc-950 transition-all disabled:opacity-50"
                  >
                    {isSubmittingWorker ? 'Creating...' : 'Register Employee'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {showAddSchedule && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 mb-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Select Employee</label>
                    <div className="relative">
                       <Users className="absolute left-4 top-3.5 text-zinc-600" size={18} />
                       <select 
                        className="input-field pl-12 appearance-none"
                        value={newSchedule.workerId}
                        onChange={(e) => {
                          const w = workers.find(x => x.id === e.target.value);
                          if (w) {
                            setNewSchedule({
                              ...newSchedule,
                              workerId: w.id!,
                              workerName: w.name,
                              workerRole: w.role
                            });
                          }
                        }}
                       >
                         <option value="">Choose coworker...</option>
                         {workers.map((w, idx) => (
                           <option key={w.id ? `worker-opt-id-${w.id}-${idx}` : `worker-opt-${idx}`} value={w.id}>{w.name} ({w.role})</option>
                         ))}
                       </select>
                       <ChevronDown className="absolute right-4 top-3.5 text-zinc-500 pointer-events-none" size={18} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Shift Time</label>
                    <div className="grid grid-cols-2 gap-2">
                       {(['morning', 'evening', 'night', 'full-day'] as const).map(s => (
                         <button 
                          key={s}
                          onClick={() => setNewSchedule({...newSchedule, shift: s})}
                          className={`py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                            newSchedule.shift === s ? 'bg-blue-500 border-blue-400 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                          }`}
                         >
                           {s}
                         </button>
                       ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Service Assignment</label>
                    <div className="relative">
                       <Briefcase className="absolute left-4 top-3.5 text-zinc-600" size={18} />
                       <select 
                        className="input-field pl-12 appearance-none"
                        value={newSchedule.serviceType || ''}
                        onChange={(e) => setNewSchedule({...newSchedule, serviceType: e.target.value as any || undefined})}
                       >
                         <option value="">General Assignment</option>
                         {['game', 'carWash', 'badminton', 'theatre', 'cafe'].map(t => (
                           <option key={t} value={t}>{getServiceDisplayName(t)}</option>
                         ))}
                       </select>
                       <ChevronDown className="absolute right-4 top-3.5 text-zinc-500 pointer-events-none" size={18} />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <button 
                    onClick={() => setShowAddSchedule(false)}
                    className="px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-slate-100"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddSchedule}
                    disabled={isSubmittingSchedule || !newSchedule.workerId}
                    className="px-8 py-3 bg-blue-500 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50"
                  >
                    {isSubmittingSchedule ? 'Saving...' : 'Confirm Schedule'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {workerSubView === 'attendance' ? (
                <>
                  <h4 className="text-sm font-black text-slate-100 uppercase tracking-widest px-4">Active Staff List</h4>
                  {workers.length === 0 && (
                    <div className="p-12 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] text-center">
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">No employees registered yet.</p>
                    </div>
                  )}
                  {workers.map((worker, idx) => {
                    const record = attendance.find(a => a.workerId === worker.id);
                    return (
                      <div key={worker.id ? `worker-id-${worker.id}-${idx}` : `worker-${idx}`} className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-6 hover:border-accent/30 transition-all group">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                          <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center text-zinc-700 group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                              <User size={24} />
                            </div>
                            <div>
                              <h5 className="font-bold text-lg text-slate-100 italic">{worker.name}</h5>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="flex items-center gap-1 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                  <Briefcase size={10} className="text-amber-500" />
                                  {worker.role}
                                </span>
                                <span className="text-zinc-700">•</span>
                                <span className="flex items-center gap-1 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                  <Phone size={10} />
                                  {worker.contact}
                                </span>
                                <span className="text-zinc-700">•</span>
                                <span className="flex items-center gap-1 text-[10px] font-black text-accent uppercase tracking-[0.2em]">
                                  <Fingerprint size={10} />
                                  ID: {worker.workerCode}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleMarkAttendance(worker.id!, worker.name, 'present')}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                record?.status === 'present' 
                                  ? 'bg-emerald-500 text-zinc-950' 
                                  : 'bg-zinc-950 text-zinc-500 border border-zinc-800 hover:border-emerald-500 hover:text-emerald-500'
                              }`}
                            >
                              Present
                            </button>
                            <button 
                              onClick={() => handleMarkAttendance(worker.id!, worker.name, 'half-day')}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                record?.status === 'half-day' 
                                  ? 'bg-amber-500 text-zinc-950' 
                                  : 'bg-zinc-950 text-zinc-500 border border-zinc-800 hover:border-amber-500 hover:text-amber-500'
                              }`}
                            >
                              Half Day
                            </button>
                            <button 
                              onClick={() => handleMarkAttendance(worker.id!, worker.name, 'absent')}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                record?.status === 'absent' 
                                  ? 'bg-red-500 text-zinc-950' 
                                  : 'bg-zinc-950 text-zinc-500 border border-zinc-800 hover:border-red-500 hover:text-red-500'
                              }`}
                            >
                              Absent
                            </button>
                            <button 
                              onClick={() => handleDeleteWorker(worker.id!)}
                              className="p-2.5 bg-zinc-950 text-zinc-700 border border-zinc-800 rounded-xl hover:text-red-500 hover:border-red-500 transition-all ml-2"
                              title="Delete Employee"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between px-4">
                    <h4 className="text-sm font-black text-slate-100 uppercase tracking-widest">Scheduled Roster for {attendanceDate}</h4>
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                      {schedules.length} Assigned
                    </span>
                  </div>
                  {schedules.length === 0 && (
                    <div className="p-12 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] text-center">
                      <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center text-zinc-800 mx-auto mb-4 border border-zinc-800/50">
                        <CalendarIcon size={32} />
                      </div>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">No shifts planned for this date.</p>
                      <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest italic">Use 'Assign Shift' to plan the roster.</p>
                    </div>
                  )}
                  {schedules.map((schedule, idx) => (
                    <motion.div 
                      key={schedule.id ? `schedule-id-${schedule.id}-${idx}` : `schedule-${schedule.workerId}-${idx}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-6 hover:border-blue-500/30 transition-all group"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                            schedule.shift === 'morning' ? 'bg-amber-500/10 text-amber-500' :
                            schedule.shift === 'evening' ? 'bg-blue-500/10 text-blue-400' :
                            schedule.shift === 'night' ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            <Clock size={24} />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h5 className="font-bold text-lg text-slate-100 italic">{schedule.workerName}</h5>
                              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                                schedule.shift === 'morning' ? 'border-amber-500/30 text-amber-500' :
                                schedule.shift === 'evening' ? 'border-blue-500/30 text-blue-400' :
                                schedule.shift === 'night' ? 'border-purple-500/30 text-purple-400' : 'border-emerald-500/30 text-emerald-400'
                              }`}>
                                {schedule.shift}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                <Briefcase size={10} />
                                {schedule.workerRole}
                              </span>
                              {schedule.serviceType && (
                                <>
                                  <span className="text-zinc-700">•</span>
                                  <span className="flex items-center gap-1 text-[10px] font-black text-accent uppercase tracking-widest">
                                    {getServiceIcon(schedule.serviceType, 10)}
                                    {getServiceDisplayName(schedule.serviceType)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => handleDeleteSchedule(schedule.id!)}
                            className="p-3 bg-zinc-950 text-zinc-700 border border-zinc-800 rounded-xl hover:text-red-500 hover:border-red-500 transition-all"
                            title="Remove Schedule"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-zinc-950 border border-zinc-800 rounded-[2rem] p-6">
                <h4 className="text-xs font-black text-slate-100 uppercase tracking-widest mb-6 flex items-center gap-2">
                  {workerSubView === 'attendance' ? (
                    <>
                      <UserCheck size={16} className="text-emerald-500" />
                      Attendance Summary
                    </>
                  ) : (
                    <>
                      <CalendarIcon size={16} className="text-blue-500" />
                      Roster Overview
                    </>
                  )}
                </h4>
                <div className="space-y-4">
                  {workerSubView === 'attendance' ? (
                    <>
                      <div className="flex justify-between items-center p-4 bg-zinc-900 rounded-xl">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Present</span>
                        <span className="text-xl font-black text-emerald-500 italic">{attendance.filter(a => a.status === 'present').length}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-zinc-900 rounded-xl">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Half Day</span>
                        <span className="text-xl font-black text-amber-500 italic">{attendance.filter(a => a.status === 'half-day').length}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-zinc-900 rounded-xl">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Absent</span>
                        <span className="text-xl font-black text-red-500 italic">{attendance.filter(a => a.status === 'absent').length}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center p-4 bg-zinc-900 rounded-xl">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Morning Shift</span>
                        <span className="text-xl font-black text-amber-500 italic">{schedules.filter(s => s.shift === 'morning').length}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-zinc-900 rounded-xl">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Evening Shift</span>
                        <span className="text-xl font-black text-blue-400 italic">{schedules.filter(s => s.shift === 'evening').length}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-zinc-900 rounded-xl">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Night Shift</span>
                        <span className="text-xl font-black text-purple-400 italic">{schedules.filter(s => s.shift === 'night').length}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-center p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Total Staff</span>
                    <span className="text-xl font-black text-slate-100 italic">{workers.length}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-accent/5 border border-accent/20 rounded-[2rem]">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-zinc-950">
                     <Clock size={16} />
                   </div>
                   <h5 className="font-black text-xs uppercase tracking-widest text-slate-100">Live Status</h5>
                 </div>
                 <p className="text-[10px] font-medium text-zinc-400 leading-relaxed mb-4">
                   Marking attendance will automatically record the timestamp. Staff listed as "Inactive" will not appear in the daily log.
                 </p>
                 <div className="bg-zinc-950/50 p-3 rounded-xl border border-white/5">
                   <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">Selected Date</p>
                   <p className="text-[10px] font-black text-accent mt-1">{new Date(attendanceDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeView === 'cafeMenu' ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tighter italic mb-2">Cafe Menu Management</h3>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Add and manage menu items for the Hub Cafe</p>
            </div>
            <button 
              onClick={() => {
                setEditingMenuItem(null);
                setNewMenuItem({ name: '', category: '', price: 0, imageUrl: '', isAvailable: true });
                setShowAddMenu(true);
              }}
              className="flex items-center gap-3 px-6 py-3 bg-amber-500 text-zinc-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-400 transition-all"
            >
              <Plus size={16} />
              Add Menu Item
            </button>
          </div>

          <AnimatePresence>
            {showAddMenu && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-zinc-950 border border-zinc-800 rounded-[2rem] p-8 mb-8 overflow-hidden"
              >
                <h4 className="text-sm font-black text-slate-100 uppercase tracking-widest mb-6">{editingMenuItem ? 'Edit Menu Item' : 'New Menu Item'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Item Name</label>
                    <input 
                      type="text" 
                      placeholder="Espresso, Sandwich..."
                      value={newMenuItem.name}
                      onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Category</label>
                    <select 
                      className="input-field appearance-none"
                      value={newMenuItem.category}
                      onChange={(e) => setNewMenuItem({...newMenuItem, category: e.target.value})}
                    >
                      <option value="">Select Category</option>
                      <option value="Coffee">Coffee</option>
                      <option value="Tea">Tea</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Cold Drinks">Cold Drinks</option>
                      <option value="Desserts">Desserts</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Price (₹)</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={newMenuItem.price || ''}
                      onChange={(e) => setNewMenuItem({...newMenuItem, price: Number(e.target.value)})}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Image URL</label>
                    <input 
                      type="text" 
                      placeholder="https://..."
                      value={newMenuItem.imageUrl}
                      onChange={(e) => setNewMenuItem({...newMenuItem, imageUrl: e.target.value})}
                      className="input-field"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <button 
                    onClick={() => {
                      setShowAddMenu(false);
                      setEditingMenuItem(null);
                    }}
                    className="px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-slate-100"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddMenuItem}
                    disabled={isSubmittingMenu || !newMenuItem.name || !newMenuItem.category}
                    className="px-8 py-3 bg-amber-500 text-zinc-950 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all disabled:opacity-50"
                  >
                    {isSubmittingMenu ? 'Saving...' : editingMenuItem ? 'Update Item' : 'Add to Menu'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item, idx) => (
              <div key={item.id ? `menu-item-${item.id}-${idx}` : `menu-item-${idx}`} className="bg-zinc-950 border border-zinc-800 rounded-[2rem] p-6 hover:border-amber-500/30 transition-all group overflow-hidden">
                <div className="flex gap-4 mb-6">
                  <div className="w-20 h-20 bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 flex-shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <Coffee size={32} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">{item.category}</span>
                      <div className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-emerald-500' : 'bg-red-500'} shadow-[0_0_8px_rgba(16,185,129,0.5)]`} />
                    </div>
                    <h5 className="font-bold text-lg text-slate-100 italic truncate mb-1">{item.name}</h5>
                    <p className="text-xl font-black text-emerald-500 italic">₹{item.price}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-4 border-t border-zinc-900">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setEditingMenuItem(item);
                        setNewMenuItem({
                          name: item.name,
                          category: item.category,
                          price: item.price,
                          imageUrl: item.imageUrl || '',
                          isAvailable: item.isAvailable
                        });
                        setShowAddMenu(true);
                      }}
                      className="p-2.5 bg-zinc-900 text-zinc-500 border border-zinc-800 rounded-xl hover:text-amber-500 hover:border-amber-500 transition-all"
                      title="Edit Item"
                    >
                      <Briefcase size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteMenuItem(item.id!)}
                      className="p-2.5 bg-zinc-900 text-zinc-500 border border-zinc-800 rounded-xl hover:text-red-500 hover:border-red-500 transition-all"
                      title="Delete Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <button 
                    onClick={() => handleToggleMenuAvailability(item.id!, item.isAvailable)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                      item.isAvailable 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}
                  >
                    {item.isAvailable ? 'Available' : 'Sold Out'}
                  </button>
                </div>
              </div>
            ))}
            {menuItems.length === 0 && (
              <div className="col-span-full py-20 text-center bg-zinc-950/50 border border-zinc-800 border-dashed rounded-[3rem]">
                <Coffee size={48} className="mx-auto text-zinc-800 mb-4 opacity-20" />
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Your cafe menu is empty.</p>
                <p className="text-[10px] font-medium text-zinc-700 uppercase tracking-widest mt-1">Start adding delicious treats!</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminDashboard;
