import { User, ListingItem, CartItem, Badge, Activity, WeeklyData } from '@/types';

export const currentUser: User = {
  id: 'u1',
  name: 'Alex Rivera',
  avatar: 'AR',
  score: 2847,
  itemsReused: 34,
  co2Saved: 128.5,
  foodRescued: 12,
  wasteDiverted: 45.2,
  streak: 7,
  joinedDate: '2024-09-15',
  badges: [],
  membershipTier: 'bronze',
  earnings: 1250,
  savings: 430,
  trustRating: 4.9,
};

export const badges: Badge[] = [
  { id: 'b1', name: 'First Swap', description: 'Complete your first item swap', icon: '♻️', tier: 'bronze', earned: true, earnedDate: '2024-10-01', progress: 100 },
  { id: 'b2', name: 'Food Hero', description: 'Rescue 10 food items', icon: '🍱', tier: 'silver', earned: true, earnedDate: '2024-11-15', progress: 100 },
  { id: 'b3', name: 'Carbon Cutter', description: 'Save 100kg of CO2', icon: '🌱', tier: 'gold', earned: true, earnedDate: '2025-01-20', progress: 100 },
  { id: 'b4', name: 'Upcycle Master', description: 'Divert 50kg of waste', icon: '🔧', tier: 'silver', earned: false, progress: 90 },
  { id: 'b5', name: 'Community Star', description: 'Help 25 neighbors', icon: '⭐', tier: 'gold', earned: false, progress: 68 },
  { id: 'b6', name: 'Zero Waste Week', description: '7-day zero waste streak', icon: '🏆', tier: 'platinum', earned: false, progress: 100 },
];

