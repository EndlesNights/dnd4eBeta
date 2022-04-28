import { Helper } from "../helper.js"

export class Turns{
    static async _onNextTurn(wrapped){
        const currentRound = game.combat.round;
        const currentTurn = game.combat.turn;
        const currentInit = game.combat.turns[game.combat.turn].initiative;
    
        const nextTurn = game.combat.turn + 1 < game.combat.turns.length? game.combat.turn + 1 : 0;
        const nextInit = game.combat.turn + 1 < game.combat.turns.length? game.combat.turns[game.combat.turn + 1].initiative :  game.combat.turns[0].initiative;
    
        Helper.rechargeItems(game.combat.turns[nextTurn].actor, ["round"]);
    
        for(let t of game.combat.turns){
            let toDelete = [];
            for(let e of t.token.actor.effects){
                const effectData = e.data.flags.dnd4e?.effectData;
                const durationType = effectData?.durationType;
    
                if(!durationType){
                    continue;
                }
    
                if(durationType === "endOfTargetTurn"){
                    if(currentInit <= effectData.durationTurnInit && currentRound >= e.data.duration.rounds && t.id === game.combat.combatant.id
                        || (currentRound > e.data.duration.rounds && t.id === game.combat.combatant.id) ){
                            toDelete.push(e.id);
                    }
                }
                else if(durationType === "endOfUserTurn"){
                    if(currentInit <= effectData.durationTurnInit && currentRound >= e.data.duration.rounds){
                            toDelete.push(e.id);
                    }
                }
                else if(durationType === "startOfTargetTurn" || durationType === "startOfUserTurn"){
                    if((nextInit <= effectData.durationTurnInit && currentRound == e.data.duration.rounds || currentRound > e.data.duration.rounds)
                    ||  (nextTurn <= currentTurn && nextInit <= effectData.durationTurnInit && currentRound+1 == e.data.duration.rounds)){
                            toDelete.push(e.id);
                    }
                }
    
                if(currentTurn === game.combat.combatants.size){
                    if(durationType === "endOfUserTurn"){
                        if(effectData.durationTurnInit < currentInit && e.data.duration.rounds <= currentRound){
                            toDelete.push(e.id);
                        }
                    }
                }
                else if(currentTurn === 0){
                    if(durationType === "startOfTargetTurn" || durationType === "startOfUserTurn"){
    
                    }
                }
            }
            if(toDelete.length){
                await t.actor.deleteEmbeddedDocuments("ActiveEffect", toDelete);
            }
        }
        return wrapped();
    }
}
