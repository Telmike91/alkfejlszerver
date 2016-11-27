'use strict'

const Schema = use('Schema')

class InvitesTableSchema extends Schema {

  up () {
    this.create('invites', (table) => {
       table.string("username", 32).references("username").inTable("players");
       table.string("clan_name", 32).references("clan_name").inTable("clans");
    })
  }

  down () {
    this.drop("invites")
  }

}

module.exports = InvitesTableSchema
