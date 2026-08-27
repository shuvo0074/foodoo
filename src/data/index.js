import { img } from './photos';
import { colors } from '../theme';

/* ------------------------------------------------------------------ *
 * Dummy content — a Riyadh-based delivery app.
 * Restaurants are fictional; dishes, prices (SAR) and addresses are
 * modelled on what actually gets delivered in Saudi Arabia.
 * Everything is deterministic (no Math.random) so the UI is stable.
 * ------------------------------------------------------------------ */

export const CITY = 'Riyadh';

/**
 * `icon` is an Ionicons name — the font ships with the app, so it renders
 * everywhere. `emoji` is kept for anywhere you'd rather show the glyph.
 */
export const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'sparkles', emoji: '🍽️', tint: colors.primary },
  { id: 'mandi', label: 'Mandi', icon: 'restaurant', emoji: '🍛', tint: '#FF9556' },
  { id: 'mashawi', label: 'Mashawi', icon: 'flame', emoji: '🔥', tint: '#E2500F' },
  { id: 'shawarma', label: 'Shawarma', icon: 'bonfire', emoji: '🌯', tint: '#FF8A3D' },
  { id: 'fastfood', label: 'Fast food', icon: 'fast-food', emoji: '🍔', tint: '#FFC531' },
  { id: 'pizza', label: 'Pizza', icon: 'pizza', emoji: '🍕', tint: '#FF6B2C' },
  { id: 'breakfast', label: 'Breakfast', icon: 'egg', emoji: '🍳', tint: '#FFD76E' },
  { id: 'seafood', label: 'Seafood', icon: 'fish', emoji: '🦐', tint: '#4C8DFF' },
  { id: 'healthy', label: 'Healthy', icon: 'leaf', emoji: '🥗', tint: '#3DDC97' },
  { id: 'sweets', label: 'Sweets', icon: 'ice-cream', emoji: '🍰', tint: '#C084FC' },
  { id: 'coffee', label: 'Qahwa', icon: 'cafe', emoji: '☕', tint: '#B98B5E' },
];

/* ---------------------------- option sets --------------------------- */

const sizeOf = (a, b, c, pb = 12, pc = 22) => ({
  id: 'size',
  title: 'Choose a size',
  required: true,
  max: 1,
  items: [
    { id: 'reg', label: a, price: 0 },
    { id: 'lg', label: b, price: pb },
    { id: 'xl', label: c, price: pc },
  ],
});

