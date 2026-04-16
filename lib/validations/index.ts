import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  venue: z.string().min(2, 'Venue is required'),
  collegeName: z.string().min(2, 'College name is required'),
  themeColor: z.string().optional(),
})

export const registrationSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Valid phone number required'),
  designation: z.string().min(1, 'Designation is required'),
  organization: z.string().min(1, 'Organization is required'),
  category: z.enum(['participant', 'guest', 'vip', 'media', 'volunteer']),
  registrationType: z.enum(['walk-in', 'pre-registered', 'invited']),
  paymentStatus: z.enum(['free', 'paid', 'pending']),
})

export const guestSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  designation: z.string().min(1, 'Designation is required'),
  organization: z.string().min(1, 'Organization is required'),
  contactNumber: z.string().min(10, 'Valid phone required'),
  email: z.string().email('Invalid email'),
  arrivalDateTime: z.string().optional(),
  departureDateTime: z.string().optional(),
  arrivalMode: z.enum(['flight', 'train', 'bus', 'self', 'cab']).optional(),
  pickupRequired: z.boolean(),
  stayRequired: z.boolean(),
  hotelName: z.string().optional(),
  roomNumber: z.string().optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  dietaryPreference: z.enum(['veg', 'non-veg', 'vegan', 'jain']).optional(),
  specialRequirements: z.string().optional(),
  status: z.enum(['confirmed', 'tentative', 'cancelled', 'arrived', 'departed']),
})

export const scheduleSlotSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  category: z.enum(['inauguration', 'keynote', 'session', 'cultural', 'award', 'break', 'networking', 'valedictory']),
  speakerName: z.string().optional(),
  speakerDesignation: z.string().optional(),
  venue: z.string().optional(),
  mcName: z.string().optional(),
  notes: z.string().optional(),
  day: z.number().optional(),
})

export const budgetItemSchema = z.object({
  category: z.enum(['venue', 'catering', 'decoration', 'gifts', 'travel', 'accommodation', 'av', 'printing', 'misc']),
  itemName: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  estimatedAmount: z.number().min(0, 'Amount must be positive'),
  actualAmount: z.number().optional(),
  paidBy: z.string().optional(),
  paymentMode: z.enum(['cash', 'upi', 'bank-transfer', 'cheque']).optional(),
  date: z.string().optional(),
  notes: z.string().optional(),
})

export const vendorSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  category: z.enum(['catering', 'decoration', 'av', 'transport', 'printing', 'photography', 'security']),
  contactPerson: z.string().min(1, 'Contact person is required'),
  phone: z.string().min(10, 'Valid phone required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  gstin: z.string().optional(),
  totalAmount: z.number().optional(),
  advancePaid: z.number().optional(),
  deliverables: z.array(z.string()),
  status: z.enum(['enquired', 'confirmed', 'contracted', 'active', 'completed', 'cancelled']),
})

export const travelSchema = z.object({
  personName: z.string().min(1, 'Name is required'),
  personType: z.enum(['guest', 'speaker', 'vip', 'staff']),
  mode: z.enum(['flight', 'train', 'bus', 'cab', 'self']),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  departureDateTime: z.string().min(1, 'Departure time is required'),
  arrivalDateTime: z.string().min(1, 'Arrival time is required'),
  bookingReference: z.string().optional(),
  bookingStatus: z.enum(['pending', 'confirmed', 'cancelled']),
  pickupRequired: z.boolean(),
  dropRequired: z.boolean(),
  travelCost: z.number().optional(),
  reimbursable: z.boolean(),
})

export const announcementSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  message: z.string().min(10, 'Message is required'),
  targetAudience: z.enum(['all', 'quadinators', 'guests', 'volunteers']),
  channel: z.enum(['push', 'email', 'whatsapp', 'sms']),
  scheduledAt: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type EventInput = z.infer<typeof eventSchema>
export type RegistrationInput = z.infer<typeof registrationSchema>
export type GuestInput = z.infer<typeof guestSchema>
export type ScheduleSlotInput = z.infer<typeof scheduleSlotSchema>
export type BudgetItemInput = z.infer<typeof budgetItemSchema>
export type VendorInput = z.infer<typeof vendorSchema>
export type TravelInput = z.infer<typeof travelSchema>
export type AnnouncementInput = z.infer<typeof announcementSchema>
