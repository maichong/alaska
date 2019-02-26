import User from 'alaska-user/models/User';

export async function pre() {
  let ctx = this.params.ctx;
  let user = this.params.user;
  if (this.params.promoter || !ctx || (user && user.promoter)) return;
  let promoter = ctx.cookies.get('p');
  if (!promoter) return;
  try {
    promoter = await User.findById(promoter).select('username');
    if (promoter) {
      this.params.promoter = promoter._id;
      if (user) {
        user.promoter = promoter._id;
      }
    }
  } catch (e) { }
}
