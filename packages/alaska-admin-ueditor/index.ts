import { Plugin } from 'alaska';
import { AdminService } from 'alaska-admin';

export default class UEditorPlugin extends Plugin {
  constructor(service: AdminService) {
    super(service);
  }
}
