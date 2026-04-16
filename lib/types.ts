import { Timestamp } from 'firebase/firestore'

export type UserRole =
  | 'super_admin'
  | 'event_admin'
  | 'quadinator'
  | 'volunteer'
  | 'guest_coordinator'
  | 'viewer'

export interface AppUser {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  role: UserRole
  assignedEventIds?: string[]
  createdAt: Timestamp
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  venue: string
  collegeName: string
  status: 'draft' | 'active' | 'completed' | 'archived'
  createdBy: string
  createdAt: Timestamp
  coverImageUrl?: string
  themeColor?: string
}

export interface Registration {
  id: string
  eventId: string
  name: string
  email: string
  phone: string
  designation: string
  organization: string
  category: 'participant' | 'guest' | 'vip' | 'media' | 'volunteer'
  registrationType: 'walk-in' | 'pre-registered' | 'invited'
  qrToken: string
  checkedIn: boolean
  checkInTime?: Timestamp
  badgePrinted: boolean
  certificateIssued: boolean
  paymentStatus: 'free' | 'paid' | 'pending'
  createdAt: Timestamp
  updatedAt: Timestamp
  status?: 'active' | 'waitlist' | 'cancelled'
}

export interface Guest {
  id: string
  eventId: string
  name: string
  designation: string
  organization: string
  photo?: string
  contactNumber: string
  email: string
  arrivalDateTime?: string
  departureDateTime?: string
  arrivalMode?: 'flight' | 'train' | 'bus' | 'self' | 'cab'
  flightNumber?: string
  trainNumber?: string
  busDetails?: string
  pickupRequired: boolean
  pickupAssignedTo?: string
  pickupVehicleDetails?: string
  pickupVolunteerContact?: string
  stayRequired: boolean
  hotelName?: string
  roomNumber?: string
  checkIn?: string
  checkOut?: string
  stayBookedBy?: string
  stayConfirmationDoc?: string
  dietaryPreference?: 'veg' | 'non-veg' | 'vegan' | 'jain'
  giftHandover?: {
    shawl: boolean
    gift: boolean
    memento: boolean
    handedBy?: string
    handedAt?: Timestamp
  }
  specialRequirements?: string
  sessionSlot?: string
  status: 'confirmed' | 'tentative' | 'cancelled' | 'arrived' | 'departed'
  createdAt: Timestamp
}

export interface Quadinator {
  id: string
  eventId: string
  name: string
  email: string
  phone: string
  photo?: string
  assignedQuad: string
  responsibilities: string[]
  teamMembers: { name: string; phone: string; role: string }[]
  shiftStart: string
  shiftEnd: string
  reportingTo: string
  createdAt: Timestamp
}

export interface StageRequirement {
  id: string
  eventId: string
  category: 'audio' | 'visual' | 'lighting' | 'furniture' | 'decor' | 'technical' | 'safety'
  itemName: string
  quantity: number
  unit: string
  description?: string
  specifications?: string
  status: 'pending' | 'ordered' | 'delivered' | 'setup' | 'checked'
  assignedVendor?: string
  estimatedCost?: number
  actualCost?: number
  requiredBy?: string
  deliveryNotes?: string
  backdropDetails?: {
    theme: string
    dimensions: string
    printingVendor: string
    status: string
    imagePreviewUrl?: string
  }
  createdAt: Timestamp
}

export interface ScheduleSlot {
  id: string
  eventId: string
  title: string
  description?: string
  startTime: string
  endTime: string
  category: 'inauguration' | 'keynote' | 'session' | 'cultural' | 'award' | 'break' | 'networking' | 'valedictory'
  speakerName?: string
  speakerDesignation?: string
  venue?: string
  mcName?: string
  status: 'upcoming' | 'live' | 'completed' | 'delayed' | 'cancelled'
  notes?: string
  order: number
  day?: number
  createdAt: Timestamp
}

