/**
 * Author: Xiaoming
 * Contact: xiaominghe2014@gmail.com
 * Date:2017/1/19
 */

"use strict";


const PokerAlgorithm = require("./PokerAlgorithm");
const PokerPair = require("./PokerPair");
const ERROR_NO = 10010;
class DdzLogic {

    //gameId 游戏编号id, pairCount 几副牌 playerCount 斗地主人数
    constructor(config){
        this.pairCount = config.pairCount;
        this.playerCount = config.playerCount;
        this.dealConfig = config.dealConfig;
        //牌池
        this.pokers = PokerAlgorithm.getPokersPair(this.pairCount);
        this.players = [];
        for (let i = 0 ; i < this.playerCount ; i++){
            this.players.push({});
        }
        this.tableLeftPokers = [];
        /**
         * sitId 上一个出牌玩家座位号 currentIdx 第几回合出牌 outIdx 本回合第几个出牌 pokers 出牌组 type 牌型
         * @type {{sitId: number, currentIdx: number, outIdx: number, pokers: Array, type: number}}
         */
        this.preOutInfo = {
            sitId:-1,
            currentIdx:-1,
            outIdx:-1,
            pokers:[],
            type:PokerPair.pokersType.dan_zh
        }; //前一个出牌牌组,包含信息 牌型，牌组
        this.preOutSitId = -1;
        this.gameBanker = -1;       //庄
        this.tableOwner = -1; //房主
        this.bankerGetCount = 3;//发牌后庄额外获取牌数
        this.outSitId = -1;
        this.passOutCount = 0;
        this.outIndex = 0;
        /**
         *@desc 和结算分数相关
         *@param baseScore 底分 multiple 倍率
         */
        this.baseScore = 1;
        this.multiple = 1;
    }


    // 1.设置房主
    setTableOwner(owner){
        this.tableOwner = owner;
    }

    // 2. 洗牌
    shufflePokers(){
        PokerAlgorithm.shuffleArray(this.pokers);
    }

    // 3.发牌
    dealPokers() {
        let deals = PokerAlgorithm.dealPoker(this.pokers, this.dealConfig);
        let res = deals.res;
        for (let i = 0 ; i < this.playerCount ; i++){
            this.players[i].handCards = res[i];
        }
        this.pokers = deals.pokers;
        this.tableLeftPokers = deals.left;
    }

    // 4. 叫分数
    grabScore(sitId, score){

    }

    // 5. 定庄/根据叫分情况而定
    setGameBanker(banker){
        this.gameBanker = banker;
        this.dealBanker();
        this.outSitId = banker;
        this.preOutSitId = banker;
    }

    /**
     *  6 出牌
     * @param pokers 所出手牌
     * @param outIndex 本轮第几个出牌
     * @param who 谁出牌
     */
    outPokers(pokers,outIndex,who){
        if(0 == pokers.length) {
            this.passOutCount++;
            if(this.passOutCount+1 == this.playerCount){
                this.outIndex = 0;
                this.passOutCount=0;
                this.outSitId = this.preOutInfo.sitId;
            }else {
                this.outIndex++;
                this.outSitId = this.getOutPokersSitId();
            }
        }else {

            let cur = PokerAlgorithm.getPokersType(pokers);
            if(ERROR_NO == cur.type){
                //非法操作
                return;
            }else {
                if(outIndex){
                    let canOut = PokerAlgorithm.checkOutPokers(this.preOutInfo.pokers,pokers);
                    if(!canOut){
                        //非法操作
                        return;
                    }
                }
                PokerAlgorithm.rmAFromB(pokers,this.players[who].handCards);
                this.preOutSitId=who;
                this.outIndex++;
                this.outSitId = this.getOutPokersSitId();
                this.preOutInfo.sitId = who;
                this.preOutInfo.outIndex = outIndex;
                this.preOutInfo.pokers = pokers;
            }

        }
    }

    //7 结算
    getResult(){
        return {}
    }

    dealBanker(){
        let count = this.bankerGetCount;
        while (count--){
            this.players[this.gameBanker].handCards.push(this.tableLeftPokers.pop());
        };
        for(let i = 0 ; i < this.playerCount ; i++){
            this.sortCards(this.players[i].handCards);
        }
    }

    getNextSitId(sitId){
        return (sitId+1)%this.playerCount;
    }

    getOutPokersSitId(){
        if(0==this.outIndex)
            return this.preOutSitId;
        this.outSitId = this.getNextSitId(this.outSitId);
        return this.outSitId;
    }


    //游戏是否已经结束
    isGameEnd(){
        for(let i = 0 ; i < this.playerCount ; i++){
            if(0 == this.players[i].handCards.length)
                return true;
        }
        return false;
    }

    autoOut(){
        let outId = this.outSitId;
        let outPokers = [];
        let wPre = this.outIndex>0?PokerAlgorithm.pokerWeight(this.preOutInfo.pokers[0]):0;
        let out = this.getOneCardCanOut(wPre,outId);
        if(out>=0)
            outPokers.push(out);
        else
            console.log('{0}选择过'.format(outId));
            //_process.exit(1);
        console.log('player_{0} out={1} outPokers={2}'.format(outId, this.outIndex,this.getCardsName(outPokers)));
        this.outPokers(outPokers,this.outIndex,outId);
    }

    /**
     * 随机获取一张能大过上家都单牌
     */
    getOneCardCanOut(weightPre,sitId){
        let len = this.players[sitId].handCards.length;
        for (let i = 0 ; i < len ; i ++){
            if(PokerAlgorithm.pokerWeight(this.players[sitId].handCards[i])>weightPre)
            {
                if(0 == this.players[sitId].handCards[i])
                {
                    console.log("");
                }
                return this.players[sitId].handCards[i];
            }
        }
        return -1;
    }

    getCardsName(cards){
        let card = [];
        let len = cards.length;
        for (let i = 0 ; i<len ; i++){
            card.push(PokerAlgorithm.pokerName(cards[i],true));
        }
        return card;
    }

    sortCards(cards){
        cards.sort(function(a,b){
            return PokerAlgorithm.pokerWeight(a)-PokerAlgorithm.pokerWeight(b);
        });
    }
}

module.exports = DdzLogic;