const OPTS = {
  rice: [
    sizeOf('Single portion', 'Family (2–3)', 'Majlis (5–6)', 45, 120),
    {
      id: 'rice',
      title: 'Pick your rice',
      required: true,
      max: 1,
      items: [
        { id: 'mandi', label: 'Smoked mandi rice', price: 0 },
        { id: 'kabsa', label: 'Kabsa rice', price: 0 },
        { id: 'bukhari', label: 'Bukhari rice', price: 5 },
        { id: 'white', label: 'Plain basmati', price: 0 },
      ],
    },
    {
      id: 'extras',
      title: 'Add to the platter',
      max: 4,
      items: [
        { id: 'daqqus', label: 'Extra daqqus (tomato chilli)', price: 3 },
        { id: 'nuts', label: 'Roasted nuts & sultanas', price: 8 },
        { id: 'laban', label: 'Fresh laban', price: 6 },
        { id: 'shorba', label: 'Lamb shorba', price: 12 },
      ],
    },
  ],
  grill: [
    {
      id: 'doneness',
      title: 'How would you like it?',
      required: true,
      max: 1,
      items: [
        { id: 'medium', label: 'Medium', price: 0 },
        { id: 'mediumwell', label: 'Medium well', price: 0 },
        { id: 'well', label: 'Well done', price: 0 },
      ],
    },
    {
      id: 'sides',
      title: 'Sides',
      max: 3,
      items: [
        { id: 'toum', label: 'Extra garlic toum', price: 4 },
        { id: 'rice', label: 'Saffron rice', price: 14 },
        { id: 'khubz', label: 'Taboon khubz', price: 6 },
      ],
    },
  ],
  shawarma: [
    sizeOf('Regular', 'Large', 'Super', 7, 14),
    {
      id: 'sauce',
      title: 'Sauce',
      required: true,
      max: 1,
      items: [
        { id: 'toum', label: 'Garlic toum', price: 0 },
        { id: 'tahini', label: 'Tahini', price: 0 },
        { id: 'spicy', label: 'Spicy shatta', price: 0 },
      ],
    },
    {
      id: 'extras',
      title: 'Add extras',
      max: 4,
      items: [
        { id: 'fries', label: 'Fries in the wrap', price: 4 },
        { id: 'cheese', label: 'Melted cheese', price: 5 },
        { id: 'pickle', label: 'Extra pickles', price: 2 },
        { id: 'double', label: 'Double meat', price: 12 },
      ],
    },
  ],
  burger: [
    sizeOf('Single patty', 'Double patty', 'Triple stack', 14, 26),
    {
      id: 'extras',
      title: 'Pile it on',
      max: 5,
      items: [
        { id: 'cheese', label: 'Extra aged cheddar', price: 5 },
        { id: 'jalapeno', label: 'Pickled jalapeños', price: 3 },
        { id: 'egg', label: 'Fried egg', price: 6 },
        { id: 'truffle', label: 'Truffle mayo', price: 7 },
      ],
    },
    {
      id: 'side',
      title: 'Make it a meal',
      max: 1,
      items: [
        { id: 'fries', label: 'Skin-on fries', price: 14 },
        { id: 'rings', label: 'Onion rings', price: 16 },
      ],
    },
  ],
  pizza: [
    sizeOf('Small 9"', 'Medium 12"', 'Large 16"', 14, 26),
    {
      id: 'crust',
      title: 'Crust',
      required: true,
      max: 1,
      items: [
        { id: 'classic', label: 'Classic Neapolitan', price: 0 },
        { id: 'thin', label: 'Thin & crispy', price: 0 },
        { id: 'stuffed', label: 'Cheese-stuffed edge', price: 12 },
      ],
    },
    {
      id: 'extras',
      title: 'Extra toppings',
      max: 4,
      items: [
        { id: 'mozz', label: 'Double mozzarella', price: 8 },
        { id: 'chilli', label: 'Green chilli', price: 5 },
        { id: 'mush', label: 'Mushrooms', price: 6 },
        { id: 'olive', label: 'Black olives', price: 5 },
      ],
    },
  ],
  bowl: [
    sizeOf('Regular bowl', 'Large bowl', 'Feast bowl', 12, 22),
    {
      id: 'base',
      title: 'Pick a base',
      required: true,
      max: 1,
      items: [
        { id: 'brown', label: 'Brown rice', price: 0 },
        { id: 'greens', label: 'Mixed greens', price: 0 },
        { id: 'quinoa', label: 'Quinoa', price: 5 },
        { id: 'freekeh', label: 'Freekeh', price: 5 },
      ],
    },
    {
      id: 'extras',
      title: 'Boost it',
      max: 4,
      items: [
        { id: 'avo', label: 'Extra avocado', price: 9 },
        { id: 'halloumi', label: 'Grilled halloumi', price: 12 },
        { id: 'zaatar', label: 'Zaatar crunch', price: 4 },
      ],
    },
  ],
  heat: [
    {
      id: 'heat',
      title: 'Heat level',
      required: true,
      max: 1,
      items: [
        { id: 'mild', label: 'Mild', price: 0 },
        { id: 'medium', label: 'Medium', price: 0 },
        { id: 'hot', label: 'Hot', price: 0 },
        { id: 'shatta', label: 'Extra shatta', price: 3 },
      ],
    },
    {
      id: 'sides',
      title: 'Sides',
      max: 3,
      items: [
        { id: 'khubz', label: 'Taboon khubz', price: 6 },
        { id: 'laban', label: 'Fresh laban', price: 6 },
        { id: 'salad', label: 'Arabic salad', price: 12 },
      ],
    },
  ],
  sweet: [
    {
      id: 'portion',
      title: 'Portion',
      required: true,
      max: 1,
      items: [
        { id: 'one', label: 'Single serve', price: 0 },
        { id: 'share', label: 'To share (2)', price: 18 },
      ],
    },
    {
      id: 'extras',
      title: 'Finish it',
      max: 3,
      items: [
        { id: 'ashta', label: 'Ashta cream', price: 8 },
        { id: 'pistachio', label: 'Extra pistachio', price: 7 },
        { id: 'syrup', label: 'Date syrup', price: 4 },
      ],
    },
  ],
  simple: [
    {
      id: 'extras',
      title: 'Add something',
      max: 3,
      items: [
        { id: 'toum', label: 'Garlic toum', price: 4 },
        { id: 'shatta', label: 'Shatta chilli', price: 3 },
        { id: 'khubz', label: 'Extra khubz', price: 5 },
      ],
    },
  ],
};

/* ------------------------------ builders ---------------------------- */

