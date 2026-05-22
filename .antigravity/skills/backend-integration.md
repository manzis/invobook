---
description: Comprehensive backend integration rules for Prisma ORM, Pages API routes, JWT auth, and Postgres database consistency.
---

# Backend Integration & Database Engineering Guide

This guide ensures that all backend, database, and API features in the Invobook application adhere to strict security, structural integrity, and relational data practices using Next.js Pages Router, Prisma ORM, and PostgreSQL.

---

## 🏗️ Technical Architecture Overview

*   **API Platform**: Next.js Pages Router API Routes under `src/pages/api/**/*.js` (or `.ts`).
*   **Database Engine**: PostgreSQL connected via **Prisma ORM** (`src/lib/prisma.js`).
*   **Authentication**: JWT Token-based stateless authentication (`jsonwebtoken` + `cookie` parser + `bcrypt` passwords).
*   **Authorization Guard**: Global middleware `src/middleware.ts` for route protection.

---

## 💾 Prisma & DB Schema Rules

When interacting with the database, strictly adhere to the following schema definitions and constraints:

### 1. Model Matrix & Relational Consistency

Always structure operations according to these relations in `schema.prisma`:
*   `User` (1-to-1) ↔ `Business` (1-to-1) ↔ `InvoiceSetting`
*   `User` (1-to-many) ↔ `Client` (1-to-many) ↔ `Invoice` (1-to-many) ↔ `InvoiceItem`
*   `User` (1-to-many) ↔ `CustomTemplate`

### 2. Relational Deletes (onDelete: Cascade)
When deleting models, understand which constraints are cascaded automatically:
*   **Cascade Active**: Deleting a `User` cascades to delete their `Client` list and `CustomTemplate` models.
*   **Cascade Active**: Deleting an `Invoice` cascades to delete all its `InvoiceItem` entries.
*   **Restrictive**: Verify associations before deleting objects that do not automatically cascade to prevent foreign-key constraint violations in PostgreSQL.

### 3. Financial Decimals (CRITICAL)
Invoices require high-precision financial accuracy. **NEVER use standard floats/numbers for money fields**.
*   **Always use Prisma Decimal fields** (e.g. `subtotal`, `taxAmount`, `shippingCost`, `total`, `amountPaid`, `balanceDue`, `rate`, `amount`).
*   **Prisma Client Type**: Decimals are instantiated as `Decimal` objects (from `decimal.js`).
*   **Data Entry/Mutation**: Convert numeric user inputs using `new Prisma.Decimal(value)` or numeric strings before saving.
*   **Calculations**: Keep calculations precise. Avoid rounding mid-operation:
    ```javascript
    // ✅ CORRECT - Decimal math
    const subtotal = items.reduce((acc, item) => acc.plus(new Decimal(item.rate).times(item.quantity)), new Decimal(0));
    ```

---

## 🔒 Security & Authentication Rules

### 1. API Route Authentication Shield
Every non-public API endpoint **MUST** verify the user session. Do not trust user-provided client IDs.
```javascript
import { verify } from 'jsonwebtoken';
import { serialize } from 'cookie';
import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(411).json({ error: 'Authentication required' });
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // Always bind userId from token
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  // Proceed with authorized logic...
}
```

### 2. Owner-Resource Check (Strictest Isolation)
When performing operations on `Client`, `Invoice`, `InvoiceItem`, or `Business`, **always scope queries to the authenticated `userId`** to prevent Cross-Tenant Data Access (IDOR).
```javascript
// ✅ CORRECT - Secure lookup scoped to authorized user
const invoice = await prisma.invoice.findFirst({
  where: {
    id: invoiceId,
    userId: req.userId // Security check
  }
});
```

### 3. Hashing & Passwords
*   Always hash passwords using `bcrypt` (salt rounds: 10) before saving user registrations.
*   Never return `hashedPassword` in user profiles or database select statements:
    ```javascript
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true } // Exclude hashedPassword
    });
    ```

---

## ⚡ High-Performance DB Transactions

To avoid orphaned models or incomplete writes (especially for Invoices and their line Items), **always wrap multi-step writes in a Prisma transaction**:

```javascript
// ✅ CORRECT - Atomic transaction
const result = await prisma.$transaction(async (tx) => {
  // 1. Create Invoice
  const invoice = await tx.invoice.create({
    data: {
      invoiceNumber,
      date: new Date(date),
      dueDate: new Date(dueDate),
      subtotal,
      taxRate,
      taxAmount,
      total,
      balanceDue: total,
      userId: req.userId,
      clientId
    }
  });

  // 2. Create related Items
  const createdItems = await Promise.all(
    items.map(item => tx.invoiceItem.create({
      data: {
        description: item.description,
        quantity: parseFloat(item.quantity),
        rate: item.rate,
        amount: new Decimal(item.rate).times(item.quantity),
        invoiceId: invoice.id
      }
    }))
  );

  return { invoice, items: createdItems };
});
```

---

## 🛠️ Validation & Error Response Checklist

Before finalizing any API endpoint:
- [ ] Parse and validate input data (check for required fields, non-negative quantities, valid emails).
- [ ] Safe date conversion: Ensure dates are parsed using `new Date()` and verified via `isNaN(date.getTime())`.
- [ ] Wrap DB lookups in structured `try-catch` blocks and return appropriate status codes:
    *   `400 Bad Request` for invalid parameters.
    *   `401 Unauthorized` for token issues.
    *   `403 Forbidden` for IDOR/ownership issues.
    *   `404 Not Found` for missing resources.
    *   `500 Internal Server Error` for system crashes.
