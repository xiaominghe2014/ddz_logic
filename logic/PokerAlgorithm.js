/**
 * Author: Xiaoming
 * Contact: xiaominghe2014@gmail.com
 * Date:2018/1/19
 */

"use strict";

const PokerPair = require("./PokerPair");
const ERROR_NO = 10010;
const ERROR_STR = 'WRONG';

//数组去重
const rmArrayRepeat = function (arr) {
    let hasMap = {}
    const loop = (list)=>{
        list.forEach((item, index) => {
            if (item instanceof Array) {
            loop(item)
        } else {
            if (!hasMap[item]) {
                hasMap[item] = 1
            } else {
                list.splice(index, 1)
            }
        }
    })
    }
    loop(arr)
}

class PokerAlgorithm {}



/**-----------------------------------
 *
 *   基本函数  begin
 * -----------------------------------
 */

//单张牌名称
PokerAlgorithm.pokerName = function(value,flag=false){
    if(value<PokerPair.count&&value>=0)
    {
        let des = PokerPair.pokerDesc[value];
        if(flag){
            des = des.replace('spade_','️♠');
            des = des.replace('club_','♣');
            des = des.replace('heart_','♥');
            des = des.replace('diamond_','♦');
        }
        return des;
    }
    return ERROR_STR;
};

//单张牌花色 spade-黑桃,club-梅花,heart-红桃,diamond-方块
PokerAlgorithm.pokerColor = function(value){
    if(value<PokerPair.count&&value>=0)
    {
        let des = PokerPair.pokerDesc[value];
        let color =  des.split('_')[0];
        return color;
    }
    return ERROR_STR;
};

//扑克花色序号
PokerAlgorithm.colorIndex = function (value) {
    if(value<PokerPair.count&&value>=0)
    {
        let des = PokerPair.pokerDesc[value];
        let color =  des.split('_')[0];
        let index = PokerPair.colorIndex[color];
        return index;
    }
    return ERROR_NO;
};

//单张牌值 3,4,5,6,7,8,9,10,J,Q,K,A,2
PokerAlgorithm.pokerValue = function(value){
    if(value<PokerPair.count&&value>=0)
    {
        let des = PokerPair.pokerDesc[value];
        let value =  des.split('_')[1];
        return value;
    }
    return ERROR_STR;
};

//单张牌大小
PokerAlgorithm.pokerWeight = function(value){
    if(value<PokerPair.count&&value>=0)
    {
        let des = PokerPair.pokerDesc[value];
        let v =  des.split('_')[1];
        let weight = PokerPair.weightMap[v];
        return weight;
    }
    return ERROR_NO;
};

/**
 * 获得扑克牌
 * @param pairCount 几副
 * @returns {Array}
 */
PokerAlgorithm.getPokersPair = function(pairCount) {
    let pair = [];
    while (pairCount--)
    {
        pair = pair.concat(PokerPair.pokerArr);
    }
    return pair;
};


/**
 * 数组随机排序
 * @param array
 * @returns {array}
 */
PokerAlgorithm.shuffleArray = function (array) {
    let len = array.length;
    for (let i = len-1 ; i>=0 ; i--){
        let randomIndex = Math.floor(Math.random()*(i+1));
        let tmp = array[randomIndex];
        array[randomIndex] = array[i];
        array[i] = tmp;
    }
    return array;
};

/***
 * 发牌
 * @param pokers    发牌的牌堆
 * @param dealConfig 发牌配置[]每个人发牌的数目
 * @return{Object}
 */
PokerAlgorithm.dealPoker = function (pokers, dealConfig) {
    let playerLen = dealConfig.length;
    let res = [];
    let cardsMaxCount = dealConfig[0];
    for (let i = 0 ; i <playerLen ; i ++ ){
        res.push([]);
        cardsMaxCount = dealConfig[i]>cardsMaxCount?dealConfig[i]:cardsMaxCount;
    }
    for (let j = 0 ; j< cardsMaxCount; j++){
        let currentLen = playerLen;
        while(currentLen--)
        {
            if(res.length<dealConfig[currentLen]
            &&pokers.length)
                res[currentLen].push(pokers.pop());
        }
    }
    let left = [];
    while(pokers.length){
        left.push(pokers.pop());
    }
    return {
        res:res,
        pokers:pokers,
        left:left
    };
};


