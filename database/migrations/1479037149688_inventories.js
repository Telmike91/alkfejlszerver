'use strict'

const Schema = use('Schema')

class InventoriesTableSchema extends Schema {

  up () {
      this.create('inventories', (table) => {
        table.string('username').references('username').inTable('players');
        table.integer('item_id').references('item_id').inTable('items');
    })
  }

  down () {
     this.drop('inventories');
  }

}

module.exports = InventoriesTableSchema
