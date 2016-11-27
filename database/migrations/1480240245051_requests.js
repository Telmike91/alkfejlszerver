'use strict'

const Schema = use('Schema')

class RequestsTableSchema extends Schema {

  up () {
    this.create('requests', (table) => { 
        table.string("clan_name").references("clan_name").inTable("clans")
        table.string("username", 32).references("username").inTable("players");
    })
  }

  down () {
      this.drop("requests");
  }

}

module.exports = RequestsTableSchema
