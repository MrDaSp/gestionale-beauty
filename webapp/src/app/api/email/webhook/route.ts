import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// Inizializza Supabase con la Service Role Key per avere privilegi amministrativi
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`
const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET

// Funzione helper per inviare messaggi su Telegram
async function sendMessage(chatId: number, text: string, replyMarkup?: any) {
  if (!TELEGRAM_BOT_TOKEN) return null;
  const payload: any = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML'
  };
  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }
  const res = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  const data = await res.json()
  return data?.result?.message_id || null
}

export async function POST(req: Request) {
  try {
    const payload = await req.text()
    const headersList = req.headers
    
    // Verifica Firma di Sicurezza del Webhook (Svix)
    const svix_id = headersList.get("svix-id")
    const svix_timestamp = headersList.get("svix-timestamp")
    const svix_signature = headersList.get("svix-signature")

    if (!svix_id || !svix_timestamp || !svix_signature || !RESEND_WEBHOOK_SECRET) {
      console.error("Mancano le firme di sicurezza o il segreto Webhook")
      return new NextResponse("Missing Webhook Secret or Headers", { status: 400 })
    }

    const wh = new Webhook(RESEND_WEBHOOK_SECRET)
    let event: any
    
    try {
      event = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      })
    } catch (err) {
      console.error("Firma Webhook non valida", err)
      return new NextResponse("Invalid Signature", { status: 400 })
    }

    // Assicuriamoci che sia un evento di tipo email ricevuta
    if (event.type !== 'email.received') {
      return NextResponse.json({ ok: true })
    }

    const emailData = event.data
    
    // Estrai email del mittente
    const senderEmailRaw = emailData.from.toLowerCase().trim()
    const emailMatch = senderEmailRaw.match(/<([^>]+)>/)
    const cleanSenderEmail = emailMatch ? emailMatch[1] : senderEmailRaw

    console.log(`Ricevuta email da: ${cleanSenderEmail} con oggetto: ${emailData.subject}`)

    // 1. Troviamo a quale utente Dikast appartiene questa email
    const { data: user } = await supabase.from('users').select('*').eq('email', cleanSenderEmail).single()
    
    if (!user) {
      console.error(`Utente non trovato nel DB per l'email mittente: ${cleanSenderEmail}`)
      return NextResponse.json({ ok: true })
    }

    // 2. Troviamo lo Spazio di Lavoro dell'utente
    const { data: member } = await supabase.from('workspace_members').select('workspace_id').eq('user_id', user.id).single()
    if (!member) {
      console.error(`L'utente ${user.email} non appartiene a nessuno workspace`)
      return NextResponse.json({ ok: true })
    }

    const workspaceId = member.workspace_id
    const rawAttachments = emailData.attachments || []

    // Se non ci sono allegati, avvisiamo l'utente e chiudiamo
    if (rawAttachments.length === 0) {
      if (user.telegram_chat_id) {
        await sendMessage(user.telegram_chat_id, `✉️ <b>Nuova Email Senza Allegati</b>\n\nHai inoltrato un'email con oggetto: <i>${emailData.subject}</i>, ma non c'erano file allegati da salvare su Dikast.`)
      }
      return NextResponse.json({ ok: true })
    }

    // 3. Recupero file veri da Resend API (Il Webhook fornisce solo i metadati e l'ID)
    let savedFilesCount = 0
    const savedFilesList: { id: string, name: string }[] = []

    try {
      // Usiamo l'SDK di Resend per ottenere i download_url degli allegati ricevuti
      const { data: attachData, error: attachErr } = await resend.emails.receiving.attachments.list({ 
        emailId: emailData.email_id 
      });
      
      if (attachErr) {
        console.error("Errore fetch allegati da Resend SDK", attachErr);
      }

      const attachmentsList = attachData?.data || []

      for (const attachment of attachmentsList) {
        const fileName = attachment.filename || `allegato_${Date.now()}`
        
        if (!attachment.download_url) {
          console.error(`Manca download_url per l'allegato: ${fileName}`)
          continue
        }

        // 4. Scarichiamo il file vero dal download_url
        const fileReq = await fetch(attachment.download_url)
        if (!fileReq.ok) {
          console.error(`Impossibile scaricare: ${fileName}`)
          continue
        }

        const buffer = Buffer.from(await fileReq.arrayBuffer())
        const mimeType = attachment.content_type || 'application/octet-stream'
        
        // 5. Carichiamo su Supabase Storage
        const storagePath = `${workspaceId}/${Date.now()}_${fileName}`
        const { error: uploadError } = await supabase.storage.from('documenti').upload(storagePath, buffer, {
          contentType: mimeType
        })

        if (!uploadError) {
          const { data: insertedDoc } = await supabase.from('documenti').insert({
            workspace_id: workspaceId,
            caricato_da: user.id,
            nome_file: fileName,
            tipo_documento: mimeType,
            storage_path: storagePath,
            stato: 'inbox'
          }).select().single()

          if (insertedDoc) {
            savedFilesCount++
            savedFilesList.push({ id: insertedDoc.id, name: fileName })
          }
        } else {
          console.error("Errore upload file su Supabase:", uploadError)
        }
      }
    } catch (err) {
      console.error("Errore nel download allegati tramite Resend API", err)
    }

    // 6. Notifica Telegram
    if (user.telegram_chat_id && savedFilesCount > 0) {
      // Cerchiamo gli ultimi 3 fascicoli aperti per la tastiera
      const { data: fascicoli } = await supabase
        .from('fascicoli')
        .select('id, titolo')
        .eq('workspace_id', workspaceId)
        .eq('stato', 'aperto')
        .order('created_at', { ascending: false })
        .limit(3)

      const keyboard = []
      
      if (fascicoli && fascicoli.length > 0) {
        fascicoli.forEach(f => {
          keyboard.push([{ text: `📁 ${f.titolo}`, callback_data: f.id }])
        })
      }
      keyboard.push([{ text: `📥 Lascia in Inbox`, callback_data: 'inbox' }])

      const fileNamesStr = savedFilesList.map(f => `- ${f.name}`).join('\n')
      const telegramMessage = `✅ <b>Email Salvata con Successo!</b>\n\nOggetto: <i>${emailData.subject}</i>\nHo estratto e salvato <b>${savedFilesCount} allegato/i</b>:\n\n${fileNamesStr}\n\nScegli dove vuoi smistarli:`
      
      const messageId = await sendMessage(user.telegram_chat_id, telegramMessage, { inline_keyboard: keyboard })

      if (messageId) {
        // Aggiorniamo i documenti appena inseriti per collegarli a questo messaggio Telegram
        const documentIds = savedFilesList.map(f => f.id)
        await supabase
          .from('documenti')
          .update({ telegram_message_id: messageId })
          .in('id', documentIds)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Errore catastrofico nel Webhook Email:", error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