//扑克类型权值
Object.defineProperty(PokerAlgorithm,"pokerTypeWeight",{
    get:function(){
        return [
            1,1,100,1,1,50,1,1,1,1,1,1,1,1
        ];
    },
    set:function(v){}
});
/**-----------------------------------
 *
 *   基本函数  end
 * -----------------------------------
 */



/**-----------------------------------
 *
 *   工具函数  begin
 * -----------------------------------
 */

PokerAlgorithm.getPokerWeightInfo = function(pokers){
    let info = [
        0,
        0,0,0,0,0,
        0,0,0,0,0,
        0,0,0,0,0
    ];
    let len = pokers.length;
    for (let i = 0 ; i < len ; i++){
        let w = this.pokerWeight(pokers[i]);
        info[w]++;
    }
    return info;
}

//从数组b删除a
PokerAlgorithm.rmAFromB = function(a,b){
    for(let e in a){
        PokerAlgorithm.rmArrayElement(b,a[e]);
    }
}


PokerAlgorithm.getPokersWeight = function(pokers){
    let len = pokers.length;
    let res = [];
    for (let i = 0 ; i < len ; i++){
        res.push(this.pokerWeight(pokers[i]));
    }
    return res;
}

/**-----------------------------------
 *
 *   工具函数  end
 * -----------------------------------
 */




/**-----------------------------------
 *
 *   牌型判断函数  begin
 * -----------------------------------
 */

/**
 * 删除数组指定元素
 * @param arr
 * @param e
 */
PokerAlgorithm.rmArrayElement = function (arr, e) {
    let index = arr.indexOf(e);
    if(-1<index)
        arr.splice(index,1)
}

/**
 * 是否为顺子
 * @param pokers
 * @return {boolean}
 */
PokerAlgorithm.isShunzi = function (pokers) {
    let len = pokers.length;
    if(len>4&&len<13){
        let lastWeight = this.pokerWeight(pokers[len-1]);
        if(13>lastWeight){
            let pW = this.getPokersWeight(pokers);
            //0,1,2,3...len
            let count = len ;
            for (let i = 1; i < count ; i++){
                if(pW[i-1]+1 == pW[i]){
                    continue;
                }else {
                    return false;
                }
            }
            return {
                flag : true,
                weight : pW[0]
            }
        }
    }
    return false;
};

/**
 * 连对判断
 * @param pokers
 * @return {boolean}
 */
PokerAlgorithm.isLianDui = function(pokers){
    let len = pokers.length;
    if(0==len%2&&5<len&&25>len){
        let lastWeight = this.pokerWeight(pokers[len-1]);
        if(13>lastWeight){
            let wInfo = this.getPokerWeightInfo(pokers);
            let pW = this.getPokersWeight(pokers);
            //0,2,4,6...len
            let count = len / 2;
            for (let i = 2; i < count ; i+=2){
                if( 2 == wInfo[pW[i-2]] &&
                    2 == wInfo[pW[i]] &&
                    pW[i-2]+1 == pW[i]){
                    continue;
                }else {
                    return false;
                }
            }
            return {
                flag : true,
                weight : pW[0]
            }
        }
    }
    return false;
}

/**
 * 三顺判断
 * @param pokers
 * @return {boolean}
 */
PokerAlgorithm.isSanShun = function (pokers) {
    let len = pokers.length;
    if(0==len%3&&len>5){
        let lastWeight = this.pokerWeight(pokers[len-1]);
        if(13>lastWeight){
            let wInfo = this.getPokerWeightInfo(pokers);
            let pW = this.getPokersWeight(pokers);
            //0,3,6,9...len
            let count = len / 3;
            for (let i = 0; i < count-1 ; i++){
                if( 3 == wInfo[pW[i*3]] &&
                    pW[i*3]+1 == pW[i*3+3]){
                    continue;
                }else {
                    return false;
                }
            }
            return {
                flag : true,
                weight : pW[0]
            }
        }
    }
    return false;
}


/**
 * 二连飞机带单 8
 * @param pokers
 * @return {boolean}
 */
