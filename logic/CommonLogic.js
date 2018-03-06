
"use strict";


const PokerAlgorithm = require("./PokerAlgorithm");
const PokerPair = require("./PokerPair");
const ERROR_NO = 10010;
const DEFAULT_CARD = 54;
const GameStatus = {
            init:0,
            deal_pokers:1,
            call_score:2,
            set_banker:3,
            out_pokers:4,
            end:5
        };

const PlayerOpt = {
    CALL_SCORE:0,
    OUT:1,
    OTHER:2
}


class CommonLogic {

    /** 游戏配置初始化游戏
     * @param {gameId:xxx,roomId:xxx,baseScore:xxx} cfg 
     */
    constructor(cfg){
        this.cfg = cfg;
        //游戏状态
        this.status = GameStatus.init;
        //本局游戏标志
        this.gameToken = cfg.gameToken;
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
        //重新叫分次数
        this.startCallCount = 0;

        //玩家uid校验
        this.seats = cfg.seats;
        for(let k in this.seats){
            //this.seats[k].id -=1;
            this.seats[k].isCheckToken = false;
            this.seats[k].sleepTime = 20e3
            this.seats[k].lastLive = null
            this.seats[k].isNoteCards = false
        }
        this.seats.sort(function (a,b) {
            return a.id-b.id;
        });

        //操作时间
        this.optTime = 0;
        let self = this;
        this.timer = setInterval(function(){
            if(self.optTime>0){
                self.optTime--;
            }
            if(!!self.outTimeCall){
                if(0 == self.optTime && GameStatus.out_pokers==self.status){
                    self.optTime = 50;
                    self.outTimeCall(PlayerOpt.OUT,self.gameToken);
                }else if(0 == self.optTime && GameStatus.call_score==self.status){
                    self.optTime = 50;
                    self.outTimeCall(PlayerOpt.CALL_SCORE,self.gameToken);
                }
            }
        },1e3);
        this.initData();
        this.resetPokers();
    }



    //开始游戏
    start(){
        this.initData();
        this.resetPokers();
        this.shufflePokers();
        this.dealPokers();
        this.startCallScore();
    }

