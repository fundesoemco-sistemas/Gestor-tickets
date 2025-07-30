import SibApiV3Sdk from 'sib-api-v3-sdk';
import 'dotenv/config';

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

export async function enviarCorreo({ to, subject, html }) {
  try {
    const sendSmtpEmail = {
      to: [{ email: to }],
      sender: { name: 'FUNDESOEMCO', email: 'sistemas@fundesoemco.com' }, // Reemplaza si es necesario
      subject,
      htmlContent: html,
    };

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Correo enviado:', data.messageId);
  } catch (error) {
    console.error('❌ Error al enviar el correo:', error);
  }
}
