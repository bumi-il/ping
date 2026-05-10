import { resend } from '#config/email.config.js';
import { env } from '#config/env.config.js';
import emailTemplates from './email.templates.js';

const sendEmail = async ({ to, subject, html, text }) => {
    const { data, error } = await resend.emails.send({
        from: env.APP_EMAIL,
        to,
        subject,
        html,
        text,
    });

    if (error) throw error;

    return data;
};

const sendTemplateEmail = ({ to, template }) => {
    return sendEmail({ to, ...template });
};

const sendWelcomeEmail = ({ to, displayName }) => {
    return sendTemplateEmail({
        to,
        template: emailTemplates.welcome({ displayName }),
    });
};

const sendAccountRestoredEmail = ({ to, displayName }) => {
    return sendTemplateEmail({
        to,
        template: emailTemplates.accountRestored({ displayName }),
    });
};

const sendVerifyEmail = ({ to, displayName, verificationUrl }) => {
    return sendTemplateEmail({
        to,
        template: emailTemplates.verifyEmail({ displayName, verificationUrl }),
    });
};

const sendPasswordResetEmail = ({ to, displayName, resetUrl }) => {
    return sendTemplateEmail({
        to,
        template: emailTemplates.passwordReset({ displayName, resetUrl }),
    });
};

const sendRestoreAvailableEmail = ({ to, displayName, restoreUrl }) => {
    return sendTemplateEmail({
        to,
        template: emailTemplates.restoreAvailable({ displayName, restoreUrl }),
    });
};

const sendGroupInviteEmail = ({ to, inviterName, groupName, inviteUrl }) => {
    return sendTemplateEmail({
        to,
        template: emailTemplates.groupInvite({
            inviterName,
            groupName,
            inviteUrl,
        }),
    });
};

const sendGroupRoleUpdatedEmail = ({ to, displayName, groupName, role }) => {
    return sendTemplateEmail({
        to,
        template: emailTemplates.groupRoleUpdated({
            displayName,
            groupName,
            role,
        }),
    });
};

const sendGroupMemberJoinedEmail = ({
    to,
    displayName,
    groupName,
    memberName,
}) => {
    return sendTemplateEmail({
        to,
        template: emailTemplates.groupMemberJoined({
            displayName,
            groupName,
            memberName,
        }),
    });
};

const emailService = {
    sendEmail,
    sendWelcomeEmail,
    sendAccountRestoredEmail,
    sendVerifyEmail,
    sendPasswordResetEmail,
    sendRestoreAvailableEmail,
    sendGroupInviteEmail,
    sendGroupRoleUpdatedEmail,
    sendGroupMemberJoinedEmail,
};

export default emailService;
