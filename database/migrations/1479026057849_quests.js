'use strict'

const Schema = use('Schema')

class QuestsTableSchema extends Schema {

  up () {
    this.create('quests', (table) => {
       table.increments("quest_id").primary();
       table.string('quest_name').unique();
       table.string("quest_type", 32).notNullable();
       table.string("reward_item");
       table.integer("reward_gold").toDefault(0)
       table.integer("reward_str").toDefault(0)
       table.integer("reward_vit").toDefault(0)
       table.integer("reward_lck").toDefault(0)
    })
  }

  down () {
    this.drop('quests')
  }

}

module.exports = QuestsTableSchema
