/**
 * Author: Xiaoming
 * Contact: xiaominghe2014@gmail.com
 * Date:2017/01/22
 */

"use strict";

class Replay {}

Object.defineProperty(Replay,"replayCode",{value:"1000000"});

Object.defineProperty(Replay,"tableNumber",{value:"666666"});

Object.defineProperty(Replay,"gamRule",{value:0});

Object.defineProperty(Replay,"getBanker",{
    value:{
        grabScore:[],//按照座位号，每个玩家都叫分数
        banker:-1 //庄
    }
});

Object.defineProperty(Replay,"outInfo",{value:[]}); //每个玩家出牌信息

//结束输赢得分
Object.defineProperty(Replay,"Result",{
    value:{
          score:[],

        }
});
