function ajaxUpgrade(e) {
    e.preventDefault();
    const data = $(e.target).serializeArray();
    console.log(data);
    const name = $('h1').text();
    const url = '/clans/' + name + "/details";
    Promise.resolve(
        $.ajax({
            url: "/ajax" + url,
            method: "POST",
            dataType: 'json',
            data
        })
    ).then(data => {
        if (data.success) {
            $('#data').load(url + " #data")
            $('#currGold').load(url + " #currGold", disablePurchase)
        }
    }).catch(err => {
        console.log(err);
    });
}

function disablePurchase() {
    const currGold = $("#currGold").text().split(" ")[1];
    const data = $(".data")
    for (var i = 0; i < data.length; i++) {
        var cost = $(data[i]).find(".cost").text();
        var upgrade = $(data[i]).find(".upgrade").text();
        if (currGold - cost < 0) {
            const btn = $("input[value="+ upgrade + "]").next("input[type=submit]")
            $(btn).addClass("btn-danger");
            $(btn).prop("disabled", true)
        }
    }
}

disablePurchase();
$("#data").on("submit", ajaxUpgrade)