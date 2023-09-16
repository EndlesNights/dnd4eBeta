import { Helper } from "../helper.js";

export class Turns{
	static async _onNextTurn(wrapped){
		const currentRound = game.combat.round;
		const currentTurn = game.combat.turn;
		const currentInit = game.combat.turns[game.combat.turn].initiative;
	
		const nextTurn = game.combat.turn + 1 < game.combat.turns.length? game.combat.turn + 1 : 0;
		const nextInit = game.combat.turn + 1 < game.combat.turns.length? game.combat.turns[game.combat.turn + 1].initiative :  game.combat.turns[0].initiative;
		
		//Moved to happen after the loop deletes end-of-turn effects
		//Helper.rechargeItems(game.combat.turns[nextTurn].actor, ["round"])
		
		//t current turn
		for(let t of game.combat.turns){
			
			if(!t.token?.actor?.effects){
				continue;
			}

			let toDelete = [];
			
			for(let e of t.token.actor.effects){
				const effectData = e.flags.dnd4e?.effectData;
				const durationType = effectData?.durationType;
	
				if(!durationType){
					continue;
				}
				else if(durationType === "endOfTargetTurn"){
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
				if(game.user.isGM){
					await t.actor.deleteEmbeddedDocuments("ActiveEffect", toDelete);
				} else {
					game.socket.emit('system.dnd4e', {
						actorID: t.actor.id,
						tokenID: t?.token.id || null,
						operation: 'deleteTokenEffect',
						user: game.user.id,
						scene: canvas.scene.id,
						toDelete: toDelete
					});
				}
			}
			
		}

		// Signal the current actor to check end-of-turn saves
		const currentActor = game.combat.turns[currentTurn].token?.actor

		if(currentActor){
			const targetUser = Helper.firstOwner(currentActor);

			if(game.user.isGM && targetUser.isGM || game.user == targetUser){
				await currentActor.promptEoTSavesSocket();
			} else {
				game.socket.emit('system.dnd4e', {
					actorID: currentActor.id,
					tokenID: game.combat.turns[currentTurn]?.token.id || null,
					operation: 'promptEoTSaves',
					user: targetUser.id,
					scene: canvas.scene.id,
					targetUser: targetUser.id
				});
			}
		}

		
		// After EoT durations are resolved, collect ongoing damage instances from effects
		const nextCombatant = game.combat.turns[nextTurn].token?.actor || null;
		
		if(nextCombatant){
			//Triggers for the beginning of the next turn
			Helper.rechargeItems(nextCombatant, ["round"]);
		}

		if(nextCombatant){
			const nextTargetUser = Helper.firstOwner(nextCombatant);
			if(game.user.isGM && nextTargetUser.isGM){
				await nextCombatant.autoDoTsSocket(game.combat.turns[nextTurn].tokenId);
			} else {
				game.socket.emit('system.dnd4e', {
					actorID: nextCombatant.id,
					tokenID: game.combat.turns[nextTurn].tokenId,
					operation: 'autoDoTs',
					user: nextTargetUser.id,
					scene: canvas.scene.id,
					targetUser: nextTargetUser.id,
					//"event":event
				});
			}
		}
		
		return wrapped();
	}
}
