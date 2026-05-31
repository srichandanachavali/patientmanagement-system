# VEDA Dental PMS — Staff User Guide

This guide is for VEDA Super Speciality Dental Clinic staff. No technical knowledge needed.

---

## Logging In

1. Open your browser and go to the clinic system URL (or <http://localhost:3000> on the clinic computer).
2. Enter your **email address** and **password**.
3. Click **Sign In**.

> If you see "Access denied" on a page, your role does not have permission. Contact the Admin user.

**To sign out:** Click your name in the top-right corner → **Sign out**.

---

## Roles and What They Can Do

| Role | Can access |
| ---- | ---------- |
| **Admin** | Everything, including Settings, Audit Log, and Analytics |
| **Dentist** | Patients, Appointments, Billing, Odontogram, Notes, Lab, Recalls |
| **Receptionist** | Patients, Appointments, Billing, Lab, Recalls |

---

## Dashboard

The dashboard is the home page after login. It shows:
- **Today's appointments** — who is coming in, at what time, in which chair
- **Revenue** — today's collected amount and this month's total
- **Outstanding balance** — total unpaid invoices
- **Recalls due** — patients who haven't visited in over 6 months

Click any appointment to open its detail page.

---

## Patients

### Finding a Patient

1. Click **Patients** in the left sidebar.
2. Type the patient's **name**, **phone number**, or **ABHA number** in the search box.
3. Results appear as you type. Click a patient card to open their record.

### Adding a New Patient

1. Click **Patients** → **New Patient** (top right).
2. Fill in:
   - **Name** (required)
   - **Phone** (required)
   - **Date of birth**, gender, address, preferred language (English or Telugu)
   - **ABHA number** (optional — national health ID)
   - **Medical history** — allergies, diabetes, blood pressure, cardiac issues, current medications, pregnancy status
3. **Consent** — tick at minimum the **Clinical** box. Tick **Billing** if you'll generate invoices. Tick **Reminders** if you'll send WhatsApp messages.
4. Click **Create Patient**.

> If a patient has allergies, a **red alert banner** appears at the top of their profile page. Always check this before treatment.

### Editing a Patient

1. Open the patient's profile.
2. Click **Edit patient** (top right).
3. Update the fields and click **Save changes**.

### Uploading Patient Attachments (X-rays, reports)

1. Open the patient's profile.
2. Scroll to **Attachments**.
3. Drag a file onto the upload area, or click to browse (max 10 MB per file).
4. The file appears immediately in the attachments list.

---

## Appointments

### Viewing the Schedule

1. Click **Appointments** in the sidebar.
2. Use the **date picker** to select a day.
3. The calendar shows all chairs side by side. Each coloured block is one appointment.

### Booking a New Appointment

1. Click **New Appointment** (top right of the Appointments page).
2. Select:
   - **Patient** — type the name or phone to search
   - **Dentist**
   - **Chair** (1, 2, or 3)
   - **Date and time** (start and end)
   - **Notes** (optional)
3. Click **Book Appointment**.

> The system **blocks double-booking** — if another appointment already occupies that chair and time slot, you will see an error. Choose a different chair or time.

### Updating an Appointment Status

1. Click the appointment in the calendar (or the appointment block on the dashboard).
2. Use the **status buttons**: Booked → Confirmed → Arrived → In Chair → Completed (or No-Show / Cancelled).
3. Click **Save**.

### Sending a WhatsApp Reminder

1. Open the appointment detail page.
2. Click **Draft reminder** — this creates a one-tap WhatsApp link with the patient's name, date, and time pre-filled.
3. Click **Open WhatsApp** — this opens WhatsApp with the message ready to send.

> Reminders are in **English** by default. If the patient's preferred language is **Telugu (te)**, the message is automatically in Telugu.

---

## Billing / Invoices

### Creating an Invoice

1. Click **Billing** → **New Invoice**.
2. **Search and select the patient** in the search box.
3. Add line items:
   - **Description** — procedure name (e.g. "Scaling & Polishing")
   - **Amount (₹)** — base amount before GST
   - **GST %** — defaults to 18%; change if needed
   - Click **+ Add item** to add more lines
4. Add any notes (optional).
5. Click **Create Invoice**.

### Recording a Payment

1. Open the invoice from the Billing list.
2. Scroll to the **Record Payment** section.
3. Enter the amount, select the mode (Cash / UPI / Card).
4. Click **Record payment**.
5. The invoice status updates automatically: partially paid → paid when the full amount is received.

### UPI QR Code

On the invoice detail page, a **UPI QR code** is shown. The patient can scan it to pay directly. The amount is pre-filled.

### Downloading a PDF Receipt

On the invoice detail page, click **Download PDF**. The receipt opens in your browser and can be printed or saved.

---

## Lab Cases

Lab cases track dental appliances (crowns, dentures, bridges, aligners) sent to an outside lab.

### Creating a Lab Case

From a patient's profile, click **New lab case** under the Lab Cases section. Or go to **Lab** → **New Lab Case**.

Fill in:
- Case type (Crown, Bridge, Denture, etc.)
- Tooth numbers (FDI notation, comma-separated, e.g. `36, 37`)
- Material (Zirconia, PFM, etc.), shade, lab name
- Lab fee (₹) and expected return date
- Dentist instructions to the lab

### Tracking Lab Case Progress

1. Go to **Lab** in the sidebar to see all cases.
2. **Overdue** cases (past expected date) are highlighted in red.
3. **Due this week** cases are highlighted in amber.
4. Click any case to open it and update:
   - **Status** — click the status button to advance: Planned → Impression Taken → Sent to Lab → Received → Fitted/Delivered
   - **Dates** — fill in the actual sent date, received date
   - **Lab assistant notes** — add progress notes or delivery details

---

## Odontogram (Tooth Chart)

1. Open a patient's profile.
2. Click **Odontogram** in the Quick Links section.
3. The chart shows all teeth (adult 1–32 in FDI notation, or pediatric if applicable).
4. Click any tooth to open the **status picker**.
5. Select the status: Healthy, Caries, Filled, Missing, Crown, Root Canal (RCT), or Implant.
6. Click **Save**. The tooth colour updates immediately.

> History is preserved — every change is recorded with the dentist's name and date.

---

## Clinical Notes

1. Open a patient's profile.
2. Click **Notes** in the Quick Links.
3. The **New Note** form is at the top.
4. Optionally paste an appointment ID in the **Appointment ID** field (to link the note to a visit).
5. Type the note — chief complaint, findings, treatment done, next steps.
6. Click **Save Note**.

Notes appear newest-first below the form, with the dentist's name and date.

---

## Recalls

The Recalls page shows patients who:
- Had their **last completed visit over 6 months ago**, AND
- Have **no upcoming active appointment**

1. Click **Recalls** in the sidebar.
2. Each row shows the patient name, phone, and last visit date.
3. Click the **WhatsApp** button to send a one-tap recall reminder (in English or Telugu based on the patient's preference).

---

## Analytics (Admin only)

The Analytics page shows clinic performance data with charts.

1. Click **Analytics** in the sidebar (Admin only).
2. Use the **date range filter** (top right) to switch between: This month / Last 3 months / All time.

What you can see:
- **Revenue** — today, this week, this month, outstanding, 6-month trend chart
- **Appointments** — by status (pie chart), busiest days, busiest hours, no-show rate by month
- **Treatment plans** — acceptance rate, status breakdown
- **Recalls and Lab** — count of overdue patients and lab cases
- **Patients** — total active, new in period, returning, top procedures by revenue
- **Receivables** — aged balances (0–30 / 31–60 / 61+ days), top patients by balance

---

## Settings (Admin only)

1. Click **Settings** in the sidebar (Admin only).
2. Edit:
   - **Clinic name, phone, address**
   - **Operating hours** — set open/close time for each day of the week
   - **GST rate** — default applied to all new invoices
   - **Chair count** — number of treatment chairs (affects scheduling columns)
   - **UPI VPA and payee name** — used to generate the payment QR code
   - **Brand colour** — hex colour used in PDF receipts

3. Click **Save settings**.

---

## Audit Log (Admin only)

The Audit Log records every important action in the system — who created, viewed, or changed what, and when.

1. Click **Audit Log** in the sidebar (Admin only).
2. Use the **← Older / Newer →** buttons to page through records.
3. Each row shows:
   - **Date & time** (India Standard Time)
   - **Actor** — who performed the action (name and role)
   - **Action** — CREATE, READ, UPDATE, DELETE (colour-coded)
   - **Entity** — what was changed (Patient, Invoice, Appointment, etc.)
   - **ID** — the last 8 characters of the record's unique ID

---

## Common Questions

**I can't see the Analytics / Settings / Audit Log page.**  
These pages are for Admin users only. Ask the clinic administrator to log in for those.

**The appointment form shows "Chair is already booked."**  
Another appointment exists in that chair at that time. Choose a different chair or adjust the time.

**The patient's name shows as "[Erased]".**  
This patient exercised their right to erasure under the DPDP Act. Their clinical records are retained for legal purposes but personal details have been cleared.

**I don't see a recall patient's WhatsApp button working.**  
Make sure the patient's phone number is saved correctly (10 digits, no country code needed). The system adds the +91 India code automatically.

**A lab case shows "Overdue" in red.**  
The expected return date has passed and the case is not yet Received or Fitted/Delivered. Contact the lab and update the expected date or status.
