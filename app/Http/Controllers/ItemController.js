'use strict'

const Database = use('Database');
const Item = use('App/Model/Item');

class ItemController {
    * index (request, response) {
        const items = yield Item.all();

        yield response.sendView('shop', {
            items: items.toJSON()
        })
    }
    
    * buy(request, response) {
        const postData = request.except('_csrf');
        const itemId = yield Database
                            .select("item_id" , "buy")
                            .from("items")
                            .where("item_name", postData.item)
                            .first();
        const user = request.currentUser.username;

        const item = {
            username: user,
            item_id: itemId.item_id         
        }
        
        var gold = yield Database.select("gold").from("players").where("username", user).first();  
        const exist = yield Database.select("*").from('inventories').where(item);         

        if(exist.length > 0) {
            yield request
                .withAll()
                .andWith({ errors: [{field: "", validation: "", message: "You already have that item!"}]})
                .flash()

            response.redirect('back')
            return
        }        
        if(gold.gold - itemId.buy < 0) {
            yield request
                .withAll()
                .andWith({ errors: [{field: "", validation: "", message: "Not enough money"}]})
                .flash()

            response.redirect('back')
            return
        }

        gold.gold = gold.gold - itemId.buy;
        yield Database
                .table('players')
                .where('username',  user)
                .update('gold', gold.gold);
        yield Database.table('inventories').insert(item);
        
        response.redirect('back');
    }

    * sell(request,response) {
        const postData = request.except('_csrf');
        const itemId = yield Database.select("item_id" , "sell").from("items").where("item_name", postData.item).first();
        const user = request.currentUser.username;

        const item = {
            username: user,
            item_id: itemId.item_id         
        }
        
        var gold = yield Database.select("gold").from("players").where("username", user).first();           

        gold.gold = gold.gold + itemId.sell;
        yield Database
                .table('players')
                .where('username',  user)
                .update('gold', gold.gold);
        
        yield Database.table("inventories").where(item).delete();        
        response.redirect('back');
    } 
}

module.exports = ItemController
