import alaska from 'alaska';
import SETTINGS from 'alaska-settings';

export default class Init extends alaska.Sled {
  async exec() {
    SETTINGS.register({
      id: 'user.closeRegister',
      title: 'Close Register',
      service: 'alaska-user',
      type: 'CheckboxFieldView'
    });

    SETTINGS.register({
      id: 'user.closeRegisterReason',
      title: 'Close Register Reason',
      service: 'alaska-user',
      type: 'TextFieldView'
    });
  }
}
