import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const processId = formData.get('process_id') as string;
    const file = formData.get('signature') as File | null;

    if (!processId || !file) {
      return NextResponse.json({ error: 'Missing process_id or signature file' }, { status: 400 });
    }

    // 1. Upload signature image
    const sigExt = file.name.split('.').pop() || 'png';
    const sigPath = `contracts/${processId}-signature.${sigExt}`;
    const sigBuffer = Buffer.from(await file.arrayBuffer());
    const { error: sigErr } = await supabase.storage
      .from('signatures')
      .upload(sigPath, sigBuffer, { contentType: file.type || 'image/png', upsert: true });
    if (sigErr) {
      return NextResponse.json({ error: sigErr.message }, { status: 500 });
    }
    const { data: sigUrlData } = supabase.storage.from('signatures').getPublicUrl(sigPath);

    // 2. Fetch the original contract PDF
    const { data: process, error: pErr } = await supabase
      .from('selection_processes').select('contract_url')
      .eq('id', processId).single();
    if (pErr || !process?.contract_url) {
      // No contract URL — just save signature without PDF overlay
      await supabase.from('selection_processes')
        .update({ signature_url: sigUrlData.publicUrl, contract_status: 'under_review' })
        .eq('id', processId);
      return NextResponse.json({ signature_url: sigUrlData.publicUrl });
    }

    // 3. Download original PDF
    const pdfResp = await fetch(process.contract_url);
    const pdfBytes = new Uint8Array(await pdfResp.arrayBuffer());

    // 4. Overlay signature on the last page (employee signature area)
    console.log('[contracts/sign] starting PDF overlay');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    console.log('[contracts/sign] pages count:', pages.length);

    // Write signing date over the Date: _____________ field
    const signDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    lastPage.drawText(`Date: ${signDate}`, {
      x: 350, y: 260, size: 10, font, color: rgb(0, 0, 0),
    });
    console.log('[contracts/sign] date written:', signDate);

    // Draw signature over the applicant signature line, scaled to fit its width (~160pt)
    console.log('[contracts/sign] sig buffer first 8 bytes:', Array.from(sigBuffer.slice(0, 8)).map((b) => b.toString(16).padStart(2, '0')).join(' '));
    let sigImage;
    try { sigImage = await pdfDoc.embedPng(sigBuffer); }
    catch (e) { sigImage = await pdfDoc.embedJpg(sigBuffer); }
    const targetW = 160;
    const scale = Math.min(1, targetW / sigImage.width);
    const sigDims = sigImage.scale(scale);
    console.log('[contracts/sign] sig native:', sigImage.width, 'x', sigImage.height, 'scale:', scale, 'dims:', sigDims.width, sigDims.height);
    lastPage.drawImage(sigImage, {
      x: 350, y: 270,
      width: sigDims.width, height: sigDims.height,
    });

    // 5. Upload signed PDF
    const modifiedPdfBytes = await pdfDoc.save();
    const pdfPath = `contracts/${processId}-signed.pdf`;
    const { error: pdfErr } = await supabase.storage
      .from('resumes')
      .upload(pdfPath, modifiedPdfBytes, { contentType: 'application/pdf', upsert: true });
    if (pdfErr) {
      return NextResponse.json({ error: pdfErr.message }, { status: 500 });
    }
    const { data: pdfUrlData } = supabase.storage.from('resumes').getPublicUrl(pdfPath);

    // 6. Update DB with all new URLs and status
    await supabase.from('selection_processes')
      .update({
        contract_url: pdfUrlData.publicUrl,
        signature_url: sigUrlData.publicUrl,
        contract_status: 'under_review',
      })
      .eq('id', processId);

    return NextResponse.json({
      signature_url: sigUrlData.publicUrl,
      contract_url: pdfUrlData.publicUrl,
    });
  } catch (err) {
    console.error('[contracts/sign]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
