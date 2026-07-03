import * as utils from "../utils/utils.mjs";

export default class Combat4e extends Combat {
	/** @inheritDoc */
	async nextTurn() {
		const currentTurn = this.turn;	
		const nextTurn = currentTurn + 1 < this.turns.length ? currentTurn + 1 : 0;
		
		//t current turn
		for (let t of this.turns) {
			utils.rechargeItems(t.token?.actor, ["turn"]);
		}
		
		// Signal the current actor to check end-of-turn saves
		utils.debugLog("Begin autosaves phase");
		const currentActor = await this.turns[currentTurn]?.token.actor;

		if (currentActor) {
			utils.debugLog(`Checking for owner of ${currentActor.name}`);
			const targetUser = utils.firstOwner(currentActor);
			
			//Work out which user makes the save; "game.user" is whoever ended the turn
			//If game.user is a non-GM with ownership of this actor, it's them
			//If game.user is a GM and this actor has no specfic owner, it's them
			//Otherwise, it's the first detected owner of the actor
			if ((currentActor.isOwner && !game.user.isGM) || (game.user.isGM && targetUser.isGM)) {
				await currentActor.promptEoTSavesSocket();
			} else {
				await game.socket.emit("system.dnd4e", {
					actorID: currentActor.id,
					tokenID: this.turns[currentTurn].tokenId,
					operation: "promptEoTSaves",
					user: targetUser.id,
					scene: canvas.scene.id,
					targetUser: targetUser.id,
				});
			}
		}
		
		// After EoT durations are resolved, collect ongoing damage instances from effects
		utils.debugLog("Begin ongoing damage phase");
		const nextCombatant = await this.turns[nextTurn]?.token.actor || null;
		
		if (nextCombatant) {
			//Triggers for the beginning of the next turn
			utils.rechargeItems(nextCombatant, ["round"]);
		}

		if (nextCombatant) {
			utils.debugLog(`Checking for owner of ${nextCombatant.name}`);
			const nextTargetUser = utils.firstOwner(nextCombatant);
			if (game.user.isGM) {
				await nextCombatant.autoDoTsSocket(this.turns[nextTurn].tokenId);
			} else {
				await game.socket.emit("system.dnd4e", {
					actorID: nextCombatant.id,
					tokenID: this.turns[nextTurn].tokenId,
					operation: "autoDoTs",
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
