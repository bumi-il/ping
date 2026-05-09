const escapeHtml = (value = '') => {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
};

const normalizeSubject = (value = '') => {
    return String(value)
        .replace(/[\r\n]+/g, ' ')
        .trim();
};

const renderButton = (label, url) => {
    if (!url) {
        return '';
    }

    const safeLabel = escapeHtml(label);
    const safeUrl = escapeHtml(url);

    return `
        <p style="margin: 24px 0;">
            <a href="${safeUrl}" style="background: #2563eb; border-radius: 6px; color: #ffffff; display: inline-block; font-weight: 600; padding: 12px 18px; text-decoration: none;">
                ${safeLabel}
            </a>
        </p>
    `;
};

const renderLayout = ({ title, body, buttonLabel, buttonUrl }) => {
    const safeTitle = escapeHtml(title);
    const bodyHtml = body
        .map(
            (paragraph) =>
                `<p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">${escapeHtml(paragraph)}</p>`,
        )
        .join('');

    return `
        <!doctype html>
        <html>
            <body style="background: #f8fafc; font-family: Arial, sans-serif; margin: 0; padding: 32px;">
                <main style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin: 0 auto; max-width: 560px; padding: 28px;">
                    <h1 style="color: #0f172a; font-size: 22px; line-height: 1.3; margin: 0 0 18px;">${safeTitle}</h1>
                    ${bodyHtml}
                    ${renderButton(buttonLabel, buttonUrl)}
                    <p style="border-top: 1px solid #e2e8f0; color: #64748b; font-size: 13px; line-height: 1.5; margin: 24px 0 0; padding-top: 18px;">
                        Ping
                    </p>
                </main>
            </body>
        </html>
    `;
};

const renderText = ({ title, body, buttonLabel, buttonUrl }) => {
    const lines = [title, '', ...body];

    if (buttonUrl) {
        lines.push('', `${buttonLabel}: ${buttonUrl}`);
    }

    lines.push('', 'Ping');

    return lines.join('\n');
};

const createTemplate = ({ subject, title, body, buttonLabel, buttonUrl }) => {
    return {
        subject: normalizeSubject(subject),
        html: renderLayout({ title, body, buttonLabel, buttonUrl }),
        text: renderText({ title, body, buttonLabel, buttonUrl }),
    };
};

const emailTemplates = {
    welcome({ displayName } = {}) {
        const name = displayName || 'there';

        return createTemplate({
            subject: 'Welcome to Ping',
            title: 'Welcome to Ping',
            body: [
                `Hi ${name},`,
                'Your account is ready. You can now create groups, join your people, and keep track of what needs attention.',
            ],
        });
    },

    accountRestored({ displayName } = {}) {
        const name = displayName || 'there';

        return createTemplate({
            subject: 'Your Ping account was restored',
            title: 'Your account was restored',
            body: [
                `Hi ${name},`,
                'Your Ping account has been restored successfully. You can continue using Ping with your restored account.',
            ],
        });
    },

    restoreAvailable({ displayName, restoreUrl } = {}) {
        const name = displayName || 'there';

        return createTemplate({
            subject: 'Restore your Ping account',
            title: 'Restore your Ping account',
            body: [
                `Hi ${name},`,
                'A recently deleted Ping account matches these details. If this was your account, you can restore it before the restore window closes.',
            ],
            buttonLabel: 'Restore account',
            buttonUrl: restoreUrl,
        });
    },

    groupInvite({ inviterName, groupName, inviteUrl } = {}) {
        const inviter = inviterName || 'Someone';
        const group = groupName || 'a group';

        return createTemplate({
            subject: `You're invited to join ${group}`,
            title: `Join ${group}`,
            body: [
                `${inviter} invited you to join ${group} on Ping.`,
                'Use the invite link below to review and join the group.',
            ],
            buttonLabel: 'View invite',
            buttonUrl: inviteUrl,
        });
    },

    groupRoleUpdated({ displayName, groupName, role } = {}) {
        const name = displayName || 'there';
        const group = groupName || 'your group';
        const newRole = role || 'member';

        return createTemplate({
            subject: `Your role changed in ${group}`,
            title: 'Your group role changed',
            body: [`Hi ${name},`, `Your role in ${group} is now ${newRole}.`],
        });
    },

    groupMemberJoined({ displayName, groupName, memberName } = {}) {
        const name = displayName || 'there';
        const group = groupName || 'your group';
        const member = memberName || 'A new member';

        return createTemplate({
            subject: `${member} joined ${group}`,
            title: 'A new member joined',
            body: [`Hi ${name},`, `${member} joined ${group}.`],
        });
    },
};

export default emailTemplates;
