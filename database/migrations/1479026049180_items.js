'use strict'

const Schema = use('Schema')

class ItemsTableSchema extends Schema {

  up () {
    this.create('items', (table) => {
      table.increments('item_id').primary();
      table.string('item_name').unique()
      table.integer('STR');
      table.integer('VIT');
      table.integer('LCK');
      table.integer('buy');
      table.integer('sell');

    })
  }

  down () {
    this.drop('items')
  }

}

module.exports = ItemsTableSchema
