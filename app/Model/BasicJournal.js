'use strict'

const Lucid = use('Lucid')

class BasicJournal extends Lucid {
    player() {
        return this.belongsTo("App/Model/Player")
    }

    static get updateTimestamp() {
        return null
    }
}

module.exports = BasicJournal
