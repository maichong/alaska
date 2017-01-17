declare module 'nodemailer' {
  declare function createTransport(smtp: Object, defaults: Object): void;

  declare function sendMail(data: Object, callback: function): void;
}
