function donateGold() {
    let donation = Number($("input[name=donation]").val());  
    const gold = Number($("#gold").text());
    if(donation == "" || donation == "0") {
        $("#newGold").text("");
    } else {
        $("#newGold").text("( " + (gold - donation) + " )");
    }    
}

$("input[name=donation]").on("change", donateGold)
$("input[name=donation]").on("keyup", donateGold)