import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDb()
    const order = await db.collection('Order').findOne({ _id: new ObjectId(id) })
    
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    }

    const invoiceHTML = generateInvoiceHTML(order)
    
    return new NextResponse(invoiceHTML, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="invoice-${order.orderNumber}.html"`,
      },
    })
  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json({ message: 'Failed to generate invoice' }, { status: 500 })
  }
}

function generateInvoiceHTML(order: any): string {
  const formatPrice = (price: number) => `₹${price.toFixed(2)}`
  const formatDate = (date: Date) => new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${order.orderNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
    .invoice { max-width: 800px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #0c831f; }
    .company { flex: 1; }
    .company h1 { color: #0c831f; font-size: 32px; margin-bottom: 5px; }
    .company p { color: #666; font-size: 14px; }
    .invoice-details { text-align: right; }
    .invoice-details h2 { font-size: 24px; color: #333; margin-bottom: 10px; }
    .invoice-details p { color: #666; margin: 5px 0; }
    .section { margin-bottom: 30px; }
    .section h3 { color: #333; margin-bottom: 15px; font-size: 16px; text-transform: uppercase; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
    .info-box { background: #f9f9f9; padding: 15px; border-radius: 5px; }
    .info-box p { margin: 5px 0; color: #555; font-size: 14px; }
    .info-box strong { color: #333; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    thead { background: #0c831f; color: white; }
    th { padding: 12px; text-align: left; font-weight: 600; }
    td { padding: 12px; border-bottom: 1px solid #eee; color: #555; }
    tr:last-child td { border-bottom: none; }
    .text-right { text-align: right; }
    .totals { margin-top: 20px; }
    .totals table { width: auto; margin-left: auto; }
    .totals td { border: none; padding: 8px 15px; }
    .totals tr:last-child { font-weight: bold; font-size: 18px; background: #f0f0f0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px; }
    .print-btn { background: #0c831f; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-bottom: 20px; }
    .print-btn:hover { background: #0a6a19; }
    @media print {
      body { padding: 0; background: white; }
      .invoice { box-shadow: none; padding: 20px; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <button class="print-btn" onclick="window.print()">🖨️ Print Invoice</button>
    
    <div class="header">
      <div class="company">
        <h1>Blinkit</h1>
        <p>Quick Commerce Delivery</p>
        <p>Customer Care: 1800-XXX-XXXX</p>
      </div>
      <div class="invoice-details">
        <h2>INVOICE</h2>
        <p><strong>Order #:</strong> ${order.orderNumber}</p>
        <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
        <p><strong>Status:</strong> <span style="color: #0c831f; text-transform: uppercase;">${order.status}</span></p>
      </div>
    </div>

    <div class="section">
      <div class="info-grid">
        <div class="info-box">
          <h3>Customer Details</h3>
          <p><strong>Name:</strong> ${order.customerName}</p>
          <p><strong>Phone:</strong> ${order.customerPhone}</p>
          ${order.customerEmail ? `<p><strong>Email:</strong> ${order.customerEmail}</p>` : ''}
        </div>
        <div class="info-box">
          <h3>Delivery Address</h3>
          <p>${order.deliveryAddress.address}</p>
          <p>${order.deliveryAddress.city}</p>
          <p><strong>PIN:</strong> ${order.deliveryAddress.pincode}</p>
        </div>
      </div>
    </div>

    ${order.instructions ? `
    <div class="section">
      <div class="info-box">
        <h3>Delivery Instructions</h3>
        <p>${order.instructions}</p>
      </div>
    </div>
    ` : ''}

    <div class="section">
      <h3>Order Items</h3>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Unit</th>
            <th class="text-right">Price</th>
            <th class="text-right">Qty</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map((item: any) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.unit}</td>
              <td class="text-right">${formatPrice(item.price)}</td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right">${formatPrice(item.price * item.quantity)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="totals">
      <table>
        <tr>
          <td>Subtotal:</td>
          <td class="text-right">${formatPrice(order.subtotal)}</td>
        </tr>
        <tr>
          <td>Delivery Charge:</td>
          <td class="text-right">${formatPrice(order.deliveryCharge)}</td>
        </tr>
        ${order.handlingCharge ? `
        <tr>
          <td>Handling Charge:</td>
          <td class="text-right">${formatPrice(order.handlingCharge)}</td>
        </tr>
        ` : ''}
        ${order.smallCartCharge ? `
        <tr>
          <td>Small Cart Fee:</td>
          <td class="text-right">${formatPrice(order.smallCartCharge)}</td>
        </tr>
        ` : ''}
        <tr>
          <td>Grand Total:</td>
          <td class="text-right">${formatPrice(order.total)}</td>
        </tr>
      </table>
    </div>

    <div class="section">
      <div class="info-box">
        <p><strong>Payment Method:</strong> ${order.paymentMethod || 'COD'}</p>
        <p><strong>Payment Status:</strong> <span style="text-transform: capitalize;">${order.paymentStatus || 'Pending'}</span></p>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for shopping with Blinkit!</p>
      <p>This is a computer-generated invoice and does not require a signature.</p>
    </div>
  </div>
</body>
</html>
  `
}
