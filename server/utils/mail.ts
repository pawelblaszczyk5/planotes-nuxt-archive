import type SMTPTransport from 'nodemailer/lib/smtp-transport';

import { type Transporter, createTransport } from 'nodemailer';

import { env } from '~~/server/utils/env';

const transporterConfig: SMTPTransport.Options = {
	host: env.SMTP_HOST,
	port: 587,
	auth: {
		user: env.SMTP_USER,
		pass: env.SMTP_PASSWORD,
	},
	dkim: {
		privateKey: env.DKIM_PRIVATE_KEY,
		keySelector: env.DKIM_SELECTOR,
		domainName: 'planotes.xyz',
	},
};

export const transporter: Transporter = createTransport(transporterConfig);

type SendEmailOptions = {
	html: string;
	receiver: string;
	plainTextVersion?: string;
	senderName: string;
	subject: string;
};

type SendEmailResult = {
	accepted: Array<string>;
};

const sendEmail = async ({
	html,
	receiver,
	plainTextVersion,
	senderName,
	subject,
}: SendEmailOptions) => {
	try {
		const { accepted }: SendEmailResult = await transporter.sendMail({
			from: `"${senderName}" <${env.SMTP_USER}>`,
			to: receiver,
			subject,
			text: plainTextVersion,
			html,
		});

		if (!accepted.includes(receiver)) throw new Error('Unable to send email');
	} catch {
		throw new Error('Unable to send email');
	}
};

export const sendEmailWithMagicLink = (token: string, receiver: string) => {
	const magicLink = `${env.APP_URL}/magic?token=${token}`;

	// TODO: use MJML probably and make this email proper one
	return sendEmail({
		html: `Use <a href="${magicLink}" target="_blank">this link</a> to login`,
		plainTextVersion: `Use this link to login: ${magicLink}`,
		subject: 'Your magic link to use Planotes',
		senderName: 'Planotes Magic Link',
		receiver,
	});
};
