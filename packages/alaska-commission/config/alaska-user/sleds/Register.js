//flow

import alaska from 'alaska';
import User from 'alaska-user/models/User';

export async function pre() {
  let ctx = this.params.ctx;
  let user = this.params.user;
  if (this.params.promoter || !ctx || (user && user.promoter)) return;
  let promoter = ctx.cookies.get('promoter');
  if (!promoter && !alaska.utils.isObjectId(promoter)) return;
  // $Flow findById
  promoter = await User.findById(promoter);
  if (promoter) {
    this.params.promoter = promoter._id;
    if (user) {
      user.promoter = promoter._id;
    }
  }
}
