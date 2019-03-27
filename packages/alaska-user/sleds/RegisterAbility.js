"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
const Ability_1 = require("../models/Ability");
class RegisterAbility extends alaska_sled_1.Sled {
    async exec(params) {
        let id = params.id;
        let ability = await Ability_1.default.findById(id).session(this.dbSession);
        if (ability) {
            return ability;
        }
        console.log(`Register ability: ${id}`);
        ability = new Ability_1.default(params);
        ability._id = id;
        await ability.save({ session: this.dbSession });
        return ability;
    }
}
exports.default = RegisterAbility;
