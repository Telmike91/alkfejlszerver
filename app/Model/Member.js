'use strict'

const Lucid = use('Lucid')

class Member extends Lucid {
    player() {
        this.hasMany('App/Model/Player');
    }

    clan() {
        this.hasMany('App/Model/Clan');
    }

    static get updateTimestamp() {
        return null
    }

    static get createTimestamp() {
        return null
    }
}

module.exports = Member
