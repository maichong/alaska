# alaska-email-smtp
Alaska smtp driver

```js

// config/alaska-email/config.js

export default {

  drivers: {
    default: {
      label: 'Default Email Driver',
      type: 'alaska-email-smtp',
      
      // https://nodemailer.com/2-0-0-beta/setup-smtp/
      smtp: {
        host: '127.0.0.1',
        secure: true,
        auth: {
          user: 'username',
          pass: 'password'
        }
      },
      
      // https://nodemailer.com/ E-mail message fields
      defaults: {
        from: '"Sender Name" <sender@server.com>'
      }
  
    }
  }
  
};

```
