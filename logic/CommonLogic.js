
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
        }
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
        
        this.start();

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
        this.callScore = [];
        for(let i = 0 ; i < this.playerCount ; i ++){
            callScore.push(0);
        }
        //第一个叫分玩家
        this.firstCall = Math.floor(Math.random()*this.playerCount());
        //当前叫分玩家
        this.callIndex = this.firstCall;
        //当前叫分次数
        this.callCount = 0;
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
                this.callScore[sitId] = score;
            }else{
                if(callCount>=this.playerCount){
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
        let i = PokerAlgorithm.isInArray(3,this.callScore);
        if(i+1){
            this.callIndex = -1;
            this.rate *= 3;
            this.setBanker(i); 
        }else{
            if(callCount == this.playerCount){
                if(PokerAlgorithm.allIsValue(0,this.callScore)){
                    //都不叫庄则重新开始
                    this.reStart = true;
                    this.start();
                }else{
                    //选取最大的叫分庄家
                    let res = PokerAlgorithm.getMaxElement(this.callScore);
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
        this.firstOut = banker;
        //当前该出牌玩家
        this.outIndex = -1;
        //当前轮已出牌次数
        this.outCount = 0;
        this.nextOut();
        //当前最大是谁的牌
        this.maxIndex = -1;
        //当前最大牌组
        this.maxPokers = [];
        this.playersOutCount = [];
        for(let i = 0 ; i < this.playerCount ; i ++){
            this.playersOutCount.push(0);
        }
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
    }

    /**
     * 检查游戏是否结束
     */
    checkGameEnd(){
        for(let i = 0 ; i < this.playerCount ; i ++ ){
            if(0 == this.handCards[i].length){
                this.setWiner(i);
            }
        }
    }

    /**
     * 设置谁获胜
     */
     setWiner(sitId){
         this.status = GameStatus.end;
         this.result = {
             score:[]
         }
         if(this.checkSprings()){
             this.rate *= 2;
         }
        if(sitId == this.banker){
            for(let i = 0 ; i < this.playerCount ; i++){
                if(i==banker){
                    this.result.push(this.rate*2);
                }else{
                    this.result.push(-this.rate);
                }   
            }
        }else{
            for(let i = 0 ; i < this.playerCount ; i++){
                if(i==banker){
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
                if(i!=banker){
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
        if(PokerPair.type.pokersType.zha_dan == type){
            return 2;
        }
        if(PokerPair.type.pokersType.huo_ji == type){
            return 2;
        }
        return 1;
    }
}

module.exports.GameStatus = GameStatus;
module.exports.GameLogic = CommonLogic;