PokerAlgorithm.isFeiJiDan2Lian = function(pokers){
    let len = pokers.length;
    if(8==len){
        let wInfo = this.getPokerWeightInfo(pokers);
        let pW = this.getPokersWeight(pokers);
        //1 2 333 444
        //1 222 333 4
        //111 222 3 4
        let index = [
            [2,5],
            [1,4],
            [0,3]
        ];
        let wIndex = [];
        for (let m = 0 ; m < 3 ; m++){
            let wArr = [];
            for (let n = 0 ; n < 2 ; n++){
                wArr.push(pW[index[m][n]]);
            }
            wIndex.push(wArr);
        }
        for(let i = 0 ; i < 3 ; i ++ ){
            let info = wIndex[i];
            if( info[1]<13&&
                3<=wInfo[info[0]]&&
                3<=wInfo[info[0]+1]){
                return {
                    flag : true,
                    weight : info[0]
                }
            }
        }
    }
    return false;
}


/**
 * 三连飞机带单 12
 * @param pokers
 * @return {boolean}
 */
PokerAlgorithm.isFeiJiDan3Lian = function(pokers){
    let len = pokers.length;
    if(12==len){
        let wInfo = this.getPokerWeightInfo(pokers);
        let pW = this.getPokersWeight(pokers);
        //1 2 3 444 555 666
        //1 2 333 444 555 6
        //1 222 333 444 5 6
        //111 222 333 4 5 6
        let index = [
            [3,6,9],
            [2,5,8],
            [1,4,7],
            [0,3,6]
        ];
        let wIndex = [];
        for (let m = 0 ; m< 4 ; m++){
            let wArr = [];
            for (let n = 0 ; n < 3 ; n++){
                wArr.push(pW[index[m][n]]);
            }
            wIndex.push(wArr);
        }
        for(let i = 0 ; i < 4 ; i ++ ){
            let info = wIndex[i];
            if( info[2]<13 &&
                3<=wInfo[info[0]]&&
                3<=wInfo[info[0]+1]&&
                3<=wInfo[info[0]+2]){
                return {
                    flag : true,
                    weight : info[0]
                }
            }
        }
    }
    return false;
}

/**
 * 4连飞机带单 16
 * @param pokers
 * @return {boolean}
 */
PokerAlgorithm.isFeiJiDan4Lian = function(pokers){
    let len = pokers.length;
    if(16==len){
        let wInfo = this.getPokerWeightInfo(pokers);
        let pW = this.getPokersWeight(pokers);
        //1 2 3 4 555 666 777 888
        //1 2 3 444 555 666 777 8
        //1 2 333 444 555 666 7 8
        //1 222 333 444 555 6 7 8
        //111 222 333 444 5 6 7 8
        let index = [
            [4,7,10,13],
            [3,6,9,12],
            [2,5,8,11],
            [1,4,7,10],
            [0,3,6,9]
        ];
        let wIndex = [];
        for (let m = 0 ; m< 5 ; m++){
            let wArr = [];
            for (let n = 0 ; n < 4 ; n++){
                wArr.push(pW[index[m][n]]);
            }
            wIndex.push(wArr);
        }
        for (let i = 0 ; i < 5 ; i++){
            let info = wIndex[i];
            if( info[3]<13 &&
                3<=wInfo[info[0]]&&
                3<=wInfo[info[0]+1]&&
                3<=wInfo[info[0]+2]&&
                3<=wInfo[info[0]+3]){
                return {
                        flag:true,
                        weight:info[0]
                }
            }
        }
    }
    return false;
}


/**
 * 5连飞机带单 20
 * @param pokers
 * @return {boolean}
 */
PokerAlgorithm.isFeiJiDan5Lian = function(pokers){
    let len = pokers.length;
    if(20==len){
        let wInfo = this.getPokerWeightInfo(pokers);
        let pW = this.getPokersWeight(pokers);
        //1 2 3 4 5 666 777 888 999 xxx
        //1 2 3 4 555 666 777 888 999 x
        //1 2 3 444 555 666 777 888 9 x
        //1 2 333 444 555 666 777 8 9 x
        //1 222 333 444 555 666 7 8 9 x
        //111 222 333 444 555 6 7 8 9 x
        let index = [
            [5,8,11,14,17],
            [4,7,10,13,16],
            [3,6,9,12,15],
            [2,5,8,11,14],
            [1,4,7,10,13],
            [0,3,6,9,12]
        ];
        let wIndex = [];
        for (let m = 0 ; m< 6 ; m++){
            let wArr = [];
            for (let n = 0 ; n < 5 ; n++){
                wArr.push(pW[index[m][n]]);
            }
            wIndex.push(wArr);
        }

        for (let i = 0 ; i < 6 ; i++){
            let info = wIndex[i];
            if( info[4]<13 &&
                3 <= wInfo[info[0]]&&
                3 <= wInfo[info[0]+1]&&
                3 <= wInfo[info[0]+2]&&
                3 <= wInfo[info[0]+3]&&
                3 <= wInfo[info[0]+4]){
                return {
                    flag : true,
                    weight : info[0]
                }
            }
        }
    }
    return false;
}


