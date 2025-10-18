import { Helper } from "./helper.js";

export default class Combat4e extends Combat {
	async nextTurn() {
		const currentRound = this.round;
		const currentTurn = this.turn;
		const currentInit = this.turns[currentTurn].initiative;
	
		const nextTurn = currentTurn + 1 < this.turns.length? currentTurn + 1 : 0;
		const nextInit = currentTurn + 1 < this.turns.length? this.turns[currentTurn + 1].initiative :  this.turns[0].initiative;
		
		//Moved to happen after the loop deletes end-of-turn effects
		//Helper.rechargeItems(this.turns[nextTurn].actor, ["round"])
		
		//t current turn
		for(let t of this.turns){
			Helper.rechargeItems(t.token?.actor, ["turn"]);

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
					if(currentInit <= effectData.durationTurnInit && currentRound >= effectData.durationRound && t.id === this.combatant.id
						|| (currentRound > effectData.durationRound && t.id === this.combatant.id) ){
							toDelete.push(e.id);
					}
				}
				else if(durationType === "endOfUserTurn" || durationType === "endOfUserCurrent" ){
					if(currentInit <= effectData.durationTurnInit && currentRound >= effectData.durationRound){
							toDelete.push(e.id);
					}
				}
				else if(durationType === "startOfTargetTurn" || durationType === "startOfUserTurn"){
					if((nextInit <= effectData.durationTurnInit && currentRound == effectData.durationRound || currentRound > effectData.durationRound)
					||  (nextTurn <= currentTurn && nextInit <= effectData.durationTurnInit && currentRound+1 == effectData.durationRound)){
							toDelete.push(e.id);
					}
				}
				
				if((!durationType || durationType === "custom") && (effectData?.durationRound && effectData?.durationRound)){
					if(currentInit <= effectData.durationTurnInit && currentRound >= effectData.durationRound){
							toDelete.push(e.id);
					}
				}
	
				if(currentTurn === this.combatants.size){
					if(durationType === "endOfUserTurn"){
						if(effectData.durationTurnInit < currentInit && effectData.durationRound <= currentRound){
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
		//console.log(`Begin autosaves phase`);
		const currentActor = await this.turns[currentTurn]?.token.actor;

		if(currentActor){
			//console.log(`Checking for owner of ${currentActor.name}`);
			const targetUser = Helper.firstOwner(currentActor);
			
			//Work out which user makes the save; "game.user" is whoever ended the turn
			//If game.user is a non-GM with ownership of this actor, it's them
			//If game.user is a GM and this actor has no specfic owner, it's them
			//Otherwise, it's the first detected owner of the actor
			if((currentActor.isOwner && !game.user.isGM) || (game.user.isGM && targetUser.isGM)){
				await currentActor.promptEoTSavesSocket();
			}else {
				await game.socket.emit('system.dnd4e', {
					actorID: currentActor.id,
					tokenID: this.turns[currentTurn].tokenId,
					operation: 'promptEoTSaves',
					user: targetUser.id,
					scene: canvas.scene.id,
					targetUser: targetUser.id
				});
			}
		}
		
		// After EoT durations are resolved, collect ongoing damage instances from effects
		//console.log(`Begin ongoing damage phase`);
		const nextCombatant = await this.turns[nextTurn]?.token.actor || null;
		
		if(nextCombatant){
			//Triggers for the beginning of the next turn
			Helper.rechargeItems(nextCombatant, ["round"]);
		}

		if(nextCombatant){
			//console.log(`Checking for owner of ${nextCombatant.name}`);
			const nextTargetUser = Helper.firstOwner(nextCombatant);
			if(game.user.isGM){
				await nextCombatant.autoDoTsSocket(this.turns[nextTurn].tokenId);
			} else {
				await game.socket.emit('system.dnd4e', {
					actorID: nextCombatant.id,
					tokenID: this.turns[nextTurn].tokenId,
					operation: 'autoDoTs',
					user: nextTargetUser.id,
					scene: canvas.scene.id,
					targetUser: nextTargetUser.id,
					//"event":event
				});
			}
		}

		return super.nextTurn(); 
	}
}
