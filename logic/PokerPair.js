/**
 * Author: Xiaoming
 * Contact: xiaominghe2014@gmail.com
 * Date:2018/1/19
 */

"use strict";

/**
 * 一副扑克牌定义
 */
class PokerPair {}

//54张
Object.defineProperty(PokerPair,"count",{
     get:function(){return 54},
     set:function(v){}
});


//扑克数组 3,4,5,6,7,8,9,10,J,Q,K,A,2
Object.defineProperty(PokerPair,"pokerArr",{
    get:function(){
         return [    0,1,2,3,4,5,6,7,8,9,10,11,12,
             13+0,13+1,13+2,13+3,13+4,13+5,13+6,13+7,13+8,13+9,13+10,13+11,13+12,
             26+0,26+1,26+2,26+3,26+4,26+5,26+6,26+7,26+8,26+9,26+10,26+11,26+12,
             39+0,39+1,39+2,39+3,26+4,39+5,39+6,39+7,39+8,39+9,39+10,39+11,39+12,
             52, 53];
    },
});


//单张权重
Object.defineProperty(PokerPair,"weightMap",{
    get:function(){
        return {
             '3':1,
            '4':2,
            '5':3,
            '6':4,
            '7':5,
            '8':6,
            '9':7,
            '10':8,
            'J':9,
            'Q':10,
            'K':11,
            'A':12,
            '2':13,
            'small':14,
            'big':15};
    },
});

//花色序号
Object.defineProperty(PokerPair,"colorIndex",{
     get:function(){
          return {'spade':0,'club':1,'heart':2,'diamond':3,'king':4};
     }
});


//扑克定义描述 spade-黑桃,club-梅花,heart-红桃,diamond-方块
Object.defineProperty(PokerPair,"pokerDesc",{
    get:function(){
        return ['spade_3','spade_4','spade_5','spade_6','spade_7','spade_8','spade_9','spade_10','spade_J','spade_Q','spade_K','spade_A','spade_2',
            'club_3','club_4','club_5','club_6','club_7','club_8','club_9','club_10','club_J','club_Q','club_K','club_A','club_2',
            'heart_3','heart_4','heart_5','heart_6','heart_7','heart_8','heart_9','heart_10','heart_J','heart_Q','heart_K','heart_A','heart_2',
            'diamond_3','diamond_4','diamond_5','diamond_6','diamond_7','diamond_8','diamond_9','diamond_10','diamond_J','diamond_Q','diamond_K','diamond_A','diamond_2',
            'king_small','king_big'];
    },
});


/**
 * 0单张 1
 * 1对子 2
 * 2火箭 2
 * 3三张 3
 * 4三带一 4
 * 5炸弹 4
 * 6三带二 5
 * 7顺子 >=5
 * 8连对 >=6 偶数 8 10 12 14 16 18 20
 * 9三顺 >=6 3的倍数 9 12 15 18
 * 10飞机单 >=8 4的倍数 12 16 20
 * 11 飞机双 >=10 5的倍数
 * 12四带二 6
 * 13 四带二对 8
 */
Object.defineProperty(PokerPair,"pokersType",{
    get:function(){
        return {
            dan_zh:0,
            dui_zi:1,
            huo_ji:2,
            san_zh:3,
            san_dai_1:4,
            zha_dan:5,
            san_dai_2:6,
            shun_zi:7,
            lian_dui:8,
            san_shun:9,
            fei_ji_dan:10,
            fei_ji_sh:11,
            si_dai_2:12,
            si_dai_2_dui:13
        };
    },
    set:function(v){}
});

module.exports = PokerPair;