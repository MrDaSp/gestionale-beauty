import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Inizializza Supabase con la Service Role Key per avere privilegi amministrativi nel webhook
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

async function sendMessage(chatId: number, text: string) {
  await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    })
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("Webhook Telegram Ricevuto:", JSON.stringify(body, null, 2))
    console.log("Checking Envs - URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("Checking Envs - ROLE_KEY exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log("Checking Envs - BOT_TOKEN exists:", !!process.env.TELEGRAM_BOT_TOKEN)

    // 3. Gestione dei Bottoni (Callback Query)
    if (body.callback_query) {
      const cb = body.callback_query
      const chatId = cb.message.chat.id
      const data = cb.data // es. "inbox" o "ID_FASCICOLO"
      const originalMessage = cb.message.reply_to_message
      const messageId = cb.message.message_id

      const { data: user } = await supabase.from('users').select('*').eq('telegram_chat_id', chatId).single()
      if (!user) return NextResponse.json({ ok: true })

      const { data: member } = await supabase.from('workspace_members').select('workspace_id').eq('user_id', user.id).single()
      if (!member) return NextResponse.json({ ok: true })

      const workspaceId = member.workspace_id

      // Rispondiamo subito a Telegram per togliere il caricamento dal bottone
      await fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: cb.id })
      })

      let fascicoloId = null
      let fascicoloNome = 'Inbox Rapida'
      let statoDoc = 'inbox'

      if (data !== 'inbox') {
        fascicoloId = data
        statoDoc = 'archiviato'
        // Recuperiamo il nome del fascicolo per il messaggio di conferma
        const { data: f } = await supabase.from('fascicoli').select('titolo').eq('id', fascicoloId).single()
        if (f) fascicoloNome = f.titolo
      }

      // CASO 1: L'utente ha caricato un file direttamente su Telegram
      if (originalMessage?.document || originalMessage?.photo) {
        let fileId = null
        let fileName = `telegram_${Date.now()}.jpg`
        let mimeType = 'image/jpeg'

        if (originalMessage.document) {
          fileId = originalMessage.document.file_id
          fileName = originalMessage.document.file_name || `document_${Date.now()}`
          mimeType = originalMessage.document.mime_type || 'application/octet-stream'
        } else if (originalMessage.photo) {
          const photos = originalMessage.photo
          fileId = photos[photos.length - 1].file_id
        }

        if (fileId) {
          const getFileRes = await fetch(`${TELEGRAM_API_URL}/getFile?file_id=${fileId}`)
          const getFileData = await getFileRes.json()
          
          if (getFileData.ok) {
            const telegramFilePath = getFileData.result.file_path
            const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${telegramFilePath}`
            
            const fileBlobRes = await fetch(fileUrl)
            const fileBlob = await fileBlobRes.blob()

            const storagePath = `${workspaceId}/${Date.now()}_${fileName}`
            const { error: uploadError } = await supabase.storage.from('documenti').upload(storagePath, fileBlob, {
              contentType: mimeType
            })

            if (!uploadError) {
              await supabase.from('documenti').insert({
                workspace_id: workspaceId,
                fascicolo_id: fascicoloId,
                caricato_da: user.id,
                nome_file: fileName,
                tipo_documento: mimeType,
                storage_path: storagePath,
                stato: statoDoc
              })
            }
          }
        }
      } 
      // CASO 2: Smistamento email da bottoni attaccati al messaggio testuale
      else {
        // Cerchiamo tutti i documenti appena creati legati a questo messaggio Telegram
        await supabase
          .from('documenti')
          .update({ fascicolo_id: fascicoloId, stato: statoDoc })
          .eq('telegram_message_id', messageId)
      }

      // Modifica il messaggio con i bottoni per confermare il salvataggio
      await fetch(`${TELEGRAM_API_URL}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text: `✅ Documenti smistati con successo in: <b>${fascicoloNome}</b>`,
          parse_mode: 'HTML'
        })
      })

      return NextResponse.json({ ok: true })
    }

    // Se non c'è un messaggio testuale (es. stiamo gestendo messaggi generici)
    if (!body.message) {
      return NextResponse.json({ ok: true })
    }

    const chatId = body.message.chat.id
    const text = body.message.text || ''

    // 1. Gestione del Codice Segreto di Collegamento
    if (text.startsWith('DIKAST-')) {
      const code = text.trim()
      
      // Cerchiamo l'utente con questo codice
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_link_code', code)
        .single()

      if (error || !user) {
        await sendMessage(chatId, "❌ Codice non valido o scaduto. Generane uno nuovo dalle Impostazioni di Dikast.")
        return NextResponse.json({ ok: true })
      }

      // Colleghiamo l'account
      await supabase
        .from('users')
        .update({ telegram_chat_id: chatId })
        .eq('id', user.id)

      await sendMessage(chatId, `✅ <b>Benvenuto Avv. ${user.cognome}!</b>\n\nIl tuo account Telegram è stato collegato con successo a Dikast.\n\nDa questo momento, qualsiasi foto o file che mi inoltrerai verrà salvato in automatico nel tuo archivio. Prova a inoltrarmi un documento!`)
      return NextResponse.json({ ok: true })
    }

    // 2. Controllo Utente Connesso (Per qualsiasi altro messaggio)
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_chat_id', chatId)
      .single()

    if (!user) {
      await sendMessage(chatId, "👋 Ciao! Non ti conosco ancora. Vai nelle Impostazioni di Dikast, genera un 'Codice Segreto' e scrivilo qui per collegare il tuo account.")
      return NextResponse.json({ ok: true })
    }

    // 4. Ricezione Documenti / Foto
    if (body.message.document || body.message.photo) {
      const { data: member } = await supabase.from('workspace_members').select('workspace_id').eq('user_id', user.id).single()
      
      if (!member) {
        await sendMessage(chatId, "❌ Errore: non sei assegnato a nessuno Spazio di Lavoro su Dikast.")
        return NextResponse.json({ ok: true })
      }

      // Cerchiamo gli ultimi 3 fascicoli aperti
      const { data: fascicoli } = await supabase
        .from('fascicoli')
        .select('id, titolo')
        .eq('workspace_id', member.workspace_id)
        .eq('stato', 'aperto')
        .order('created_at', { ascending: false })
        .limit(3)

      const keyboard = []
      
      if (fascicoli && fascicoli.length > 0) {
        fascicoli.forEach(f => {
          keyboard.push([{ text: `📁 ${f.titolo}`, callback_data: f.id }])
        })
      }
      
      keyboard.push([{ text: `📥 Butta nell'Inbox Rapida`, callback_data: 'inbox' }])

      // Invia la tastiera inline (in risposta al file)
      await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: "Dove vuoi archiviare questo documento?",
          reply_to_message_id: body.message.message_id,
          reply_markup: {
            inline_keyboard: keyboard
          }
        })
      })

    } else {
      await sendMessage(chatId, "Sono un Bot progettato per archiviare documenti. 📁 Inoltrami una foto o un PDF da WhatsApp e io lo salverò su Dikast!")
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Errore nel Webhook Telegram:", error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
