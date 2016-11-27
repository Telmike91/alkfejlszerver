'use strict'

const Lucid = use('Lucid')

class Item extends Lucid {
    inventory() {
        return this.belongsToMany('App/Model/Inventory');
    }
}

module.exports = Item
