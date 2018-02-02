
"use strict";


const PokerAlgorithm = require("./PokerAlgorithm");
const PokerPair = require("./PokerPair");
const ERROR_NO = 10010;
const GameStatus = {
            init:0,
            deal_pokers:1,
            call_score:2,
            set_banker:3,
            out_pokers:4,
            end:5
        };

class CommonLogic {

    /** 游戏配置初始化游戏
     * @param {gameId:xxx,roomId:xxx,baseScore:xxx} cfg 
     */
    constructor(cfg){
        //游戏状态
        this.status = GameStatus.init;
        //游戏id
        this.gameId = cfg.gameId;
        //房间号
        this.roomId = cfg.roomId;
        //底注
        this.baseScore = cfg.baseScore;
        //当前倍率
        this.rate = 1;
        //几副牌
        this.pairCount = 1;
        //几位玩家
        this.playerCount = 3;
        //发牌配置
        this.dealConfig = [17, 17, 17];
        
        //this.start();

    }

    //开始游戏
    start(){
        this.rate = 1;
        this.reStart = false;
        this.resetPokers();
        this.shufflePokers();
        this.dealPokers();
        this.startCallScore();
    }


    /**
     * 重置桌面牌
     */
    resetPokers(){
        //取牌牌池
        this.pokers = PokerAlgorithm.getPokersPair(this.pairCount);

        //桌面牌
        this.tablePokers = [];
        //手牌
        this.handCards = [
            [],[],[]
        ];
        //底牌信息
        this.lastPokers = [];
    }


    /**
     * 洗牌
     */
    shufflePokers(){
        PokerAlgorithm.shuffleArray(this.pokers);
    }


    /**
     * 发牌
     */
    dealPokers() {
        let deals = PokerAlgorithm.dealPoker(this.pokers, this.dealConfig);
        let res = deals.res;
        for (let i = 0 ; i < this.playerCount ; i++){
            this.handCards[i] = res[i];
        }
        this.pokers = deals.pokers;
        for(let i = 0 ; i < deals.left.length; i++){
            this.lastPokers.push(deals.left[i]);
        }
        this.status = GameStatus.deal_pokers;
    }

    /**
     * 叫分
     */
     startCallScore(){
        this.status = GameStatus.call_score;
        //庄家座位号
        this.banker = -1;
        //可叫分数
        this.validScore = [1,2,3];
        //玩家叫分情况
        this.callScores = [];
        for(let i = 0 ; i < this.playerCount ; i ++){
            this.callScores.push(0);
        }
        //第一个叫分玩家
        this.firstCall = Math.floor(Math.random()*this.playerCount());
        //当前叫分玩家
        this.callIndex = this.firstCall;
        //当前叫分次数
        this.callCount = 0;
        //最后叫牌玩家
        this.callLast  = -1;
     }

     /**
      * 叫分
      */
      callScore(sitId,score){
        if(sitId!=this.callIndex){
              return false;
        }
        if(score){
            if(PokerAlgorithm.isInArray(score, this.validScore)+1){
                PokerAlgorithm.rmArrayElement(this.validScore,score);
                this.callScores[sitId] = score;
                this.callLast = sitId;
            }else{
                if(this.callCount >= this.playerCount){
                    return false;
                }     
            }
        }
        this.callCount++;
        this.nextCall();
        return true;
      }

      //寻找下一个叫分玩家
      nextCall(){
        let i = PokerAlgorithm.isInArray(3,this.callScores);
        if(i+1){
            this.callIndex = -1;
            this.rate *= 3;
            this.setBanker(i); 
        }else{
            if(this.callCount == this.playerCount){
                if(PokerAlgorithm.allIsValue(0,this.callScores)){
                    //都不叫庄则重新开始
                    this.reStart = true;
                    //this.start();
                }else{
                    //选取最大的叫分庄家
                    let res = PokerAlgorithm.getMaxElement(this.callScores);
                    this.setBanker(res.index);
                    this.callIndex = -1;
                    this.rate *= res.value;
                    this.setBanker(res.index); 
                }
            }else{
                this.callIndex = (this.firstCall + this.callCount)%this.playerCount;
            }
        }
      }

    /**
     * 确定庄家
     */
    setBanker(banker){
        this.banker = banker;
        this.bankerGetLastPokers();
        this.startOut();
        this.status = GameStatus.set_banker;
    }

    /**
     * 庄家摸取底牌
     */
    bankerGetLastPokers(){
        while(this.tablePokers.length){
            this.handCards[this.banker].push(this.tablePokers.pop());
        }
    }

    startOut(){
        //第几轮
        this.outRoundCount = 0;
        //当前轮第一个出牌玩家
        this.firstOut = this.banker;
        //当前该出牌玩家
        this.outIndex = -1;
        //当前轮已出牌次数
        this.outCount = 0;

        //最后一手出牌
        this.lastOut = -1;
        this.lastOutPokers = [];
        this.nextOut();
        //当前最大是谁的牌
        this.maxIndex = -1;
        //当前最大牌组
        this.maxPokers = [];
        this.playersOutCount = [];

        for(let i = 0 ; i < this.playerCount ; i ++){
            this.playersOutCount.push(0);
        }

        //所有轮出牌信息
        this.allOutInfo = [];
        this.addRoundInfo();
    }

    /**
     * 添加本轮出牌消息
     */
    addRoundInfo(){
        let info = {
            first : this.firstOut,
            out :[]
        };
        for(let i = 0 ; i < this.playerCount ; i++){
            info.out.push([]);
        }
        this.allOutInfo.push(info);
    }

