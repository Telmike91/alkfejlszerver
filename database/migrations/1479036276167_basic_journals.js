'use strict'

const Schema = use('Schema')

class BasicJournalsTableSchema extends Schema {

  up () {
    this.create('basic_journals', (table) => {
      table.string('username', 32).references('username').inTable('players');
      table.integer('quest_id').references('quest_id').inTable('quests');
      table.integer('completed');    
    })
  }

  down () {
    this.drop('basic_journals');
  }

}

module.exports = BasicJournalsTableSchema