let seq = 0;

/**
 * @param {string} rid      owning restaurant
 * @param {string} section  menu section title
 * @param {string} name
 * @param {string} desc
 * @param {number} price    in SAR
 * @param {string} key      photo key from ./photos
 */
const d = (rid, section, name, desc, price, key, extra = {}) => {
  seq += 1;
  return {
    id: `d${seq}`,
    rid,
    section,
    name,
    desc,
    price,
    img: img(key, 640),
    imgLarge: img(key, 1200),
    kcal: extra.kcal ?? 320 + ((seq * 137) % 620),
    rating: extra.rating ?? Number((4.2 + ((seq * 13) % 8) / 10).toFixed(1)),
    reviews: 40 + ((seq * 53) % 900),
    prepMin: 8 + ((seq * 7) % 14),
    veg: !!extra.veg,
    spicy: !!extra.spicy,
    popular: !!extra.popular,
    badge: extra.badge ?? null,
    options: extra.options ?? OPTS.simple,
  };
};

/* ---------------------------- restaurants --------------------------- */

const R = [
  {
    id: 'r1',
    name: 'Bayt Al Mandi',
    arabic: 'بيت المندي',
    tagline: 'Slow-smoked mandi since 1998',
    cuisines: ['Saudi', 'Yemeni', 'Mandi'],
    cats: ['mandi'],
    hero: 'mandiChicken',
    logo: 'kabsaChicken',
    rating: 4.8,
    reviews: 3120,
    priceLevel: 2,
    etaMin: 35,
    etaMax: 50,
    distanceKm: 3.2,
    deliveryFee: 0,
    minOrder: 50,
    promo: 'Free delivery over SR 80',
    badges: ['Top rated', 'Free delivery'],
    open: true,
    area: 'Al Olaya',
    menu: [
      ['Mandi & Kabsa', [
        ['Chicken Mandi', 'Smoked half chicken, saffron mandi rice, raisins, daqqus', 42, 'mandiChicken', { popular: true, badge: 'Bestseller', rating: 4.9, options: OPTS.rice }],
        ['Lamb Mandi', 'Slow-smoked lamb shoulder, aged basmati, toasted almonds', 68, 'mandiPlate', { popular: true, options: OPTS.rice }],
        ['Chicken Kabsa', 'Kabsa rice, roasted nuts, sultanas, house daqqus', 45, 'kabsaChicken', { popular: true, options: OPTS.rice }],
        ['Lamb Kabsa', 'Whole shank on spiced rice with grilled tomato', 72, 'kabsaRice', { options: OPTS.rice }],
      ]],
      ['Najdi classics', [
        ['Hijazi Saleeg', 'Creamy short-grain rice, roasted chicken, samn, black pepper', 48, 'saleeg', { badge: "Chef's pick" }],
        ['Jareesh', 'Cracked wheat slow-cooked in laban, caramelised onion', 32, 'jareesh', {}],
      ]],
      ['Sides', [
        ['Sambusak (4 pcs)', 'Crisp pastry parcels filled with spiced minced lamb', 12, 'sambusak', {}],
        ['Khubz Basket', 'Fresh taboon bread, straight from the oven', 8, 'bread', { veg: true }],
      ]],
    ],
  },
  {
    id: 'r2',
    name: 'Najdi Jamr',
    arabic: 'نجدي جمر',
    tagline: 'Charcoal-fired mashawi',
    cuisines: ['Grills', 'Saudi', 'Levantine'],
    cats: ['mashawi'],
    hero: 'mashawiPlatter',
    logo: 'tawookSkewers',
    rating: 4.7,
    reviews: 2410,
    priceLevel: 3,
    etaMin: 30,
    etaMax: 45,
    distanceKm: 2.1,
    deliveryFee: 9,
    minOrder: 60,
    promo: '20% off orders over SR 150',
    badges: ['Charcoal grill'],
    open: true,
    area: 'Al Malqa',
    menu: [
      ['From the coals', [
        ['Mixed Mashawi Platter', 'Tawook, kofta, lamb tikka, grilled veg and khubz', 98, 'mashawiPlatter', { popular: true, badge: 'Bestseller', rating: 4.9, options: OPTS.grill }],
        ['Shish Tawook', 'Yoghurt-marinated chicken skewers with garlic toum', 46, 'tawookSkewers', { popular: true, options: OPTS.grill }],
        ['Kebab Halabi', 'Spiced minced lamb, chilli and pomegranate molasses', 54, 'mashawiMixed', { spicy: true, options: OPTS.grill }],
        ['Tawook & Rice', 'Two skewers, saffron rice, Arabic salad and bread', 44, 'tawookRice', { options: OPTS.grill }],
        ['Lamb Chops', 'Charcoal lamb chops with sumac onions', 92, 'kebabGrill', { options: OPTS.grill }],
        ['Beef Short Ribs', 'Twelve hours over jamr, pomegranate glaze', 78, 'ribs', { options: OPTS.grill }],
      ]],
      ['Mezze', [
        ['Hummus Beiruti', 'Chickpeas, tahini, olive oil and pine nuts', 19, 'hummus', { veg: true, popular: true }],
        ['Fattoush', 'Crisp khubz, sumac, tomato, cucumber and mint', 24, 'fattoush', { veg: true }],
        ['Falafel (6 pcs)', 'Crushed chickpea and herbs, tahini on the side', 18, 'falafel', { veg: true }],
      ]],
    ],
  },
  {
    id: 'r3',
    name: 'Shawarma Souq',
    arabic: 'سوق الشاورما',
    tagline: "Riyadh's late-night shawarma",
    cuisines: ['Shawarma', 'Street food'],
    cats: ['shawarma', 'fastfood'],
    hero: 'shawarmaSpit',
    logo: 'wrap',
    rating: 4.6,
    reviews: 5840,
    priceLevel: 1,
    etaMin: 15,
    etaMax: 25,
    distanceKm: 0.8,
    deliveryFee: 0,
    minOrder: 25,
    promo: 'Free delivery today',
    badges: ['Free delivery', 'Fast'],
    open: true,
    area: 'Al Muruj',
    menu: [
      ['Wraps', [
        ['Chicken Shawarma Wrap', 'Garlic toum, pickles and fries rolled into the bread', 15, 'wrap', { popular: true, badge: 'No.1 seller', rating: 4.8, options: OPTS.shawarma }],
        ['Beef Shawarma Wrap', 'Tahini, tomato, parsley and sumac onion', 18, 'chickenSando', { popular: true, options: OPTS.shawarma }],
        ['Shawarma Combo Box', 'Any wrap with fries and a drink', 26, 'burgerBasket', { badge: 'Save SR 8' }],
      ]],
      ['Plates', [
        ['Shawarma Plate', 'Carved shawarma, rice, salad and a pot of toum', 34, 'shawarmaSpit', { options: OPTS.shawarma }],
      ]],
      ['Sides', [
        ['Shawarma Fries', 'Fries loaded with shawarma, toum and shatta', 22, 'fries', { spicy: true, popular: true }],
        ['Onion Rings', 'Crunchy, golden, dangerous', 14, 'onionRings', { veg: true }],
        ['Tabbouleh', 'Parsley, bulgur, tomato and plenty of lemon', 22, 'tabbouleh', { veg: true }],
      ]],
    ],
  },
  {
    id: 'r4',
    name: 'Broast Nation',
    arabic: 'بروست نيشن',
    tagline: 'Broasted chicken, Jeddah style',
    cuisines: ['Broast', 'Fried chicken'],
    cats: ['fastfood'],
    hero: 'broast',
    logo: 'broast',
    rating: 4.5,
    reviews: 4380,
    priceLevel: 2,
    etaMin: 25,
    etaMax: 35,
    distanceKm: 1.6,
    deliveryFee: 6,
    minOrder: 35,
    promo: 'SR 20 off your first order',
    badges: ['Popular'],
    open: true,
    area: 'Al Nakheel',
    menu: [
      ['Broast', [
        ['Broast Quarter Meal', 'Quarter chicken, fries, coleslaw and khubz', 29, 'broast', { popular: true, badge: 'Bestseller', options: OPTS.heat }],
        ['Broast & Rice', 'Broasted chicken over Bukhari rice with three sauces', 38, 'mandiChicken', { popular: true, options: OPTS.heat }],
        ['Zinger Sandwich', 'Crispy fillet, lettuce and spicy mayo', 22, 'chickenSando', { spicy: true }],
      ]],
      ['Sides', [
        ['Loaded Fries', 'Cheese sauce, jalapeño and crispy onion', 20, 'fries', { veg: true }],
        ['Onion Rings', 'Beer-battered and golden', 14, 'onionRings', { veg: true }],
      ]],
    ],
  },
  {
    id: 'r5',
    name: 'Tamees Corner',
    arabic: 'ركن التميس',
    tagline: 'Saudi breakfast, all morning',
    cuisines: ['Breakfast', 'Saudi', 'Bakery'],
    cats: ['breakfast'],
    hero: 'foulPlate',
    logo: 'mutabbaq',
    rating: 4.6,
    reviews: 1890,
    priceLevel: 1,
    etaMin: 20,
    etaMax: 30,
    distanceKm: 1.2,
    deliveryFee: 6,
    minOrder: 30,
    promo: 'Breakfast combo SR 25',
    badges: ['All morning'],
    open: true,
    area: 'Al Sulimaniyah',
    menu: [
      ['Breakfast', [
        ['Foul Medames', 'Slow-cooked fava beans, olive oil, tomato and khubz', 18, 'foulPlate', { veg: true, popular: true, badge: 'Bestseller' }],
        ['Foul with Tahini', 'Creamy foul, tahini swirl and a spoon of shatta', 20, 'foulBowl', { veg: true, spicy: true }],
        ['Mutabbaq', 'Folded pastry stuffed with spiced meat, egg and leek', 24, 'mutabbaq', { popular: true }],
        ['Shakshouka', 'Eggs baked in tomato with green chilli', 26, 'eggs', { veg: true, spicy: true }],
        ['Masoub', 'Mashed banana bread with cream, honey and nuts', 28, 'sweetToast', { veg: true }],
      ]],
      ['Bakery', [
        ['Tamees Bread', 'Wood-fired flatbread, torn straight from the oven', 7, 'bread', { veg: true }],
        ['Luqaimat (12 pcs)', 'Crisp golden dumplings soaked in date syrup', 20, 'sweetsTray', { veg: true, popular: true }],
      ]],
      ['Drinks', [
        ['Arabic Qahwa & Dates', 'Cardamom coffee in a dallah with three dates', 16, 'qahwaDallah', { veg: true, badge: 'On the house with SR 60+' }],
        ['Karak Tea', 'Strong tea, cardamom, evaporated milk', 9, 'karak', { veg: true }],
      ]],
    ],
  },
  {
    id: 'r6',
    name: 'Corniche Seafood',
    arabic: 'كورنيش للمأكولات البحرية',
    tagline: 'Red Sea catch, grilled to order',
    cuisines: ['Seafood', 'Hijazi'],
    cats: ['seafood'],
    hero: 'fishGrilled',
    logo: 'fishFillet',
    rating: 4.7,
    reviews: 980,
    priceLevel: 3,
    etaMin: 35,
    etaMax: 50,
    distanceKm: 4.1,
    deliveryFee: 12,
    minOrder: 80,
    promo: null,
    badges: ['Premium'],
    open: true,
    area: 'Hittin',
    menu: [
      ['From the grill', [
        ['Grilled Hamour', 'Whole hamour, sayadieh rice and tahini sauce', 96, 'fishGrilled', { popular: true, badge: 'Bestseller', rating: 4.8, options: OPTS.grill }],
        ['Fish Fillet Plate', 'Grilled fillet, sautéed greens and lemon butter', 78, 'fishFillet', { options: OPTS.grill }],
      ]],
      ['Rice & pasta', [
        ['Shrimp Sayadieh', 'Caramelised onion rice with tiger prawns', 88, 'prawnRice', { popular: true, spicy: true }],
        ['Prawn Linguine', 'Chilli, garlic, cherry tomato and parsley', 72, 'prawnPasta', { spicy: true }],
      ]],
      ['Starters', [
        ['Grilled Halloumi', 'Charred halloumi with zaatar oil', 32, 'halloumi', { veg: true }],
        ['Garden Salad', 'Little gem, radish and herb vinaigrette', 26, 'gardenSalad', { veg: true }],
      ]],
    ],
  },
  {
    id: 'r7',
    name: 'Forno Riyadh',
    arabic: 'فورنو الرياض',
    tagline: 'Wood-fired in 90 seconds',
    cuisines: ['Pizza', 'Italian'],
    cats: ['pizza', 'fastfood'],
    hero: 'pizzaBoard',
    logo: 'pizzaPepperoni',
    rating: 4.6,
    reviews: 4120,
    priceLevel: 2,
    etaMin: 25,
    etaMax: 35,
    distanceKm: 1.9,
    deliveryFee: 6,
    minOrder: 45,
    promo: 'Buy 1 get 1 half price',
    badges: ['BOGO', 'Wood fired'],
    open: true,
    area: 'Al Yasmin',
    menu: [
      ['Classics', [
        ['Margherita', 'San Marzano, fior di latte and basil', 38, 'pizzaMargherita', { veg: true, popular: true, options: OPTS.pizza }],
        ['Pepperoni Diavola', 'Double beef pepperoni with chilli honey', 52, 'pizzaPepperoni', { spicy: true, popular: true, badge: 'Bestseller', options: OPTS.pizza }],
      ]],
      ['House specials', [
        ['Rocket & Labneh', 'Whipped labneh, wild rocket and lemon oil', 56, 'pizzaRocket', { veg: true, badge: "Chef's pick", options: OPTS.pizza }],
        ['Smoky BBQ Chicken', 'Pulled chicken, red onion, coriander, BBQ swirl', 54, 'pizzaBbq', { popular: true, options: OPTS.pizza }],
        ['Ortolana Veggie', 'Roast pepper, courgette, aubergine and pesto', 48, 'pizzaVeggie', { veg: true, options: OPTS.pizza }],
      ]],
      ['Sides', [
        ['Garlic Khubz Sticks', 'Rosemary sea salt with a garlic butter dip', 16, 'bread', { veg: true }],
      ]],
    ],
  },
  {
    id: 'r8',
    name: 'Smash Riyadh',
    arabic: 'سماش الرياض',
    tagline: 'Smashed patties, Riyadh style',
    cuisines: ['Burgers', 'American'],
    cats: ['fastfood'],
    hero: 'burgerHero',
    logo: 'burgerDouble',
    rating: 4.7,
    reviews: 6210,
    priceLevel: 2,
    etaMin: 20,
    etaMax: 30,
    distanceKm: 1.1,
    deliveryFee: 0,
    minOrder: 35,
    promo: 'Free delivery today',
    badges: ['Free delivery', 'Fast'],
    open: true,
    area: 'Al Olaya',
    menu: [
      ['Most wanted', [
        ['The Double Smash', 'Two smashed patties, cheddar, pickles, house sauce', 42, 'burgerDouble', { popular: true, badge: 'No.1 seller', rating: 4.9, options: OPTS.burger }],
        ['Classic Smash', 'Single patty, aged cheddar, lettuce and tomato', 32, 'burgerClassic', { popular: true, options: OPTS.burger }],
        ['Truffle & Cheese', 'Triple cheese blend, truffle mayo, crispy onion', 48, 'burgerCheese', { options: OPTS.burger }],
        ['Riyadh Royale', 'Double patty, jalapeño and spicy mayo', 46, 'burgerSpicy', { spicy: true, options: OPTS.burger }],
      ]],
      ['Sides', [
        ['Skin-on Fries', 'Rosemary salt and house ketchup', 16, 'fries', { veg: true }],
        ['Onion Rings', 'Crunchy, golden, dangerous', 18, 'onionRings', { veg: true }],
      ]],
    ],
  },
  {
    id: 'r9',
    name: 'Green Souq',
    arabic: 'السوق الأخضر',
    tagline: 'Bowls that actually fill you up',
    cuisines: ['Healthy', 'Bowls', 'Salads'],
    cats: ['healthy'],
    hero: 'saladBar',
    logo: 'pokeBowl',
    rating: 4.5,
    reviews: 1140,
    priceLevel: 2,
    etaMin: 20,
    etaMax: 30,
    distanceKm: 1.4,
    deliveryFee: 0,
    minOrder: 40,
    promo: 'Free delivery on bowls',
    badges: ['Free delivery', 'Healthy'],
    open: true,
    area: 'Al Ghadir',
    menu: [
      ['Signature bowls', [
        ['Salmon Poke Bowl', 'Cured salmon, avocado, edamame and sesame', 52, 'pokeBowl', { popular: true, badge: 'Bestseller', rating: 4.8, options: OPTS.bowl }],
        ['Chickpea Buddha Bowl', 'Chickpea, sweet potato, avocado and tahini', 42, 'buddhaBowl', { veg: true, popular: true, options: OPTS.bowl }],
        ['Avocado Egg Bowl', 'Soft egg, avocado, quinoa and green goddess', 44, 'eggBowl', { veg: true, options: OPTS.bowl }],
      ]],
      ['Salads', [
        ['Superfood Kale', 'Kale, walnut, grape and citrus dressing', 38, 'kaleSalad', { veg: true }],
        ['Garden Crunch', 'Little gem, radish, pea and herb vinaigrette', 32, 'gardenSalad', { veg: true }],
      ]],
    ],
  },
  {
    id: 'r10',
    name: 'Halawiyat Al Diwan',
    arabic: 'حلويات الديوان',
    tagline: 'Late-night kunafa & qahwa',
    cuisines: ['Desserts', 'Bakery', 'Coffee'],
    cats: ['sweets', 'coffee'],
    hero: 'kunafa',
    logo: 'sweetsTray',
    rating: 4.8,
    reviews: 2760,
    priceLevel: 2,
    etaMin: 20,
    etaMax: 35,
    distanceKm: 2.4,
    deliveryFee: 6,
    minOrder: 30,
    promo: 'Open until 2am',
    badges: ['Late night'],
    open: true,
    area: 'Al Wurud',
    menu: [
      ['Kunafa & friends', [
        ['Kunafa Nabulsia', 'Shredded pastry, sweet cheese and crushed pistachio', 32, 'kunafa', { veg: true, popular: true, badge: 'Bestseller', options: OPTS.sweet }],
        ['Kunafa Tray (share)', 'Family tray with ashta cream on the side', 58, 'kunafaTray', { veg: true, options: OPTS.sweet }],
        ['Umm Ali', 'Baked pastry pudding, nuts and saffron cream', 30, 'ummAli', { veg: true, popular: true, options: OPTS.sweet }],
        ['Basbousa', 'Semolina cake soaked in rose syrup', 22, 'basbousa', { veg: true, options: OPTS.sweet }],
      ]],
      ['Cakes & spoons', [
        ['Chocolate Fondant', 'Warm centre, salted crumb, vanilla scoop', 34, 'chocCake', { veg: true, options: OPTS.sweet }],
        ['Pistachio Cheesecake', 'Baked cheesecake with pistachio and berries', 32, 'cheesecake', { veg: true, options: OPTS.sweet }],
        ['Tiramisu', 'Mascarpone, espresso-soaked savoiardi, cocoa', 30, 'tiramisu', { veg: true, options: OPTS.sweet }],
        ['Cookie Dough Sundae', 'Soft serve, cookie crumb and fudge', 26, 'sundae', { veg: true, options: OPTS.sweet }],
        ['Date Cookie Box', 'Six brown-butter cookies with Ajwa dates', 26, 'cookies', { veg: true, badge: 'Baked hourly' }],
        ['Nutella Crepe', 'Folded crepe, hazelnut spread and strawberries', 28, 'crepes', { veg: true }],
      ]],
      ['Qahwa bar', [
        ['Dates & Mint Tea', 'A plate of Ajwa dates with fresh mint tea', 14, 'datesTea', { veg: true }],
      ]],
    ],
  },
];

