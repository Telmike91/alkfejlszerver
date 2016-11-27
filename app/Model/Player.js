'use strict'

const Lucid = use('Lucid')

class Player extends Lucid {
    user() {
        return this.belongsTo('App/Model/User');
    }
    inventory() {
        return this.hasOne('App/Model/Player');
    }

    clan() {
        return this.belongsTo('App/Model/Clan');
    }

    quests() {
        return this.hasMany('App/Model/Quest');
    }

    static get updateTimestamp() {
        return null
    }

    static get createTimestamp() {
        return null
    }
}

module.exports = Player
