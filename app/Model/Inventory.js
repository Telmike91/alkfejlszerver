'use strict'

const Lucid = use('Lucid')

class Inventory extends Lucid {
    items() {
        return this.hasMany('App/Model/Item');
    }

    players() {
        return this.hasMany('App/Model/Player');
    }
}

module.exports = Inventory
