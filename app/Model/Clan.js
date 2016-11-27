'use strict'

const Lucid = use('Lucid')

class Clan extends Lucid {
    players() {
        return this.hasMany('App/Model/Player');
    }

    static get updateTimestamp() {
        return null
    }

    static get createTimestamp() {
        return null
    }
}

module.exports = Clan
