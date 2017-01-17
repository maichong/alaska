//flow

import alaska from 'alaska';
import User from 'alaska-user/models/User';

export async function pre() {
  let ctx = this.data.ctx;
  let user = this.data.user;
  if (this.data.promoter || !ctx || (user && user.promoter)) return;
  let promoter = ctx.cookies.get('promoter');
  if (!promoter && !alaska.util.isObjectId(promoter)) return;
  // $Flow findById
  promoter = await User.findById(promoter);
  if (promoter) {
    this.data.promoter = promoter._id;
    if (user) {
      user.promoter = promoter._id;
    }
  }
}