/**
 * 二连飞机带对 10
 * @param pokers
 * @return {boolean}
 */
PokerAlgorithm.isFeiJiSh2Lian = function(pokers){
    let len = pokers.length;
    if(10==len){
        let wInfo = this.getPokerWeightInfo(pokers);
        let pW = this.getPokersWeight(pokers);
        //11 22 333 444
        //11 222 333 44
        //111 222 33 44
        let index = [
            [4,7,0,2],
            [2,5,0,8],
            [0,3,6,8]
        ];
        let wIndex = [];
        for (let m = 0 ; m < 3 ; m++){
            let wArr = [];
            for (let n = 0 ; n < 4 ; n++){
                wArr.push(pW[index[m][n]]);
            }
            wIndex.push(wArr);
        }
        for (let i = 0 ; i < 3 ; i ++){
            let info = wIndex[i];
            if( info[1]<13&&
                3 == wInfo[info[0]]&&
                3 == wInfo[info[1]]&&
                2 == wInfo[info[2]]&&
                2 == wInfo[info[3]]
            ){
                if(info[0]+1==info[1]){
                    return {
                        flag: true,
                        weight:info[0]
                    }
                }
            }
        }
    }
    return false;
}

/**
 * 3连飞机带对 15
 * @param pokers
 * @return {boolean}
 */
PokerAlgorithm.isFeiJiSh3Lian = function(pokers){
    let len = pokers.length;
    if(15==len){
        let wInfo = this.getPokerWeightInfo(pokers);
        let pW = this.getPokersWeight(pokers);
        let slInfo = [
            //11 22 33 444 555 666
            [6,9,12,0,2,4],
            //11 22 333 444 555 66
            [4,7,10,0,2,13],
            //11 222 333 444 55 66
            [2,5,8,0,11,13],
            //111 222 333 44 55 66
            [0,3,6,9,11,13]
        ];

        for(let i = 0 ; i < 4 ; i++){
            let indexI = slInfo[i];
            if( pW[indexI[2]]<13&&
                3==wInfo[pW[indexI[0]]]&&
                3==wInfo[pW[indexI[1]]]&&
                3==wInfo[pW[indexI[2]]]){

                if( pW[indexI[0]]+1==pW[indexI[1]]&&
                    pW[indexI[1]]+1==pW[indexI[2]]){

                    if( pW[indexI[3]]==pW[indexI[3]+1]&&
                        pW[indexI[4]]==pW[indexI[4]+1]&&
                        pW[indexI[5]]==pW[indexI[5]+1]){
                        return {
                            flag : true,
                            weight : pW[indexI[0]]
                        }
                    }
                }
            }
        }
    }
    return false;
}


/**
 * 4连飞机带对 20
 * @param pokers
 * @return {boolean}
 */
PokerAlgorithm.isFeiJiSh4Lian = function(pokers){
    let len = pokers.length;
    if(20==len){
        let wInfo = this.getPokerWeightInfo(pokers);
        let pW = this.getPokersWeight(pokers);
        //11 22 33 44 555 666 777 888
        //11 22 33 444 555 666 777 88
        //11 22 333 444 555 666 77 88
        //11 222 333 444 555 66 77 88
        //111 222 333 444 55 66 77 88
        let index = [
            [8,11,14,17, 0,2,4,6],
            [6,9, 12,15, 0,2,4,18],
            [4,7, 10,13, 0,2,16,18],
            [2,5, 8, 11, 0,14,16,18],
            [0,3, 6, 9,  12,14,16,18]
        ];
        let wIndex = [];
        for (let m = 0 ; m< 5 ; m++){
            let wArr = [];
            for (let n = 0 ; n < 8 ; n++){
                wArr.push(pW[index[m][n]]);
            }
            wIndex.push(wArr);
        }
        for (let i = 0 ; i < 5 ; i ++ ){
            let info = wIndex[i];
            if( info[3]<13&&
                3 == wInfo[info[0]]&&
                3 == wInfo[info[1]]&&
                3 == wInfo[info[2]]&&
                3 == wInfo[info[3]]&&

                2 == wInfo[info[4]]&&
                2 == wInfo[info[5]]&&
                2 == wInfo[info[6]]&&
                2 == wInfo[info[7]]){
                if( info[0]+1 == info[1] &&
                    info[1]+1 == info[2] &&
                    info[2]+1 == info[3]){
                    return {
                        flag : true,
                        weight : info[0]
                    }
                }
            }
        }
    }
    return false;
}


