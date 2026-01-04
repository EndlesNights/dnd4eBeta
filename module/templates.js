/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {

	// Define template paths to load
	const partials = [
		// "systems/dnd4e/templates/items/parts/item-granter.html",

		// Shared Partials
		"systems/dnd4e/templates/shared/self-effects.hbs",
		
		// Item Sheet Partials	
		"systems/dnd4e/templates/items/parts/details-consumable.hbs",
		"systems/dnd4e/templates/items/parts/details-equipment.hbs",
		"systems/dnd4e/templates/items/parts/details-feature.hbs",
		"systems/dnd4e/templates/items/parts/details-power.hbs",
		"systems/dnd4e/templates/items/parts/details-ritual.hbs",
		"systems/dnd4e/templates/items/parts/details-tool.hbs",
		"systems/dnd4e/templates/items/parts/details-weapon.hbs",
		"systems/dnd4e/templates/items/parts/details-backpack.hbs",

		"systems/dnd4e/templates/items/parts/target-effects.hbs"
	];

	const paths = {};
  for ( const path of partials ) {
    paths[path.replace(".hbs", ".html")] = path;
    paths[`dnd4e.${path.split("/").pop().replace(".hbs", "")}`] = path;
  }
	
	// Load the template parts
  return foundry.applications.handlebars.loadTemplates(paths);
};