export const listings: ListingItem[] = [
  // Swap/Rent items
  {
    id: 'l1', type: 'swap', title: 'Vintage Desk Lamp', description: 'Mid-century modern desk lamp in excellent condition. Brass finish with adjustable arm.',
    image: '/items/lamp.jpg', category: 'Home & Decor', condition: 'like-new', location: 'Brooklyn, NY', distance: '0.8 mi',
    available: true, userId: 'u2', userName: 'Sarah K.', userAvatar: 'SK', trustBadge: true,
    createdAt: '2025-04-10', swapFor: 'Books, Plants, Kitchen items', estimatedValue: 45,
  },
  {
    id: 'l2', type: 'rent', title: 'Power Drill Set', description: 'DeWalt 20V cordless drill with complete bit set. Perfect for weekend projects.',
    image: '/items/drill.jpg', category: 'Tools', condition: 'good', location: 'Manhattan, NY', distance: '1.2 mi',
    available: true, userId: 'u3', userName: 'Mike T.', userAvatar: 'MT', trustBadge: true,
    createdAt: '2025-04-12', rentPrice: 8, rentPeriod: 'per day', estimatedValue: 120,
  },
  {
    id: 'l3', type: 'swap', title: 'Yoga Mat + Blocks', description: 'Manduka PRO yoga mat with two cork blocks. Used gently for 3 months.',
    image: '/items/yoga.jpg', category: 'Fitness', condition: 'good', location: 'Queens, NY', distance: '2.1 mi',
    available: true, userId: 'u4', userName: 'Priya M.', userAvatar: 'PM', trustBadge: false,
    createdAt: '2025-04-11', swapFor: 'Dumbbells, Resistance bands', estimatedValue: 60,
  },
  {
    id: 'l4', type: 'rent', title: 'DSLR Camera Kit', description: 'Canon EOS R50 with 18-45mm lens. Includes bag and extra battery.',
    image: '/items/camera.jpg', category: 'Electronics', condition: 'like-new', location: 'Brooklyn, NY', distance: '1.5 mi',
    available: true, userId: 'u5', userName: 'Leo C.', userAvatar: 'LC', trustBadge: true,
    createdAt: '2025-04-09', rentPrice: 25, rentPeriod: 'per day', estimatedValue: 750,
  },
  // Food rescue items
  {
    id: 'l5', type: 'food', title: '12 Fresh Bagels', description: 'Assorted bagels from this morning. Everything, sesame, plain, and cinnamon raisin.',
    image: '/items/bagels.jpg', category: 'Bakery', location: 'SoHo, NY', distance: '0.5 mi',
    available: true, userId: 'u6', userName: "Joe's Bagels", userAvatar: 'JB', trustBadge: true,
    createdAt: '2025-04-14', urgency: 'high', quantity: '12 pieces', pickupWindow: '2:00 PM - 5:00 PM',
    expiresAt: '2025-04-14T17:00:00', restaurantName: "Joe's Bagels",
  },
  {
    id: 'l6', type: 'food', title: 'Mixed Salad Bowls (x8)', description: 'Pre-made salad bowls with grilled chicken. Prepared today, best before tonight.',
    image: '/items/salad.jpg', category: 'Prepared Meals', location: 'Midtown, NY', distance: '1.0 mi',
    available: true, userId: 'u7', userName: 'Green Leaf Cafe', userAvatar: 'GL', trustBadge: true,
    createdAt: '2025-04-14', urgency: 'high', quantity: '8 bowls', pickupWindow: '4:00 PM - 7:00 PM',
    expiresAt: '2025-04-14T19:00:00', restaurantName: 'Green Leaf Cafe',
  },
  {
    id: 'l7', type: 'food', title: 'Surplus Bread Loaves', description: 'Artisan sourdough and whole wheat loaves. Baked fresh today.',
    image: '/items/bread.jpg', category: 'Bakery', location: 'Williamsburg, NY', distance: '1.8 mi',
    available: true, userId: 'u8', userName: 'Flour & Fire', userAvatar: 'FF', trustBadge: true,
    createdAt: '2025-04-14', urgency: 'medium', quantity: '15 loaves', pickupWindow: '6:00 PM - 9:00 PM',
    expiresAt: '2025-04-14T21:00:00', restaurantName: 'Flour & Fire',
  },
  // Upcycle items
  {
    id: 'l8', type: 'upcycle', title: 'Denim Fabric Scraps', description: 'Mixed denim from old jeans. Various washes and weights. Great for bags or quilts.',
    image: '/items/denim.jpg', category: 'Textiles', condition: 'fair', location: 'East Village, NY', distance: '0.9 mi',
    available: true, userId: 'u9', userName: 'Mila R.', userAvatar: 'MR', trustBadge: false,
    createdAt: '2025-04-13', materialType: 'Denim Cotton', reusePotential: 85, weight: '4.2 kg', estimatedValue: 15,
  },
  {
    id: 'l9', type: 'upcycle', title: 'Circuit Boards (x20)', description: 'Salvaged PCBs from old electronics. Clean, desoldered. Perfect for art projects.',
    image: '/items/pcb.jpg', category: 'E-Waste', condition: 'fair', location: 'LIC, NY', distance: '2.3 mi',
    available: true, userId: 'u10', userName: 'Tech Reclaim', userAvatar: 'TR', trustBadge: true,
    createdAt: '2025-04-12', materialType: 'Mixed Metals / Fiberglass', reusePotential: 70, weight: '2.8 kg', estimatedValue: 25,
  },
  {
    id: 'l10', type: 'upcycle', title: 'Hardwood Pallet Wood', description: 'Disassembled oak pallet planks. Sanded and ready for furniture projects.',
    image: '/items/pallet.jpg', category: 'Wood', condition: 'good', location: 'Bushwick, NY', distance: '1.7 mi',
    available: true, userId: 'u11', userName: 'WoodWorks Co', userAvatar: 'WW', trustBadge: true,
    createdAt: '2025-04-11', materialType: 'Oak Hardwood', reusePotential: 92, weight: '12 kg', estimatedValue: 35,
  },
  {
    id: 'l11', type: 'swap', title: 'Standing Desk Converter', description: 'Adjustable standing desk riser. Fits on any desk. Dual monitor support.',
    image: '/items/desk.jpg', category: 'Office', condition: 'good', location: 'Harlem, NY', distance: '3.0 mi',
    available: true, userId: 'u12', userName: 'Desk Pro', userAvatar: 'DP', trustBadge: true,
    createdAt: '2025-04-10', swapFor: 'Monitor, Keyboard, Office chair', estimatedValue: 85,
  },
  {
    id: 'l12', type: 'food', title: 'Pizza Slices (x16)', description: 'Margherita and pepperoni. Made this evening, still warm. Available for pickup now.',
    image: '/items/pizza.jpg', category: 'Prepared Meals', location: 'Chelsea, NY', distance: '0.7 mi',
    available: true, userId: 'u13', userName: "Tony's Slice", userAvatar: 'TS', trustBadge: true,
    createdAt: '2025-04-14', urgency: 'high', quantity: '16 slices', pickupWindow: '8:00 PM - 10:00 PM',
    expiresAt: '2025-04-14T22:00:00', restaurantName: "Tony's Slice",
  },
  // Buy mode items
  {
    id: 'l13', type: 'buy', title: 'Bose QC35 Headphones (Refurbished)', description: 'Professionally refurbished noise-cancelling headphones. 99% less e-waste.',
    image: '/items/hp.jpg', category: 'Electronics', condition: 'like-new', location: 'Shipped locally', distance: 'Warehouse',
    available: true, userId: 'sys', userName: 'EcoStore Official', userAvatar: 'ES', trustBadge: true,
    createdAt: '2025-04-15', estimatedValue: 180, ecoScore: 92, discountApplied: 15, isEarlyAccess: false
  },
  {
    id: 'l14', type: 'buy', title: 'Herman Miller Aeron (Renewed)', description: 'Sustainably renewed ergonomic chair. Prevents 25kg of landfill waste.',
    image: '/items/chair.jpg', category: 'Furniture', condition: 'like-new', location: 'Shipped from hub', distance: 'Warehouse',
    available: true, userId: 'sys', userName: 'EcoStore Official', userAvatar: 'ES', trustBadge: true,
    createdAt: '2025-04-16', estimatedValue: 450, ecoScore: 98, discountApplied: 25, isEarlyAccess: true, tierRequirement: 'gold'
  },
  {
    id: 'l15', type: 'buy', title: 'Patagonia Jacket (Repaired)', description: 'Worn wear jacket, professionally repaired. Excellent condition for winter.',
    image: '/items/jacket.jpg', category: 'Apparel', condition: 'good', location: 'Local shop', distance: '2.4 mi',
    available: true, userId: 'sys', userName: 'EcoStore Official', userAvatar: 'ES', trustBadge: true,
    createdAt: '2025-04-17', estimatedValue: 85, ecoScore: 89, discountApplied: 10, isEarlyAccess: true, tierRequirement: 'silver'
  },
];

