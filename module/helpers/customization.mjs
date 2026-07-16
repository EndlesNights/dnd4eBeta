/**
 * Adds custom skills to CONFIG.DND4E.skills.
 */
export function customSkillSetup() {
	CONFIG.DND4E.coreSkills = foundry.utils.deepClone(CONFIG.DND4E.skills); 

	const customSkillsArray = game.settings.get("dnd4e", "custom-skills");
	
	if (!customSkillsArray.length) return;

	for (const skill of customSkillsArray) {
		CONFIG.DND4E.skills[skill.id] = {
			label: skill.label,
			ability: skill.ability,
			armourCheck: skill.armourCheck,
		};
	}
}

/**
 * Adds custom statuses to CONFIG.DND4E.statusEffect.
 */
export function customStatusSetup() {
	CONFIG.DND4E.coreStatuses = foundry.utils.deepClone(CONFIG.DND4E.statusEffect); 

	const customStatusArray = game.settings.get("dnd4e", "custom-statuses");
	
	if (!customStatusArray.length) return;

	for (const status of customStatusArray) {
		CONFIG.DND4E.statusEffect[status.id] = {
			name: status.name,
			img: status.img,
			description: status.description,
		};
	}
}
