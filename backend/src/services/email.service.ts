import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "fcv1202@gmail.com",
    pass: "kzjy ftsn lafd enza"
  },
  debug: true
});

export async function sendEmail(to: string, subject: string, text: string): Promise<{ success: boolean; message: string }> {
  const mailOptions = {
    from: "fcv1202@gmail.com",
    to,
    subject,
    text,
  };

  try {
    console.log('Intentando conexión con credenciales hardcodeadas...');
    await transporter.verify();
    console.log('Conexión verificada, enviando email...');
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', result);
    return { success: true, message: "Correo enviado exitosamente" };
  } catch (error) {
    console.error("Error detallado:", error);
    return { 
      success: false, 
      message: `Error enviando correo: ${error.message || 'Error desconocido'}` 
    };
  }
}
