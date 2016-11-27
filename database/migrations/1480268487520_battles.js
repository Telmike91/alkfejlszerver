'use strict'

const Schema = use('Schema')

class BattlesTableSchema extends Schema {

  up () {
    this.create('battles', (table) => {
       table.integer("quest_id").references("quest_id").inTable("quests");
       table.string("enemy_name", 32);
       table.integer('STR');
       table.integer('VIT');
       table.integer('LCK');
    })
  }

  down () {
    this.drop("battles");
  }

}

module.exports = BattlesTableSchema
