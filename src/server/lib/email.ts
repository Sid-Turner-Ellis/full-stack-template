import { createHmac, randomBytes, timingSafeEqual } from "crypto";

import { env } from "~/env";

const FORWARD_EMAIL_ENDPOINT = "https://api.forwardemail.net/v1/emails";
const FORWARD_EMAIL_FROM = "hello@";
const FORWARD_EMAIL_USER = "hello@";
const FORWARD_EMAIL_AUTH = `${FORWARD_EMAIL_USER}:${env.FORWARD_EMAIL_PASSWORD}`;

export const sendEmail = async ({
  to,
  subject,
  ...emailProps
}: { to: string; subject: string } & ({ text: string } | { html: string })) => {
  console.log(
    `Sending email to ${to} with subject ${subject} with content \n`,
    JSON.stringify(emailProps),
  );
  //   const authHeader = Buffer.from(FORWARD_EMAIL_AUTH).toString("base64");

  //   const body = new URLSearchParams({
  //     from: FORWARD_EMAIL_FROM,
  //     to,
  //     subject,
  //     ...emailProps,
  //   });

  //   const response = await fetch(FORWARD_EMAIL_ENDPOINT, {
  //     method: "POST",
  //     headers: {
  //       Authorization: `Basic ${authHeader}`,
  //       "Content-Type": "application/x-www-form-urlencoded",
  //     },
  //     body: body.toString(),
  //   });
};
