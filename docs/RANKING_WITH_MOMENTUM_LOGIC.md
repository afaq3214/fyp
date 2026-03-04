# Ranking with Momentum – Logic (For Teacher Presentation)

This document describes the **logic** of the four Discovery Hub features so you can explain them clearly to your teacher.

---

## 1. Popular Products

**Goal:** Show products that the community has voted for the most.

**Logic (step by step):**

1. **Data used:** Each product has:
   - `upvotes` = array of user IDs who upvoted (length = upvote count)
   - `totalcomments` = number of reviews/comments

2. **Computation:**
   - For every product, compute **upvotesCount** = size of `upvotes` array.
   - No filtering: all products are considered.

3. **Sorting:**
   - **Primary:** Sort by **upvotesCount** descending (most upvotes first).
   - **Secondary:** If two products have the same upvotesCount, sort by **totalcomments** descending (more comments first).

4. **Result:**
   - Take the top **limit** products (e.g. 20 or 30).
   - Return this list as “Popular Products”.

**Formula (concept):**
```
Rank = ORDER BY (upvotesCount DESC, totalcomments DESC)
```

**API:** `GET /api/products/ranking/popular?limit=20`

---

## 2. Fresh Products

**Goal:** Show the newest products, optionally only from the last N days.

**Logic (step by step):**

1. **Data used:** Each product has:
   - `createdAt` = date/time when the product was added.

2. **Filter (optional):**
   - Parameter: `days` (e.g. 7, 14, 30). Default 30.
   - Compute: **since** = today − `days` (e.g. 30 days ago).
   - Keep only products where **createdAt ≥ since**.

3. **Sorting:**
   - Sort by **createdAt** descending (newest first).

4. **Result:**
   - Take the top **limit** products.
   - Return this list as “Fresh Products”.

**Formula (concept):**
```
Filter: createdAt >= (today - days)
Rank   = ORDER BY createdAt DESC
```

**API:** `GET /api/products/ranking/fresh?limit=20&days=30`

---

## 3. Hidden Gems

**Goal:** Surface products that have good engagement but are **not** in the “top by upvotes” list (so they are under the radar but still valuable).

**Logic (step by step):**

1. **Data used (per product):**
   - `upvotesCount` = length of `upvotes` array
   - `reviewsCount` = `totalcomments` (or length of `reviews` array)
   - `createdAt` = launch date

2. **Momentum score:**
   - **daysSince** = days between `createdAt` and today (minimum 1 to avoid division by zero).
   - **momentum** = (upvotesCount + reviewsCount × 1.5) ÷ daysSince  
   - So: more upvotes and comments increase the score; older products get a lower score (engagement per day).

3. **Exclude “top by upvotes”:**
   - Sort all products by **upvotesCount** descending.
   - Take the **top 25%** of products by upvotes (e.g. if there are 100 products, top 25).
   - Put their IDs in an **excluded** set.
   - “Hidden gems” = products **not** in this excluded set.

4. **Eligibility:**
   - A product is eligible only if it has **at least 1 upvote OR at least 1 comment** (so we don’t show completely empty products).

5. **Sorting:**
   - Among eligible, non-excluded products, sort by **momentum** descending (highest engagement-per-day first).

6. **Result:**
   - Take the top **limit** from this sorted list.
   - Return as “Hidden Gems”.

**Formulas:**
```
daysSince = max(1, (today - createdAt) in days)
momentum  = (upvotesCount + reviewsCount × 1.5) / daysSince

excludedIds = top 25% of products when sorted by upvotesCount DESC
eligible    = product NOT in excludedIds AND (upvotesCount ≥ 1 OR reviewsCount ≥ 1)
Rank        = ORDER BY momentum DESC (among eligible)
```

**API:** `GET /api/products/ranking/hidden-gems?limit=20`

---

## 4. Smart Filters

**Goal:** One flexible feed where the user can combine **category**, **topic (tags)**, **sort**, and **diversity (one per maker)**.

**Logic (step by step):**

### Step A – Build the base query

1. **Category filter (optional):**
   - If user selects a category (e.g. “AI Tools”), filter: `category === selected category`.
   - If “All Categories”, no category filter.

2. **Topic filter (optional):**
   - Products have **autoTags** (e.g. ["AI", "Productivity"]).
   - If user selects a topic (e.g. “AI”), filter: product’s `autoTags` must contain that tag (case-insensitive).
   - If “All Topics”, no tag filter.

3. **Min engagement (optional):**
   - If `minUpvotes` or `minComments` are set, keep only products with:
     - upvotesCount ≥ minUpvotes AND
     - reviewsCount ≥ minComments.

4. **Result of Step A:** A list of products that match category + topic + min engagement. For each product we also compute:
   - **upvotesCount**, **reviewsCount**
   - **daysSince** = max(1, days since createdAt)
   - **momentum** = (upvotesCount + reviewsCount × 1.5) / daysSince

---

### Step B – Apply sort

User chooses one sort. We apply only that one:

| Sort option       | Logic |
|-------------------|--------|
| **popular**       | Sort by upvotesCount DESC, then reviewsCount DESC. |
| **fresh**         | Sort by createdAt DESC (newest first). |
| **momentum**      | Sort by momentum DESC (engagement per day). |
| **rising_week**   | Keep only products with createdAt in the **last 7 days**, then sort by momentum DESC. |
| **hidden_gems**   | Same idea as “Hidden Gems” feed: exclude top 25% by upvotes, keep only if upvotesCount ≥ 1 OR reviewsCount ≥ 1, then sort by momentum DESC. |

---

### Step C – Diversity (optional): One per maker

- If user enables **“One per maker”**:
  - After sorting, we walk the list in order.
  - For each product we look at **author** (author_id or author_name).
  - We keep the **first** product we see for each author and skip any further products from the same author.
  - So the final list has at most one product per maker (the “best” one according to the current sort).

---

### Step D – Final result

- Take the first **limit** products (e.g. 20) from the list after Step C.
- Return this as the Smart Filters result.

**Summary formula (concept):**
```
Filter  = category match AND topic (autoTags) match AND min engagement
Scores  = upvotesCount, reviewsCount, momentum = (upvotes + 1.5×comments) / daysSince
Sort    = one of: popular | fresh | momentum | rising_week | hidden_gems
Optional: diversity = one product per author (keep first per author)
Result  = first `limit` products
```

**API:**  
`GET /api/products/ranking/smart?category=...&sort=...&tags=...&diversity=maker&limit=20`

---

## Quick reference table

| Feature          | Main idea                          | Sort / selection rule |
|-----------------|-------------------------------------|-------------------------|
| **Popular**      | Community favourites                | Most upvotes, then most comments |
| **Fresh**        | Newest launches                     | Newest first (optional: last N days) |
| **Hidden Gems**  | Good but under the radar            | Exclude top 25% by upvotes; sort by momentum |
| **Smart Filters**| User-controlled combo feed          | Category + topic + chosen sort + optional one-per-maker |

You can use this document as-is to explain the logic to your teacher. If needed, you can also point them to the backend code in `Backend/routes/product.js` (routes: `/ranking/popular`, `/ranking/fresh`, `/ranking/hidden-gems`, `/ranking/smart`, and `/tags`).
