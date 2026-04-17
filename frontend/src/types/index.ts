export type ListingType = 'swap' | 'rent' | 'food' | 'upcycle' | 'buy';
export type Condition = 'new' | 'like-new' | 'good' | 'fair' | 'worn';
export type Urgency = 'high' | 'medium' | 'low';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface User {
  id: string;
  name: string;
  avatar: string;
  score: number;
  itemsReused: number;
  co2Saved: number;
  foodRescued: number;
  wasteDiverted: number;
  streak: number;
  joinedDate: string;
  badges: Badge[];
  membershipTier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  earnings?: number;
  savings?: number;
  trustRating?: number;
}

export interface ListingItem {
  id: string;
  type: ListingType;
  title: string;
  description: string;
  image: string;
  category: string;
  condition?: Condition;
  location: string;
  distance?: string;
  available: boolean;
  userId: string;
  userName: string;
  userAvatar: string;
  trustBadge: boolean;
  createdAt: string;
  // Swap/Rent specific
  swapFor?: string;
  rentPrice?: number;
  rentPeriod?: string;
  // Food rescue specific
  urgency?: Urgency;
  quantity?: string;
  pickupWindow?: string;
  expiresAt?: string;
  restaurantName?: string;
  // Upcycle specific
  materialType?: string;
  reusePotential?: number;
  weight?: string;
  // Carbon tracking
  carbonFootprint?: number;
  greenAlternative?: string;
  greenAlternativeSaving?: number;
  // Value
  estimatedValue?: number;
  // Buy Mode / Advanced fields
  ecoScore?: number;
  discountApplied?: number;
  isEarlyAccess?: boolean;
  tierRequirement?: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  carbonKg: number;
  greenAlt?: string;
  greenAltCarbonKg?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: BadgeTier;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
}

export interface Activity {
  id: string;
  type: 'swap' | 'rescue' | 'upcycle' | 'offset' | 'achievement';
  title: string;
  description: string;
  timestamp: string;
  impact: string;
  icon: string;
}

export interface WeeklyData {
  day: string;
  co2: number;
  items: number;
}

export interface AdminMetric {
  label: string;
  value: number;
  change: number;
  icon: string;
}
