const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const extract = (key) => {
  const match = env.match(new RegExp(`${key}=([^\r\n]+)`));
  return match ? match[1] : '';
};

const NEXT_PUBLIC_SUPABASE_URL = extract('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = extract('SUPABASE_SERVICE_ROLE_KEY');
const TELEGRAM_BOT_TOKEN = extract('TELEGRAM_BOT_TOKEN');
const RESEND_API_KEY = extract('RESEND_API_KEY');

const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const resend = new Resend(RESEND_API_KEY);

const emailData = {
  email_id: 'fc5ef962-0d36-4962-bb2e-ed93cc08f678',
  from: 'dani3d.drone@gmail.com',
  subject: 'test1'
};

async function testWebhook() {
  const cleanSenderEmail = 'dani3d.drone@gmail.com';

  const { data: user } = await supabase.from('users').select('*').eq('email', cleanSenderEmail).single();
  const { data: member } = await supabase.from('workspace_members').select('workspace_id').eq('user_id', user.id).single();
  const workspaceId = member.workspace_id;

  let savedFilesCount = 0;
  const savedFilesList = [];

  try {
    const { data: attachData, error: attachErr } = await resend.emails.receiving.attachments.list({ 
      emailId: emailData.email_id 
    });
    
    if (attachErr) {
      console.error("Errore fetch allegati da Resend SDK", attachErr);
    }

    console.log("attachData:", JSON.stringify(attachData, null, 2));
    const attachmentsList = attachData?.data || [];
    console.log("Found attachments:", attachmentsList.length);

    for (const attachment of attachmentsList) {
      const fileName = attachment.filename || `allegato_${Date.now()}`;
      console.log("Processing", fileName);
      
      if (!attachment.download_url) {
        console.error(`Manca download_url per l'allegato: ${fileName}`);
        continue;
      }

      const fileReq = await fetch(attachment.download_url);
      if (!fileReq.ok) {
        console.error(`Impossibile scaricare: ${fileName}`);
        continue;
      }

      const buffer = Buffer.from(await fileReq.arrayBuffer());
      const mimeType = attachment.content_type || 'application/octet-stream';
      
      const storagePath = `${workspaceId}/${Date.now()}_${fileName}`;
      console.log("Uploading to", storagePath);

      const { error: uploadError } = await supabase.storage.from('documenti').upload(storagePath, buffer, {
        contentType: mimeType
      });

      if (!uploadError) {
        console.log("Upload OK, inserting to DB");
        const { data: insertedDoc, error: insertErr } = await supabase.from('documenti').insert({
          workspace_id: workspaceId,
          caricato_da: user.id,
          nome_file: fileName,
          tipo_documento: mimeType,
          storage_path: storagePath,
          stato: 'da_smistare'
        }).select().single();

        if (insertErr) {
          console.error("DB Insert error:", insertErr);
        }

        if (insertedDoc) {
          savedFilesCount++;
          savedFilesList.push(fileName);
          console.log("Inserted doc", insertedDoc.id);
        }
      } else {
        console.error("Errore upload file su Supabase:", uploadError);
      }
    }
  } catch (err) {
    console.error("Errore nel download allegati tramite Resend API", err);
  }

  console.log(`Saved files: ${savedFilesCount}`);
}

testWebhook();
