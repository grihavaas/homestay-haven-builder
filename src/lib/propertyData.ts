// Property Data for Serenity Hills Homestay
export const propertyData = {
  // 1. Property Identity & Basic Information
  name: "Serenity Hills Homestay",
  type: "Boutique Homestay",
  tagline: "Where Nature Meets Comfort",
  description: `Nestled amidst the aromatic coffee plantations of Coorg, Serenity Hills Homestay offers an authentic escape into nature's embrace. Our century-old family estate has been lovingly restored to provide modern comfort while preserving the charm of traditional Karnataka architecture.

Wake up to the melody of birdsong, sip freshly brewed plantation coffee on your private veranda, and let the misty mountain views calm your soul. Whether you seek adventure in the Western Ghats or peaceful moments of reflection, Serenity Hills is your home away from home.`,
  classification: "4-Star Heritage Homestay",
  tags: [
    "Certified Hygienic Property",
    "Family Friendly",
    "Eco-Friendly",
    "Value for Money",
    "Pet Friendly",
  ],

  // 2. Location & Geography
  location: {
    address: "Makkandur Village, Somwarpet Taluk",
    city: "Coorg (Kodagu)",
    state: "Karnataka",
    country: "India",
    postalCode: "571233",
    description: "Located in the heart of Coorg's coffee country, just 12 km from Madikeri town",
    coordinates: {
      latitude: 12.4244,
      longitude: 75.7382,
    },
    proximity: [
      { name: "Mangalore Airport", distance: "135 km", time: "3.5 hours" },
      { name: "Madikeri Town", distance: "12 km", time: "25 mins" },
      { name: "Abbey Falls", distance: "8 km", time: "20 mins" },
      { name: "Raja's Seat", distance: "14 km", time: "30 mins" },
      { name: "Mysore City", distance: "120 km", time: "3 hours" },
    ],
  },

  // 4. Ratings & Reviews
  ratings: {
    overall: 4.8,
    totalReviews: 347,
    breakdown: {
      location: 4.9,
      cleanliness: 4.8,
      value: 4.7,
      service: 4.9,
      amenities: 4.6,
    },
    sources: [
      { name: "Google", rating: 4.8, reviews: 156 },
      { name: "TripAdvisor", rating: 4.7, reviews: 89 },
      { name: "Airbnb", rating: 4.9, reviews: 62 },
      { name: "MakeMyTrip", rating: 4.6, reviews: 40 },
    ],
    highlights: [
      "Breathtaking views",
      "Warm hospitality",
      "Delicious home-cooked food",
      "Peaceful ambiance",
      "Clean and spacious rooms",
    ],
  },

  // Featured Reviews
  reviews: [
    {
      id: 1,
      author: "Priya Sharma",
      location: "Mumbai, India",
      date: "December 2024",
      rating: 5,
      text: "An absolutely magical experience! The hosts treated us like family, and waking up to those mountain views was incredible. The Coorgi cuisine was the highlight of our trip.",
      avatar: "PS",
    },
    {
      id: 2,
      author: "James Mitchell",
      location: "London, UK",
      date: "November 2024",
      rating: 5,
      text: "Perfect retreat from city life. The coffee plantation tour was fascinating, and the cottage was beautifully appointed. Can't wait to return!",
      avatar: "JM",
    },
    {
      id: 3,
      author: "Ananya Reddy",
      location: "Bangalore, India",
      date: "October 2024",
      rating: 5,
      text: "We celebrated our anniversary here and it couldn't have been more perfect. The sunset from the infinity pool is something we'll never forget.",
      avatar: "AR",
    },
  ],

  // 5. Room Types & Accommodation
  rooms: [
    {
      id: "deluxe-room",
      name: "Deluxe Plantation Room",
      description: "Spacious room with panoramic views of the coffee estate. Features traditional wooden decor, king-sized bed, and a private balcony perfect for morning coffee.",
      capacity: { adults: 2, children: 1, maxGuests: 3 },
      beds: [{ type: "King", count: 1 }],
      size: "400 sq ft",
      view: "Plantation View",
      amenities: ["Air Conditioning", "Private Balcony", "En-suite Bathroom", "Mini Bar", "Work Desk", "Room Service", "Safe", "Tea/Coffee Maker"],
      basePrice: 5500,
      discountedPrice: 4950,
    },
    {
      id: "family-suite",
      name: "Family Heritage Suite",
      description: "Our largest accommodation featuring two queen beds, a living area with traditional Coorgi furniture, and bay windows overlooking the misty mountains.",
      capacity: { adults: 4, children: 2, maxGuests: 6 },
      beds: [{ type: "Queen", count: 2 }],
      size: "650 sq ft",
      view: "Mountain View",
      amenities: ["Air Conditioning", "Living Area", "Two Bathrooms", "Mini Bar", "Work Desk", "Room Service", "Safe", "Tea/Coffee Maker", "Sofa Bed"],
      basePrice: 8500,
      discountedPrice: 7650,
    },
    {
      id: "garden-cottage",
      name: "Private Garden Cottage",
      description: "A romantic standalone cottage surrounded by flowering gardens and coffee plants. Features a private veranda, outdoor seating, and complete privacy.",
      capacity: { adults: 2, children: 1, maxGuests: 3 },
      beds: [{ type: "King", count: 1 }],
      size: "350 sq ft",
      view: "Garden View",
      amenities: ["Air Conditioning", "Private Veranda", "En-suite Bathroom", "Mini Fridge", "Outdoor Seating", "Room Service", "Hammock"],
      basePrice: 6500,
      discountedPrice: 5850,
    },
  ],

  // 7. Amenities & Facilities
  amenities: {
    core: [
      { name: "Free Wi-Fi", icon: "Wifi", description: "High-speed internet throughout property" },
      { name: "Free Parking", icon: "Car", description: "Secure covered parking for guests" },
      { name: "Infinity Pool", icon: "Waves", description: "Heated pool with mountain views" },
      { name: "Restaurant", icon: "UtensilsCrossed", description: "In-house dining with local cuisine" },
      { name: "Spa Services", icon: "Sparkles", description: "Traditional Ayurvedic treatments" },
      { name: "24/7 Reception", icon: "Clock", description: "Round-the-clock assistance" },
      { name: "Room Service", icon: "ConciergeBell", description: "Available from 7 AM to 10 PM" },
      { name: "Laundry", icon: "Shirt", description: "Same-day laundry service" },
      { name: "Airport Shuttle", icon: "Plane", description: "Pickup from Mangalore Airport" },
      { name: "Garden", icon: "TreePine", description: "5 acres of landscaped gardens" },
      { name: "Bonfire Area", icon: "Flame", description: "Evening bonfire arrangements" },
      { name: "Library", icon: "BookOpen", description: "Curated collection of books" },
    ],
    special: [
      { name: "Pet Friendly", icon: "PawPrint", description: "Pets welcome with prior notice" },
      { name: "Kid Friendly", icon: "Baby", description: "Play area and babysitting available" },
      { name: "Plantation Tours", icon: "Coffee", description: "Guided coffee estate walks" },
      { name: "Trekking Guides", icon: "Mountain", description: "Local guides for nature trails" },
    ],
  },

  // 8. Host Information
  host: {
    name: "Ramesh & Lakshmi Gowda",
    title: "Third-generation coffee planters",
    bio: "We are Ramesh and Lakshmi, and Serenity Hills has been in our family for over 80 years. What started as my grandfather's coffee estate has now become a passion project where we share our love for Coorg with travelers from around the world.",
    writeUp: "Having spent our entire lives on this land, we know every trail, every bird call, and every secret spot for the best sunrise views. We believe in sustainable tourism and authentic experiences - from the coffee in your cup to the vegetables on your plate, everything is grown right here on our estate.",
    languages: ["English", "Hindi", "Kannada", "Malayalam"],
    responseTime: "Within 1 hour",
    contact: {
      email: "stay@serenityhillscoorg.com",
      phone: "+91 98765 43210",
      whatsapp: "+91 98765 43210",
    },
  },

  // 9. Booking & Reservation
  booking: {
    checkIn: "2:00 PM",
    checkOut: "11:00 AM",
    minStay: 1,
    maxStay: 30,
    policies: {
      cancellation: "Free cancellation up to 7 days before check-in. 50% refund for cancellations 3-7 days prior. No refund within 3 days.",
      payment: "50% advance at booking, balance at check-in",
      methods: ["Credit Card", "Debit Card", "UPI", "Bank Transfer"],
    },
  },

  // 10. Rules & Policies
  rules: [
    { icon: "Clock", rule: "Check-in: 2:00 PM - 8:00 PM" },
    { icon: "Clock", rule: "Check-out: by 11:00 AM" },
    { icon: "Ban", rule: "No smoking inside rooms" },
    { icon: "Volume2", rule: "Quiet hours: 10:00 PM - 7:00 AM" },
    { icon: "Users", rule: "Visitors must be registered at reception" },
    { icon: "PawPrint", rule: "Pets allowed with prior approval" },
    { icon: "PartyPopper", rule: "Events require prior permission" },
    { icon: "CreditCard", rule: "Valid ID required at check-in" },
  ],

  // 11. Nearby Attractions
  attractions: [
    { name: "Abbey Falls", distance: "8 km", type: "Waterfall", description: "Stunning 70-foot waterfall amidst coffee and spice plantations" },
    { name: "Raja's Seat", distance: "14 km", type: "Viewpoint", description: "Historic sunset point with panoramic valley views" },
    { name: "Dubare Elephant Camp", distance: "32 km", type: "Wildlife", description: "Elephant interaction and river rafting experience" },
    { name: "Namdroling Monastery", distance: "45 km", type: "Spiritual", description: "Golden Temple - largest Tibetan Buddhist monastery in India" },
    { name: "Talakaveri", distance: "48 km", type: "Pilgrimage", description: "Sacred origin of the River Kaveri" },
    { name: "Mandalpatti Peak", distance: "22 km", type: "Adventure", description: "Jeep safari to misty peaks at 4,000 feet" },
  ],

  // 12. Property Features & USPs
  features: {
    highlights: [
      "80-year heritage coffee estate",
      "Authentic Coorgi cuisine with estate-grown ingredients",
      "Private coffee plantation walks",
      "Infinity pool with mountain backdrop",
      "Traditional architecture meets modern comfort",
    ],
    awards: [
      "TripAdvisor Travelers' Choice 2024",
      "Karnataka Tourism Excellence Award 2023",
      "Sustainable Hospitality Certificate",
    ],
    sustainability: [
      "Solar-powered hot water",
      "Organic kitchen garden",
      "Rainwater harvesting",
      "Plastic-free property",
      "Local employment priority",
    ],
  },

  // 13. Trust Badges
  badges: [
    { name: "Highly Rated", description: "4.8/5 from 347 reviews" },
    { name: "Verified Property", description: "Officially registered homestay" },
    { name: "Safe & Hygienic", description: "Enhanced cleaning protocols" },
    { name: "Eco Certified", description: "Sustainable tourism practices" },
  ],

  // Contact & Social
  contact: {
    phone: "+91 98765 43210",
    email: "stay@serenityhillscoorg.com",
    whatsapp: "+91 98765 43210",
    address: "Serenity Hills Estate, Makkandur Village, Somwarpet Taluk, Coorg 571233",
    social: {
      instagram: "@serenityhillscoorg",
      facebook: "SerenityhillsHomestay",
    },
  },
};