/**
 * 4带2
 * @param pokers
 * @return {boolean}
 */
PokerAlgorithm.is4Dai2 = function(pokers){
    let len = pokers.length;
    if(6==len){
        let w1 = this.pokerWeight(pokers[0]);
        let w2 = this.pokerWeight(pokers[1]);
        let w3 = this.pokerWeight(pokers[2]);
        let w4 = this.pokerWeight(pokers[3]);
        let w5 = this.pokerWeight(pokers[4]);
        let w6 = this.pokerWeight(pokers[5]);
        //1 2 3333
        if(w3==w6){
            return {
                flag : true,
                weight : w3
            }
        }
        //1 2222 3
        if(w2==w5){
            return {
                flag : true,
                weight : w2
            }
        }
        //1111 2 3
        if(w1==w4){
            return {
                flag : true,
                weight : w1
            }
        }
    }
    return false;
}

/**
 * 4带2对
 * @param pokers
 * @return {boolean}
 */
PokerAlgorithm.is4Dai2Dui = function (pokers) {
    let len = pokers.length;
    if(8==len){
        let w1 = this.pokerWeight(pokers[0]);
        let w2 = this.pokerWeight(pokers[1]);
        let w3 = this.pokerWeight(pokers[2]);
        let w4 = this.pokerWeight(pokers[3]);
        let w5 = this.pokerWeight(pokers[4]);
        let w6 = this.pokerWeight(pokers[5]);
        let w7 = this.pokerWeight(pokers[6]);
        let w8 = this.pokerWeight(pokers[7]);
        //11 22 3333
        if(w5==w8&&w1==w2&&w3==w4){
            return {
                flag:true,
                weight:w5
            }
        }
        //11 2222 33
        if(w3==w6&&w1==w2&&w7==w8){
            return {
                flag:true,
                weight:w3
            }
        }
        //1111 22 33
        if(w1==w4&&w5==w6&&w7==w8){
            return {
                flag:true,
                weight:w1
            }
        }
    }
    return false;
}
/**-----------------------------------
 *
 *   牌型判断函数  end
 * -----------------------------------
 */




/**
 * 核心函数 - 返回牌型信息
 * @param pokers
 * @return {Object}
 * {
 *   cards:牌组,
 *   type:牌型,
 *   typeWeight:牌型权值,
 *   weight:本牌型类的权值
 *   repeated:牌型重复次数
 * }
 */
