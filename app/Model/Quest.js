'use strict'

const Lucid = use('Lucid')

class Quest extends Lucid {
    player() {
        return this.hasMany('App/Model/Player');
    }
}

module.exports = Quest
