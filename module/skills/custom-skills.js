export function customSKillSetUp(){
	game.dnd4eBeta.config.coreSkills = foundry.utils.deepClone(game.dnd4eBeta.config.skills); 

	const customSkillsArray = game.settings.get("dnd4e", "custom-skills");
	
	if(!customSkillsArray.length) return;

	for(const skill of customSkillsArray){
		game.dnd4eBeta.config.skills[skill.id] = skill.label;
	}
}

Hooks.once("createActor", async function(actor) {
	const customSkillsArray = game.settings.get("dnd4e", "custom-skills");

	if(!customSkillsArray.length) return;

	if(!actor.system?.skills) return;

	for(const skill of customSkillsArray){
		const updateData = {};
		updateData[`system.skills.${skill.id}.value`] = 0;
		updateData[`system.skills.${skill.id}.base`] = 0;
		updateData[`system.skills.${skill.id}.bonus`] = [{}];
		updateData[`system.skills.${skill.id}.ability`] = skill.ability;
		updateData[`system.skills.${skill.id}.armourCheck`] = skill.armourCheck;
		updateData[`system.skills.${skill.id}.chat`] = "@name uses @label.";
		
		await actor.update(updateData);    
	}
});