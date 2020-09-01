/**
 * A simple and flexible system for world-building using an arbitrary collection of character and item attributes
 * Author: Atropos
 * Software License: GNU GPLv3
 */

// Import Modules
import { DND4EALTUS } from "./config.js";
import { SimpleActor } from "./actor.js";
import { SimpleItemSheet } from "./item-sheet.js";
import { SimpleActorSheet } from "./actor-sheet.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function() {
	console.log(`D&D4eAltus | Initializing Dungeons & Dragons 4th Edition System\n${DND4EALTUS.ASCII}`);
	
	/**
	 * Set an initiative formula for the system
	 * @type {String}
	 */
	// CONFIG.Combat.initiative = {
		// formula: "1d20",
		// decimals: 2
  // };
  
	game.dnd4eAltus = {
		config: DND4EALTUS
	};
	
	// Define custom Entity classes
	CONFIG.DND4EALTUS = DND4EALTUS;
	CONFIG.Actor.entityClass = SimpleActor;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("dnd4eAltus", SimpleActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("dnd4eAltus", SimpleItemSheet, {makeDefault: true});

  // Register system settings
  game.settings.register("dnd4eAltus", "macroShorthand", {
    name: "Shortened Macro Syntax",
    hint: "Enable a shortened macro syntax which allows referencing attributes directly, for example @str instead of @attributes.str.value. Disable this setting if you need the ability to reference the full attribute model, for example @attributes.str.label.",
    scope: "world",
    type: Boolean,
    default: true,
    config: true
  });
});

Hooks.once("setup", function() {

  // Localize CONFIG objects once up-front
  const toLocalize = [
	"actorSizes", "spoken", "script", "vision", "special"
  ];

  const doLocalize = function(obj) {
    return Object.entries(obj).reduce((obj, e) => {
      if (typeof e[1] === "string") obj[e[0]] = game.i18n.localize(e[1]);
      else if (typeof e[1] === "object") obj[e[0]] = doLocalize(e[1]);
      return obj;
    }, {});
  };
  for ( let o of toLocalize ) {
    CONFIG.DND4EALTUS[o] = doLocalize(CONFIG.DND4EALTUS[o]);
  }
});
