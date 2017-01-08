'use strict'

const Database = use('Database');
const Clan = use('App/Model/Clan');
const Validator = use('Validator');

class ClanController {
    * index(request, response) {
        const clans = yield Clan.all();

        yield response.sendView('main', {
            clans: clans.toJSON(),
        })
    }

    * kick(request, response) {
        const clan_name = request.param('clan_name');
        const clan = yield Clan.findBy('clan_name', clan_name);
        if (!clan) {
            response.notFound(clan_name + ' doesn\'t exist');
            return
        }

        const player = yield Database.select("*")
                .from("players")
                .where("players.username", request.currentUser.username)
                .innerJoin("members", "players.username", "members.username")
                .first();
        var members
        if(player.clan_name == clan_name && player.privilege > 1) {
            if(player.privilege == 3) {
                members = yield Database.select("*").from("members").where(function() {
                    this.where("clan_name", clan_name).andWhere("privilege", "<", 3)                
                })
            } else {
                members = yield Database.select("*").from("members").where(function() {
                    this.where("clan_name", clan_name).andWhere("privilege", "<", 2)                
                })
            }
                    yield response.sendView('kick', {
                clan: clan.toJSON(),
                members: members,
                player: player
            })
        } else {
            response.redirect('back')
        }
    }

    * promote(request,response) {
        const clan_name = request.param('clan_name');
        const clan = yield Clan.findBy('clan_name', clan_name);
        if (!clan) {
            response.notFound(clan_name + ' doesn\'t exist');
            return
        }

        const player = yield Database.select("*")
                .from("players")
                .where("players.username", request.currentUser.username)
                .innerJoin("members", "players.username", "members.username")
                .first();
        if(player.privilege != 3 || player.clan_name != clan_name) {
            response.redirect('/');
            return
        }
        var members = yield Database.select("*").from("members").where(function() {
                this.where("clan_name", clan_name).andWhere("privilege", "<", 3)                
            })        
        yield response.sendView('promote', {
            clan: clan.toJSON(),
            members: members,
            player: player
        })
    }

    * doPromote(request, response) {
        const requestExc = request.except("_csrf")
        const player = yield Database.select("*").from("players").where("username", requestExc.username).first();
        const isMember = yield Database.select("username").from("members").where("username", player.username).first();
        if (isMember == null) {
            yield request
                .withAll()
                .andWith({ errors: [{ field: "", validation: "", message: "Player not member of the clan" }] })
                .flash()

            response.redirect('back')
            return
        }

        if(requestExc.promote == "promote"){
            console.log("///////////////////////PROMOTE")
            yield Database.table("members").where("username", player.username).update("privilege", 2);
        } else if(requestExc.promote == "demote") {
            console.log("///////////////////////DEMOTE")
            yield Database.table("members").where("username", player.username).update("privilege", 1);
        }
        response.redirect('back');
        return
    }

    * doKick(request, response) {
        const requestExc = request.except("_csrf")
        const player = yield Database.select("*").from("players").where("username", requestExc.username).first();
        const isMember = yield Database.select("username").from("members").where("username", player.username).first();

        console.log("/////////////////")
        console.log(player);
        console.log(isMember)
        console.log("SHIT//////////");

        if (isMember == null) {
            yield request
                .withAll()
                .andWith({ errors: [{ field: "", validation: "", message: "Player not member of the clan" }] })
                .flash()

            response.redirect('back')
            return
        }

        yield Database.table("members").where("username", player.username).delete();
        yield Database.table("players").where("username", player.username).update("clan_name", null);

        response.redirect('back');
        return
    }

    * invite(request, response) {
        const user = request.currentUser.username;
        const clan_name = request.param("clan_name")
        const players = yield Database.raw("SELECT username FROM players WHERE players.clan_name is null " +
                        "EXCEPT "+
                        "SELECT username FROM invites WHERE clan_name = ?"+
                        "EXCEPT "+
                        "SELECT username FROM requests WHERE requests.username = \""+ user+ "\"", clan_name)
        const currentPlayer = yield Database.select("*").from("players").where("username", user);

        console.log("///////////////" + players)
        yield response.sendView("invite", {
            players: players,
            currentPlayer: currentPlayer
        })

    }

    * doInvite(request, response) {
        const invited = request.except("_csrf");
        const clan = request.param("clan_name");
        const player = yield Database.select("*").from("players").where("username", invited.username).first();

        yield Database.table("invites").insert({ username: invited.username, clan_name: clan })

        response.redirect('back');
    }

