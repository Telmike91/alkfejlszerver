'use strict'

const Database = use('Database');
const Quest = use('App/Model/Quest');
const BasicJournal = use('App/Model/BasicJournal');

class QuestController {

    * ajaxComplete(request, response) {
        const reward = request.except("_csrf");
        const quest_id = request.param("quest_id");
        const user = request.currentUser.username;
        const now = Math.floor(new Date().getTime() / 1000)

        const player = yield Database.select("*")
            .from("players")
            .where("username", user)
            .first();
        let msg = "";
        if (reward.reward == "gold") {
            const gold = yield Database
                .select("reward_gold")
                .from("quests")
                .where("quest_id", quest_id)
                .first();
            const goldBonus = yield Database.select("amount").from("upgrades").where({
                clan_name: player.clan_name,
                upgrade: "Gold"
            }).first();
            goldBonus.amount += 100;
            goldBonus.amount /= 100;
            const rewardGold = Math.floor(gold.reward_gold * goldBonus.amount);
            player.gold += rewardGold
            msg = "You got " + rewardGold + " gold!";
            yield Database.table("players").update(player).where("username", user)
        } else if (reward.reward == "item") {
            const item = yield Database
                .select("*")
                .innerJoin("items", "quests.reward_item", "items.item_id")
                .from("quests")
                .where("quest_id", quest_id)
                .first();
            const alreadyHave = yield Database.select('*').from("inventories").where({
                username: user,
                item_id: item.reward_item
            });
            if (alreadyHave.length > 0) {
                response.ok({
                    msg: "You already have that item!",
                    success: false
                })
                return;
            }
            msg = "You got a(n)" + item.item_name + "!";
            yield Database.table('inventories').insert({
                username: user,
                item_id: item.reward_item
            });
        } else if (reward.reward == "knowledge") {
            const knowledge = yield Database
                .select("reward_str", "reward_vit", "reward_lck")
                .from("quests").where("quest_id", quest_id)
                .first();
            player.STR += knowledge.reward_str
            player.VIT += knowledge.reward_vit
            player.LCK += knowledge.reward_lck
            msg = "Your attributes have increased!";
            yield Database.table("players").update(player).where("username", user)
        }

        const complete = {
            username: user,
            quest_id: quest_id,
            completed: now
        }

        yield Database.table("basic_journals").insert(complete);

        response.ok({
            msg,
            success: true
        })
    }

    * battle(request, response) {
        const quest_id = request.param("quest_id")
        const user = request.currentUser.username;
        const player = yield Database.select("*").from("players").where("username", user).first();
        const upgrades = yield Database.select("*").from("upgrades").where("clan_name", player.clan_name);
        const battle = yield Database.select("*").from("battles").where("quest_id", quest_id).first();
        const journal = yield Database.select("*").from("basic_journals").where({
            username: user,
            quest_id
        });
        const lastMission = yield Database
            .from("basic_journals")
            .max('completed as max')
            .first()
            .where("username", user);
        const now = Math.floor(new Date().getTime() / 1000)
        if (lastMission.max + 86400 < now || lastMission.max == null) {
        } else {
            response.redirect("/");
            return
        }
        if (journal.length > 0) {
            response.redirect("/");
            return
        }
        const items = yield Database
            .select("*")
            .from("inventories")
            .innerJoin("items", "inventories.item_id", "items.item_id")
            .where("username", user);
        var goldBonus = 100;
        const goldReward = yield Database
            .select("reward_gold")
            .from("quests")
            .where("quest_id", quest_id)
            .first();
        const itemReward = yield Database
            .select("items.item_name")
            .innerJoin("items", "quests.reward_item", "items.item_id")
            .from("quests")
            .where("quest_id", quest_id)
            .first();
        const knowledgeReward = yield Database
            .select("reward_str", "reward_vit", "reward_lck")
            .from("quests").where("quest_id", quest_id)
            .first();
        const reward = {
            itemReward,
            goldReward,
            knowledgeReward
        }
        for (var i = 0; i < upgrades.length; i++) {
            switch (upgrades[i].upgrade) {
                case "Strength":
                    player.STR += upgrades[i].amount
                    break;
                case "Vitality":
                    player.VIT += upgrades[i].amount
                    break;
                case "Luck":
                    player.LCK += upgrades[i].amount
                    break;
                case "Gold":
                    goldBonus += upgrades[i].amount
                    break;
                default:
            }
        }

        yield response.sendView("quests/battle", {
            player,
            quest_id,
            battle,
            goldBonus,
            items,
            reward
        })
    }

    * index(request, response) {
        const user = request.currentUser.username;
        const journal = yield Database.select("*").from("basic_journals").where("username", user);
        const quests = yield Database.select("*").from("quests").limit(journal.length + 1)

        const lastMission = yield Database
            .from("basic_journals")
            .max('completed as max')
            .first()
            .where("username", user);
        const now = Math.floor(new Date().getTime() / 1000)
        var doable;
        if (lastMission.max + 86400 < now || lastMission.max == null) {
            doable = "Yes";
        } else {
            doable = "No";
        }

        yield response.sendView('questList', {
            quests: quests,
            journal: journal,
            doable: doable
        })
    }

    * accept(request, response) {
        const quest_id = request.param('quest_id');
        const quest = yield Quest.findBy('quest_id', quest_id);
        const user = request.currentUser.username;
        const journal = yield Database.select("*").from("basic_journals").where({
            username: user,
            quest_id
        });

        const lastMission = yield Database
            .from("basic_journals")
            .max('completed as max')
            .first()
            .where("username", user);
        const now = Math.floor(new Date().getTime() / 1000)
        if (lastMission.max + 86400 < now || lastMission.max == null) {
        } else {
            response.redirect("/");
            return
        }
        if (!quest) {
            response.notFound('Quest doesn\'t exist');
            return
        }
        if (journal.length > 0) {
            response.redirect("/");
            return
        }
        const player = yield Database.select("*")
            .from("players")
            .where("username", request.currentUser.username)
            .first();

        yield response.sendView('quests/' + quest_id, {
            quest: quest.toJSON(),
            player: player
        })
    }

    * complete(request, response) {
        const reward = request.except("_csrf");
        const quest_id = request.param("quest_id");
        const now = Math.floor(new Date().getTime() / 1000)

        const user = request.currentUser.username;
        const player = yield Database.select("*")
            .from("players")
            .where("username", user)
            .first();

        if (reward.reward == "gold") {
            const gold = yield Database
                .select("reward_gold")
                .from("quests")
                .where("quest_id", quest_id)
                .first();
            player.gold += gold.reward_gold
            yield Database.table("players").update(player).where("username", user)
        } else if (reward.reward == "item") {
            const item = yield Database
                .select("reward_item")
                .innerJoin("items", "quests.reward_item", "items.item_id")
                .from("quests")
                .where("quest_id", quest_id)
                .first();
            yield Database.table('inventories').insert({
                username: user,
                item_id: item.reward_item
            });
        } else if (reward.reward == "knowledge") {
            const knowledge = yield Database
                .select("reward_str", "reward_vit", "reward_lck")
                .from("quests").where("quest_id", quest_id)
                .first();
            player.STR += knowledge.reward_str
            player.VIT += knowledge.reward_vit
            player.LCK += knowledge.reward_lck
            yield Database.table("players").update(player).where("username", user)
        }

        const complete = {
            username: user,
            quest_id: quest_id,
            completed: now
        }



        yield Database.table("basic_journals").insert(complete);

        response.redirect('/quests')
    }
}

module.exports = QuestController
