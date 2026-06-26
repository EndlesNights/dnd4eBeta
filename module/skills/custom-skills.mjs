export function customSKillSetUp() {
	game.dnd4e.config.coreSkills = foundry.utils.deepClone(game.dnd4e.config.skills); 

	const customSkillsArray = game.settings.get("dnd4e", "custom-skills");
	
	if (!customSkillsArray.length) return;

	for (const skill of customSkillsArray) {
		game.dnd4e.config.skills[skill.id] = {
			label: skill.label,
			ability: skill.ability,
			armourCheck: skill.armourCheck,
		};
	}
}