PokerAlgorithm.getPokersType = function (pokers) {
    pokers.sort(function(a,b){
        return PokerAlgorithm.pokerWeight(a)-PokerAlgorithm.pokerWeight(b);
    });
    let res = {
        cards:pokers,
        type:ERROR_NO,
        typeWight:0,
        weight:0,
        repeated:1
    }
    let len = pokers.length;
    if(0==len) return res;
    let w1 = this.pokerWeight(pokers[0]);
    res.weight = w1;

    if (1==len) {
        res.type =  PokerPair.pokersType.dan_zh;
        res.typeWight = this.pokerTypeWeight[res.type];
        return res;
    }
    let w2 = this.pokerWeight(pokers[1]);

    if (2==len){
        if(w1 == w2){
            res.type =  PokerPair.pokersType.dui_zi;
            res.typeWight = this.pokerTypeWeight[res.type];
        }
        if(14==w1&&15==w2){
            res.type =  PokerPair.pokersType.huo_ji;
            res.typeWight = this.pokerTypeWeight[res.type];
        }
        return res;
    }
    let w3 = this.pokerWeight(pokers[2]);
    if(3==len){
        if(w1==w3){
            res.type =  PokerPair.pokersType.san_zh;
            res.typeWight = this.pokerTypeWeight[res.type];
        }
        return res;
    }
    let w4 = this.pokerWeight(pokers[3]);
    if(4==len){
        if(w1==w4){
            res.type =  PokerPair.pokersType.zha_dan;
            res.typeWight = this.pokerTypeWeight[res.type];
        }
        else if((w1==w3)
        ||(w2==w4)){
            res.type =  PokerPair.pokersType.san_dai_1;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = w2;
        }
        return res;
    }
    let w5 = this.pokerWeight(pokers[4]);
    if(5==len){
        if((w1==w3&&w4==w5)
        ||(w1==w2&&w3==w5)){
            res.type =  PokerPair.pokersType.san_dai_2;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = w3;
        }
        else if(this.isShunzi(pokers)){
            res.type =  PokerPair.pokersType.shun_zi;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = w1;
            res.repeated = len;
        }
        return res;
    }

    if(6==len){
        //顺子，连对，三顺，4带2
       if(this.isShunzi(pokers)){
           res.type =  PokerPair.pokersType.shun_zi;
           res.typeWight = this.pokerTypeWeight[res.type];
           res.weight = w1;
           res.repeated = len;
       }
       else if(this.isLianDui(pokers)){
           res.type =  PokerPair.pokersType.lian_dui;
           res.typeWight = this.pokerTypeWeight[res.type];
           res.weight = w1;
           res.repeated = len/2;
       }
       else if(this.isSanShun(pokers)){
           res.type =  PokerPair.pokersType.san_shun;
           res.typeWight = this.pokerTypeWeight[res.type];
           res.weight = w1;
           res.repeated = len/3;
       }
       else if(this.is4Dai2(pokers)){
           res.type =  PokerPair.pokersType.si_dai_2;
           res.typeWight = this.pokerTypeWeight[res.type];
           res.weight = w3;
       }
       return res;
    }

    if(7==len){
        if(this.isShunzi(pokers)){
            res.type =  PokerPair.pokersType.shun_zi;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = w1;
            res.repeated = len;
        }
        return res;
    }

    if(8==len){
        //顺子 连对 二连飞机(单) 4带2对
        if(this.isShunzi(pokers)){
            res.type =  PokerPair.pokersType.shun_zi;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = w1;
            res.repeated = len;
        }
        if(this.isLianDui(pokers)){
            res.type =  PokerPair.pokersType.lian_dui;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = w1;
            res.repeated = len/2;
        }
        let dai2Dui = this.is4Dai2Dui(pokers);
        if(dai2Dui){
            res.type = PokerPair.pokersType.si_dai_2_dui;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = dai2Dui.weight;
            //4带2优于飞机
            return res;
        }
        let feiJ = this.isFeiJiDan2Lian(pokers);
        if(feiJ){
            res.type =  PokerPair.pokersType.fei_ji_dan;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = feiJ.weight;
            res.repeated = len/4;
        }
        //4带2优于飞机
        return res;
    }

    if(9==len){
        if(this.isShunzi(pokers)){
            res.type =  PokerPair.pokersType.shun_zi;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = w1;
            res.repeated = len;
        }
        else if(this.isSanShun(pokers)){
            res.type =  PokerPair.pokersType.san_shun;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = w1;
            res.repeated = len/3;
        }
        return res;
    }
    if(10==len){
        //顺子 连对 二连飞机(双)
        if(this.isShunzi(pokers)){
            res.type =  PokerPair.pokersType.shun_zi;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = w1;
            res.repeated = len;
        }
        if(this.isLianDui(pokers)){
            res.type =  PokerPair.pokersType.lian_dui;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = w1;
            res.repeated = len/2;
        }
        let feiJ = this.isFeiJiSh2Lian(pokers)
        if(feiJ){
            res.type = PokerPair.pokersType.fei_ji_sh;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = feiJ.weight;
            res.repeated = len/5;
        }
        return res;
    }
    if(11==len){
        if(this.isShunzi(pokers)){
            res.type =  PokerPair.pokersType.shun_zi;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = w1;
            res.repeated = len;
        }
        return res;
    }
    if(12==len){
        //顺子 连对 三顺 3连飞机单
        if(this.isShunzi(pokers)){
            res.type =  PokerPair.pokersType.shun_zi;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = w1;
            res.repeated = len;
        }
        if(this.isLianDui(pokers)){
            res.type =  PokerPair.pokersType.lian_dui;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = w1;
            res.repeated = len/2;
        }
        //三顺优于飞机
        if(this.isSanShun(pokers)){
            res.type =  PokerPair.pokersType.san_shun;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = w1;
            res.repeated = len/3;
            return res;
        }
        let feiJ = this.isFeiJiDan3Lian(pokers);
        if(feiJ){
            res.type = PokerPair.pokersType.fei_ji_dan;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = feiJ.weight;
            res.repeated = len /4;
        }
        return res;
    }
    if(13==len){
        return res;
    }
    if(14==len){
        if(this.isLianDui(pokers)){
            res.type =  PokerPair.pokersType.lian_dui;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = w1;
            res.repeated = len/2;
        }
        return res;
    }
    if(15==len){
        //三顺 三连飞机(双)
        if(this.isSanShun(pokers)){
            res.type =  PokerPair.pokersType.san_shun;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = w1;
            res.repeated = len/3;
        }
        let feiJ = this.isFeiJiSh3Lian(pokers);
        if(feiJ){
            res.type = PokerPair.pokersType.fei_ji_sh;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = feiJ.weight;
            res.repeated = len/5;
        }
        return res;
    }
    if(16==len){
        //连对 4连飞机(单)
        if(this.isLianDui(pokers)){
            res.type =  PokerPair.pokersType.lian_dui;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = w1;
            res.repeated = len/2;
        }
        let feiJ = this.isFeiJiDan4Lian(pokers);
        if(feiJ){
            res.type = PokerPair.pokersType.fei_ji_dan;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = feiJ.weight;
            res.repeated = len /4;
        }
        return res;
    }
    if(17==len){
        return res;
    }
    if(18==len){
        if(this.isLianDui(pokers)){
            res.type =  PokerPair.pokersType.lian_dui;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = w1;
            res.repeated = len/2;
        }
        if(this.isSanShun(pokers)){
            res.type =  PokerPair.pokersType.san_shun;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = w1;
            res.repeated = len/3;
        }
        return res;
    }
    if(19==len){
        return res;
    }
    if(20==len){
        //连对 5连飞机单 4连飞机双
        if(this.isLianDui(pokers)){
            res.type =  PokerPair.pokersType.lian_dui;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = w1;
            res.repeated = len/2;
        }
        let feiJdan = this.isFeiJiDan5Lian(pokers);
        if(feiJdan){
            res.type = PokerPair.pokersType.fei_ji_dan;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = feiJdan.weight;
            res.repeated = len /4;
        }
        let feiJsh = this.isFeiJiSh4Lian(pokers);
        if(feiJsh){
            res.type = PokerPair.pokersType.fei_ji_sh;
            res.typeWight = this.pokerTypeWeight[res.type];
            res.weight = feiJsh.weight;
            res.repeated = len /5;
        }
    }
    return res;
};

