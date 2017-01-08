function ajaxShop(e) {
    e.preventDefault();
    const data = $(e.target).serializeArray();
    const url = '/shop'
    console.log(data);
    Promise.resolve(
        $.ajax({
            url: "/ajax" + url,
            method: "POST",
            dataType: 'json',
            data
        })
    ).then(data => {
        if (data.success) {
            $("h1").text("Thank you for your purchase!")  
            $("#currGold").load("/shop #currGold", function() {
                $(".expense").text("");
            });
        } else {
            $("h1").text(data.errMsg);
        }
    }).catch(err => {
        console.log(err);
    });
}

$("form").on("submit", ajaxShop);

$(".data").on("mouseover", function(e) {
    const cost = $(this).find(".cost").text()
    const currGold = $("#currGold").text();
    const final = currGold - cost;
    $(".expense").text(" ( " + final + " )");
})

$(".data").on("mouseleave", function(e) {
    $(".expense").text("");
})