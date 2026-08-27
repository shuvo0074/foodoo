# Foodoo

A dark-themed food delivery app built with the **React Native CLI** (bare RN 0.87, no Expo),
set in **Riyadh, Saudi Arabia**. Everything runs on local dummy data — no backend yet — but the app
is fully interactive: you can browse, customise a dish, build a cart, apply a promo code, check out,
and watch the order move along a live tracking screen. Prices are in Saudi riyal (SR).

## Run it

```bash
npm install
cd ios && pod install && cd ..    # or: npm run pods

npm run ios                       # or: npm run android
npm start                         # Metro on its own
```

Requirements: Xcode + CocoaPods for iOS, JDK 17 + Android SDK for Android.

## What's in it

| Screen | File | Highlights |
| --- | --- | --- |
| Home | `src/screens/HomeScreen.js` | Collapsing blurred header, parallax promo carousel, category filter, trending rail, skeleton loading, pull-to-refresh, address sheet |
| Search | `src/screens/SearchScreen.js` | Live filtering over restaurants + dishes, recent/popular searches, cuisine grid |
| Orders | `src/screens/OrdersScreen.js` | Live order progress, order history, one-tap reorder |
| Profile | `src/screens/ProfileScreen.js` | Animated loyalty progress, stats, preference toggles, favourites |
| Restaurant | `src/screens/RestaurantScreen.js` | Parallax hero, scroll-linked top bar, sticky section chips that jump to a section |
| Dish | `src/screens/DishScreen.js` | Required/multi-select option groups, live price, quantity, kitchen note |
| Cart | `src/screens/CartScreen.js` | Per-line steppers, layout animations on removal, promo codes, tip picker, live totals |
| Checkout | `src/screens/CheckoutScreen.js` | Address / time / payment pickers, summary, animated "placing order" overlay |
| Tracking | `src/screens/OrderScreen.js` | Courier riding an SVG bezier route, stage timeline, auto-advancing status, rating |

## Structure

```
App.js                  providers + NavigationContainer
index.js                AppRegistry entry
src/navigation/         root stack + bottom tabs + custom animated TabBar
src/screens/            the nine screens above
src/theme/              colours, spacing, type scale, elevation, spring configs
src/data/               dummy restaurants, dishes, promos, orders + photo ids
src/state/store.js      cart / favourites / orders reducer + context
src/components/         Press, Img, Sheet, cards, cart bar, UI primitives
```

## Native dependencies

| Package | Used for |
| --- | --- |
| `@react-navigation/native` + `native-stack` + `bottom-tabs` | routing, modal presentation |
| `react-native-reanimated` (+ `react-native-worklets`) | every animation; scroll-linked headers run on the UI thread |
| `react-native-gesture-handler` | required by native-stack gestures |
| `react-native-linear-gradient` | gradients on buttons, scrims, promo cards |
| `@react-native-community/blur` | frosted tab bar and headers |
| `react-native-vector-icons` (Ionicons) | all iconography |
| `react-native-svg` | the animated delivery route |
| `react-native-haptic-feedback` | press feedback |
| `react-native-safe-area-context` / `react-native-screens` | insets + native screens |

Font note: only `Ionicons.ttf` is shipped — it's declared in `ios/Foodoo/Info.plist` (`UIAppFonts`)
and copied on Android via `fonts.gradle` in `android/app/build.gradle`.

## Notes on the fake data

Ten fictional Riyadh restaurants — mandi & kabsa, charcoal mashawi, shawarma, broast, a Saudi
breakfast place, Red Sea seafood, pizza, burgers, healthy bowls, and a late-night kunafa shop —
with menus, prices, neighbourhoods (Al Olaya, Al Malqa, Hittin…), mada / STC Pay payment methods
and SR pricing.

- `src/data/photos.js` holds two photo maps, both resolved through `img(key, width)`:
  - **Unsplash** for universal items (burgers, pizza, salads, seafood, desserts).
  - **Wikimedia Commons** for the Saudi and wider Arab dishes stock libraries cover badly — kabsa,
    mandi, saleeg, jareesh, shawarma, foul, mutabbaq, kunafa, umm ali, luqaimat, qahwa and dates.
  Every URL was fetched and eyeballed so each dish gets a picture of roughly the right food.
  Commons only generates thumbnails at fixed bucket widths, so `img()` snaps Wikimedia requests to
  the nearest allowed size — don't remove that or you'll get 400s.
- `Img` paints a deterministic gradient underneath every photo and cross-fades the real image in, so
  tiles still look designed offline or on a slow connection.
- All data is deterministic (no `Math.random`), so the UI looks identical on every run.

## Wiring up a backend later

The seams are already there:

- `src/data/index.js` exports `getRestaurant`, `getDish`, `byCategory`, `search` — replace the bodies
  with fetches.
- `src/state/store.js` is a plain reducer. `placeOrder()` and `advance()` are the two places that
  would talk to a real orders API.
- The cart is restaurant-scoped and prompts before clearing, matching normal delivery-app behaviour.

## Promo codes that work

`FOODOO50` (50% off, max SR 45) · `FREESHIP` (free delivery) · `SAVE20` (SR 20 off)
