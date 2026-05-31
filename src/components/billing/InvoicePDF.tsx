'use client'
// ── F174 · src/components/billing/InvoicePDF.tsx
// Purpose: @react-pdf/renderer A4 invoice template — clinic header, line items, GST totals, UPI QR image
// In: InvoicePDFProps, CLINIC_NAME/ADDRESS/PHONE (F030) | Out: InvoicePDF, InvoicePDFProps | See: F175, F172, F030

import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { CLINIC_NAME, CLINIC_ADDRESS, CLINIC_PHONE } from '@/constants/clinic'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, padding: 36, color: '#111827', backgroundColor: '#FFFFFF' },
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  clinicName: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#111827' },
  clinicSub: { fontSize: 8, color: '#6B7280', marginTop: 2 },
  invLabel: { fontSize: 8, color: '#6B7280', textAlign: 'right' },
  invNumber: { fontSize: 12, fontFamily: 'Helvetica-Bold', textAlign: 'right', color: '#111827' },
  // Divider
  divider: { borderBottom: '1pt solid #E5E7EB', marginVertical: 10 },
  // Bill-to
  section: { marginBottom: 12 },
  sectionLabel: { fontSize: 7, color: '#6B7280', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  sectionValue: { fontSize: 9, color: '#111827' },
  // Table
  tableHeader: { flexDirection: 'row', backgroundColor: '#F8F9FB', padding: '5 6', borderRadius: 3 },
  tableRow: { flexDirection: 'row', padding: '4 6', borderBottom: '0.5pt solid #E5E7EB' },
  colDesc: { flex: 3 },
  colNum: { flex: 1, textAlign: 'right' },
  cellLabel: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#374151' },
  cellValue: { fontSize: 8.5, color: '#111827' },
  cellMuted: { fontSize: 8.5, color: '#6B7280' },
  // Totals
  totalsRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingVertical: 2 },
  totalLabel: { width: 90, fontSize: 8.5, color: '#6B7280', textAlign: 'right', paddingRight: 12 },
  totalValue: { width: 72, fontSize: 8.5, color: '#111827', textAlign: 'right' },
  grandLabel: { width: 90, fontSize: 10, fontFamily: 'Helvetica-Bold', textAlign: 'right', paddingRight: 12 },
  grandValue: { width: 72, fontSize: 10, fontFamily: 'Helvetica-Bold', textAlign: 'right' },
  // Payment
  paymentSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 16 },
  qrImage: { width: 80, height: 80 },
  paymentModes: { fontSize: 7.5, color: '#6B7280', marginTop: 4 },
  footer: { position: 'absolute', bottom: 24, left: 36, right: 36, textAlign: 'center', fontSize: 7.5, color: '#9CA3AF' },
})

export interface InvoicePDFProps {
  invoiceNumber: string
  invoiceDate: string
  patientName: string
  patientPhone: string
  lines: Array<{ description: string; amount: number; taxRate: number }>
  payments: Array<{ amount: number; mode: string; paidAt: string }>
  upiQrDataUrl: string | null
  status: string
}

function formatINR(n: number) {
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function InvoicePDF({
  invoiceNumber,
  invoiceDate,
  patientName,
  patientPhone,
  lines,
  payments,
  upiQrDataUrl,
  status,
}: InvoicePDFProps) {
  const subtotal = lines.reduce((s, l) => s + l.amount, 0)
  const gst = lines.reduce((s, l) => s + l.amount * (l.taxRate / 100), 0)
  const total = subtotal + gst
  const paid = payments.reduce((s, p) => s + p.amount, 0)
  const due = total - paid

  return (
    <Document title={`${invoiceNumber} — ${patientName}`} author={CLINIC_NAME}>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.clinicName}>{CLINIC_NAME}</Text>
            <Text style={s.clinicSub}>{CLINIC_ADDRESS}</Text>
            <Text style={s.clinicSub}>Ph: {CLINIC_PHONE}</Text>
          </View>
          <View>
            <Text style={s.invLabel}>INVOICE</Text>
            <Text style={s.invNumber}>{invoiceNumber}</Text>
            <Text style={s.invLabel}>Date: {invoiceDate}</Text>
            <Text style={s.invLabel}>Status: {status}</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* Bill to */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Bill To</Text>
          <Text style={s.sectionValue}>{patientName}</Text>
          <Text style={[s.cellMuted, { marginTop: 2 }]}>{patientPhone}</Text>
        </View>

        {/* Line items */}
        <View style={s.tableHeader}>
          <Text style={[s.cellLabel, s.colDesc]}>Description</Text>
          <Text style={[s.cellLabel, s.colNum]}>Amount</Text>
          <Text style={[s.cellLabel, s.colNum]}>GST%</Text>
          <Text style={[s.cellLabel, s.colNum]}>Tax</Text>
          <Text style={[s.cellLabel, s.colNum]}>Total</Text>
        </View>

        {lines.map((line, i) => {
          const tax = line.amount * (line.taxRate / 100)
          return (
            <View key={i} style={s.tableRow}>
              <Text style={[s.cellValue, s.colDesc]}>{line.description}</Text>
              <Text style={[s.cellValue, s.colNum]}>{formatINR(line.amount)}</Text>
              <Text style={[s.cellMuted, s.colNum]}>{line.taxRate}%</Text>
              <Text style={[s.cellMuted, s.colNum]}>{formatINR(tax)}</Text>
              <Text style={[s.cellValue, s.colNum]}>{formatINR(line.amount + tax)}</Text>
            </View>
          )
        })}

        {/* Totals */}
        <View style={{ marginTop: 8 }}>
          <View style={s.totalsRow}>
            <Text style={s.totalLabel}>Subtotal</Text>
            <Text style={s.totalValue}>{formatINR(subtotal)}</Text>
          </View>
          <View style={s.totalsRow}>
            <Text style={s.totalLabel}>GST</Text>
            <Text style={s.totalValue}>{formatINR(gst)}</Text>
          </View>
          {paid > 0 && (
            <View style={s.totalsRow}>
              <Text style={s.totalLabel}>Paid</Text>
              <Text style={s.totalValue}>− {formatINR(paid)}</Text>
            </View>
          )}
          <View style={[s.divider, { marginHorizontal: 0 }]} />
          <View style={s.totalsRow}>
            <Text style={s.grandLabel}>Amount Due</Text>
            <Text style={s.grandValue}>{formatINR(due)}</Text>
          </View>
        </View>

        {/* Payment */}
        <View style={s.paymentSection}>
          <View>
            <Text style={s.sectionLabel}>Payment</Text>
            {payments.length > 0 ? (
              payments.map((p, i) => (
                <Text key={i} style={s.cellMuted}>
                  {p.paidAt} · {formatINR(p.amount)} via {p.mode}
                </Text>
              ))
            ) : (
              <Text style={s.cellMuted}>No payments recorded</Text>
            )}
            <Text style={[s.paymentModes, { marginTop: 8 }]}>
              Accepted: Cash · UPI · Card · Insurance
            </Text>
          </View>
          {upiQrDataUrl && (
            <View style={{ alignItems: 'center' }}>
              <Image src={upiQrDataUrl} style={s.qrImage} />
              <Text style={s.paymentModes}>Scan to pay via UPI</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <Text style={s.footer}>
          Thank you for choosing {CLINIC_NAME}. For queries call {CLINIC_PHONE}.
        </Text>
      </Page>
    </Document>
  )
}