/** Expand the compact menu tuples into full dish objects. */
export const RESTAURANTS = R.map((r) => {
  const sections = r.menu.map(([title, rows]) => ({
    title,
    data: rows.map(([name, desc, price, key, extra]) => d(r.id, title, name, desc, price, key, extra)),
  }));
  return {
    ...r,
    heroImg: img(r.hero, 1200),
    logoImg: img(r.logo, 320),
    sections,
    dishes: sections.flatMap((s) => s.data),
    address: `${120 + Number(r.id.slice(1)) * 37} King Fahd Rd, ${r.area}, ${CITY}`,
  };
});

export const DISHES = RESTAURANTS.flatMap((r) => r.dishes);

const RMAP = Object.fromEntries(RESTAURANTS.map((r) => [r.id, r]));
const DMAP = Object.fromEntries(DISHES.map((x) => [x.id, x]));

export const getRestaurant = (id) => RMAP[id];
export const getDish = (id) => DMAP[id];

/** Dishes marked popular, best first — used for the "Trending now" rail. */
export const TRENDING = DISHES.filter((x) => x.popular)
  .slice()
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 12);

export const FREE_DELIVERY = RESTAURANTS.filter((r) => r.deliveryFee === 0);

export const byCategory = (catId) =>
  catId === 'all' ? RESTAURANTS : RESTAURANTS.filter((r) => r.cats.includes(catId));

