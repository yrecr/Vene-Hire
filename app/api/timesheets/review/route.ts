import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { requireSession, resolveActorIds } from '@/lib/api-auth';
import { dbError } from '@/lib/api-error';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

async function generateInvoicePdf(opts: {
  companyName: string;
  workerName: string;
  totalHours: number;
  hourlyRate: number;
  timesheetId: string;
}): Promise<Uint8Array> {
  const { companyName, workerName, totalHours, hourlyRate, timesheetId } = opts;
  const amount = totalHours * hourlyRate;

  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = 720;
  const draw = (text: string, opts: { size?: number; bold?: boolean; x?: number } = {}) => {
    page.drawText(text, {
      x: opts.x ?? 50, y, size: opts.size ?? 12,
      font: opts.bold ? bold : font, color: rgb(0, 0, 0),
    });
    y -= (opts.size ?? 12) + 8;
  };

  draw('VeneHire', { size: 20, bold: true });
  draw('Billing Statement', { size: 14 });
  y -= 8;
  draw('_'.repeat(80));
  y -= 12;

  draw(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { size: 10 });
  y -= 8;

  draw('BILL TO', { size: 12, bold: true });
  draw(companyName, { size: 11 });
  y -= 8;

  draw('WORKER', { size: 12, bold: true });
  draw(workerName, { size: 11 });
  y -= 8;

  draw('SUMMARY', { size: 12, bold: true });
  draw(`Hours worked: ${totalHours.toFixed(2)}`, { size: 11 });
  draw(`Hourly rate: $${hourlyRate.toFixed(2)}`, { size: 11 });
  draw(`Total amount due: $${amount.toFixed(2)}`, { size: 13, bold: true });
  y -= 16;

  draw('_'.repeat(80));
  draw(`Statement ID: ${timesheetId.slice(0, 8)}`, { size: 9 });

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

  const { employerProfileId } = await resolveActorIds(supabase, caller);

  const { data: timesheet } = await supabase
    .from('timesheets')
    .select('*, selection_processes!inner(*, employer_profiles!inner(*), talent_profiles!inner(*))')
    .eq('id', timesheet_id)
    .single();

  if (!timesheet || timesheet.selection_processes.employer_id !== employerProfileId) {
    return NextResponse.json({ error: 'Forbidden: not your process' }, { status: 403 });
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
      totalHours: timesheet.total_hours,
      hourlyRate: process.hourly_rate,
      timesheetId: timesheet.id,
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
