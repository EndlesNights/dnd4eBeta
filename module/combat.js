
/**
 * Override the default Initiative formula to customize special behaviors of the D&D4e system.
 * Apply advantage, proficiency, or bonuses where appropriate
 * Apply the dexterity score as a decimal tiebreaker if requested
 * See Combat._getInitiativeFormula for more detail.
 */
export const _getInitiativeFormula = function() {
	const actor = this.actor;
	if ( !actor ) return "1d20";
	const init = actor.system.attributes.init.value;
	const tiebreaker = game.settings.get("dnd4eAltus", "initiativeDexTiebreaker");
	const parts = ["1d20", init,];
	if ( actor.getFlag("dnd4eAltus", "initiativeAdv") ) parts[0] = "2d20kh";
	if ( tiebreaker ) parts.push(actor.system.attributes.init.value / 100);
	return parts.filter(p => p !== null).join(" + ");
};
