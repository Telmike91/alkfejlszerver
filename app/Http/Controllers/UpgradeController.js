'use strict'

const Database = use('Database');
const Upgrade = use('App/Model/Upgrade');

class UpgradeController {
    * purchase(request, response) {
        const postData = request.except('_csrf');
        const clan_name = request.param("clan_name");
        
        var gold = yield Database.select("gold").from("clans").where("clan_name", clan_name).first();

        const upg = yield Database.select("*").from("upgrades").where({clan_name: clan_name, upgrade: postData.upgrade }).first();   
        if(gold.gold - upg.cost < 0) {
            yield request
                .withAll()
                .andWith({ errors: [{field: "", validation: "", message: "Not enough money"}]})
                .flash()

            response.redirect('back')
            return
        }

        gold.gold = gold.gold - upg.cost;
        upg.lvl++;
        upg.cost+=25
        upg.amount+=2
        yield Database
                .table('clans')
                .where('clan_name',  clan_name)
                .update('gold', gold.gold);
        yield Database
                .table('upgrades')
                .where({clan_name: clan_name, upgrade: postData.upgrade})
                .update(upg);
        
        response.redirect('back');
    } 
}

module.exports = UpgradeController
