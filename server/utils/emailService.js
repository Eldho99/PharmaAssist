const nodemailer = require('nodemailer');

// Create reusable transporter using Gmail
const createTransporter = () => {
    // Gmail App Passwords sometimes have spaces — strip them
    const pass = (process.env.EMAIL_PASS || '').replace(/\s/g, '');
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: process.env.EMAIL_USER,
            pass,
        },
    });
};

// ─── Shared HTML wrapper ─────────────────────────────────────────────────────
const wrapHtml = (title, bodyHtml) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <style>
    body { margin:0; padding:0; background:#f0f4ff; font-family:'Segoe UI',Arial,sans-serif; }
    .wrapper { max-width:600px; margin:40px auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(79,70,229,0.10); }
    .header { background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%); padding:36px 40px; text-align:center; }
    .header h1 { margin:0; color:#fff; font-size:26px; letter-spacing:-0.5px; }
    .header p { margin:8px 0 0; color:rgba(255,255,255,0.8); font-size:14px; }
    .body { padding:36px 40px; }
    .body p { color:#374151; line-height:1.7; font-size:15px; margin:0 0 16px; }
    .pill-badge { display:inline-block; background:#ede9fe; color:#4f46e5; border-radius:999px; padding:4px 14px; font-size:13px; font-weight:600; margin:4px 4px 4px 0; }
    .status-badge { display:inline-block; border-radius:8px; padding:6px 16px; font-size:13px; font-weight:700; }
    .status-pending   { background:#fef3c7; color:#92400e; }
    .status-processed { background:#dbeafe; color:#1e40af; }
    .status-dispatched{ background:#d1fae5; color:#065f46; }
    .status-delivered { background:#dcfce7; color:#166534; }
    .cta { display:block; width:fit-content; margin:24px auto; background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff; text-decoration:none; padding:14px 32px; border-radius:10px; font-weight:700; font-size:15px; }
    .divider { border:none; border-top:1px solid #e5e7eb; margin:24px 0; }
    .footer { background:#f9fafb; padding:20px 40px; text-align:center; }
    .footer p { margin:0; color:#9ca3af; font-size:12px; }
    .med-row { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #f3f4f6; }
    .med-row:last-child { border-bottom:none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>💊 PharmaAssist</h1>
      <p>Your trusted medicine companion</p>
    </div>
    <div class="body">
      ${bodyHtml}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} PharmaAssist · You're receiving this because you have an account with us.</p>
    </div>
  </div>
</body>
</html>
`;

// ─── Email Templates ──────────────────────────────────────────────────────────

/**
 * Send a welcome email after registration
 */
const sendWelcomeEmail = async (to, name) => {
    const transporter = createTransporter();
    const html = wrapHtml('Welcome to PharmaAssist', `
        <p>Hi <strong>${name}</strong> 👋</p>
        <p>Welcome to <strong>PharmaAssist</strong>! Your account has been created successfully.</p>
        <p>Here's what you can do right away:</p>
        <ul style="color:#374151;line-height:2;padding-left:20px;">
            <li>📋 Upload or manually enter your prescriptions</li>
            <li>⏰ Set medicine reminders with push notifications</li>
            <li>📦 Track your refill orders in real time</li>
            <li>💊 Monitor your stock levels</li>
        </ul>
        <a class="cta" href="http://localhost:5173/dashboard">Go to Dashboard →</a>
        <hr class="divider"/>
        <p style="font-size:13px;color:#6b7280;">If you didn't create this account, please ignore this email.</p>
    `);

    await transporter.sendMail({
        from: `"PharmaAssist" <${process.env.EMAIL_USER}>`,
        to,
        subject: '🎉 Welcome to PharmaAssist!',
        html,
    });
    console.log(`[Email] Welcome email sent to ${to}`);
};

/**
 * Send an order status update email
 */
const sendOrderStatusEmail = async (to, name, order) => {
    const transporter = createTransporter();

    const statusLabels = {
        pending: { label: 'Order Received', emoji: '📬', class: 'status-pending' },
        processed: { label: 'Ready for Dispatch', emoji: '📦', class: 'status-processed' },
        dispatched: { label: 'Out for Delivery', emoji: '🚚', class: 'status-dispatched' },
        delivered: { label: 'Delivered', emoji: '✅', class: 'status-delivered' },
    };

    const info = statusLabels[order.status] || { label: order.status, emoji: '📋', class: 'status-pending' };
    const medList = order.medicines.map(m =>
        `<div class="med-row"><span>${m.name}</span><span class="pill-badge">Qty: ${m.quantity || 30}</span></div>`
    ).join('');

    const html = wrapHtml('Order Status Update', `
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your refill order status has been updated:</p>
        <p style="text-align:center;margin:20px 0;">
            <span class="status-badge ${info.class}">${info.emoji} ${info.label}</span>
        </p>
        <p><strong>Medicines in this order:</strong></p>
        <div style="background:#f9fafb;border-radius:10px;padding:8px 16px;margin-bottom:16px;">
            ${medList}
        </div>
        <p style="font-size:13px;color:#6b7280;">Order placed on: ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <a class="cta" href="http://localhost:5173/refills">Track Your Order →</a>
    `);

    await transporter.sendMail({
        from: `"PharmaAssist" <${process.env.EMAIL_USER}>`,
        to,
        subject: `${info.emoji} Order Update: ${info.label}`,
        html,
    });
    console.log(`[Email] Order status email sent to ${to} — status: ${order.status}`);
};

/**
 * Send daily medicine reminder email
 */
const sendDailyReminderEmail = async (to, name, medicines) => {
    const transporter = createTransporter();

    const medRows = medicines.map(med => {
        const times = med.times && med.times.length > 0 ? med.times.join(', ') : 'Not set';
        const stockClass = med.stock <= med.refillThreshold ? 'color:#dc2626;font-weight:700;' : 'color:#059669;';
        return `
            <div class="med-row">
                <div>
                    <strong>${med.name}</strong>
                    <span style="display:block;font-size:12px;color:#6b7280;">${med.dosage || ''} · ${med.frequency || ''}</span>
                </div>
                <div style="text-align:right;">
                    <span class="pill-badge">⏰ ${times}</span>
                    <span style="display:block;font-size:12px;${stockClass}">Stock: ${med.stock}</span>
                </div>
            </div>
        `;
    }).join('');

    const lowStock = medicines.filter(m => m.stock <= m.refillThreshold);
    const lowStockWarning = lowStock.length > 0 ? `
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 18px;margin:16px 0;">
            <p style="margin:0;color:#b91c1c;font-weight:600;">⚠️ Low Stock Alert</p>
            <p style="margin:6px 0 0;color:#dc2626;font-size:13px;">
                ${lowStock.map(m => `${m.name} (${m.stock} left)`).join(', ')} — consider placing a refill order.
            </p>
        </div>
    ` : '';

    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

    const html = wrapHtml("Today's Medicine Schedule", `
        <p>Good morning, <strong>${name}</strong>! 🌅</p>
        <p>Here's your medicine schedule for <strong>${today}</strong>:</p>
        <div style="background:#f9fafb;border-radius:10px;padding:8px 16px;margin-bottom:16px;">
            ${medRows}
        </div>
        ${lowStockWarning}
        <a class="cta" href="http://localhost:5173/reminders">View Full Schedule →</a>
    `);

    await transporter.sendMail({
        from: `"PharmaAssist" <${process.env.EMAIL_USER}>`,
        to,
        subject: `💊 Your Medicine Schedule for ${today}`,
        html,
    });
    console.log(`[Email] Daily reminder sent to ${to}`);
};

module.exports = { sendWelcomeEmail, sendOrderStatusEmail, sendDailyReminderEmail };