/** Naive client-side search across restaurants, cuisines and dish names. */
export const search = (q) => {
  const s = q.trim().toLowerCase();
  if (!s) return { restaurants: [], dishes: [] };
  const hit = (t) => String(t).toLowerCase().includes(s);
  return {
    restaurants: RESTAURANTS.filter(
      (r) => hit(r.name) || hit(r.tagline) || hit(r.area) || r.cuisines.some(hit),
    ),
    dishes: DISHES.filter((x) => hit(x.name) || hit(x.desc)).slice(0, 24),
  };
};

/* ------------------------------- misc ------------------------------- */

export const PROMOS = [
  {
    id: 'p1',
    title: '50% off your\nfirst order',
    sub: 'Use code FOODOO50 · up to SR 45',
    img: img('kabsaChicken', 900),
    tint: '#FF6B2C',
    cta: 'Claim now',
  },
  {
    id: 'p2',
    title: 'Free delivery\non every mandi',
    sub: 'Bayt Al Mandi · all week',
    img: img('mandiChicken', 900),
    tint: '#FF9556',
    cta: 'Order mandi',
  },
  {
    id: 'p3',
    title: 'Late-night\nkunafa drop',
    sub: 'Halawiyat Al Diwan · until 2am',
    img: img('kunafa', 900),
    tint: '#C084FC',
    cta: 'Treat yourself',
  },
  {
    id: 'p4',
    title: '2 pizzas,\none price',
    sub: 'Forno Riyadh · buy 1 get 1 half',
    img: img('pizzaBoard', 900),
    tint: '#FFC531',
    cta: 'Grab the deal',
  },
];

