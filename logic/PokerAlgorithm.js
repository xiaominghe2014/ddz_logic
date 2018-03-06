/**
 * Author: Xiaoming
 * Contact: xiaominghe2014@gmail.com
 * Date:2018/1/19
 */

"use strict";

if(typeof (String.prototype.format)=='undefined'){
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
                        //var reg = new RegExp("({[" + i + "]})", "g");//这个在索引大于9时会有问题，谢谢何以笙箫的指出
                        var reg= new RegExp("({)" + i + "(})", "g");
                        result = result.replace(reg, arguments[i]);
                    }
                }
            }
        }
        return result;
    }
}

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

/**
 * 元素是否在数组内
 * @param {*}value
 * @param {Array} arr
 * @return {Boolean}
 */
PokerAlgorithm.isInArray = function(value, arr){
    let len = arr.length;
    for(let i = 0 ; i < len ; i ++ ){
        if(value == arr[i]) return i;
    }
    return -1;
}

PokerAlgorithm.allIsValue = function(value, arr){
    let len = arr.length;
    for(let i = 0 ; i < len ; i ++ ){
        if(value != arr[i]) return false;
    }
    return true;
}


PokerAlgorithm.getMaxElement = function(arr){
    let len = arr.length;
    let res = {
        index:-1,
        value:0
    }
    for(let i = 0 ; i < len ; i ++ ){
        if(arr[i]>res.value){
            res.value = arr[i];
            res.index = i;
        }
    }
    return res;
}

PokerAlgorithm.getEmptyArray = function(len,defaultValue=0){
    return [...Array(len)].map(_=>defaultValue);
}

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
    //做牌标记
    let make = true;
    if(make){
        return PokerAlgorithm.makeCards(pokers)
    }else {
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
    }
};

/**
 * 做牌
 * @param pokers
 * @return {{res: *[], pokers: *[], left: *[]}}
 */
PokerAlgorithm.makeCards = function (pokers) {
    return {
        res:[[3,4,5,6,7,8,9,10,11,13+3,13+4,13+5,13+6,13+7,13+8,13+9,13+10],[
            0,13,1,13+1,2,13+2,26,26+1,26+2,26+3,26+4,12,13+12,26+12,39+12,52,53
        ],[    26+7,26+8,26+9,26+10,26+11,
            39+0,39+1,39+2,39+3,26+4,39+5,39+6,39+7,39+8,39+9,39+10,39+11]],
        pokers:[13+11,
            26+5,26+6],
        left:[13+11,
            26+5,26+6]
    };
}


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


