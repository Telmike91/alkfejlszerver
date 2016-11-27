'use strict'

const Lucid = use('Lucid')

class User extends Lucid {
  player() {
      return this.hasOne('App/Model/Player');
  }   

  apiTokens () {
      return this.hasMany('App/Model/Token')
  }

}

module.exports = User
