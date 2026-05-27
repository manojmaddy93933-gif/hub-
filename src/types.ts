export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  mobileNumber?: string;
  role: UserRole;
  createdAt: number;
}

export type BookingType = 'game' | 'carWash' | 'badminton' | 'theatre' | 'cafe';
export type BookingStatus = 'pending' | 'ongoing' | 'completed' | 'cancelled';
export type BookingPriority = 'low' | 'medium' | 'high';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface Booking {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  type: BookingType;
  resourceId: string; // e.g., "Carrom Table 2", "Bay 1", "Court 1"
  resourceName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  duration: number;
  vehicleNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehiclePhotoUrl?: string;
  notes?: string;
  status: BookingStatus;
  priority?: BookingPriority;
  price: number;
  discountType?: string;
  discountAmount?: number;
  originalPrice?: number;
  paymentStatus?: 'unpaid' | 'pending' | 'paid';
  paymentMethod?: 'upi' | 'cash' | 'card';
  checkedInAt?: number;
  bay?: string;
  createdAt: number;
}

export interface Worker {
  id?: string;
  workerCode: string; // Unique code for attendance (e.g., HUB001)
  name: string;
  role: string;
  contact: string;
  joiningDate: string;
  isActive: boolean;
  createdAt: number;
}

export interface Attendance {
  id?: string;
  workerId: string;
  workerName: string;
  date: string; // YYYY-MM-DD
  checkIn: number; // timestamp
  checkOut?: number; // timestamp
  status: 'present' | 'absent' | 'half-day';
  notes?: string;
}

export type ShiftType = 'morning' | 'evening' | 'night' | 'full-day';
 
export interface CafeMenuItem {
  id?: string;
  name: string;
  category: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: number;
}

export interface StaffSchedule {
  id?: string;
  workerId: string;
  workerName: string;
  workerRole: string;
  date: string; // YYYY-MM-DD
  shift: ShiftType;
  serviceType?: BookingType;
  notes?: string;
  createdAt: number;
}
