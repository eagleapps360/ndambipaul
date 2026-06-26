import { getAppUrl } from "@/lib/env";

type TributeEditEmailInput = {
  tributeName: string;
  recipientEmail: string;
  editLink: string;
  expiresInMinutes: number;
};

export async function sendTributeEditEmail({ tributeName, recipientEmail, editLink, expiresInMinutes }: TributeEditEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.TRIBUTE_EDIT_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    if (process.env.NODE_ENV !== "production") {
      console.info("TRIBUTE_EDIT_LINK", {
        recipientEmail,
        editLink,
        tributeName,
        expiresInMinutes,
      });
      return { ok: true as const, provider: "console" };
    }
    return { ok: false as const, error: "Email provider is not configured." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: recipientEmail,
      subject: `Edit link for ${tributeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #171717; line-height: 1.6;">
          <h2 style="margin-bottom: 12px;">Edit your tribute</h2>
          <p>You requested a secure link to update the tribute for <strong>${tributeName}</strong>.</p>
          <p>This one-time link expires in ${expiresInMinutes} minutes.</p>
          <p><a href="${editLink}">Open secure tribute editor</a></p>
          <p>If you did not request this, you can ignore this message.</p>
          <p style="color: #666;">${getAppUrl()}</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return { ok: false as const, error: body || "Email request failed." };
  }

  return { ok: true as const, provider: "resend" };
}