export const ADDRESSES = [
  { id: 'a1', label: 'Home', line: '7421 Anas Ibn Malik Rd, Al Malqa', note: 'Villa 12 — ring the bell', icon: 'home' },
  { id: 'a2', label: 'Work', line: 'Olaya Towers, Level 12, Al Olaya', note: 'Leave at reception', icon: 'briefcase' },
  { id: 'a3', label: 'Gym', line: 'Al Nakheel Mall, Ground Floor', note: 'Call on arrival', icon: 'barbell' },
];

export const PAYMENTS = [
  { id: 'pm1', label: 'mada', last4: '4291', icon: 'card', tint: '#3DDC97' },
  { id: 'pm2', label: 'Visa', last4: '8830', icon: 'card', tint: '#4C8DFF' },
  { id: 'pm3', label: 'Apple Pay', last4: null, icon: 'logo-apple', tint: '#FFFFFF' },
  { id: 'pm4', label: 'STC Pay', last4: null, icon: 'phone-portrait', tint: '#C084FC' },
];

export const COURIERS = [
  { name: 'Faisal A.', vehicle: 'Scooter', rating: 4.9, trips: 1284 },
  { name: 'Rami H.', vehicle: 'Car', rating: 4.8, trips: 903 },
  { name: 'Imran S.', vehicle: 'Scooter', rating: 5.0, trips: 2210 },
];

