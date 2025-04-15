import nodemailer from "nodemailer";
import dotenv from "dotenv";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true", // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
  debug: process.env.EMAIL_DEBUG === "true"
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
