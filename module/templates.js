/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {

  // Define template paths to load
  const templatePaths = [

    // Shared Partials
    "systems/dnd4eBeta/templates/actors/parts/active-effects.html",
    // Actor Sheet Partials
    "systems/dnd4eBeta/templates/actors/parts/actor-attributes.html",
    "systems/dnd4eBeta/templates/actors/parts/actor-inventory.html",
    "systems/dnd4eBeta/templates/actors/parts/actor-features.html",
    "systems/dnd4eBeta/templates/actors/parts/actor-powers.html",
	
	// Item Sheet Partials
	"systems/dnd4eBeta/templates/items/parts/item-action.html",
	"systems/dnd4eBeta/templates/items/parts/item-activation.html",
	"systems/dnd4eBeta/templates/items/parts/item-description.html",
	"systems/dnd4eBeta/templates/items/parts/item-mountable.html",
	
	"systems/dnd4eBeta/templates/items/parts/item-power-template.html"
  ];

  // Load the template parts
  return loadTemplates(templatePaths);
};