    * donate(request, response) {
        const clan_name = request.param('clan_name');
        const clan = yield Clan.findBy('clan_name', clan_name);
        const player = yield Database.select("*")
            .from("players")
            .where("username", "=", request.currentUser.username)
            .first();
        const members = yield Database
            .select("*")
            .from("members")
            .where("clan_name", clan_name);

        yield response.sendView('donation', {
            clan: clan.toJSON(),
            members: members,
            player: player
        })

        response.redirect('back');
    }

    * doDonate(request, response) {    
        const postData = request.except('_csrf');
        const clan_name = request.param("clan_name");
        const user = request.currentUser.username;
        const player = yield Database
            .select('gold')
            .from("players")
            .where('username', user)
            .first();

        var gold = yield Database.select("gold").from("clans").where("clan_name", clan_name).first();

        if (player.gold - postData.donation < 0) {
            yield request
                .withAll()
                .andWith({ errors: [{ field: "", validation: "", message: "Not enough money" }] })
                .flash()

            response.redirect('back')
            return
        }

        player.gold -= postData.donation

        gold.gold += Number(postData.donation);
        yield Database
            .table('players')
            .where('username', user)
            .update(player);

        yield Database
            .table('clans')
            .where("clan_name", clan_name)
            .update("gold", gold.gold);

        response.redirect('back');
    }

    * details(request, response) {
        const clan_name = request.param('clan_name');
        const members = yield Database.select("*").from("members").where("clan_name", clan_name);
        const clan = yield Clan.findBy('clan_name', clan_name);
        if (!clan) {
            response.notFound(clan_name + ' doesn\'t exist');
            return
        }
        const upgrades = yield Database.select("*").from("upgrades").where("clan_name", clan.clan_name);
        var player;
        if (request.currentUser) {
            player = yield Database.select("*")
                .from("players")
                .where("players.username", request.currentUser.username)
                .innerJoin("members", "players.username", "members.username")
                .first();
        } else {
            player = null
        }

        yield response.sendView('clan', {
            clan: clan.toJSON(),
            upgrades: upgrades,
            members: members,
            player: player
        })
    }

    * create(request, response) {
        yield response.sendView('createClan');
    }

    * doCreate(request, response) {
        const clanData = request.except('_csrf');
        const rules = {
            inputClanName: 'required|alpha_numeric|unique:clans, clan_name'
        }
        const validation = yield Validator.validateAll(clanData, rules);
        if (validation.fails()) {
            yield request
                .withAll()
                .andWith({ errors: validation.messages() })
                .flash()

            response.redirect('back')
            return
        }

        const exist = yield Database.select('username')
            .from('players')
            .whereRaw(`"username" = ? AND "clan_name" IS NULL`, [request.currentUser.username])
        if (exist.length != 0) {
            const clan = yield Clan.create({
                clan_name: clanData.inputClanName,
                gold: 0
            })

            yield Database
                .table('Players')
                .where('username', request.currentUser.username)
                .update('clan_name', clan.clan_name);
            yield Database
                .table("members")
                .insert({
                    clan_name: clan.clan_name,
                    username: request.currentUser.username,
                    privilege: 3
                })
            yield Database
                .table("upgrades")
                .insert(
                [
                    {
                        clan_name: clan.clan_name,
                        upgrade: "Strength"
                    },
                    {
                        clan_name: clan.clan_name,
                        upgrade: "Vitality"
                    },
                    {
                        clan_name: clan.clan_name,
                        upgrade: "Luck"
                    },
                    {
                        clan_name: clan.clan_name,
                        upgrade: "Gold"
                    }
                ])
        } else {
            const errorMsgs = []
            errorMsgs.push({ field: "", validation: "", message: "Már csatlakoztál klánhoz!" });
            yield request
                .withAll()
                .andWith({ errors: errorMsgs })
                .flash()

            response.redirect('back')
            return
        }
        response.redirect('/');
    }

    * requests(request, response) {
        const clan_name = request.param("clan_name");
        const requests = yield Database.select("*").from("requests").where("clan_name", clan_name);

        yield response.sendView("inviteRequests", {
            requests: requests
        })
    }

    * accept(request, response) {
        const clan_name = request.param("clan_name");
        const player = request.except("_csrf");

        const rightRequest = yield Database.select("*").from("requests").where({
            username: player.username,
            clan_name: clan_name
        }).first()


        if (!rightRequest) {
            yield request
                .withAll()
                .andWith({ errors: [{ field: "", validation: "", message: "No request found!" }] })
                .flash()

            response.redirect('back')
            return
        }

        yield Database.table("players").update("clan_name", clan_name).where("username", player.username);
        yield Database.table("members").insert({
            username: player.username,
            clan_name: clan_name
        })

        yield Database.table("invites").where("username", player.username).delete();
        yield Database.from("requests").where("username", player.username).delete();

        response.redirect('back');
    }
}

module.exports = ClanController
