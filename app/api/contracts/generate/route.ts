import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { requireSession } from '@/lib/api-auth';
import { dbError } from '@/lib/api-error';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const caller = await requireSession(req);
    if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (caller.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: admins only' }, { status: 403 });
    }

    const { process_id } = await req.json();
    if (!process_id) {
      return NextResponse.json({ error: 'Missing process_id' }, { status: 400 });
    }

    const { data: process, error: pErr } = await supabase
      .from('selection_processes').select('*, talent_profiles!inner(*), employer_profiles!inner(*)')
      .eq('id', process_id).single();

    if (pErr || !process) {
      return NextResponse.json({ error: 'Process not found' }, { status: 404 });
    }

    const applicant = process.talent_profiles;
    const employer = process.employer_profiles;

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
      y -= opts.size ?? 12 + 6;
    };

    draw('EMPLOYMENT CONTRACT', { size: 20, bold: true });
    y -= 12;
    draw('_' .repeat(80));
    y -= 12;

    draw(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { size: 10 });
    y -= 8;

    draw('PARTIES', { size: 14, bold: true });
    draw(`Employer: ${employer?.company_name || 'N/A'}`, { size: 11 });
    draw(`Contact: ${employer?.contact_name || 'N/A'}`, { size: 11 });
    y -= 4;
    draw(`Employee: ${applicant?.display_name || 'N/A'}`, { size: 11 });
    draw(`Role: ${process.role_title || 'N/A'}`, { size: 11 });
    y -= 8;

    draw('TERMS AND CONDITIONS', { size: 14, bold: true });
    const terms = [
      '1. The Employee agrees to perform the duties and responsibilities associated with the role described above.',
      '2. The Employer agrees to compensate the Employee according to the terms agreed upon separately.',
      '3. This contract shall commence on the start date agreed by both parties.',
      '4. Either party may terminate this agreement with notice as per applicable labor laws.',
      '5. The Employee agrees to maintain confidentiality of all proprietary information.',
      '6. This contract constitutes the entire agreement between the parties.',
      '7. Any modifications to this contract must be made in writing and signed by both parties.',
    ];
    for (const t of terms) {
      draw(t, { size: 10 });
    }
    y -= 12;

    draw('_' .repeat(80));
    y -= 8;
    draw('IN WITNESS WHEREOF, the parties have executed this contract as of the date above.', { size: 10 });
    y -= 20;

    draw('_________________________', { size: 11, x: 50 });
    draw(`${employer?.company_name || 'Employer'} Signature`, { size: 10, x: 50 });
    draw('Date: _____________', { size: 10, x: 50 });
    y += 20;
    draw('_________________________', { size: 11, x: 350 });
    draw(`${applicant?.display_name || 'Employee'} Signature`, { size: 10, x: 350 });
    draw('Date: _____________', { size: 10, x: 350 });

    const pdfBytes = await doc.save();
    const nameSlug = (applicant?.display_name || 'contract')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const path = `contracts/${nameSlug}-${process_id.slice(0, 8)}.pdf`;

    const { error: upErr } = await supabase.storage
      .from('resumes')
      .upload(path, pdfBytes, { contentType: 'application/pdf', upsert: true });

    if (upErr) {
      return dbError('contracts/generate', upErr);
    }

    const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(path);

    // Unchecked, the PDF would exist in Storage while the process still shows no
    // contract — and nobody would find out until someone reloaded the page.
    const { error: procErr } = await supabase.from('selection_processes')
      .update({ contract_url: urlData.publicUrl })
      .eq('id', process_id);
    if (procErr) {
      return dbError('contracts/generate:process_update', procErr);
    }

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err) {
    console.error('[contracts/generate]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
