/**
 * Photo sources for the dummy data.
 *
 * Every URL below was fetched and eyeballed, so each dish gets a picture of
 * roughly the right food. Two sources are used:
 *
 *  - UNSPLASH: `images.unsplash.com/photo-<id>` — universal items (burgers,
 *    pizza, salads, seafood, desserts). Arbitrary widths, great quality.
 *  - WIKI: Wikimedia Commons — the Saudi and wider Arab dishes that stock
 *    libraries cover badly (kabsa, mandi, saleeg, jareesh, kunafa, foul…).
 *    Commons thumbnails cap at the original size, so widths are clamped.
 *
 * Swap either map for your own CDN later; everything goes through `img()`.
 */

const UNSPLASH = {
  burgerHero: '1550547660-d9450f859349',
  burgerDouble: '1607013251379-e6eecfffe234',
  burgerClassic: '1571091718767-18b5b1457add',
  burgerCheese: '1550317138-10000687a72b',
  burgerSpicy: '1568901346375-23c9450c58cd',
  burgerBasket: '1551782450-a2132b4ba21d',
  chickenSando: '1521305916504-4a1121188589',
  wrap: '1626700051175-6818013e1d4f',
  fries: '1541592106381-b31e9677c0e5',
  onionRings: '1639024471283-03518883512d',

  pizzaBoard: '1513104890138-7c749659a591',
  pizzaPepperoni: '1544982503-9f984c14501a',
  pizzaRocket: '1593560708920-61dd98c46a4e',
  pizzaBbq: '1565299624946-b28f40a0ae38',
  pizzaVeggie: '1615719413546-198b25453f85',
  pizzaMargherita: '1594007654729-407eedc4be65',

  ribs: '1544025162-d76694265947',
  kebabGrill: '1555939594-58d7cb561ad1',
  halloumi: '1476224203421-9ac39bcb3327',

  fishGrilled: '1519708227418-c8fd9a32b7a2',
  fishFillet: '1467003909585-2f8a72700288',
  prawnPasta: '1563379926898-05f4575a45d8',
  prawnRice: '1559847844-5315695dadae',

  pokeBowl: '1546069901-ba9599a7e63c',
  buddhaBowl: '1512621776951-a57141f2eefd',
  eggBowl: '1490645935967-10de6ba17061',
  kaleSalad: '1540189549336-e6e99c3679fe',
  gardenSalad: '1494859802809-d069c3b71a8a',
  saladBar: '1498837167922-ddd27525d352',

  bread: '1509440159596-0249088772ff',
  eggs: '1533089860892-a7c6f0a88666',
  sweetToast: '1484723091739-30a097e8f929',

  cheesecake: '1565958011703-44f9829ba187',
  chocCake: '1578985545062-69928b1d9587',
  tiramisu: '1571877227200-a0d98ea607e9',
  sundae: '1563805042-7684c019e1cb',
  cookies: '1558961363-fa8fdf82db35',
  crepes: '1587314168485-3236d6710814',
};

/** [directory prefix, url-encoded filename] on upload.wikimedia.org. */
const WIKI = {
  kabsaChicken: ['4/4c', 'Kabsa.jpg'],
  kabsaRice: ['d/de', 'Kabsa_001.jpg'],
  mandiChicken: ['2/26', 'Chicken_mandi.jpg'],
  mandiPlate: ['e/ea', 'Yemeni_food_-_Mandi_-_2011.jpg'],
  saleeg: ['b/ba', 'The_Hijazi_Saleeg.jpg'],
  jareesh: ['4/4e', 'Jarish_SaudiCuisine.JPG'],

  shawarmaSpit: ['0/00', 'Shawarma_2.jpg'],
  mashawiPlatter: ['6/66', 'Iraqi_Mixed_Grill_Platter_with_Traditional_Accompaniments.jpg'],
  mashawiMixed: ['a/a6', 'Mixed_Grill_Platter.jpg'],
  tawookSkewers: ['9/9c', 'Shish_taouk.jpg'],
  tawookRice: ['c/c6', 'Shish_Taouk.JPG'],

  broast: ['3/39', 'Chicken_Broast.JPG'],

  foulPlate: ['c/c1', 'Ful_medames_%28cropped%29.jpg'],
  foulBowl: ['3/37', 'Qwaider_al_nabulsi_foul_medames_%2811389639565%29.jpg'],
  mutabbaq: ['6/63', 'Murtabak.jpg'],
  sambusak: ['e/ed', 'Samosa_4.jpg'],
  falafel: ['2/20', '4pcs_Falafel%2C_Petra_Restaurant%2C_2026_%2801%29.jpg'],

  hummus: ['b/bf', 'Lebanese_style_hummus.jpg'],
  fattoush: ['a/a5', 'Fattoush.JPG'],
  tabbouleh: ['b/ba', 'Flickr_-_cyclonebill_-_Tabbouleh.jpg'],

  kunafa: ['f/f8', 'Knafeh_From_Yaffa_Knafeh.jpg'],
  kunafaTray: ['9/90', 'Kunafa%2C_Bangalore_%282025%29_03.jpg'],
  ummAli: ['9/9c', 'Umm_Ali.JPG'],
  basbousa: ['8/82', 'Basboosa.jpg'],
  sweetsTray: ['6/67', 'Lokma_et_al.jpg'],

  qahwaDallah: ['7/7f', 'Arabic_coffee_with_dates.jpg'],
  datesTea: ['5/58', 'Dates_and_gahwa.jpg'],
  karak: ['c/cb', 'Karak_Tea.jpg'],
};

const WIKI_BASE = 'https://upload.wikimedia.org/wikipedia/commons';
/**
 * Commons only generates thumbnails at a fixed set of bucket widths — asking
 * for anything else (640px, 800px…) comes back 400. Every file above has an
 * original of at least 960px, so these four are always safe.
 */
const WIKI_BUCKETS = [120, 250, 500, 960];
const snap = (w) => WIKI_BUCKETS.find((b) => b >= w) ?? 960;

/**
 * Resolve a photo key to a URL at roughly `w` pixels wide.
 * @param {string} key  a key from UNSPLASH or WIKI
 * @param {number} w    requested width in px
 */
export const img = (key, w = 900) => {
  const u = UNSPLASH[key];
  if (u) return `https://images.unsplash.com/photo-${u}?auto=format&fit=crop&w=${w}&q=80`;

  const k = WIKI[key];
  if (k) {
    const [dir, file] = k;
    return `${WIKI_BASE}/thumb/${dir}/${file}/${snap(w)}px-${file}`;
  }

  if (__DEV__) console.warn(`[photos] unknown image key: ${key}`);
  return null;
};

export default { UNSPLASH, WIKI };
