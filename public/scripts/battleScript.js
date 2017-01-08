const $player = $(".player")
const player = {
    str: $($player[0]),
    vit: $($player[1]),
    lck: $($player[2]),
    item: {
        str: 0,
        vit: 0,
        lck: 0
    }
}
const $enemy = $(".enemy")
const enemy = {
    str: $($enemy[0]),
    vit: $($enemy[1]),
    lck: $($enemy[2])
}
let yourTurn = false;
let over = false;
var begun = false;

function equip(e) {
    const $tds = $("tr:contains('" + e.target.value + "') > td")
    let i = 1;
    player.str.text(Number(player.str.text()) - player.item.str);
    if(!begun) {
        player.vit.text(Number(player.vit.text()) - player.item.vit);
    }
    player.lck.text(Number(player.lck.text()) - player.item.lck);
    for (item in player.item) {
        player.item[item] = Number($($tds[i]).text())
        i++;
    }
    player.str.text(Number(player.str.text()) + player.item.str);
    if(!begun) {
        player.vit.text(Number(player.vit.text()) + player.item.vit);
    }
    player.lck.text(Number(player.lck.text()) + player.item.lck);
}

function battle(e) {
        e.preventDefault();    
    if (!begun) {
        begun = true;
        if(Math.floor(Math.random() * 2) == 0) {
             $("#log").append("<p>You start</p>");          
            yourTurn = true;
        } else {
             $("#log").append("<p>The enemy starts</p>");
        }
    }    
    if(!over) {
        if(yourTurn) {
            let dmg = attack(player)
            if((enemy.vit.text() - dmg) < 0) {
                $("#log").append("<p>Victory</p>")
                enemy.vit.text(Number(enemy.vit.text()) - dmg)
                $("#battle input.btn").val("Complete");
                $('#battle > form').off('submit').on("submit", rewardModal)
                over = true;
            } else {
                enemy.vit.text(Number(enemy.vit.text()) - dmg)
            }
            yourTurn = false;
        } else {
            let dmg = attack(enemy);
            if((player.vit.text() - dmg) < 0) {
                $("#log").append("<p>Defeat</p>")
                $("#log").append("<p>Try again!</p>")
                player.vit.text(Number(player.vit.text()) - dmg)
                over = true;
            } else {
                player.vit.text(Number(player.vit.text()) - dmg)
            }
            yourTurn = true;
        }
    }
}
function attack(who) {
    let dmg = Number(who.str.text());            
    const lucky = Math.floor(Math.random() * 100)
    const dodge = Math.floor(Math.random() * 100);
    if(lucky < Number(who.lck.text()) && ((lucky / dodge) < 2)) {
        dmg*=2;
        $("#log").append("<p class='lucky'>Lucky strike! " + dmg + " damage!!!</p>");
    } else if((lucky / dodge) > 4) {
        $("#log").append("<p>Miss</p>")
        dmg = 0;
    } else {
        $("#log").append("<p>Simple attack for " + dmg + " damage</p>");
    }
    return dmg;
}

function sendData(e, $modal) {
    e.preventDefault();
    const quest_id = window.location.pathname.split('/')[2];
    const data = $(e.target).serializeArray();
    Promise.resolve(
        $.ajax({
            url: '/ajax/quests/' + quest_id + '/complete',
            method: 'POST',
            data,
            dataType: 'json',
            headers: { 'csrf-token': $('[name="_csrf"]').val() }
        })
    )
        .then(json => {
            if(json.success) {
                $("#log").append(json.msg);                
                $modal.modal('hide');
                $("#battle input.btn").val("Return");
                $('#battle > form').off('submit').on("submit", function(e) {
                    e.preventDefault();
                    window.location.replace("/quests");
                })
            } else {
                $(".alert").text(json.msg);
            }
        })
        .catch(err => console.log(err));
}

function rewardModal(e) {
    e.preventDefault();
    const $modal = $("#modal");
    const $form = $modal.find(".modal-body");
    $modal.modal('show')
    $form.on('submit', function (e) {
        e.preventDefault()
        sendData(e, $modal);
    });
    
}

$("#battle > form").on("submit", battle)
$("input[name=item]").on("click", equip)