export const cartItems: CartItem[] = [
  { id: 'c1', name: 'Organic Cotton T-Shirt', price: 35, image: '/items/tshirt.jpg', quantity: 1, carbonKg: 8.1, greenAlt: 'Recycled Cotton Tee', greenAltCarbonKg: 2.4 },
  { id: 'c2', name: 'Leather Sneakers', price: 120, image: '/items/sneakers.jpg', quantity: 1, carbonKg: 14.0, greenAlt: 'Vegan Leather Sneakers', greenAltCarbonKg: 5.2 },
  { id: 'c3', name: 'Bluetooth Speaker', price: 60, image: '/items/speaker.jpg', quantity: 1, carbonKg: 6.3, greenAlt: 'Refurbished Speaker', greenAltCarbonKg: 1.8 },
  { id: 'c4', name: 'Glass Water Bottle', price: 25, image: '/items/bottle.jpg', quantity: 2, carbonKg: 1.2, greenAlt: undefined, greenAltCarbonKg: undefined },
];

export const recentActivity: Activity[] = [
  { id: 'a1', type: 'swap', title: 'Swapped Desk Lamp', description: 'You exchanged a vintage lamp with Sarah K.', timestamp: '2h ago', impact: '-2.1kg CO₂', icon: '♻️' },
  { id: 'a2', type: 'rescue', title: 'Rescued 8 Salad Bowls', description: 'Picked up from Green Leaf Cafe for Harlem Shelter', timestamp: '5h ago', impact: '3.6kg food saved', icon: '🍱' },
  { id: 'a3', type: 'upcycle', title: 'Claimed Denim Scraps', description: 'Material received from Mila R. for tote bag project', timestamp: '1d ago', impact: '4.2kg waste diverted', icon: '🔧' },
  { id: 'a4', type: 'offset', title: 'Cart Impact Reduced', description: 'Switched to green alternatives, saved 14.7kg CO₂', timestamp: '2d ago', impact: '-14.7kg CO₂', icon: '🌱' },
  { id: 'a5', type: 'achievement', title: 'Badge Earned: Carbon Cutter', description: 'You saved over 100kg of CO₂ — Gold tier unlocked!', timestamp: '3d ago', impact: 'Gold Badge', icon: '🏆' },
];

export const weeklyData: WeeklyData[] = [
  { day: 'Mon', co2: 3.2, items: 2 },
  { day: 'Tue', co2: 5.1, items: 1 },
  { day: 'Wed', co2: 2.8, items: 3 },
  { day: 'Thu', co2: 7.4, items: 2 },
  { day: 'Fri', co2: 4.6, items: 4 },
  { day: 'Sat', co2: 8.2, items: 3 },
  { day: 'Sun', co2: 6.1, items: 2 },
];

export const impactStats = {
  totalCO2Saved: 128.5,
  totalItemsReused: 34,
  totalFoodRescued: 12,
  totalWasteDiverted: 45.2,
  totalUsers: 2847,
  totalListings: 1243,
  totalTransactions: 8456,
  offsetEquivalent: '32 trees planted',
};
