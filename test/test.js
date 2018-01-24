"use strict";

String.prototype.format = function(args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if(args[key]!=undefined){
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    var reg= new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
}
const fs = require("fs");
const DdzLogic = require(__dirname + "/../logic/DdzLogic");
fs.readFile(__dirname + "/../config/cfg.json",'utf8',function (err,data) {
    if(err){
        console.log(err);
        return;
    }
    const cfg = JSON.parse(data);
    run(cfg);
});

const  run = function (cfg) {
    let logic = new DdzLogic(cfg);
    console.log(logic.getCardsName(logic.pokers));
    //
    logic.shufflePokers();
    console.log(logic.getCardsName(logic.pokers));
    //
    logic.dealPokers();
    logic.setGameBanker(0);
    for(let i = 0 ; i < logic.playerCount ; i++){
        console.log('----{0}----'.format(i));
        console.log(logic.getCardsName(logic.players[i].handCards));
    }

    //出牌
    while (!logic.isGameEnd()){
        logic.autoOut();
        console.log('---------------');
        for(let i = 0 ; i < logic.playerCount ; i++){
            console.log('----{0}----'.format(i));
            console.log(logic.getCardsName(logic.players[i].handCards));
        }
    }
};