    /**
     * 获取下一个出牌玩家
     */
    nextOut(){
        this.outIndex = (this.firstOut + this.outCount)%this.playerCount;
    }

    /**
     * 出牌
     */
    outPokers(sitId, pokers){
        this.status = GameStatus.out_pokers;
        if(sitId!=this.outIndex){
            return false;
        }
        if(pokers.length){
            let res = PokerAlgorithm.checkOutPokers(this.maxPokers,pokers);
            if(res){
                this.maxIndex = sitId;
                this.maxPokers = pokers;
                PokerAlgorithm.rmAFromB(pokers, this.handCards[sitId]);
                let rate = this.getPokersRate(pokers);
                this.pokers *= rate;
                this.playersOutCount[sitId]++;
            }else{
                return false;
            }
        }
        //第一个玩家出牌不能为空
        if(sitId == this.firstOut && 0 == pokers.length){
            return false;
        }
        this.lastOut = sitId;
        this.lastOutPokers = pokers.concat();
        let len = this.allOutInfo.length;
        this.allOutInfo[len-1].out[sitId] = pokers.concat();
        this.outCount++;
        this.checkOut();
        this.checkGameEnd();
        return true;
    }

    /**
     * 检查当前轮是否结束
     */
    checkOut(){
        if(this.outCount == this.playerCount){
            this.nextRound();
        }else{
            this.nextOut();
        }
    }

    nextRound(){
        //第几轮
        this.outRoundCount++;
        //当前轮第一个出牌玩家
        this.firstOut = this.maxIndex;
        //当前该出牌玩家
        this.outIndex = -1;
        //当前轮已出牌次数
        this.outCount = 0;
        this.nextOut();
        //当前最大是谁的牌
        this.maxIndex = -1;
        //当前最大牌组
        this.maxPokers = [];
        this.addRoundInfo();
    }

    /**
     * 检查游戏是否结束
     */
    checkGameEnd(){
        for(let i = 0 ; i < this.playerCount ; i ++ ){
            if(0 == this.handCards[i].length){
                this.setWinner(i);
            }
        }
    }

    /**
     * 设置谁获胜
     */
     setWinner(sitId){
         this.status = GameStatus.end;
         this.result = {
             score:[]
         }
         if(this.checkSprings()){
             this.rate *= 2;
         }
        if(sitId == this.banker){
            for(let i = 0 ; i < this.playerCount ; i++){
                if(i==this.banker){
                    this.result.push(this.rate*2);
                }else{
                    this.result.push(-this.rate);
                }   
            }
        }else{
            for(let i = 0 ; i < this.playerCount ; i++){
                if(i==this.banker){
                    this.result.push(-this.rate*2);
                }else{
                    this.result.push(this.rate);
                }   
            }
        }
     }

     /**
      * 检查是否是春天 0 不是春天 1 春天 2 反春 
      */
      checkSprings(sitId){
        if(sitId == this.banker){
            let maxCount = 0;
            for(let i = 0 ; i < this.playerCount ; i++){
                if(i!=this.banker){
                    let count = this.playersOutCount[i];
                    maxCount = maxCount>count?maxCount:count;
                }
            }
            if(0 == maxCount){
                return 1;
            }
        }else{
            if(this.playersOutCount[this.banker]<2){
                return 2;
            }
        }
        return 0;
      }


    /**
     * 获取牌型的倍率
     */
    getPokersRate(pokers){
        let type = PokerAlgorithm.getPokersType(pokers).type;
        if(PokerPair.pokersType.zha_dan == type){
            return 2;
        }
        if(PokerPair.pokersType.huo_ji == type){
            return 2;
        }
        return 1;
    }


    /**
     * ------------------------------------
     * ---------------对外额外接口-----------
     * ------------------------------------
     */
    getHandCards(sitId){
        return this.handCards[sitId].concat();
    }

    getHideCards(sitId){
        let len = this.handCards[sitId].length;
        return PokerAlgorithm.getEmptyArray(len, 255);
    }

    getDealCards(sitId){
        let len = this.playerCount;
        let arr = [];
        for(let i = 0 ; i < len ; i ++ ){
            let cards = i==sitId?this.getHandCards(i):this.getHideCards(i);
            arr.push(cards);
        }
        return arr;
    }

    getAllCards(){
        let len = this.playerCount;
        let arr = [];
        for(let i = 0 ; i < len ; i ++ ){
            let cards = this.getHandCards(i);
            arr.push(cards);
        }
        return arr;
    }

    getCallScoreOpt(){
        return {
            seatId : this.callIndex,
            scores : this.validScore.concat(),
            timeout : 20
        }
    }

    getOutOpt(){
        return {
            seatId: this.outIndex,
            cardsPre: this.getCurrentOutInfo().out.concat(),
            cardsMax: this.maxPokers.concat(),
            timeout: 20
        }
    }

    getBankerLastCards(sitId){
        if(sitId==this.banker){
            return this.lastPokers.concat()
        }else {
            return PokerAlgorithm.getEmptyArray(this.lastPokers.length,255);
        }
    }

    getScores(){
        return this.result.score.concat();
    }

    getLastCallScore(){
        return {
            seatId : this.callLast,
            score : this.callScores[this.callLast]
        }
    }

    getLastOut(){
        return {
            seatId : this.lastOut,
            cards : this.lastOutPokers.concat()
        }
    }

    getCurrentOutInfo(){
        return this.allOutInfo[this.outRoundCount];
    }
}

module.exports.GameStatus = GameStatus;
module.exports.GameLogic = CommonLogic;

