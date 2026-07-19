// /pages/api/invoices.js (Corrected and Final)

import { verify } from 'jsonwebtoken';
import prisma from '../../lib/prisma';
import { createNotification } from '../../lib/notifications';
const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { authToken } = req.cookies;
  if (!authToken) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  try {
    const decoded = verify(authToken, SECRET_KEY);
    const userId = decoded.userId;
    const invoiceData = req.body;
    let clientId = invoiceData.clientId;

    // --- Handle New vs. Existing Client ---
    if (!clientId) {
      if (!invoiceData.clientName && !invoiceData.clientPhone) {
        return res.status(400).json({ message: 'New client name and phone are required.' });
      }
      const newClient = await prisma.client.create({
        data: {
          name: invoiceData.clientName,
          email: invoiceData.clientEmail,
          company: invoiceData.clientCompany,
          address: invoiceData.clientAddress,
          city: invoiceData.clientCity,
          phone: invoiceData.clientPhone,
          taxId: invoiceData.clientTaxId,
          type: invoiceData.type === 'PURCHASE' ? 'VENDOR' : 'CLIENT',
          userId: userId,
        },
      });
      clientId = newClient.id;
    }

    const subtotal = parseFloat(invoiceData.subtotal) || 0;
    const discountType = invoiceData.discountType || 'PERCENTAGE';
    const discountValue = parseFloat(invoiceData.discountValue) || 0;
    const taxRate = parseFloat(invoiceData.taxRate) || 0;
    const shippingCost = parseFloat(invoiceData.shippingCost) || 0;
    const amountPaid = parseFloat(invoiceData.amountPaid) || 0;

    // 2. Perform all financial calculations on the server to ensure data integrity.
    let discountAmount = 0;
    if (discountType === 'PERCENTAGE') {
      discountAmount = subtotal * (discountValue / 100);
    } else { // Assumes 'FIXED'
      discountAmount = discountValue > subtotal ? subtotal : discountValue; // Cap discount at subtotal
    }

    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (taxRate / 100);
    const total = taxableAmount + taxAmount + shippingCost;
    const balanceDue = total - amountPaid;
    

      let finalStatus = invoiceData.status || 'PENDING';

    // Only update status automatically if it's not a draft
    if (finalStatus !== 'DRAFT') {
      if (balanceDue <= 0) {
        // If the balance is zero or less, the invoice is fully PAID.
        finalStatus = 'PAID';
      } else if (amountPaid > 0) {
        // If not fully paid, but some amount has been paid, it's PARTIALLY_PAID.
        finalStatus = 'PARTIALLY_PAID';
      }
      
    }
    // --- Check if inventory is enabled for stock validation ---
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { inventoryEnabled: true },
    });
    const shouldDeductStock = user?.inventoryEnabled && finalStatus !== 'DRAFT' && invoiceData.type !== 'QUOTATION' && invoiceData.type !== 'PURCHASE';
    const shouldIncrementStock = user?.inventoryEnabled && finalStatus !== 'DRAFT' && invoiceData.type === 'PURCHASE';

    if (user?.inventoryEnabled) {
      const invalidItems = invoiceData.items.filter(item => !item.inventoryItemId);
      if (invalidItems.length > 0) {
        return res.status(400).json({ message: 'Inventory tracking is enabled. All items must be selected from the product catalog.' });
      }
    }

    // --- Validate stock levels before creating invoice ---
    if (shouldDeductStock) {
      const inventoryItemIds = invoiceData.items
        .filter(item => item.inventoryItemId)
        .map(item => item.inventoryItemId);

      if (inventoryItemIds.length > 0) {
        const inventoryItems = await prisma.inventoryItem.findMany({
          where: { id: { in: inventoryItemIds }, userId },
        });

        const stockMap = {};
        for (const inv of inventoryItems) {
          stockMap[inv.id] = { quantity: inv.quantity, name: inv.name };
        }

        const outOfStock = [];
        for (const item of invoiceData.items) {
          if (item.inventoryItemId && stockMap[item.inventoryItemId]) {
            const available = stockMap[item.inventoryItemId].quantity;
            if (item.quantity > available) {
              outOfStock.push({
                name: stockMap[item.inventoryItemId].name,
                requested: item.quantity,
                available,
              });
            }
          }
        }

        if (outOfStock.length > 0) {
          const details = outOfStock.map(i => `${i.name}: requested ${i.requested}, available ${i.available}`).join('; ');
          return res.status(400).json({ message: `Insufficient stock: ${details}` });
        }
      }
    }

    // --- Create the Invoice and its Items ---
    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber: invoiceData.invoiceNumber,
        date: new Date(invoiceData.date),
        dueDate: new Date(invoiceData.dueDate),
        status: finalStatus,
        type: invoiceData.type || 'SALES',
        notes: invoiceData.notes,
        terms: invoiceData.terms,
        
        // Use the server-calculated values to prevent data tampering
        subtotal: subtotal,
        discountType: discountType,
        discountValue: discountValue,
        discountAmount: discountAmount,
        taxRate: taxRate,
        taxAmount: taxAmount,
        shippingCost: shippingCost,
        total: total,
        amountPaid: amountPaid,
        balanceDue: balanceDue,
        
        // Link relationships
        userId: userId,
        clientId: clientId,
        
        // Create nested line items
        items: {
          create: invoiceData.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
            inventoryItemId: item.inventoryItemId || null,
          })),
        },
      },
      include: {
        items: true,
        client: true,
      },
    });

    // --- Deduct stock after successful invoice creation ---
    if (shouldDeductStock) {
      const stockUpdates = invoiceData.items
        .filter(item => item.inventoryItemId)
        .map(item =>
          prisma.inventoryItem.update({
            where: { id: item.inventoryItemId },
            data: { quantity: { decrement: item.quantity } },
          })
        );

      if (stockUpdates.length > 0) {
        await prisma.$transaction(stockUpdates);

        // Check for low stock notifications
        const updatedInventory = await prisma.inventoryItem.findMany({
          where: {
            id: { in: invoiceData.items.filter(i => i.inventoryItemId).map(i => i.inventoryItemId) },
            userId,
          },
        });

        for (const inv of updatedInventory) {
          if (inv.quantity <= 0) {
            await createNotification({
              userId,
              title: 'Out of Stock',
              message: `"${inv.name}" is now out of stock (0 ${inv.unit}).`,
              type: 'INVOICE_CREATE',
            });
          } else if (inv.quantity <= inv.lowStock) {
            await createNotification({
              userId,
              title: 'Low Stock Alert',
              message: `"${inv.name}" is running low — only ${inv.quantity} ${inv.unit} remaining.`,
              type: 'INVOICE_CREATE',
            });
          }
        }
      }
    }

    // --- Increment stock for PURCHASE invoices ---
    if (shouldIncrementStock) {
      const stockIncrements = invoiceData.items
        .filter(item => item.inventoryItemId)
        .map(item =>
          prisma.inventoryItem.update({
            where: { id: item.inventoryItemId },
            data: { quantity: { increment: item.quantity } },
          })
        );

      if (stockIncrements.length > 0) {
        await prisma.$transaction(stockIncrements);
      }
    }

    await createNotification({
      userId,
      title: 'Invoice Created',
      message: `Invoice ${newInvoice.invoiceNumber} was created for ${newInvoice.client?.name || 'Client'}.`,
      type: 'INVOICE_CREATE',
      invoiceId: newInvoice.id,
    });

    return res.status(201).json(newInvoice);

  } catch (error) {
    console.error("Create Invoice API Error:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'An invoice with this number already exists.' });
    }
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}