Project Context Implementations:
# 🧠 Understanding `useContext` — Real-World Scenarios

A guide to building a mental model for React's Context API with three real-world scenarios you see on websites every day, complete with simple code showing how `useContext` solves common component tree problems.

---

## 🛒 Example 1: Shopping Cart Badge (E-Commerce)

Imagine you have a shopping cart icon in your header that shows the total number of items bought.

### The Problem Without Context

Your App holds the `cartCount`. To get that number into the `CartIcon`, you have to pass it through components that don't care about it:

```
App (holds cartCount = 3)
 └── Header
      └── Navigation
           └── CartIcon (needs cartCount!)
```

`Header` and `Navigation` are just forced to act as middlemen.

### The Solution With `useContext`

```
App (Provider: cartCount = 3)
 ├── Header
 │    └── Navigation
 │         └── CartIcon ⚡ (grabs cartCount directly!)
 └── ProductList
```

#### Code Implementation

```javascript
import { createContext, useContext, useState } from "react";

// 1. Create the context
const CartContext = createContext();

export function App() {
  const [cartCount, setCartCount] = useState(3);

  return (
    // 2. Broadcast the cart count to the whole app
    <CartContext.Provider value={{ cartCount, setCartCount }}>
      <Header />
      <MainProducts />
    </CartContext.Provider>
  );
}

// 3. Middle components don't touch the data at all!
function Header() {
  return <Navigation />;
}

function Navigation() {
  return <CartIcon />;
}

// 4. The target component grabs the data instantly
function CartIcon() {
  const { cartCount } = useContext(CartContext);
  return <div className="badge">🛒 Items: {cartCount}</div>;
}
```

---

## 🌐 Example 2: Language Switcher (English vs. Khmer)

On a multi-language website, every button, heading, and paragraph needs to know what language the user selected.

### Why standard props fail here

If you pass a language prop manually, every single component in your entire app would need `language={currentLang}` added to it. That’s hundreds of lines of useless code!

### The Solution With `useContext`

```javascript
import { createContext, useContext, useState } from "react";

const LanguageContext = createContext();

export function App() {
  const [lang, setLang] = useState("KH"); // Default: Khmer

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      <Navbar />
      <WelcomeBanner />
    </LanguageContext.Provider>
  );
}

// Inside a deep nested component:
function WelcomeBanner() {
  // Grab the language from Context
  const { lang } = useContext(LanguageContext);

  return <h1>{lang === "KH" ? "សូមស្វាគមន៍!" : "Welcome!"}</h1>;
}
```

---

## 🔑 Example 3: User Authentication (Login / Logout)

When a user logs in, your website needs to know their profile data across many different pages:

- **Navbar**: Shows their profile avatar or "Login" button.
- **Dashboard**: Shows "Hello, Alex!".
- **Checkout Page**: Auto-fills their shipping address.

### The Problem Without Context

You'd have to pass `user` down through 10+ page components.

### The Solution With `useContext` (AuthContext)

```
               ┌────────────────────────┐
               │    AuthContext.Provider│
               │   (user: {name: "Alex"})│
               └───────────┬────────────┘
                           │
      ┌────────────────────┼────────────────────┐
      ▼                    ▼                    ▼
┌───────────┐        ┌───────────┐        ┌───────────┐
│  Navbar   │        │ Dashboard │        │ Checkout  │
│(useAuth)  │        │(useAuth)  │        │(useAuth)  │
└───────────┘        └───────────┘        └───────────┘
```

#### Code Implementation

```javascript
// Any component can check if the user is logged in
function Dashboard() {
  const { user, logout } = useContext(AuthContext);

  if (!user) return <p>Please log in.</p>;

  return (
    <div>
      <h2>Welcome back, {user.name}!</h2>
      <button onClick={logout}>Log Out</button>
    </div>
  );
}
```

---

## 📋 Summary Checklist

Ask yourself these two questions:

1. **Do 3 or more components in different places need this data?** _(e.g., User Login info, Dark/Light Mode, Language)_
2. **Are middle components being forced to pass props they don't use?**

If the answer to both is **YES**, use `useContext`!

---

## 📚 References & Further Reading

- **Official React Documentation**:
  - [`useContext` API Reference](https://react.dev/reference/react/useContext)
  - [Learn: Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context)
  - [Scaling Up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context)