export interface BudgetItem {
  id: string
  eventId: string
  category: 'venue' | 'catering' | 'decoration' | 'gifts' | 'travel' | 'accommodation' | 'av' | 'printing' | 'misc'
  itemName: string
  description?: string
  estimatedAmount: number
  actualAmount?: number
  paidBy?: string
  paymentMode?: 'cash' | 'upi' | 'bank-transfer' | 'cheque'
  receiptUrl?: string
  approvedBy?: string
  approvalStatus: 'pending' | 'approved' | 'rejected'
  date?: string
  notes?: string
  createdAt: Timestamp
}

export interface Vendor {
  id: string
  eventId: string
  name: string
  category: 'catering' | 'decoration' | 'av' | 'transport' | 'printing' | 'photography' | 'security'
  contactPerson: string
  phone: string
  email?: string
  address?: string
  gstin?: string
  contractUrl?: string
  totalAmount?: number
  advancePaid?: number
  balanceDue?: number
  deliverables: string[]
  status: 'enquired' | 'confirmed' | 'contracted' | 'active' | 'completed' | 'cancelled'
  rating?: number
  feedback?: string
  createdAt: Timestamp
}

export interface TravelRecord {
  id: string
  eventId: string
  personId: string
  personName: string
  personType: 'guest' | 'speaker' | 'vip' | 'staff'
  mode: 'flight' | 'train' | 'bus' | 'cab' | 'self'
  origin: string
  destination: string
  departureDateTime: string
  arrivalDateTime: string
  bookingReference?: string
  ticketUrl?: string
  bookedBy?: string
  bookingStatus: 'pending' | 'confirmed' | 'cancelled'
  pickupRequired: boolean
  pickupVehicle?: string
  pickupDriver?: string
  pickupContact?: string
  dropRequired: boolean
  dropVehicle?: string
  dropDriver?: string
  dropContact?: string
  travelCost?: number
  reimbursable: boolean
  pickupStatus?: 'scheduled' | 'dispatched' | 'picked_up' | 'dropped_off'
  createdAt: Timestamp
}

export interface Announcement {
  id: string
  eventId: string
  title: string
  message: string
  targetAudience: 'all' | 'quadinators' | 'guests' | 'volunteers'
  channel: 'push' | 'email' | 'whatsapp' | 'sms'
  scheduledAt?: string
  sentAt?: Timestamp
  sentBy: string
  status: 'draft' | 'scheduled' | 'sent' | 'failed'
  createdAt: Timestamp
}

export interface ChecklistItem {
  id: string
  task: string
  assignedTo?: string
  dueDate?: string
  status: 'pending' | 'done' | 'skipped'
  completedAt?: Timestamp
}

export interface Checklist {
  id: string
  eventId: string
  title: string
  category: 'pre-event' | 'day-of' | 'post-event' | 'custom'
  items: ChecklistItem[]
  createdAt: Timestamp
}

export interface Feedback {
  id: string
  eventId: string
  submittedBy?: string
  overallRating: number
  sessionRatings?: Record<string, number>
  organizationRating?: number
  hospitalityRating?: number
  contentRating?: number
  suggestions?: string
  testimonial?: string
  approved?: boolean
  submittedAt: Timestamp
}

export interface Certificate {
  id: string
  eventId: string
  recipientRegId: string
  recipientName: string
  certType: 'participation' | 'appreciation' | 'best-paper' | 'felicitation' | 'volunteer'
  issuedAt: Timestamp
  issuedBy: string
  templateUsed?: string
  downloadUrl?: string
  emailed: boolean
  emailedAt?: Timestamp
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'task' | 'guest' | 'budget' | 'checklist' | 'approval' | 'announcement'
  read: boolean
  link?: string
  createdAt: Timestamp
}

export interface MediaFile {
  id: string
  eventId: string
  album: string
  fileName: string
  fileUrl: string
  fileType: 'image' | 'video' | 'document'
  size: number
  uploadedBy: string
  uploadedAt: Timestamp
  description?: string
}
