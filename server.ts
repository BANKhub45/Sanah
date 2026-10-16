import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client instance
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// AI Chatbot endpoint for "น้องสานะ" - ร้านของฝากตลาดกิมหยง หาดใหญ่
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, contextData } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const ai = getGeminiClient();

    // Default knowledgeable fallback if API key is not yet configured or fails
    if (!ai) {
      const lastUserMsg = messages[messages.length - 1]?.content || '';
      return res.json({
        reply: `ยินดีต้อนรับสู่ร้านสานะกิมหยง หาดใหญ่ค่ะ! 🥜✨ (โหมดผู้ช่วยอัจฉริยะ) ของฝากขึ้นชื่อของเรามีทั้ง เกาลัดคั่วสด เม็ดมะม่วงหิมพานต์เผาโบราณ ถั่วพิตาชิโอเกรดพรีเมียม ชาชักสูตรใต้แท้ๆ และผลไม้อบแห้งนำเข้า หากต้องการให้ช่วยแนะนำชุดของฝาก หรือสอบถามข้อมูลสินค้าตัวไหน ถามน้องสานะได้เลยนะคะ!`,
      });
    }

    const systemInstruction = `คุณคือ "น้องสานะ" ผู้ช่วยอัจฉริยะประจำร้านของฝาก "สานะกิมหยง" ตลาดกิมหยง อำเภอหาดใหญ่ จังหวัดสงขลา
บุคลิก: สุภาพ อบอุ่น อารมณ์ดี สำเนียงเป็นกันเอง แนะนำของฝากได้อย่างเชี่ยวชาญ รู้จักสินค้าของฝากชื่อดังของตลาดกิมหยงเป็นอย่างดี
สินค้าหลักของร้าน:
1. ถั่วและธัญพืช: เม็ดมะม่วงหิมพานต์เผาโบราณ, ถั่วพิตาชิโอคั่วเกลือ, เกาลัดหวานหอมแกะเปลือก, อัลมอนด์อบธรรมชาติ, ถั่วแมคคาเดเมีย
2. ขนมนำเข้า & มาเลเซีย: ช็อกโกแลตนำเข้า (Beryl's, Daim, Ovomaltine), ป๊อกกี้ญี่ปุ่น, คุกกี้เนยแท้
3. ชา กาแฟ และเครื่องดื่ม: ชาชักปักษ์ใต้ 666 ตราเรือใบ, กาแฟโบราณหาดใหญ่, ชาเขียวมัทฉะมาเลย์, ผงไมโลมาเลย์แท้ (รสชาติเข้มข้นในตำนาน)
4. ผลไม้อบแห้ง: บ๊วยซากุระ, พุทราจีนสอดไส้วอลนัท, กีวี่อบแห้ง, สตรอว์เบอร์รีอบแห้ง, ลูกพรุน
5. ของแห้งและของทานเล่น: ปลากรอบสมุนไพร, หมึกบดปรุงรส, ข้าวเกรียบปลาปัตตานี (กรือโปะ)

หน้าที่ของคุณ:
1. แนะนำของฝากตามงบประมาณ กลุ่มผู้รับ (เช่น ฝากผู้ใหญ่, ฝากเพื่อนร่วมงาน, ฝากเด็กๆ, ซื้อทานเอง)
2. ให้คำแนะนำเรื่องอายุสินค้า วิธีเก็บรักษา (เช่น ควรใส่ตู้เย็นเพื่อคงความกรอบ)
3. ตอบคำถามเกี่ยวกับขั้นตอนการสั่งซื้อ การจ่ายเงินผ่าน PromptPay QR, การจัดส่ง และการตรวจสอบพัสดุ
4. ให้คำตอบกระชับ ตรงประเด็น สุภาพ และมีอิโมจิน่ารักที่เหมาะสม

ข้อมูลสถานะสินค้าปัจจุบันในร้าน:
${contextData ? JSON.stringify(contextData) : 'มีสินค้าสต็อกครบถ้วนทุกหมวดหมู่'}`;

    // Format contents for Gemini generateContent
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'ขออภัยนะคะ น้องสานะไม่สามารถประมวลผลคำตอบได้ชั่วคราว ลองถามใหม่อีกครั้งนะคะ';
    return res.json({ reply });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
      reply: 'ยินดีต้อนรับสู่ร้านสานะกิมหยงค่ะ ขณะนี้น้องสานะกำลังเตรียมข้อมูลของฝากให้ หากต้องการสั่งซื้อสินค้าสามารถเลือกใส่ตะกร้าหรือสั่งผ่านหน้าร้านได้ทันทีค่ะ!',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
