'use strict'

const Schema = use('Schema')

class MembersTableSchema extends Schema {

  up () {
    this.create('members', (table) => {
      table.string('clan_name').references('clan_name').inTable('clans');
      table.string('username', 32).references('username').inTable('players');
    })
  }

  down () {
    this.drop('members');
  }

}

module.exports = MembersTableSchema
