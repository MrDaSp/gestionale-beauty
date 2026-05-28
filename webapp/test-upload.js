require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const download_url = 'https://cdn.resend.app/receiving/fc5ef962-0d36-4962-bb2e-ed93cc08f678/attachments/c64e3b21-2e7f-48da-b16a-d9548b2f6123?response-content-disposition=attachment%3B+filename%3D%22Screenshot+2025-12-30+131210.png%22&Expires=1779868611&Key-Pair-Id=K1EE1EYO2ZO8UR&Signature=gCF2eFbPFbeNsvns02G5VWPxr9lrWO~6ZW0QyD0tIfaZhQgypXu7vH4jKmVWsNvf-~VYQe4fpYir5UcznlIDv~JfYYdsiklMOAxJdgpAvLKso~GHOE3UBz~vOb~bqXPRp5BrJHqytk9DaHt~1j9xDN0zjqLP9DD1Y0U62ZpwEypkvoLdtGTt8Yi~g4mTVMUFatulXqIJjZh4FY1nVZDQ0WhFSBzNaMup-EX22OhU0Q1ZjFip9EUCoSYfDIUn2~HYHd3HAzZt1nT3rbgEKpnT8bW5NBwi5Yp7a~9tS4XESH6cWG1SylYX5PrnR7ZIhsHQWHF~UseQDAi0EGMSP3rplg__';
  const fileName = 'test_image.png';
  const workspaceId = 'f6c925e4-2e9d-47c5-ace8-771782427e0f';

  const fileReq = await fetch(download_url);
  if (!fileReq.ok) {
    console.error("Fetch fallita", fileReq.status);
    return;
  }
  const buffer = Buffer.from(await fileReq.arrayBuffer());
  const mimeType = 'image/png';
  const storagePath = `${workspaceId}/${Date.now()}_${fileName}`;
  
  console.log("Uploading to", storagePath);
  const { error: uploadError } = await supabase.storage.from('documenti').upload(storagePath, buffer, {
    contentType: mimeType
  });

  if (uploadError) {
    console.error("Upload error:", uploadError);
  } else {
    console.log("Upload OK");
    const { data: insertedDoc, error: insertErr } = await supabase.from('documenti').insert({
      workspace_id: workspaceId,
      caricato_da: 'f3668a59-f65c-4bca-8ad0-2a2827647e64',
      nome_file: fileName,
      tipo_documento: mimeType,
      storage_path: storagePath,
      stato: 'da_smistare'
    }).select().single();
    if (insertErr) console.error("Insert error:", insertErr);
    else console.log("Insert OK", insertedDoc);
  }
}

test();