/**
 *  * 出牌合法性判断 *
 * @param preOut  上一手出牌
 * @param currentOut 这一手出牌
 * @return{boolean} 非法,返回false，否则返回true
 */
PokerAlgorithm.checkOutPokers = function (prePokers, currentPokers) {
    let preOut = this.getPokersType(prePokers);
    let currentOut = this.getPokersType(currentPokers);
    let preType = preOut.type;
    let curType = currentOut.type;
    if(ERROR_NO!=curType){
        if(preType!=curType){
            if(currentOut.typeWight>preOut.typeWight) {
                return true;
            }else {
                let lenPre = prePokers.length;
                let currentPokers = currentPokers.length;
                if(lenPre==currentPokers){
                    if(8 == lenPre && PokerPair.pokersType.pokersType.fei_ji_dan==preType){
                           let feiJi = this.isFeiJiDan2Lian(currentPokers);
                           if(feiJi){
                               if(feiJi.weight>preOut.weight){
                                   return true;
                               }
                           }
                    }
                    if(12 == lenPre && PokerPair.pokersType.pokersType.fei_ji_dan==preType){
                        let feiJi = this.isFeiJiDan3Lian(currentPokers);
                        if(feiJi){
                            if(feiJi.weight>preOut.weight){
                                return true;
                            }
                        }
                    }
                }
            }
        }else {
            if(preOut.repeated == currentOut.repeated &&
                currentOut.weight>preOut.weight){
                return true;
            }
        }
    }
    return false;
};


module.exports = PokerAlgorithm;

