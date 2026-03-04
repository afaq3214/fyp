# AI Recommendations Module – Logic (For Teacher)

This document describes the **AI Recommendations** module and how it uses **sentiment analysis** and the **existing database**.

---

## 1. Feedback sentiment (comments)

**Where:** When a user adds a **comment** on a product (`POST /api/comments/add`).

**Logic:**
- The comment **text** is analyzed with the **Sentiment** library (Node).
- A **score** (positive/negative number) and a **label** (`positive` / `negative` / `neutral`) are computed.
- These are stored on the comment document: `sentimentScore`, `sentimentLabel`.
- So every new comment is automatically tagged with sentiment and stored in the **existing Comments collection**.

**Database:** Same `Comments` model; two extra fields: `sentimentScore`, `sentimentLabel`.

---

## 2. AI Suggested products

**Goal:** Recommend products for the **logged-in user** based on their behavior.

**Logic:**
- Use the **existing database**: Products, Comments, upvotes.
- Find products the user has **upvoted** → collect their **categories** and **autoTags**.
- Find products the user has **commented** on → treat as “already seen”.
- Recommend products that:
  - Match those categories or tags,
  - Are **not** by the user,
  - Are **not** already commented on,
  - Are ranked by **momentum** (engagement per day).
- If there are not enough matches, **fallback** to popular products (by upvotes).

**API:** `GET /api/recommendations/suggested` (auth required).  
**Frontend:** Discovery Hub right sidebar “AI Suggested for you” (when logged in), and Chatbot “Suggest products for me”.

---

## 3. Weekly digest emails

**Goal:** Send a **weekly email** with top products and feedback sentiment summary.

**Logic:**
- **Preference:** User model has `digestOptIn`. User turns it on/off in **Profile** (“Weekly digest email”).
- **Content:** Top products by upvotes, count of **new products** in the last 7 days, and **sentiment summary** (positive / neutral / negative counts from comments in the last 7 days).
- **Sending:** A **cron job** (e.g. Sunday 9:00) calls `POST /api/recommendations/send-digest`, which:
  - Builds the digest payload from the **existing** Product and Comments data,
  - Finds all users with `digestOptIn === true`,
  - Sends one email per user via **Nodemailer** (SMTP).

**Database:** Same **User** model; one extra field: `digestOptIn`.  
**Env (optional):** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FRONTEND_URL`. If SMTP is not set, the job still runs but only logs (no real email).

---

## 4. Feedback sentiment insights (API + UI)

**Goal:** Expose **aggregate sentiment** over comments for the product feed or for makers.

**Logic:**
- **API:** `GET /api/recommendations/sentiment?productId=...&limit=...`
  - If `productId` is given: only comments for that product.
  - Otherwise: all comments (or up to `limit`).
  - For those comments, use stored `sentimentScore` and `sentimentLabel`.
  - Return: **total** comments, **average score**, **distribution** (counts of positive / neutral / negative), and optional **recent sample**.
- **Database:** Same **Comments** collection; no new collection. Uses `sentimentScore` and `sentimentLabel` computed at comment creation.

**Frontend:** Discovery Hub right sidebar “Feedback sentiment” (global), and Chatbot “Show feedback sentiment”.

---

## 5. Chatbot assistant

**Goal:** Let users ask for **suggested products** and **sentiment insights** in natural language.

**Logic:**
- **Suggested products:** If the user says things like “suggest products for me” or “recommend”, the frontend calls `GET /api/recommendations/suggested` (with auth) and the bot replies with the list (or “log in first”).
- **Sentiment:** If the user says “sentiment” or “feedback insights”, the frontend calls `GET /api/recommendations/sentiment` and the bot replies with the summary (total, average score, distribution).
- Other questions (how PeerRank works, pitch tips, etc.) are answered with **static** replies (no new APIs).

**Database:** No direct DB access in the chatbot; it uses the same **recommendations APIs** above, which use the existing database.

---

## Summary table

| Feature                 | Uses DB              | Sentiment          | API / Trigger                          |
|-------------------------|----------------------|--------------------|----------------------------------------|
| Comment sentiment       | Comments             | Yes (on add)       | `POST /api/comments/add`               |
| AI Suggested products  | Products, Comments   | No                 | `GET /api/recommendations/suggested`   |
| Weekly digest           | Products, Comments, User | Yes (aggregate) | Cron → `POST /api/recommendations/send-digest` |
| Sentiment insights     | Comments             | Yes (stored)       | `GET /api/recommendations/sentiment`   |
| Chatbot (suggest/sentiment) | Via APIs above  | Via APIs           | Same APIs from frontend                |

All features use the **existing** Product, Comments, and User collections; only **two** new fields were added: `Comments.sentimentScore` / `Comments.sentimentLabel`, and `User.digestOptIn`.
