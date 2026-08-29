import nodemailer from 'nodemailer';

export async function sendAlertEmail(to: string, subject: string, htmlBody: string): Promise<{success: boolean, messageId: string, previewUrl?: string}> {
  try {
    let transporter;

    if (process.env.GMAIL_APP_PASSWORD) {
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const info = await transporter.sendMail({
      from: '"Nerve Center Alerts" <noreply@nervecenter.local>',
      to,
      subject,
      html: htmlBody,
    });

    const result: {success: boolean, messageId: string, previewUrl?: string} = {
      success: true,
      messageId: info.messageId,
    };

    if (!process.env.GMAIL_APP_PASSWORD) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        result.previewUrl = previewUrl;
      }
    }

    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, messageId: '' };
  }
}
