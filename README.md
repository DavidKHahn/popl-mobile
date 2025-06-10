# 📱 Popl Mobile Take-Home Project

Welcome — and thanks for your time.

This take-home project is designed to simulate a **real-world lead management flow**, similar to patterns we use at Popl. We're using this to understand how you reason about **data flow**, **state**, **API integration**, and **UI behavior** in a modern React Native codebase.

This isn't about perfection — it’s about how you **think**.

## 🧠 What You'll Be Building

A lightweight mobile app (3 screens) for managing "leads":

### 1. **Lead List Screen** :white_check_mark:

- Fetches and displays a list of leads from a mock API
- Supports basic **search** and **sort** (by name or creation date)
- Tapping a lead should navigate to its detail view

### 2. **Lead Detail Screen** :white_check_mark:

- Displays all lead details (name, company, tags, etc.)
- Use either navigation-passed data or fetch by ID (up to you)

### 3. **New Lead Screen** :white_check_mark:

- Basic form to create a new lead (name, email, etc.)
- Submits via a mock API (`POST /leads`)
- Consider optimistic updates or a refresh pattern

## 🛠 Stack (already scaffolded)

- **React Native (Expo)**
- **TypeScript**
- **React Navigation**
- **React Native Paper** (UI components)
- **Axios** for API
- **React Query** for data fetching/caching

You’ll find basic folders and some static data already wired up.

## ✅ What We’re Evaluating

We're less interested in pixel-perfect design and more in:

- 📐 **Code clarity and structure**
- 🧱 **Separation of concerns (API, types, UI, data)**
- 🧭 **Correct and idiomatic use of React Navigation**
- 🔁 **Loading, error, and edge-case handling**
- 🧠 **Practical reasoning**: do you solve problems like someone we'd want to ship features with?

Bonus points for:

- 👁 Thoughtful UX polish
- 🧪 Basic testability
- 📂 A sensible folder and component structure

## 🧪 Mock API Instructions

We use `json-server` to simulate a backend.

### Start the mock API:

```bash
npm run api
```

This will serve from:
[http://localhost:3001/leads](http://localhost:3001/leads)

### Available endpoints:

- `GET /leads` – fetch all
- `GET /leads/:id` – fetch one
- `POST /leads` – create
- `PUT /leads/:id` – full replace
- `PATCH /leads/:id` – partial update
- `DELETE /leads/:id` – delete

🕗 Note: a small artificial delay is applied to all responses (via interceptor) to simulate real-world async behavior.

## 💡 Optional Enhancements (in loose priority order)

If you're feeling ambitious, consider adding one or more of these:

1. **🔧 Dynamic form support** :white_check_mark:

   - Add a toggle at the top of the "New Lead" screen for "Default" vs "Custom"
   - Load custom field mappings from a mock `/form-config` API and append to the form dynamically
   - This reflects a real pattern in our production app

2. **🧠 Improve loading/empty/error UI** :white_check_mark:

   - E.g. loading skeletons, "No results" states, graceful error fallback

3. **🔍 Debounced search** :white_check_mark:

   - Prevent over-rendering on every keystroke using `useDebounce` or `lodash.debounce`

4. **🧪 Tests**

   - Basic unit or component tests — not required, but a nice bonus

5. **📦 Global app config or user state** :white_check_mark:

   - Introduce Redux or Zustand to manage a simple user session or settings

6. **📶 Offline persistence** :white_check_mark:

   - Use something like `AsyncStorage` or `react-query`’s persistence layer to survive refreshes or flight mode

## 📬 How to Submit

Send us either:

- A GitHub repo link (public or invite us)
- A zip file of the completed project

Optional: add a short note if you left anything out intentionally, or want to clarify something about your implementation.

We’re looking forward to reviewing your work! Thanks again — and have fun with it. 🙏
