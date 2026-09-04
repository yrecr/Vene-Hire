import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PDFDocument, PDFFont, rgb, StandardFonts } from 'pdf-lib';
import { readFileSync } from 'fs';
import { join } from 'path';
import { requireSession } from '@/lib/api-auth';
import { dbError } from '@/lib/api-error';
import { groupDaysByWeek } from '@/lib/timesheet-utils';
import type { TimesheetDay } from '@/types';

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  deal: 'DEAL',
  bank_transfer: 'Bank transfer',
  other: 'Other',
};

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

async function generateInvoicePdf(opts: {
  companyName: string;
  workerName: string;
  roleTitle: string;
  month: string;
  days: TimesheetDay[];
  totalHours: number;
  hourlyRate: number;
  timesheetId: string;
  paymentMethod: string | null;
  paymentDetails: string | null;
}): Promise<Uint8Array> {
  const { companyName, workerName, roleTitle, month, days, totalHours, hourlyRate, timesheetId, paymentMethod, paymentDetails } = opts;
  const amount = totalHours * hourlyRate;

  const doc = await PDFDocument.create();
  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const logoBytes = readFileSync(join(process.cwd(), 'public', 'logo.png'));
  const logoImage = await doc.embedPng(logoBytes);

  const reportNo = `VH-${new Date().getFullYear()}-${timesheetId.slice(0, 4)}`;
  const issueDate = new Date();
  const [monthYear, monthNum] = month.split('-').map(Number);
  const periodStart = new Date(monthYear, monthNum - 1, 1);
  const periodEnd = new Date(monthYear, monthNum, 0);
  const fmt = (d: Date) => d.toLocaleDateString('en-GB');

  let y = PAGE_HEIGHT - MARGIN;

  const newPage = () => {
    page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
  };

  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN) newPage();
  };

  const draw = (text: string, opts: { size?: number; bold?: boolean; x?: number; color?: ReturnType<typeof rgb> } = {}) => {
    const size = opts.size ?? 10;
    ensureSpace(size + 6);
    page.drawText(text, {
      x: opts.x ?? MARGIN, y, size,
      font: opts.bold ? bold : font, color: opts.color ?? rgb(0.1, 0.1, 0.1),
    });
    y -= size + 6;
  };

  const rule = () => {
    ensureSpace(10);
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
    y -= 14;
  };

  const sectionHeader = (title: string) => {
    ensureSpace(28);
    y -= 6;
    draw(title, { size: 11, bold: true, color: rgb(0.02, 0.28, 0.55) });
    rule();
  };

  const field = (label: string, value: string, x: number, width: number) => {
    page.drawText(label, { x, y, size: 8, font, color: rgb(0.5, 0.5, 0.5) });
    page.drawText(value, { x, y: y - 12, size: 10, font: bold, color: rgb(0.1, 0.1, 0.1) });
  };

  const fieldRow = (pairs: [string, string][]) => {
    ensureSpace(30);
    const colWidth = CONTENT_WIDTH / pairs.length;
    pairs.forEach(([label, value], i) => field(label, value, MARGIN + i * colWidth, colWidth));
    y -= 30;
  };

  // ── Header ──
  page.drawImage(logoImage, { x: MARGIN, y: y - 34, width: 34, height: 34 });
  page.drawText('VeneHire', { x: MARGIN + 42, y: y - 12, size: 18, font: bold, color: rgb(0.1, 0.1, 0.1) });
  page.drawText('A Venesoft company', { x: MARGIN + 42, y: y - 26, size: 8, font, color: rgb(0.5, 0.5, 0.5) });
  y -= 46;
  draw('SERVICE REPORT & BILLING SUMMARY', { size: 13, bold: true });
  rule();

  fieldRow([
    ['REPORT NO.', reportNo],
    ['ISSUE DATE', fmt(issueDate)],
  ]);
  fieldRow([
    ['SERVICE PERIOD', `${fmt(periodStart)} - ${fmt(periodEnd)}`],
    ['PAYMENT DUE', fmt(issueDate)],
  ]);

  // ── Client & service details ──
  sectionHeader('CLIENT & SERVICE DETAILS');
  draw(`Client: ${companyName}`);
  draw(`Assigned Professional: ${workerName}`);
  draw(`Role: ${roleTitle}`);
  draw(`Project / Service: ${roleTitle}`);
  wrapText(`Service Description: Software development and engineering services for ${roleTitle}.`, font, 10, CONTENT_WIDTH)
    .forEach((line) => draw(line));

  // ── Work summary ──
  sectionHeader('WORK SUMMARY');
  const cols = [MARGIN, MARGIN + 90, MARGIN + 310, MARGIN + 380];
  ensureSpace(20);
  page.drawText('Week', { x: cols[0], y, size: 9, font: bold });
  page.drawText('Description', { x: cols[1], y, size: 9, font: bold });
  page.drawText('Hours', { x: cols[2], y, size: 9, font: bold });
  page.drawText('Notes', { x: cols[3], y, size: 9, font: bold });
  y -= 16;
  groupDaysByWeek(days).forEach(({ week, days: weekDays }) => {
    ensureSpace(16);
    const weekTotal = weekDays.reduce((sum, d) => sum + (Number(d.hours) || 0), 0);
    page.drawText(`Week ${week}`, { x: cols[0], y, size: 9, font });
    page.drawText('Development work', { x: cols[1], y, size: 9, font });
    page.drawText(`${weekTotal}h`, { x: cols[2], y, size: 9, font });
    page.drawText('-', { x: cols[3], y, size: 9, font });
    y -= 16;
  });
  y -= 6;

  // ── Billing summary ──
  sectionHeader('BILLING SUMMARY');
  draw(`Total Hours: ${totalHours.toFixed(2)} h`);
  draw(`Agreed Commercial Rate: $${hourlyRate.toFixed(2)} / hour`);
  draw('Additional / Approved Charges: $0.00');
  ensureSpace(20);
  draw(`TOTAL AMOUNT DUE: $${amount.toFixed(2)}`, { size: 13, bold: true, color: rgb(0.02, 0.28, 0.55) });

  // ── Payment information ──
  sectionHeader('PAYMENT INFORMATION');
  draw('Beneficiary: Venesoft C.A.');
  draw(`Bank / Platform: ${paymentMethod ? PAYMENT_METHOD_LABELS[paymentMethod] ?? paymentMethod : 'Not provided'}`);
  draw(`Account: ${paymentDetails || 'Not provided'}`);
  draw('Currency: USD');
  draw(`Payment Reference: ${reportNo}`);
  draw('Payment Terms: Due upon receipt');

  // ── Notes ──
  sectionHeader('NOTES');
  wrapText(
    'This document summarizes the services provided during the indicated period and the corresponding commercial amount payable to Venesoft/VeneHire. Internal compensation arrangements with assigned professionals are confidential and are not part of this client billing summary. Applicable taxes, withholdings and legal obligations will be handled according to the corresponding contractual and legal requirements.',
    font, 9, CONTENT_WIDTH
  ).forEach((line) => draw(line, { size: 9, color: rgb(0.4, 0.4, 0.4) }));

  // ── Signatures ──
  ensureSpace(60);
  y -= 20;
  const sigY = y;
  page.drawLine({ start: { x: MARGIN, y: sigY }, end: { x: MARGIN + 200, y: sigY }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
  page.drawLine({ start: { x: MARGIN + 280, y: sigY }, end: { x: MARGIN + 480, y: sigY }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
  page.drawText('Prepared by', { x: MARGIN, y: sigY - 12, size: 8, font, color: rgb(0.5, 0.5, 0.5) });
  page.drawText('Venesoft C.A.', { x: MARGIN, y: sigY - 24, size: 10, font: bold });
  page.drawText('Client acknowledgement (optional)', { x: MARGIN + 280, y: sigY - 12, size: 8, font, color: rgb(0.5, 0.5, 0.5) });
  page.drawText(companyName, { x: MARGIN + 280, y: sigY - 24, size: 10, font: bold });

  return doc.save();
}

export async function POST(req: NextRequest) {
  const caller = await requireSession(req);
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { timesheet_id, decision, comment } = await req.json() as {
    timesheet_id: string; decision: 'approved' | 'rejected'; comment?: string;
  };
  if (!timesheet_id || !['approved', 'rejected'].includes(decision)) {
    return NextResponse.json({ error: 'timesheet_id and a valid decision are required' }, { status: 400 });
  }
  if (decision === 'rejected' && !comment?.trim()) {
    return NextResponse.json({ error: 'A comment is required when rejecting' }, { status: 400 });
  }

  if (caller.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: admins only' }, { status: 403 });
  }

  const { data: timesheet } = await supabase
    .from('timesheets')
    .select('*, selection_processes!inner(*, employer_profiles!inner(*), talent_profiles!inner(*))')
    .eq('id', timesheet_id)
    .single();

  if (!timesheet) {
    return NextResponse.json({ error: 'Timesheet not found' }, { status: 404 });
  }
  // Two admin tabs reviewing the same timesheet would otherwise both generate an
  // invoice and both write an audit event.
  if (timesheet.status !== 'submitted') {
    return NextResponse.json(
      { error: `This timesheet was already ${timesheet.status}` },
      { status: 409 }
    );
  }

  const process = timesheet.selection_processes;
  let invoice_url: string | null = timesheet.invoice_url;

  if (decision === 'approved') {
    if (process.hourly_rate == null) {
      return NextResponse.json({ error: 'Set an hourly rate for this process before approving hours' }, { status: 400 });
    }
    const pdfBytes = await generateInvoicePdf({
      companyName: process.employer_profiles.company_name || 'N/A',
      workerName: process.talent_profiles.display_name || 'N/A',
      roleTitle: process.role_title || 'N/A',
      month: timesheet.month,
      days: timesheet.days,
      totalHours: timesheet.total_hours,
      hourlyRate: process.hourly_rate,
      timesheetId: timesheet.id,
      paymentMethod: process.employer_profiles.payment_method,
      paymentDetails: process.employer_profiles.payment_details,
    });
    const nameSlug = (process.talent_profiles.display_name || 'invoice')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const path = `invoices/${nameSlug}-${timesheet.month}-${timesheet.id.slice(0, 8)}.pdf`;

    const { error: upErr } = await supabase.storage
      .from('resumes')
      .upload(path, pdfBytes, { contentType: 'application/pdf', upsert: true });
    if (upErr) return dbError('timesheets/review:invoice-upload', upErr);

    const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(path);
    invoice_url = urlData.publicUrl;
  }

  const { data: updated, error } = await supabase
    .from('timesheets')
    .update({ status: decision, invoice_url, updated_at: new Date().toISOString() })
    .eq('id', timesheet_id)
    .select()
    .single();
  if (error || !updated) {
    return dbError('timesheets/review', error ?? { message: 'Update returned no row' });
  }

  const { error: eventError } = await supabase.from('timesheet_events').insert({
    timesheet_id,
    event_type: decision,
    actor_profile_id: caller.id,
    comment: comment?.trim() || null,
  });
  if (eventError) {
    return dbError('timesheets/review:event', eventError);
  }

  return NextResponse.json({ timesheet: updated });
}
