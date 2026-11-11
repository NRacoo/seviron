
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      fullName,
      company,
      email,
      phone,
      interest,
      message,
      consent,
    } = body;

    // Backend validation
    if (
      !fullName?.trim() ||
      !company?.trim() ||
      !email?.trim() ||
      !interest ||
      !message?.trim() ||
      !consent
    ) {
      return Response.json(
        {
          success: false,
          message: "Please complete all required fields.",
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return Response.json(
        {
          success: false,
          message: "Invalid email address.",
        },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"SEVIRON Contact Form" <${process.env.EMAIL}>`,
      to: process.env.EMAIL,
      replyTo: email,
      subject: `New Inquiry: ${interest} - ${company}`,
      text: `
New Contact Form Submission

Full Name: ${fullName}
Company: ${company}
Email: ${email}
Phone: ${phone || "Not provided"}
Interest: ${interest}

Message:
${message}

Privacy Consent: ${consent ? "Accepted" : "Not accepted"}
      `,
      html: `
        <h2>New Contact Form Submission</h2>

        <p><strong>Full Name:</strong> ${escapeHtml(fullName)}</p>
        <p><strong>Company:</strong> ${escapeHtml(company)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>
        <p><strong>Interest:</strong> ${escapeHtml(interest)}</p>

        <hr />

        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>

        <hr />

        <p><strong>Privacy Consent:</strong> Accepted</p>
      `,
    });

    return Response.json(
      {
        success: true,
        message: "Inquiry successfully sent.",
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Contact API Error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to send inquiry.",
      },
      { status: 500 }
    );
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[char];
  });
}
