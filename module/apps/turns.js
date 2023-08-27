import { Helper } from "../helper.js";
import { SaveThrowDialog } from "../apps/save-throw.js";

export class Turns{
    static async _onNextTurn(wrapped){
        const currentRound = game.combat.round;
        const currentTurn = game.combat.turn;
        const currentInit = game.combat.turns[game.combat.turn].initiative;
    
        const nextTurn = game.combat.turn + 1 < game.combat.turns.length? game.combat.turn + 1 : 0;
        const nextInit = game.combat.turn + 1 < game.combat.turns.length? game.combat.turns[game.combat.turn + 1].initiative :  game.combat.turns[0].initiative;
    
        Helper.rechargeItems(game.combat.turns[nextTurn].actor, ["round"]);
		  
		  const saveReminders = game.settings.get("dnd4e","saveReminders");
    
        for(let t of game.combat.turns){
            let toDelete = [];
				
            for(let e of t.token?.actor?.effects){
                const effectData = e.flags.dnd4e?.effectData;
                const durationType = effectData?.durationType;
    
                if(!durationType){
                    continue;
                }

                if(durationType === "saveEnd" && saveReminders){
                    if( t.id === game.combat.combatant.id ){
							  
								//Ideally this would respect Fast-Forward settings. Unfortunately Fox couldn't quite get there.
								//const fastForward = Helper.isRollFastForwarded(event);
								//return this.actor.usePower(item, {configureDialog: !fastForward, fastForward: fastForward});
								
								let save = new SaveThrowDialog(t.token.actor, {effectSave:true, effectId: e.id}).render(true);
                    }
						  
                }
					 
                if(durationType === "endOfTargetTurn"){
                    if(currentInit <= effectData.durationTurnInit && currentRound >= e.duration.rounds && t.id === game.combat.combatant.id
                        || (currentRound > e.duration.rounds && t.id === game.combat.combatant.id) ){
                            toDelete.push(e.id);
                    }
                }
                else if(durationType === "endOfUserTurn"){
                    if(currentInit <= effectData.durationTurnInit && currentRound >= e.duration.rounds){
                            toDelete.push(e.id);
                    }
                }
                else if(durationType === "startOfTargetTurn" || durationType === "startOfUserTurn"){
                    if((nextInit <= effectData.durationTurnInit && currentRound == e.duration.rounds || currentRound > e.duration.rounds)
                    ||  (nextTurn <= currentTurn && nextInit <= effectData.durationTurnInit && currentRound+1 == e.duration.rounds)){
                            toDelete.push(e.id);
                    }
                }
    
                if(currentTurn === game.combat.combatants.size){
                    if(durationType === "endOfUserTurn"){
                        if(effectData.durationTurnInit < currentInit && e.duration.rounds <= currentRound){
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
