
/**
 * Override the default Initiative formula to customize special behaviors of the D&D4e system.
 * Apply advantage, proficiency, or bonuses where appropriate
 * Apply a tiebreaker according to system preference
 * See Combat._getInitiativeFormula for more detail.
 */
export const _getInitiativeFormula = function() {
	const actor = this.actor;
	if ( !actor ) return "1d20";
	const init = actor.system.attributes.init.value;
	const tiebreaker = game.settings.get("dnd4e", "initiativeDexTiebreaker");
	const parts = ["1d20", init,];
	if ( actor.getFlag("dnd4e", "initiativeAdv") ) parts[0] = "2d20kh";
	
	if (tiebreaker === 'system') {
		//Official system behaviour: append ititiative modifier as tiebreaker
		parts.push(actor.system.attributes.init.value / 100);
	} else if (tiebreaker === 'dex') {
		//Optional override: append raw dexterity score as tiebreaker
		parts.push(actor.system.abilities.dex.value / 100);
	}
	//Finally, append two extra decimal places at random, to simulate a random tiebreaker.
	parts.push(Math.floor(Math.random()*98+1)/10000);
	
	return parts.filter(p => p !== null).join(" + ");
};
