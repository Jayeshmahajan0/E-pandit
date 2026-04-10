import priest1 from "@/assets/priest-1.jpg";
import priest2 from "@/assets/priest-2.jpg";
import priest3 from "@/assets/priest-3.jpg";
import poojaKit from "@/assets/pooja-kit.jpg";

// ── Interfaces ──────────────────────────────────

export interface PanditProfile {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  experience: number;
  languages: string[];
  specializations: string[];
  location: string;
  district: string;
  state: string;
  pricePerPooja: number;
  priceRange: string;
  about: string;
  verified: boolean;
  online: boolean;
}

export interface BookingData {
  id: string;
  userId: string;
  panditId: string;
  panditName: string;
  panditImage: string;
  panditPhone: string;
  userName: string;
  userPhone: string;
  poojaType: string;
  status: "requested" | "accepted" | "arriving" | "in_progress" | "completed" | "cancelled";
  userAddress: string;
  amount: number;
  paymentStatus: "pending" | "paid" | "refunded";
  paymentMethod: "cash" | "upi" | "card" | "wallet";
  scheduledDate: string;
  scheduledTime: string;
  notes?: string;
  cancellationReason?: string;
  cancelledBy?: "user" | "pandit";
  createdAt: string;
  acceptedAt?: string;
  arrivingAt?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface PoojaKitItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface ReviewData {
  id: string;
  bookingId: string;
  userId: string;
  userName: string;
  panditId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// ── Pooja Categories ────────────────────────────

export const poojaCategories = [
  "All",
  "Satyanarayan Katha",
  "Griha Pravesh",
  "Vivah",
  "Mundan",
  "Ganesh Puja",
  "Navgraha Shanti",
  "Rudrabhishek",
  "Vastu Shanti",
  "Havan",
  "Sunderkand Path",
];

// ── Mock Pandits (Extended) ─────────────────────

export const mockPandits: PanditProfile[] = [
  {
    id: "pnd_001",
    name: "Pandit Ramesh Sharma",
    image: priest1,
    rating: 4.9,
    reviews: 234,
    experience: 20,
    languages: ["Hindi", "Sanskrit", "English"],
    specializations: ["Satyanarayan Katha", "Griha Pravesh", "Vivah"],
    location: "Pune, Maharashtra",
    district: "Pune",
    state: "Maharashtra",
    pricePerPooja: 2100,
    priceRange: "₹2,100 - ₹11,000",
    about: "20+ years of experience in Vedic rituals and ceremonies. Specialist in Satyanarayan Katha and wedding ceremonies.",
    verified: true,
    online: true,
  },
  {
    id: "pnd_002",
    name: "Pandit Arjun Mishra",
    image: priest2,
    rating: 4.8,
    reviews: 189,
    experience: 8,
    languages: ["Hindi", "Sanskrit", "Marathi"],
    specializations: ["Ganesh Puja", "Navgraha Shanti", "Rudrabhishek"],
    location: "Pune, Maharashtra",
    district: "Pune",
    state: "Maharashtra",
    pricePerPooja: 1500,
    priceRange: "₹1,500 - ₹8,000",
    about: "Specialist in Ganesh Puja and planetary remedies. Well-versed in traditional Maharashtrian rituals.",
    verified: true,
    online: true,
  },
  {
    id: "pnd_003",
    name: "Pandit Vishnu Dutta",
    image: priest3,
    rating: 4.95,
    reviews: 412,
    experience: 35,
    languages: ["Hindi", "Sanskrit", "Gujarati", "English"],
    specializations: ["Vivah", "Mundan", "Vastu Shanti", "Satyanarayan Katha"],
    location: "Mumbai, Maharashtra",
    district: "Mumbai",
    state: "Maharashtra",
    pricePerPooja: 3000,
    priceRange: "₹3,000 - ₹15,000",
    about: "35 years of sacred rituals across India. One of the most experienced pandits in Western India.",
    verified: true,
    online: false,
  },
  {
    id: "pnd_004",
    name: "Pandit Suresh Joshi",
    image: priest1,
    rating: 4.7,
    reviews: 156,
    experience: 12,
    languages: ["Hindi", "Marathi", "Sanskrit"],
    specializations: ["Satyanarayan Katha", "Vivah", "Griha Pravesh", "Havan"],
    location: "Pune, Maharashtra",
    district: "Pune",
    state: "Maharashtra",
    pricePerPooja: 1800,
    priceRange: "₹1,800 - ₹9,000",
    about: "Experienced in traditional Maharashtrian Vedic rituals. Known for conducting beautiful wedding ceremonies.",
    verified: true,
    online: true,
  },
  {
    id: "pnd_005",
    name: "Pandit Devendra Kulkarni",
    image: priest2,
    rating: 4.6,
    reviews: 98,
    experience: 6,
    languages: ["Hindi", "Marathi"],
    specializations: ["Ganesh Puja", "Sunderkand Path", "Havan"],
    location: "Pune, Maharashtra",
    district: "Pune",
    state: "Maharashtra",
    pricePerPooja: 1200,
    priceRange: "₹1,200 - ₹5,000",
    about: "Young and energetic pandit specializing in Ganesh Puja and Sunderkand Path.",
    verified: true,
    online: true,
  },
];

// ── Mock Bookings ───────────────────────────────

export const mockBookings: BookingData[] = [
  {
    id: "bk_001",
    userId: "usr_001",
    panditId: "pnd_001",
    panditName: "Pandit Ramesh Sharma",
    panditImage: priest1,
    panditPhone: "9876543211",
    userName: "Rahul Deshmukh",
    userPhone: "9876543210",
    poojaType: "Satyanarayan Katha",
    status: "completed",
    userAddress: "Flat 302, Sunrise Apartments, Kothrud, Pune",
    amount: 5100,
    paymentStatus: "paid",
    paymentMethod: "upi",
    scheduledDate: "2026-03-20",
    scheduledTime: "09:00",
    createdAt: "2026-03-18T10:00:00Z",
    completedAt: "2026-03-20T12:00:00Z",
  },
  {
    id: "bk_002",
    userId: "usr_001",
    panditId: "pnd_002",
    panditName: "Pandit Arjun Mishra",
    panditImage: priest2,
    panditPhone: "9876543212",
    userName: "Rahul Deshmukh",
    userPhone: "9876543210",
    poojaType: "Ganesh Puja",
    status: "completed",
    userAddress: "B-12, Green Valley, Hinjewadi, Pune",
    amount: 2100,
    paymentStatus: "paid",
    paymentMethod: "cash",
    scheduledDate: "2026-03-25",
    scheduledTime: "07:00",
    createdAt: "2026-03-23T08:00:00Z",
    completedAt: "2026-03-25T10:00:00Z",
  },
  {
    id: "bk_003",
    userId: "usr_001",
    panditId: "pnd_004",
    panditName: "Pandit Suresh Joshi",
    panditImage: priest1,
    panditPhone: "9876543214",
    userName: "Rahul Deshmukh",
    userPhone: "9876543210",
    poojaType: "Griha Pravesh",
    status: "arriving",
    userAddress: "A-101, Harmony Residences, Baner, Pune",
    amount: 7500,
    paymentStatus: "pending",
    paymentMethod: "upi",
    scheduledDate: "2026-04-10",
    scheduledTime: "10:00",
    createdAt: "2026-04-08T14:00:00Z",
    acceptedAt: "2026-04-08T14:05:00Z",
    arrivingAt: "2026-04-10T09:30:00Z",
  },
];

// ── Mock Pooja Kits ─────────────────────────────

export const mockPoojaKits: PoojaKitItem[] = [
  { id: "pk1", name: "Satyanarayan Pooja Kit", description: "Complete kit with all samagri for Satyanarayan Katha", price: 599, image: poojaKit, category: "Complete Kit" },
  { id: "pk2", name: "Ganesh Pooja Samagri", description: "Essential items for Ganesh Puja including modak mould", price: 449, image: poojaKit, category: "Essential Kit" },
  { id: "pk3", name: "Navgraha Shanti Kit", description: "9 types of grains, flowers and special havan samagri", price: 799, image: poojaKit, category: "Premium Kit" },
  { id: "pk4", name: "Griha Pravesh Kit", description: "Housewarming ceremony complete pooja materials", price: 999, image: poojaKit, category: "Complete Kit" },
];

// ── Mock Reviews ────────────────────────────────

export const mockReviews: ReviewData[] = [
  { id: "rv_001", bookingId: "bk_001", userId: "usr_001", userName: "Rahul Deshmukh", panditId: "pnd_001", rating: 5, comment: "Excellent pooja! Very knowledgeable pandit ji.  ", createdAt: "2026-03-20T13:00:00Z" },
  { id: "rv_002", bookingId: "bk_002", userId: "usr_001", userName: "Rahul Deshmukh", panditId: "pnd_002", rating: 4, comment: "Good experience, very professional.", createdAt: "2026-03-25T11:00:00Z" },
];

// ── Helper: Get pandit by ID ────────────────────
export const getPanditById = (id: string) => mockPandits.find((p) => p.id === id);

// ── Helper: Get online pandits by district ──────
export const getOnlinePanditsByDistrict = (district: string, poojaType?: string) => {
  let pandits = mockPandits.filter((p) => p.online && p.district === district);
  if (poojaType && poojaType !== "All") {
    pandits = pandits.filter((p) => p.specializations.includes(poojaType));
  }
  return pandits;
};
