/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {

	// Define template paths to load
	const templatePaths = [

	// Shared Partials
	"systems/dnd4e/templates/actors/parts/active-effects.html",
	"systems/dnd4e/templates/items/parts/power-effects.html",
	// Actor Sheet Partials
	"systems/dnd4e/templates/actors/parts/actor-attributes.html",
	"systems/dnd4e/templates/actors/parts/actor-biography.html",
	"systems/dnd4e/templates/actors/parts/actor-details.html",
	"systems/dnd4e/templates/actors/parts/actor-inventory.html",
	"systems/dnd4e/templates/actors/parts/actor-features.html",
	"systems/dnd4e/templates/actors/parts/actor-powers.html",
	
	// Item Sheet Partials
	"systems/dnd4e/templates/items/parts/item-action.html",
	"systems/dnd4e/templates/items/parts/item-activation.html",
	"systems/dnd4e/templates/items/parts/item-description.html",
	"systems/dnd4e/templates/items/parts/item-mountable.html",
	
	"systems/dnd4e/templates/items/parts/item-power-template.html",
	"systems/dnd4e/templates/items/parts/item-macro.html",

	// Config Settings
	];

	// Load the template parts
	return loadTemplates(templatePaths);
};
