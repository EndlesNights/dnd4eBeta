/**
 * Adds custom skills to CONFIG.DND4E.skills.
 */
export default function customSkillSetup() {
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