    /**
     * 初始化一些数据
     */
    initData(){
        this.rate = 1;
        this.reStart = false;
        //庄家座位号
        this.banker = -1;
        //可叫分数
        this.validScore = [];
        //玩家叫分情况
        this.callScores = [];

        //第一个叫分玩家


        this.firstCall = -1;
        //当前叫分玩家
        this.callIndex = -1;
        //当前叫分次数
        this.callCount = 0;
        //最后叫牌玩家
        this.callLast  = -1;


        //第几轮
        this.outRoundCount = 0;
        //当前轮第一个出牌玩家
        this.firstOut = -1;
        //当前该出牌玩家
        this.outIndex = -1;
        //当前轮已出牌次数
        this.outCount = 0;

        //最后一手出牌
        this.lastOut = -1;
        this.lastOutPokers = [];
        //当前最大是谁的牌
        this.maxIndex = -1;
        //当前最大牌组
        this.maxPokers = [];
        this.playersOutCount = [];
        //所有轮出牌信息
        this.allOutInfo = [];

        //已过人数
        this.passCount = 0;

        let cfg = this.cfg;
        this.replayData = {
            roomId:this.roomId,
            tableId:cfg.tableId,
            gameId:cfg.gameId,
            gameToken:cfg.gameToken,
            seats:[],
            banker:-1,
            handCards:[],
            lastCards:[],
            outInfos:[],
            callScores:[]
        };

        for(let i = 0 ; i < this.playerCount ; i++){
            this.replayData.seats.push({
                id:this.seats[i].id,
                uid:this.seats[i].uid,
                score:0
            });
            this.replayData.callScores.push(0);
        }
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
            this.replayData.handCards.push({
                seatId:i,
                cards:res[i].concat()
            });
        }
        this.pokers = deals.pokers;
        for(let i = 0 ; i < deals.left.length; i++){
            this.lastPokers.push(deals.left[i]);
        }
        this.replayData.lastCards = deals.left.concat();
        this.status = GameStatus.deal_pokers;
    }

    /**
     * 叫分
     */
     startCallScore(){
        this.startCallCount++;
        this.status = GameStatus.call_score;
        //可叫分数
        this.validScore = [1,2,3];
        //玩家叫分情况
        this.callScores = [];
        for(let i = 0 ; i < this.playerCount ; i ++){
            this.callScores.push(0);
        }

        //第一个叫分玩家
        this.firstCall = Math.floor(Math.random()*this.playerCount);
        //当前叫分玩家
        this.callIndex = this.firstCall;
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
        }else {
            this.callScores[sitId] = score;
            this.callLast = sitId;
        }
        this.replayData.callScores[sitId] = score;
        this.optTime = 50;
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
                    if(this.startCallCount>2){
                        this.setBanker(this.callIndex);
                    }else {
                        //都不叫庄则重新开始
                        this.reStart = true;
                    }
                    //this.start();
                }else{
                    //选取最大的叫分庄家
                    let res = PokerAlgorithm.getMaxElement(this.callScores);
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
        this.replayData.banker = banker;
        this.callIndex = -1;
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
        console.log('out seatId',sitId);
        console.log('out Value',pokers);
        if(PokerAlgorithm.getElementType(pokers)!='Array'){
            return false;
        }
        if(pokers.length){
            let pLen = pokers.length
            while (pLen){
                if(PokerAlgorithm.getElementType(pokers[pLen-1]) != 'Number'){
                    return false;
                }
                pLen--;
            }
        }
        PokerAlgorithm.printPokers(pokers);
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
                this.rate *= rate;
                this.playersOutCount[sitId]++;
            }else{
                return false;
            }
        }
        //第一个玩家出牌不能为空
        let len = this.getCurrentOutInfo().out.length
        if(0 == len && sitId == this.firstOut && 0 == pokers.length){
            return false;
        }
        if(0 == pokers.length){
            this.passCount++;
        }else {
            this.passCount = 0;
        }
        this.lastOut = sitId;
        this.lastOutPokers = pokers.concat();
        this.allOutInfo[this.allOutInfo.length-1].out.push({seatId:sitId,cards:pokers.concat()});
        this.outCount++;
        this.checkOut();
        this.checkGameEnd();
        this.replayData.outInfos.push({seatId:sitId,cards:pokers.concat()});
        this.optTime = 50;
        return true;
    }

    /**
     * 检查当前轮是否结束
     */
    checkOut(){
        if(2 == this.passCount){
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
        this.passCount = 0;
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
         clearInterval(this.timer);
         this.status = GameStatus.end;
         this.result = {
             score:[]
         }
         if(this.checkSprings()){
             this.rate *= 2;
             this.rate *= this.baseScore;
         }
        if(sitId == this.banker){
            for(let i = 0 ; i < this.playerCount ; i++){
                if(i==this.banker){
                    this.result.score.push(this.rate*2);
                }else{
                    this.result.score.push(-this.rate);
                }   
            }
        }else{
            for(let i = 0 ; i < this.playerCount ; i++){
                if(i==this.banker){
                    this.result.score.push(-this.rate*2);
                }else{
                    this.result.score.push(this.rate);
                }   
            }
        }

        for(let i = 0 ; i < this.playerCount ; i++){
             this.replayData.seats[i].score = this.result.score[i];
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
     * 判断座位号是否有效
     * @param sid
     * @return {boolean}
     */
    isValidSeatId(sid){
        return -1<sid && this.playerCount>sid;
    }


    /**
     * ------------------------------------
     * ---------------对外额外接口-----------
     * ------------------------------------
     */
    getHandCards(sitId){
        if(this.isValidSeatId(sitId)){
            return this.handCards[sitId].concat();
        }
        return [];
    }

    getHideCards(sitId){
        if(this.isValidSeatId(sitId)){
            let len = this.handCards[sitId].length;
            return PokerAlgorithm.getEmptyArray(len, DEFAULT_CARD);
        }
        return [];
    }

    getDealCards(sitId){
        let arr = [];
        if(this.isValidSeatId(sitId)){
            let len = this.playerCount;
            for(let i = 0 ; i < len ; i ++ ){
                let cards = i==sitId?this.getHandCards(i):this.getHideCards(i);
                arr.push(cards);
            }
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
            scores : [].concat(this.validScore),
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
        if(this.isValidSeatId(sitId)){
            if(sitId==this.banker){
                return this.lastPokers.concat()
            }else {
                return PokerAlgorithm.getEmptyArray(this.lastPokers.length,DEFAULT_CARD);
            }
        }
        return PokerAlgorithm.getEmptyArray(this.lastPokers.length,DEFAULT_CARD);
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
        if(!!this.allOutInfo){
            if(this.allOutInfo.length){
                return this.allOutInfo[this.outRoundCount];
            }
        }
        return {first : -1,out :[]};
    }

    getAutoOut(sitId){
        if(this.isValidSeatId(sitId)){
            let tips = PokerAlgorithm.outTips(this.maxPokers,this.handCards[sitId])
            if(tips.length>0) return tips[0];
            return [];
        }
        return [];
    }

    hasUid(uid){
        for(let i = 0 ; i < this.playerCount ; i++){
            if(this.seats[i].uid == uid){
                return true;
            }
        }
        return false;
    }

    /**
     * 检查重连
     * @param token
     * @param uid
     * @return {*}
     */
    isReconnected(token, uid){
        for(let i = 0 ; i < this.playerCount ; i++){
            if(token == this.gameToken&&
                this.seats[i].uid == uid ){
                return this.seats[i].sleepTime>10e3;
            }
        }
        return false;
    }

    /**
     * 玩家token校验
     * 会话绑定
     */
    checkToken(token,uid,session){
        for(let i = 0 ; i < this.playerCount ; i++){
            if(token == this.gameToken&&
                this.seats[i].uid == uid){
                this.seats[i].isCheckToken = true;
                this.seats[i].session = session;
                if(this.seats[i].lastLive){
                    this.seats[i].sleepTime = new Date().getTime()-this.seats[i].lastLive
                }
                this.seats[i].lastLive = new Date().getTime()
                return i;
            }
        }
        return -1;
    }

    /**
     * 是否全部连接就绪
     * @return {boolean}
     */
    isAllChecked(){
        for(let i = 0 ; i < this.playerCount ; i++){
            if(this.seats[i].isCheckToken){
                continue;
            }else {
                return false;
            }
        }
        return true;
    }

    /**
     * 获取记牌器数据
     */
    getNoteCards(seatId){
        let res = []
        if(this.isValidSeatId(seatId)){
            for(let i = 0 ; i < this.playerCount ; i++){
                if(i!=seatId)
                    res = res.concat(this.handCards[i])
            }
            res.sort(PokerAlgorithm.sort)
        }
        return res
    }

    /**
     * 设置启动记牌器数据
     * @param seatId
     */
    launchNoteCards(seatId){
        if(this.isValidSeatId(seatId)){
            this.seats[seatId].isNoteCards = true
        }
    }


    /**
     * 获取启动了记牌器的座位号
     * @return {Array}
     */
    getNoteCardsSeatIds(){
        let res = []
        for(let i = 0 ; i < this.playerCount ; i++){
            if(this.seats[i].isNoteCards){
                res.push(i)
            }
        }
        return res
    }

}

module.exports.GameStatus = GameStatus;
module.exports.PlayerOpt = PlayerOpt;
module.exports.GameLogic = CommonLogic;

