'use strict'

const Schema = use('Schema')

class ClansTableSchema extends Schema {

  up () {
    this.create('clans', (table) => {      
        table.string('clan_name', 32).primary();
        table.integer('gold').defaultTo(0);     
    })
  }

  down () {
    this.drop('clans')
  }

}

module.exports = ClansTableSchema
