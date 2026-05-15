import { resend } from '#config/email.config.js';
import { env } from '#config/env.config.js';
import emailTemplates from './email.templates.js';

class EmailService {
    sendEmail = async ({ to, subject, html, text }) => {
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

    sendTemplateEmail = ({ to, template }) => {
        return this.sendEmail({ to, ...template });
    };

    sendWelcomeEmail = ({ to, displayName }) => {
        return this.sendTemplateEmail({
            to,
            template: emailTemplates.welcome({ displayName }),
        });
    };

    sendAccountRestoredEmail = ({ to, displayName }) => {
        return this.sendTemplateEmail({
            to,
            template: emailTemplates.accountRestored({ displayName }),
        });
    };

    sendVerifyEmail = ({ to, displayName, verificationUrl }) => {
        return this.sendTemplateEmail({
            to,
            template: emailTemplates.verifyEmail({ displayName, verificationUrl }),
        });
    };

    sendPasswordResetEmail = ({ to, displayName, resetUrl }) => {
        return this.sendTemplateEmail({
            to,
            template: emailTemplates.passwordReset({ displayName, resetUrl }),
        });
    };

    sendRestoreAvailableEmail = ({ to, displayName, restoreUrl }) => {
        return this.sendTemplateEmail({
            to,
            template: emailTemplates.restoreAvailable({ displayName, restoreUrl }),
        });
    };

    sendGroupInviteEmail = ({ to, inviterName, groupName, inviteUrl }) => {
        return this.sendTemplateEmail({
            to,
            template: emailTemplates.groupInvite({
                inviterName,
                groupName,
                inviteUrl,
            }),
        });
    };

    sendGroupRoleUpdatedEmail = ({ to, displayName, groupName, role }) => {
        return this.sendTemplateEmail({
            to,
            template: emailTemplates.groupRoleUpdated({
                displayName,
                groupName,
                role,
            }),
        });
    };

    sendGroupMemberJoinedEmail = ({ to, displayName, groupName, memberName }) => {
        return this.sendTemplateEmail({
            to,
            template: emailTemplates.groupMemberJoined({
                displayName,
                groupName,
                memberName,
            }),
        });
    };
}

export default new EmailService();
