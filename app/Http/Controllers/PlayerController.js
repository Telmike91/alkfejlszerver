'use strict'

const Database = use('Database');
const Player = use('App/Model/Player');
const User = use('App/Model/User');

class PlayerController {
    * details(request, response) {
        const username = request.param('user_name');
        const player = yield Player.findBy('username', username);
        const invites = yield Database
            .select("clan_name")
            .from("invites")
            .where("username", player.username);
        if (!player) {
            response.notFound(username + ' doesn\'t exist');
            return
        }
        var visitor;
        if (request.currentUser) {
            visitor = yield Database
                .select("*")
                .from("players")
                .innerJoin("members", "members.username", "players.username")
                .where("players.username", request.currentUser.username)
                .first();
        }

        const items = yield Database.select("*")
            .from("inventories")
            .where("username", username)
            .innerJoin("items", "inventories.item_id", "items.item_id");
        yield response.sendView('player', {
            player: player.toJSON(),
            visitor: visitor,
            invites: invites,
            items: items
        })


    }

    * join(request, response) {
        const clan_name = request.except("_csrf");
        const player_name = request.param("user_name");
        const clan = yield Database.select("*").from("clans").where("clan_name", clan_name.clan_name)

        const exist = yield Database.select("*").from("invites").where({
            clan_name: clan_name.clan_name,
            username: player_name
        })

        if(exist.length == 0) {
            response.redirect('back');
            return
        }

        yield Database.table("invites").where("username", player_name).delete();
        yield Database.table("requests").where("username", player_name).delete();
        yield Database.table("players").where("username", player_name).update("clan_name", clan_name.clan_name);
        yield Database.table("members").insert({username: player_name, clan_name: clan_name.clan_name})   

        response.redirect('back');
        return;    
    }

    * ask(request, response) {
        const user_name = request.currentUser.username
        const player = yield Database.select("*").from("players").where("username", request.param("username"));
        if(user_name == player.username && player.clan_name == null){
            const clans = yield Database.raw("SELECT clan_name FROM clans EXCEPT SELECT clan_name FROM requests WHERE requests.username = ? EXCEPT SELECT clan_name FROM invites WHERE invites.username = ?", [request.currentUser.username, request.currentUser.username])
            yield response.sendView("askForInvite", {
                clans: clans
            })
        } else {
            response.redirect('/');
            return
        }
    }

    * doAsk(request, response) {
        const username = request.currentUser.username;
        const player = request.param("user_name");
        if(username == player)
            {const clan_name = request.except("_csrf");

            const exist = yield Database.select("clan_name").from("clans").where("clan_name", clan_name.clan_name);

            console.log("////////////////" + exist + " ////////" + exist.length)

            if (exist.length != 1) {
                yield request
                    .withAll()
                    .andWith({ errors: [{ field: "", validation: "", message: "Clan not found!" }] })
                    .flash()

                response.redirect('back')
                return
            }

            const alreadyRequested = yield Database.select("*").from("requests").where({username: username, clan_name: clan_name.clan_name})

            if (alreadyRequested.length > 0) {
                yield request
                    .withAll()
                    .andWith({ errors: [{ field: "", validation: "", message: "Already requested to this clan!" }] })
                    .flash()

                response.redirect('back')
                return
            }

            const inviteRequest = {
                clan_name: clan_name.clan_name,
                username: username
            }

            yield Database.table("requests").insert(inviteRequest);
            response.redirect('back');
        } else {
            response.redirect('/')
            return
        }
    }

    * invites(request, response) {
        const username = request.param('user_name');        
        const player = yield Player.findBy('username', username);
        if(username == player.username && player.clan_name == null) {        
            const invites = yield Database
                .select("clan_name")
                .from("invites")
                .where("username", player.username);
            yield response.sendView("listInvites", {
                invites: invites,
                player: player
            })
        } else {
            response.redirect('/');
            return
        }
    }
}

module.exports = PlayerController