PokerAlgorithm.getPokerWeightMessage = function(pokers){
    let info = [
        0,
        0,0,0,0,0,
        0,0,0,0,0,
        0,0,0,0,0
    ];
    let cards = [
        [],
        [],[],[],[],[],
        [],[],[],[],[],
        [],[],[],[],[]
    ]
    let len = pokers.length;
    for (let i = 0 ; i < len ; i++){
        let w = this.pokerWeight(pokers[i]);
        info[w]++;
        cards[w].push(pokers[i])
    }
    return {info:info,cards:cards};
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
    if(0 == prePokers.length){
        if(ERROR_NO!=curType){
            return true;
        }
    }
    if(ERROR_NO!=curType){
        if(preType!=curType){
            if(currentOut.typeWight>preOut.typeWight) {
                return true;
            }else {
                let lenPre = prePokers.length;
                let lenCurrentPokers = currentPokers.length;
                if(lenPre==lenCurrentPokers){
                    if(8 == lenPre && PokerPair.pokersType.fei_ji_dan==preType){
                           let feiJi = this.isFeiJiDan2Lian(currentPokers);
                           if(feiJi){
                               if(feiJi.weight>preOut.weight){
                                   return true;
                               }
                           }
                    }
                    if(12 == lenPre && PokerPair.pokersType.fei_ji_dan==preType){
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


PokerAlgorithm.sort = function(a,b){
    return PokerAlgorithm.pokerWeight(b)-PokerAlgorithm.pokerWeight(a);
};


PokerAlgorithm.printPokers = function(pokers){
    let cards = pokers.concat();
    let str = '';
    for(let v of cards){
        str += '\t'+PokerAlgorithm.pokerName(v,true)
    }
    console.log(str)
    return str
};


/**
 * 出牌提示
 * @param maxOutPokers
 * @param handPokers
 * @return {Array}
 */
PokerAlgorithm.outTips = function (maxOutPokers, handPokers) {
    let len = maxOutPokers.length
    let tips = [];
    if(0==len){
        return PokerAlgorithm.getDanZh(handPokers);
    }
    let maxInfo = PokerAlgorithm.getPokersType(maxOutPokers);
    let type = maxInfo.type
    switch (type){
        case PokerPair.pokersType.dan_zh:
            return PokerAlgorithm.getDanZhTips(maxInfo, handPokers);
        case PokerPair.pokersType.dui_zi:
            return PokerAlgorithm.getDuiZiTips(maxInfo, handPokers);
        case PokerPair.pokersType.san_zh:
            return PokerAlgorithm.getSanZhTips(maxInfo, handPokers);
        case PokerPair.pokersType.san_dai_1:
            return PokerAlgorithm.getSanDai1Tips(maxInfo, handPokers);
        case PokerPair.pokersType.zha_dan:
            return PokerAlgorithm.getZhaDanTips(maxInfo, handPokers);
        case PokerPair.pokersType.san_dai_2:
            return PokerAlgorithm.getSanDai2Tips(maxInfo, handPokers);
        case PokerPair.pokersType.shun_zi:
            return PokerAlgorithm.getShunZiTips(maxInfo, handPokers);
        case PokerPair.pokersType.lian_dui:
            return PokerAlgorithm.getLianDuiTips(maxInfo, handPokers);
        case PokerPair.pokersType.san_shun:
            return PokerAlgorithm.getSanShunTips(maxInfo, handPokers);
        case PokerPair.pokersType.fei_ji_dan:
            return PokerAlgorithm.getFeiJiDanTips(maxInfo, handPokers);
        case PokerPair.pokersType.fei_ji_sh:
            return PokerAlgorithm.getFeiJiShTips(maxInfo, handPokers);
        case PokerPair.pokersType.si_dai_2:
            return PokerAlgorithm.getSiDai2Tips(maxInfo, handPokers);
        case PokerPair.pokersType.si_dai_2_dui:
            return PokerAlgorithm.getSiDai2DuiTips(maxInfo, handPokers);
    }
    return tips;
}


PokerAlgorithm.getDanZhTips = function(maxInfo, handPokers){
    let tips = []
    let weight = maxInfo.weight;
    let len = handPokers.length
    for(let i = 0; i<len ; i++){
        let w = PokerAlgorithm.pokerWeight(handPokers[i]);
        if(w>weight){
            tips.push([handPokers[i]]);
        }
    }
    tips = tips.concat(PokerAlgorithm.getTypeTips(maxInfo.typeWight,handPokers));
    return tips;
}


PokerAlgorithm.getDuiZiTips = function(maxInfo, handPokers){
    let tips = []
    let duizi = PokerAlgorithm.getDuiZi(handPokers)
    let len = duizi.length;
    for(let i = 0 ; i < len ; i++){
        let duiziW = PokerAlgorithm.pokerWeight(duizi[i][0]);
        if(duiziW>maxInfo.weight)
            tips.push(duizi[i]);
    }
    tips = tips.concat(PokerAlgorithm.getTypeTips(maxInfo.typeWight,handPokers));
    return tips;
}

PokerAlgorithm.getSanZhTips = function(maxInfo, handPokers){
    let tips = []
    let sanzh = PokerAlgorithm.getSanZhang(handPokers)
    let len = sanzh.length;
    for(let i = 0 ; i < len ; i++){
        let w = PokerAlgorithm.pokerWeight(sanzh[i][0]);
        if(w>maxInfo.weight)
            tips.push(sanzh[i]);
    }
    tips = tips.concat(PokerAlgorithm.getTypeTips(maxInfo.typeWight,handPokers));
    return tips;
}

PokerAlgorithm.getSanDai1Tips = function(maxInfo, handPokers){
    let tips = []
    let sandai1 = PokerAlgorithm.getSanDai1(handPokers);
    let len = sandai1.length;
    for(let i = 0 ; i < len ; i++){
        let w = PokerAlgorithm.pokerWeight(sandai1[i][0]);
        if(w>maxInfo.weight)
            tips.push(sandai1[i]);
    }
    tips = tips.concat(PokerAlgorithm.getTypeTips(maxInfo.typeWight,handPokers));
    return tips;
}


PokerAlgorithm.getZhaDanTips = function(maxInfo, handPokers){
    let tips = []
    let zhadan = PokerAlgorithm.getZhaDan(handPokers);
    let len = zhadan.length
    for(let i = 0 ; i< len ; i++){
        let w = PokerAlgorithm.pokerWeight(zhadan[i][0]);
        if(w>maxInfo.weight)
            tips.push(zhadan[i])
    }
    tips = tips.concat(PokerAlgorithm.getTypeTips(maxInfo.typeWight,handPokers));
    return tips;
}


PokerAlgorithm.getSanDai2Tips = function(maxInfo, handPokers){
    let tips = []
    let sandai2 = PokerAlgorithm.getSanDai1(handPokers);
    let len = sandai2.length;
    for(let i = 0 ; i < len ; i++){
        let w = PokerAlgorithm.pokerWeight(sandai2[i][0]);
        if(w>maxInfo.weight)
            tips.push(sandai2[i]);
    }
    tips = tips.concat(PokerAlgorithm.getTypeTips(maxInfo.typeWight,handPokers));
    return tips;
}


PokerAlgorithm.getShunZiTips = function(maxInfo, handPokers){
    let tips = []
    let weight = maxInfo.weight;
    let len = maxInfo.repeated;
    let handTmp = [].concat(handPokers);
    let msg = PokerAlgorithm.getPokerWeightMessage(handTmp);
    let count = 0;
    let tip = [];
    for(let i = weight+1 ; i < 13 ; i++){
        if(msg.info[i]){
            count++;
            tip.push(msg.cards[i][0]);
            if(len == count){
                tips.push(tip);
                break;
            }
        }else {
            if(count){
                count = 0;
                tip = [];
            }
        }
    }
    tips = tips.concat(PokerAlgorithm.getTypeTips(maxInfo.typeWight,handPokers));
    return tips;
}


PokerAlgorithm.getLianDuiTips = function(maxInfo, handPokers){
    let tips = []
    let weight = maxInfo.weight;
    let len = maxInfo.repeated;
    let handTmp = [].concat(handPokers);
    let msg = PokerAlgorithm.getPokerWeightMessage(handTmp);
    let count = 0;
    let tip = [];
    for(let i = weight+1 ; i < 13 ; i++){
        if(2<=msg.info[i]){
            count++;
            tip = tip.concat([msg.cards[i][0],msg.cards[i][1]]);
            if(len == count){
                tips.push(tip);
                break;
            }
        }else {
            if(count){
                count = 0;
                tip = [];
            }
        }
    }
    tips = tips.concat(PokerAlgorithm.getTypeTips(maxInfo.typeWight,handPokers));
    return tips;
}


PokerAlgorithm.getSanShunTips = function(maxInfo, handPokers){
    let tips = []
    let weight = maxInfo.weight;
    let len = maxInfo.repeated;
    let handTmp = [].concat(handPokers);
    let msg = PokerAlgorithm.getPokerWeightMessage(handTmp);
    let count = 0;
    let tip = [];
    for(let i = weight+1 ; i < 13 ; i++){
        if(3<=msg.info[i]){
            count++;
            tip = tip.concat([msg.cards[i][0],msg.cards[i][1],msg.cards[i][2]]);
            if(len == count){
                tips.push(tip);
                break;
            }
        }else {
            if(count){
                count = 0;
                tip = [];
            }
        }
    }
    tips = tips.concat(PokerAlgorithm.getTypeTips(maxInfo.typeWight,handPokers));
    return tips;
}

PokerAlgorithm.getFeiJiDanTips = function(maxInfo, handPokers){
    let tips = []
    tips = tips.concat(PokerAlgorithm.getFeiJiDan(maxInfo, handPokers))
    tips = tips.concat(PokerAlgorithm.getTypeTips(maxInfo.typeWight,handPokers));
    return tips;
}


PokerAlgorithm.getFeiJiShTips = function(maxInfo, handPokers){
    let tips = []
    tips = tips.concat(PokerAlgorithm.getFeiJiSh(maxInfo, handPokers))
    tips = tips.concat(PokerAlgorithm.getTypeTips(maxInfo.typeWight,handPokers));
    return tips;
}


PokerAlgorithm.getSiDai2Tips = function(maxInfo, handPokers){
    let tips = []
    let sidai2 = PokerAlgorithm.getSiDai2(handPokers);
    let weight = maxInfo.weight;
    let len = sidai2.length;
    for(let i = 0 ; i < len ; i++){
        if(PokerAlgorithm.pokerWeight(sidai2[i][0])>weight){
            tips.push(sidai2[i]);
        }
    }
    tips = tips.concat(PokerAlgorithm.getTypeTips(maxInfo.typeWight,handPokers));
    return tips;
}

PokerAlgorithm.getSiDai2DuiTips = function(maxInfo, handPokers){
    let tips = []
    let sidai2Dui = PokerAlgorithm.getSiDai2Dui(handPokers);
    let weight = maxInfo.weight;
    let len = sidai2Dui.length;
    for(let i = 0 ; i < len ; i++){
        if(PokerAlgorithm.pokerWeight(sidai2Dui[i][0])>weight){
            tips.push(sidai2Dui[i]);
        }
    }
    tips = tips.concat(PokerAlgorithm.getTypeTips(maxInfo.typeWight,handPokers));
    return tips;
}

PokerAlgorithm.getTypeTips = function (weight, handPokers) {
    let tips = []
    let zhadanW = PokerAlgorithm.pokerTypeWeight[PokerPair.pokersType.zha_dan]
    if(weight<zhadanW){
        let zhadan = PokerAlgorithm.getZhaDan(handPokers);
        if(zhadan.length){
            tips = tips.concat(zhadan);
        }
    }
    let huo_jian = PokerAlgorithm.getHuoJian(handPokers)
    if(huo_jian.length){
        tips.push(huo_jian)
    }
    return tips;
}


PokerAlgorithm.getFeiJiDan = function(maxInfo,handPokers) {
    let wMax = maxInfo.weight;
    let len = maxInfo.repeated;
    let tips = [];
    let handTmp = [].concat(handPokers);
    let msg = PokerAlgorithm.getPokerWeightMessage(handTmp);
    let count = 0;
    for (let i = wMax; i < 14; i++) {
        let tip = []
        if (3 <= msg.info[i]) {
            tip = tip.concat([msg.cards[i][0],msg.cards[i][1],msg.cards[i][2]]);
            count++;
            if(len==count){
                let hand2 = PokerAlgorithm.rmAFromB(tip,[].concat(handPokers));
                let msg2 = PokerAlgorithm.getPokerWeightMessage(hand2);
                let l = 0;
                for(let j = 0 ; j < 16 ; j++){
                    let cl = msg2.info[j]
                    for(let k = 0 ; k < cl ; k++){
                        tip.push(msg2.cards[j][k])
                        l++;
                        if(l==len){
                            tips.push(tip)
                            break;
                        }
                    }
                }
            }
        }else {
            count = 0;
            tip = [];
        }
    }
    return tips;
}


PokerAlgorithm.getFeiJiSh = function(maxInfo,handPokers) {
    let wMax = maxInfo.weight;
    let len = maxInfo.repeated;
    let tips = [];
    let handTmp = [].concat(handPokers);
    let msg = PokerAlgorithm.getPokerWeightMessage(handTmp);
    let count = 0;
    for (let i = wMax; i < 14; i++) {
        let tip = []
        if (3 <= msg.info[i]) {
            tip = tip.concat([msg.cards[i][0],msg.cards[i][1],msg.cards[i][2]]);
            count++;
            if(len==count){
                let hand2 = PokerAlgorithm.rmAFromB(tip,[].concat(handPokers));
                let msg2 = PokerAlgorithm.getPokerWeightMessage(hand2);
                let l = 0;
                for(let j = 0 ; j < 16 ; j++){
                    let cl = msg2.info[j]
                    if(4 == cl){
                        tip.push(msg2.cards[j][0])
                        tip.push(msg2.cards[j][1])
                        l++;
                        if(l==len){
                            tips.push(tip)
                            break;
                        }
                        tip.push(msg2.cards[j][2])
                        tip.push(msg2.cards[j][3])
                        l++;
                        if(l==len){
                            tips.push(tip)
                            break;
                        }
                    }
                    if(2<=cl){
                        tip.push(msg2.cards[j][0])
                        tip.push(msg2.cards[j][1])
                        l++;
                        if(l==len){
                            tips.push(tip)
                            break;
                        }
                    }
                }
            }
        }else {
            count = 0;
            tip = [];
        }
    }
    return tips;
}


PokerAlgorithm.getSiDai2Dui =  function(handPokers){
    let tips = [];
    let handTmp = [].concat(handPokers);
    let msg = PokerAlgorithm.getPokerWeightMessage(handTmp);
    for(let i = 0 ; i < 14 ; i++){
        if(4 == msg.info[i]){
            let tip = [msg.cards[i][0],msg.cards[i][1],msg.cards[i][2],msg.cards[i][3]];
            for(let j = 0 ; j < 16 ; j++){
                if(i!=j){
                    if(4==msg.info[j]){
                        tip = tip.concat([msg.cards[j][0],msg.cards[j][1],msg.cards[j][2],msg.cards[j][3]])
                        tips.push(tip);
                        break;
                    }
                    if(2<=msg.info[j]){
                        for(let k = 0 ; k < 16 ; k++){
                            if(i!=j&&i!=k&&j!=k&&2==msg.info[k]){
                                tip = tip.concat([msg.cards[j][0],msg.cards[j][1]]);
                                tip = tip.concat([msg.cards[k][0],msg.cards[k][1]]);
                                tips.push(tip);
                                break;
                            }
                        }
                        if(8 == tip.length){
                            break;
                        }
                    }
                }
            }
        }
    }
    return tips;
}


PokerAlgorithm.getSiDai2 =  function(handPokers){
    let tips = [];
    let handTmp = [].concat(handPokers);
    let msg = PokerAlgorithm.getPokerWeightMessage(handTmp);
    for(let i = 0 ; i < 14 ; i++){
        if(4 == msg.info[i]){
            let tip = [msg.cards[i][0],msg.cards[i][1],msg.cards[i][2],msg.cards[i][3]];
            for(let j = 0 ; j < 16 ; j++){
                if(i!=j){
                    if(2<=msg.info[j]){
                        tip = tip.concat([msg.cards[j][0],msg.cards[j][1]])
                        tips.push(tip);
                        break;
                    }
                    if(1==msg.info[j]){
                        for(let k = 0 ; k < 16 ; k++){
                            if(i!=j&&i!=k&&j!=k&&msg.info[k]){
                                tip.push(msg.cards[j][0]);
                                tip.push(msg.cards[k][0]);
                                tips.push(tip);
                                break;
                            }
                        }
                        if(6 == tip.length){
                            break;
                        }
                    }
                }
            }
        }
    }
    return tips;
}


PokerAlgorithm.getSanDai2 =  function(handPokers){
    let tips = [];
    let handTmp = [].concat(handPokers);
    let msg = PokerAlgorithm.getPokerWeightMessage(handTmp);
    for(let i = 0 ; i < 14 ; i++){
        if(3 <= msg.info[i]){
            for(let j = 0 ; j < 16 ; j++){
                if(i!=j&&2<=msg.info[j]){
                    tips.push([msg.cards[i][0],msg.cards[i][1],msg.cards[i][2],msg.cards[j][0],msg.cards[j][1]]);
                    break;
                }
            }
        }
    }
    return tips;
}


PokerAlgorithm.getSanDai1 =  function(handPokers){
    let tips = [];
    let handTmp = [].concat(handPokers);
    let msg = PokerAlgorithm.getPokerWeightMessage(handTmp);
    for(let i = 0 ; i < 14 ; i++){
        if(3 <= msg.info[i]){
            for(let j = 0 ; j < 16 ; j++){
                if(i!=j&&msg.info[j]){
                    tips.push([msg.cards[i][0],msg.cards[i][1],msg.cards[i][2],msg.cards[j][0]]);
                    break;
                }
            }
        }
    }
    return tips;
}

PokerAlgorithm.getSanZhang = function (handPokers) {
    let tips = [];
    let handTmp = [].concat(handPokers);
    let msg = PokerAlgorithm.getPokerWeightMessage(handTmp);
    for(let i = 0 ; i < 14 ; i++){
        if(3 <= msg.info[i]){
            tips.push([msg.cards[i][0],msg.cards[i][1],msg.cards[i][2]]);
        }
    }
    return tips;
}

PokerAlgorithm.getDuiZi = function (handPokers) {
    let tips = [];
    let handTmp = [].concat(handPokers);
    let msg = PokerAlgorithm.getPokerWeightMessage(handTmp);
    for(let i = 0 ; i < 14 ; i++){
        if(2 <= msg.info[i]){
            tips.push([msg.cards[i][0],msg.cards[i][1]]);
        }
    }
    return tips;
}

PokerAlgorithm.getZhaDan = function(handPokers){
    let tips = [];
    let handTmp = [].concat(handPokers);
    let msg = PokerAlgorithm.getPokerWeightMessage(handTmp);
    for(let i = 0 ; i < 14 ; i++){
        if(4 == msg.info[i]){
            tips.push(msg.cards[i][0]);
        }
    }
    return tips;
}

PokerAlgorithm.getHuoJian = function (handPokers) {
    let handTmp = [].concat(handPokers);
    let msg = PokerAlgorithm.getPokerWeightMessage(handTmp);
    if(msg.info[14]&&msg.info[15]){
        return [52,53];
    }
    return[]
}

PokerAlgorithm.getDanZh = function (handPokers){
    let tips = [];
    let handTmp = [].concat(handPokers);
    let len = handTmp.length
    for(let i = 0; i<len ; i++){
        tips.push([handPokers[i]]);
    }
    return tips;
}


PokerAlgorithm.sortOut = function(outPokers){
    outPokers.sort(PokerAlgorithm.sort);
    let info = PokerAlgorithm.getPokersType(outPokers);
    let type = info.type
    let tmp = [].concat(outPokers)
    let res = []
    let weight = info.weight
    let len = info.repeated
    let msg = PokerAlgorithm.getPokerWeightMessage(tmp);
    let count = 0;
    switch (type){
        case PokerPair.pokersType.san_dai_1:
        case PokerPair.pokersType.san_dai_2:
            for(let i = 0 ; i < tmp.length ; i++){
                let w = PokerAlgorithm.pokerWeight(tmp[i]);
                if(w==weight){
                    res.push(tmp[i]);
                    count++;
                    if(3==count) break;
                }
            }
            PokerAlgorithm.rmAFromB(res,tmp);
            res = res.concat(tmp);
            return res;
        case PokerPair.pokersType.si_dai_2:
        case PokerPair.pokersType.si_dai_2_dui:
            for(let i = 0 ; i < tmp.length ; i++){
                let w = PokerAlgorithm.pokerWeight(tmp[i]);
                if(w==weight){
                    res.push(tmp[i]);
                    count++;
                    if(4==count) break;
                }
            }
            PokerAlgorithm.rmAFromB(res,tmp);
            res = res.concat(tmp);
            return res;
        case PokerPair.pokersType.fei_ji_dan:
        case PokerPair.pokersType.fei_ji_sh:
            for(let i = weight ; i < len + weight ; i ++){
                let cards = [msg.cards[i][0],msg.cards[i][1],msg.cards[i][2]]
                res = res.concat(cards);
            }
            PokerAlgorithm.rmAFromB(res,tmp);
            res = res.concat(tmp);
            return res;
    }
    return outPokers;
}


PokerAlgorithm.getElementType = function(e){
    return Object.prototype.toString.call(e);
}

// let arr = PokerAlgorithm.sortOut([14,27,15,28,2])
// console.log(arr)
module.exports = PokerAlgorithm;

