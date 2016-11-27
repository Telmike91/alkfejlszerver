'use strict'

const Schema = use('Schema')

class PlayersTableSchema extends Schema {

  up () {
    this.create('players', (table) => {
      table.string('username', 32).references('users.username').primary();
      table.string('clan_name');
      table.foreign('clan_name').references('clans.clan_name');
      table.integer('STR');
      table.integer('VIT');
      table.integer('LCK');
      table.integer('gold');

    })
  }

  down () {
    this.drop('players')
  }

}

module.exports = PlayersTableSchema