/** Fake order history so the Orders tab has something to show. */
export const PAST_ORDERS = [
  {
    id: 'o-8842',
    rid: 'r3',
    status: 'delivered',
    placedAt: 'Yesterday · 11:40 PM',
    total: 68,
    items: [
      { name: 'Chicken Shawarma Wrap', qty: 2 },
      { name: 'Shawarma Fries', qty: 1 },
      { name: 'Onion Rings', qty: 1 },
    ],
  },
  {
    id: 'o-8790',
    rid: 'r1',
    status: 'delivered',
    placedAt: 'Friday · 2:15 PM',
    total: 186,
    items: [
      { name: 'Lamb Mandi', qty: 2 },
      { name: 'Chicken Kabsa', qty: 1 },
      { name: 'Khubz Basket', qty: 2 },
    ],
  },
  {
    id: 'o-8731',
    rid: 'r10',
    status: 'delivered',
    placedAt: 'Thursday · 1:02 AM',
    total: 94,
    items: [
      { name: 'Kunafa Nabulsia', qty: 2 },
      { name: 'Umm Ali', qty: 1 },
    ],
  },
  {
    id: 'o-8620',
    rid: 'r5',
    status: 'cancelled',
    placedAt: 'Monday · 8:05 AM',
    total: 44,
    items: [{ name: 'Foul Medames', qty: 2 }],
  },
];

export const USER = {
  name: 'Sadi',
  handle: '@sadi',
  tier: 'Foodoo Gold',
  points: 2480,
  nextTierAt: 3000,
  joined: 'Member since 2023',
  avatarTint: '#FF6B2C',
};

export const ORDER_STAGES = [
  { id: 'confirmed', label: 'Order confirmed', sub: 'The restaurant has your order', icon: 'checkmark-circle' },
  { id: 'preparing', label: 'Preparing your food', sub: 'Fresh off the pass', icon: 'restaurant' },
  { id: 'pickup', label: 'Courier picking up', sub: 'On the way to the kitchen', icon: 'bicycle' },
  { id: 'delivering', label: 'Out for delivery', sub: 'Heading to your address', icon: 'navigate' },
  { id: 'delivered', label: 'Delivered', sub: 'Enjoy your meal', icon: 'happy' },
];
