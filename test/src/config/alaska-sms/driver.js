export default class Driver {
  async send(to, message) {
    console.log(to, message);
    return { to, message };
  }
}
