'use strict'

const Schema = use('Schema')

class UpgradesTableSchema extends Schema {

  up () {
    this.create('upgrades', (table) => {
        table.string('clan_name').references('clan_name').inTable('clans');
        table.integer('lvl').defaultTo(1);
        table.integer('cost').defaultTo(25);
        table.string('upgrade', 10);
        table.integer('amount').defaultTo(0);     
    })
  }

  down () {
    this.drop('upgrades');
  }

}

module.exports = UpgradesTableSchema
