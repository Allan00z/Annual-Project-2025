module.exports = ({ env }) => ({
  'documentation': {
    enabled: true,
  },
  'email': {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.example.com'),
        port: env.int('SMTP_PORT', 587),
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
      },
      settings: {
        defaultFrom: 'no-reply@example.com',
        defaultReplyTo: 'support@example.com',
      },
    },
  }
});
