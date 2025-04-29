import { preLocalize } from "./helper.js";

// Namespace D&D4e Configuration Values
export const DND4E = {};

// ASCII Artwork
DND4E.ASCII = `__________________________________________________________
______      ______   ___    
|  _  \\___  |  _  \\ /   | 
| | | ( _ ) | | | |/ /| | ___
| | | / _ \\/\\ | | / /_| |/ _ \\
| |/ / (_>  < |/ /\\___  |  __/
|___/ \\___/\\/___/     |_/\\___\\
__________________________________________________________`;

DND4E.difficultTerrain = {
	img: "systems/dnd4e/icons/ui/tri.webp",
	alpha: 1,
	drawTerrianTint: false
}

/**
 * The set of Ability Scores used within the system (deprectaed, move to abilityScores where possible)
 * @type {Object}
 */
DND4E.abilities = {
	"str": "DND4E.AbilityStr",
	"con": "DND4E.AbilityCon",
	"dex": "DND4E.AbilityDex",
	"int": "DND4E.AbilityInt",
	"wis": "DND4E.AbilityWis",
	"cha": "DND4E.AbilityCha"
};

/**
 * More detailed Ability Score objects for use in selectOptions etc.
 * @type {Object}
 */
DND4E.abilityScores = {
	"str": {
		"label":"DND4E.AbilityStr",
		"labelShort":"DND4E.AbilStr"
	},
	"con": {
		"label":"DND4E.AbilityCon",
		"labelShort":"DND4E.AbilCon"
	},
	"dex": {
		"label":"DND4E.AbilityDex",
		"labelShort":"DND4E.AbilDex"
	},
	"int": {
		"label":"DND4E.AbilityInt",
		"labelShort":"DND4E.AbilInt"
	},
	"wis": {
		"label":"DND4E.AbilityWis",
		"labelShort":"DND4E.AbilWis"
	},
	"cha": {
		"label":"DND4E.AbilityCha",
		"labelShort":"DND4E.AbilCha"
	}
};
preLocalize("abilityScores", { keys: ["label","labelShort"] });

/* -------------------------------------------- */

DND4E.macroScope = {
	global: {label: "Global"},
	actors: {label: "Actors"},
	actor: {label: "Actor"},
}

DND4E.macroType = {
	script: {label: "TYPES.Macro.script"},
	chat: {label: "TYPES.Macro.chat"},
}
preLocalize("macroType", { keys: ["label"] });

DND4E.macroLaunchOrder = {
	"both": {label: "DND4E.LaunchOrderBoth"},
	"off": {label: "DND4E.LaunchOrderOff"},
	"pre": {label: "DND4E.LaunchOrderPre"},
	"post": {label: "DND4E.LaunchOrderPost"},
	"sub": {label: "DND4E.LaunchOrderSub"}
}
preLocalize("macroLaunchOrder", { keys: ["label"] });

/**
 * Character alignment options (Not 4e; Unused?)
 * @type {Object}
 */
DND4E.alignments = {
	'lg': "DND4E.AlignmentLG",
	'ng': "DND4E.AlignmentNG",
	'cg': "DND4E.AlignmentCG",
	'ln': "DND4E.AlignmentLN",
	'tn': "DND4E.AlignmentTN",
	'cn': "DND4E.AlignmentCN",
	'le': "DND4E.AlignmentLE",
	'ne': "DND4E.AlignmentNE",
	'ce': "DND4E.AlignmentCE"
};
/**
 * 5e Skill proficiencies (Vestigial/Unused?)
 * @type {Object}
 */
DND4E.weaponProficiencies = {
	"sim": "DND4E.WeaponSimpleProficiency",
	"mar": "DND4E.WeaponMartialProficiency"
};

DND4E.toolProficiencies = {
	"art": "DND4E.ToolArtisans",
	"disg": "DND4E.ToolDisguiseKit",
	"forg": "DND4E.ToolForgeryKit",
	"game": "DND4E.ToolGamingSet",
	"herb": "DND4E.ToolHerbalismKit",
	"music": "DND4E.ToolMusicalInstrument",
	"navg": "DND4E.ToolNavigators",
	"pois": "DND4E.ToolPoisonersKit",
	"thief": "DND4E.ToolThieves",
	"vehicle": "DND4E.ToolVehicle"
};


/* -------------------------------------------- */

/**
 * This Object defines the various lengths of time which can occur in D&D4e
 * @type {Object}
 */
DND4E.timePeriods = {
	"inst": "DND4E.TimeInst",
	"turn": "DND4E.TimeTurn",
	"round": "DND4E.TimeRound",
	"minute": "DND4E.TimeMinute",
	"hour": "DND4E.TimeHour",
	"day": "DND4E.TimeDay",
	"month": "DND4E.TimeMonth",
	"year": "DND4E.TimeYear",
	"perm": "DND4E.TimePerm",
	"spec": "DND4E.Special"
};
preLocalize("timePeriods");

/* -------------------------------------------- */

/**
 * This describes the ways that an ability can be activated
 * @type {Object}
 */
DND4E.abilityActivationTypes = {
	"none": {
		label: "DND4E.NoAction",
		labelShort: "DND4E.NoActionShort",
		abbreviation: "DND4E.NoneShort"
	},
	"standard": {
		label: "DND4E.ActionStandard",
		labelShort: "DND4E.ActionStandardBrief",
		abbreviation: "DND4E.ActionStandardShort"
	},
	"move": {
		label: "DND4E.ActionMove",
		labelShort: "DND4E.ActionMoveBrief",
		abbreviation: "DND4E.ActionMoveShort"
	},
	"minor": {
		label: "DND4E.ActionMinor",
		labelShort: "DND4E.ActionMinorBrief",
		abbreviation: "DND4E.ActionMinorShort"
	},
	"free": {
		label: "DND4E.ActionFree",
		labelShort: "DND4E.ActionFreeBrief",
		abbreviation: "DND4E.ActionFreeShort"
	},
	"reaction": {
		label: "DND4E.ActionReaction",
		labelShort: "DND4E.ActionReactionBrief",
		abbreviation: "DND4E.ActionFreeShort"
	},
	"interrupt": {
		label: "DND4E.ActionInterrupt",
		labelShort: "DND4E.ActionInterruptBrief",
		abbreviation: "DND4E.ActionFreeShort"
	},
	"opportunity": {
		label: "DND4E.ActionOpportunity",
		labelShort: "DND4E.ActionOpportunityBrief",
		abbreviation: "DND4E.ActionOpportunityShort"
	},
};
preLocalize("abilityActivationTypes", { keys: ["label"] });

DND4E.abilityActivationTypesShort = {
	"none": "DND4E.NoActionShort",
	"standard": "DND4E.ActionStandardShort",
	"move": "DND4E.ActionMoveShort",
	"minor": "DND4E.ActionMinorShort",
	"free": "DND4E.ActionFreeShort",
	"reaction": "DND4E.ActionReactionShort",
	"interrupt": "DND4E.ActionInterruptShort",
	"opportunity": "DND4E.ActionOpportunityShort",
};
/* -------------------------------------------- */


DND4E.abilityConsumptionTypes = {
	"": {label: "DND4E.None"},
	"resource": {label: "DND4E.Resource"},
	"ammo": {label: "DND4E.ConsumeAmmunition"},
	"material": {label: "DND4E.ConsumeMaterial"},
	"charges": {label: "DND4E.ConsumeCharges"},
	"attribute": {label: "DND4E.ConsumeAttribute"}
};
preLocalize("abilityConsumptionTypes", { keys: ["label"] });

/* -------------------------------------------- */

// Creature Sizes
DND4E.actorSizes = {
	tiny: {
		label: "DND4E.SizeTiny"
	},
	sm: {
		label: "DND4E.SizeSmall"
	},
	med: {
		label: "DND4E.SizeMedium"
	},
	lg: {
		label: "DND4E.SizeLarge"
	},
	huge: {
		label: "DND4E.SizeHuge"
	},
	grg: {
		label: "DND4E.SizeGargantuan"
	}

//   "tiny": "DND4E.SizeTiny",
//   "sm": "DND4E.SizeSmall",
//   "med": "DND4E.SizeMedium",
//   "lg": "DND4E.SizeLarge",
//   "huge": "DND4E.SizeHuge",
//   "grg": "DND4E.SizeGargantuan"
};
preLocalize("actorSizes", { keys: ["label"] });

DND4E.tokenSizes = {
	"tiny": 1,
	"sm": 1,
	"med": 1,
	"lg": 2,
	"huge": 3,
	"grg": 4
};

/* -------------------------------------------- */

/**
 * Colors used to visualize temporary and temporary maximum HP in token health bars.
 * @enum {number}
 */
DND4E.tokenHPColors = {
	damage: 0xFF0000,
	healing: 0x00FF00,
	temp: 0x66CCFF,
	tempmax: 0x440066,
	negmax: 0x550000
};

/* -------------------------------------------- */

/**
 * Classification types for item action types (5e/vestigial?)
 * @type {Object}
 */
DND4E.itemActionTypes = {
	"mwak": "DND4E.ActionMWAK",
	"rwak": "DND4E.ActionRWAK",
	"msak": "DND4E.ActionMSAK",
	"rsak": "DND4E.ActionRSAK",
	"save": "DND4E.ActionSave",
	"heal": "DND4E.ActionHeal",
	"abil": "DND4E.ActionAbil",
	"util": "DND4E.ActionUtil",
	"other": "DND4E.ActionOther"
};

/* -------------------------------------------- */

DND4E.itemCapacityTypes = {
	"items": {label: "DND4E.ItemContainerCapacityItems"},
	"weight": {label: "DND4E.ItemContainerCapacityWeight"}
};
preLocalize("itemCapacityTypes", { keys: ["label"] });


/* -------------------------------------------- */

/**
 * Enumerate the lengths of time over which an item can have limited use ability
 * @type {Object}
 */
DND4E.limitedUsePeriods = {
	"": {label: "DND4E.None"},
	"enc": {label: "DND4E.Encounter"},
	"day": {label: "DND4E.Day"},
	"charges": {label: "DND4E.Charges"},
	"round": {label: "DND4E.Round"}
};
preLocalize("limitedUsePeriods", { keys: ["label"] });

/* -------------------------------------------- */

DND4E.autoanimationHook = {
	"attack": "DND4E.AutoanimationHookAttack",
	"damage": "DND4E.AutoanimationHookDamage",
	"healing": "DND4E.AutoanimationHookHealing",
	"usePower": "DND4E.AutoanimationHookUsePower",
	"template": "DND4E.AutoanimationHookTemplate",
};

/* -------------------------------------------- */

/**
 * The set of equipment types for armour, clothing, and other objects which can ber worn by the character
 * @type {Object}
 */
DND4E.equipmentTypes = {
	"": {label: "DND4E.None"},
	"armour": {label: "DND4E.EquipmentTypeArmour"},
	"arms": {label: "DND4E.EquipmentTypeArms"},
	"feet": {label: "DND4E.EquipmentTypeFeet"},
	"hands": {label: "DND4E.EquipmentTypeHands"},
	"head": {label: "DND4E.EquipmentTypeHead"},
	"neck": {label: "DND4E.EquipmentTypeNeck"},
	"ring": {label: "DND4E.EquipmentTypeRing"},
	"waist": {label: "DND4E.EquipmentTypeWaist"},
	"natural": {label: "DND4E.EquipmentTypeNatural"},
	"other": {label: "DND4E.EquipmentTypeOther"},
};
preLocalize("equipmentTypes", { keys: ["label"] });

DND4E.equipmentTypesArmour = {
	"": {label: "DND4E.None"},
	"cloth": {label: "DND4E.EquipmentArmourCloth"},
	"light": {label: "DND4E.EquipmentArmourLight"},
	"heavy": {label: "DND4E.EquipmentArmourHeavy"},
	"natural": {label: "DND4E.EquipmentArmourNatural"},
	"other": {label: "DND4E.EquipmentTypeOther"},
};
preLocalize("equipmentTypesArmour", { keys: ["label"] });

DND4E.equipmentTypesArms = {
	"": {label: "DND4E.None"},
	"light": {label: "DND4E.EquipmentArmsLight"},
	"heavy": {label: "DND4E.EquipmentArmsHeavy"},
	"bracers": {label: "DND4E.EquipmentArmsBracers"},
	"bracelet": {label: "DND4E.EquipmentArmsBracelet"},
	"other": {label: "DND4E.EquipmentTypeOther"},
};
preLocalize("equipmentTypesArms", { keys: ["label"] });

DND4E.equipmentTypesFeet = {
	"": {label: "DND4E.None"},
	"shoe": {label: "DND4E.EquipmentFeetShoe"},
	"boot": {label: "DND4E.EquipmentFeetBoot"},
	"greave": {label: "DND4E.EquipmentFeetGreave"},
	"other": {label: "DND4E.EquipmentTypeOther"},
};
preLocalize("equipmentTypesFeet", { keys: ["label"] });

DND4E.equipmentTypesHands = {
	"": {label: "DND4E.None"},
	"gloves": {label: "DND4E.EquipmentHandsGloves"},
	"gauntlets": {label: "DND4E.EquipmentHandsGauntlets"},
	"other": {label: "DND4E.EquipmentTypeOther"},
};
preLocalize("equipmentTypesHands", { keys: ["label"] });

DND4E.equipmentTypesHead = {
	"": {label: "DND4E.None"},
	"hat": {label: "DND4E.EquipmentHeadHat"},
	"helmet": {label: "DND4E.EquipmentHeadHelmet"},
	"eyewear": {label: "DND4E.EquipmentHeadEyewear"},
	"other": {label: "DND4E.EquipmentTypeOther"},
};
preLocalize("equipmentTypesHead", { keys: ["label"] });

DND4E.equipmentTypesNeck = {
	"": {label: "DND4E.None"},
	"necklace": {label: "DND4E.EquipmentNeckNecklace"},
	"amulet": {label: "DND4E.EquipmentNeckAmulet"},
	"cloak": {label: "DND4E.EquipmentCloak"},
	"other": {label: "DND4E.EquipmentTypeOther"},
};
preLocalize("equipmentTypesNeck", { keys: ["label"] });

DND4E.equipmentTypesWaist = {
	"": {label: "DND4E.None"},
	"belt": {label: "DND4E.EquipmentWaistBelt"},
	"other": {label: "DND4E.EquipmentTypeOther"},
};
preLocalize("equipmentTypesWaist", { keys: ["label"] });

/* -------------------------------------------- */

/**
 * The set of armour Proficiencies which a character may have
 * @type {Object}
 */
DND4E.armourProficiencies = {
	"lgt": "DND4E.equipmentTypes.light",
	"med": "DND4E.equipmentTypes.medium",
	"hvy": "DND4E.equipmentTypes.heavy",
	"shl": "DND4E.EquipmentShieldProficiency"
};


/* -------------------------------------------- */

DND4E.creatureOrigin = {
	aberrant: {
		label: "DND4E.CreatureOriginAberrant",
	},
	elemental: {
		label: "DND4E.CreatureOriginElemental",
	},
	fey: {
		label: "DND4E.CreatureOriginFey",
	},
	immortal: {
		label: "DND4E.CreatureOriginImmortal",
	},
	natural: {
		label: "DND4E.CreatureOriginNatural",
	},
	shadow: {
		label: "DND4E.CreatureOriginShadow",
	},

	// "aberrant": "DND4E.CreatureOriginAberrant",
	// "elemental": "DND4E.CreatureOriginElemental",
	// "fey": "DND4E.CreatureOriginFey",
	// "immortal": "DND4E.CreatureOriginImmortal",
	// "natural": "DND4E.CreatureOriginNatural",
	// "shadow": "DND4E.CreatureOriginShadow",
}
preLocalize("creatureOrigin", { keys: ["label"] });


/* -------------------------------------------- */

DND4E.creatureRole = {
	artillery: {
		label: "DND4E.CreatureRoleArtillery",
	},
	brute: {
		label: "DND4E.CreatureRoleBrute",
	},
	controller: {
		label: "DND4E.CreatureRoleController",
	},
	defender: {
		label: "DND4E.CreatureRoleDefender",
	},
	leader: {
		label: "DND4E.CreatureRoleLeader",
	},
	lurker: {
		label: "DND4E.CreatureRoleLurker",
	},
	skirmisher: {
		label: "DND4E.CreatureRoleSkirmisher",
	},
	striker: {
		label: "DND4E.CreatureRoleStriker",
	},
	soldier: {
		label: "DND4E.CreatureRoleSoldier",
	},
	
	// "artillery": "DND4E.CreatureRoleArtillery",
	// "brute": "DND4E.CreatureRoleBrute",
	// "controller": "DND4E.CreatureRoleController",
	// "defender": "DND4E.CreatureRoleDefender",
	// "leader": "DND4E.CreatureRoleLeader",
	// "lurker": "DND4E.CreatureRoleLurker",
	// "skirmisher": "DND4E.CreatureRoleSkirmisher",
	// "striker": "DND4E.CreatureRoleStriker",
	// "soldier": "DND4E.CreatureRoleSoldier",
}
preLocalize("creatureRole", { keys: ["label"] });

/* -------------------------------------------- */

DND4E.creatureRoleSecond = {
	"standard": {label: "DND4E.CreatureRoleSecStandard"},
	"elite": {label: "DND4E.CreatureRoleSecElite"},
	"solo": {label: "DND4E.CreatureRoleSecSolo"},
	"minion": {label: "DND4E.CreatureRoleSecMinion"},
	"other": {label: "DND4E.CreatureRoleSecOther"},
}
preLocalize("creatureRoleSecond", { keys: ["label"] });

/* -------------------------------------------- */

DND4E.creatureType = {
	animate: {
		label: "DND4E.CreatureTypeAnimate",
	},
	beast: {
		label: "DND4E.CreatureTypeBeast",
	},
	humanoid: {
		label: "DND4E.CreatureTypeHumanoid",
	},
	magical: {
		label: "DND4E.CreatureTypeMagicalBeaste",
	},
	// "animate": "DND4E.CreatureTypeAnimate",
	// "beast": "DND4E.CreatureTypeBeast",
	// "humanoid": "DND4E.CreatureTypeHumanoid",
	// "magical": "DND4E.CreatureTypeMagicalBeaste",
}
preLocalize("creatureType", { keys: ["label"] });

/* -------------------------------------------- */

/**
 * Enumerate the valid consumable types which are recognized by the system
 * @type {Object}
 */
DND4E.consumableTypes = {
	"alchemical": {label: "DND4E.ConsumableAlchemical"},
	"ammo": {label: "DND4E.ConsumableAmmunition"},
	"potion": {label: "DND4E.ConsumablePotion"},
	"poison": {label: "DND4E.ConsumablePoison"},
	"food": {label: "DND4E.ConsumableFood"},
	"scroll": {label: "DND4E.ConsumableScroll"},
	"trinket": {label: "DND4E.ConsumableTrinket"}
};
preLocalize("consumableTypes", { keys: ["label"] });

/* -------------------------------------------- */
DND4E.commonAttackBonuses = {
	comAdv: {value: 2, label:"DND4E.CommonAttackComAdv"},
	charge: {value: 1, label:"DND4E.CommonAttackCharge"},
	conceal: {value: -2, label:"DND4E.CommonAttackConceal"},
	concealTotal: {value: -5, label:"DND4E.CommonAttackConcealTotal"},
	cover: {value: -2, label:"DND4E.CommonAttackCover"},
	coverSup: {value: -5, label:"DND4E.CommonAttackCoverSup"},
	longRange: {value: -2, label:"DND4E.CommonAttackLongRange"},
	prone: {value: -2, label:"DND4E.CommonAttackProne"},
	restrained: {value: -2, label:"DND4E.CommonAttackRestrained"},
	running: {value: -5, label:"DND4E.CommonAttackRunning"},
	squeez: {value: -5, label:"DND4E.CommonAttackSqueez"},
}
/* -------------------------------------------- */

/**
 * The valid currency denominations supported by the 4e system
 * @type {Object}
 */
DND4E.currencies = {
	"ad": "DND4E.CurrencyAD",
	"pp": "DND4E.CurrencyPP",
	"gp": "DND4E.CurrencyGP",
	"sp": "DND4E.CurrencySP",
	"cp": "DND4E.CurrencyCP"
};

/**
 * Define the upwards-conversion rules for registered currency types
 * @type {{string, object}}
 */
DND4E.currencyConversion = {
  cp: {into: "sp", each: 10, gp: 0.01},
  sp: {into: "gp", each: 10, gp: 0.1},
  gp: {into: "pp", each: 100, gp: 1},
  pp: {into: "ad", each: 100, gp: 100},
  ad: {into: "ad", each: 1, gp: 10000},
};

/* -------------------------------------------- */

DND4E.ritualcomponents = {
	"ar": "DND4E.RitualCompAR",
	"ms": "DND4E.RitualCompMS",
	"rh": "DND4E.RitualCompRH",
	"si": "DND4E.RitualCompSI",
	"rs": "DND4E.RitualCompRS"
};

/* -------------------------------------------- */

// Damage Types
DND4E.damageTypes = {
	"damage": "DND4E.DamageAll",
	"ongoing": "DND4E.Ongoing",
	"acid": "DND4E.DamageAcid",
	"cold": "DND4E.DamageCold",
	"fire": "DND4E.DamageFire",
	"force": "DND4E.DamageForce",
	"lightning": "DND4E.DamageLightning",
	"necrotic": "DND4E.DamageNecrotic",
	"physical": "DND4E.Damagephysical",
	"poison": "DND4E.DamagePoison",
	"psychic": "DND4E.DamagePsychic",
	"radiant": "DND4E.DamageRadiant",
	"thunder": "DND4E.DamageThunder"
};
// DND4E.damageTypes = {
// 	"damage": {label: "DND4E.DamageAll"},
// 	"ongoing": {label: "DND4E.Ongoing"},
// 	"acid": {label: "DND4E.DamageAcid"},
// 	"cold": {label: "DND4E.DamageCold"},
// 	"fire": {label: "DND4E.DamageFire"},
// 	"force": {label: "DND4E.DamageForce"},
// 	"lightning": {label: "DND4E.DamageLightning"},
// 	"necrotic": {label: "DND4E.DamageNecrotic"},
// 	"physical": {label: "DND4E.Damagephysical"},
// 	"poison": {label: "DND4E.DamagePoison"},
// 	"psychic": {label: "DND4E.DamagePsychic"},
// 	"radiant": {label: "DND4E.DamageRadiant"},
// 	"thunder": {label: "DND4E.DamageThunder"}
// };
// preLocalize("damageTypes", { keys: ["label"] });

/* -------------------------------------------- */

/**
 * Default artwork configuration for each Document type and sub-type.
 * @type {Record<string, Record<string, string>>}
 */

//TODO, get icons that are nice
DND4E.defaultArtwork = {
	Item: {
		"backpack": "icons/svg/barrel.svg",
		"classFeats": "icons/svg/book.svg",
		"consumable": "icons/svg/tankard.svg",
		"destinyFeats": "icons/svg/book.svg",
		"equipment": "icons/svg/shield.svg",
		"feat": "icons/svg/book.svg",
		"loot": "icons/svg/chest.svg",
		"pathFeats": "icons/svg/book.svg",
		"power": "icons/svg/combat.svg",
		"raceFeats": "icons/svg/book.svg",
		"ritual": "icons/svg/statue.svg",
		"tool": "icons/svg/trap.svg",
		"weapon": "icons/svg/sword.svg"
	}
}

/* -------------------------------------------- */

// Def
DND4E.def = {
	"ac": "DND4E.DefAC",
	"fort": "DND4E.DefFort",
	"ref": "DND4E.DefRef",
	"wil": "DND4E.DefWil"
};/* -------------------------------------------- */


// Defensives
DND4E.defensives = {
	ac: {
		label: "DND4E.DefenceAC",
		labelShort: "DND4E.DefenceACShort",
		abbreviation: "DND4E.DefAC"
	},
	fort: {
		label: "DND4E.DefenceFort",
		labelShort: "DND4E.DefenceFortShort",
		abbreviation: "DND4E.DefFort"
	},
	ref: {
		label: "DND4E.DefenceRef",
		labelShort: "DND4E.DefenceRefShort",
		abbreviation: "DND4E.DefRef"
	},
	wil: {
		label: "DND4E.DefenceWil",
		labelShort: "DND4E.DefenceWilShort",
		abbreviation: "DND4E.DefWil"
	}
};
preLocalize("defensives", { keys: ["label", "labelShort", "abbreviation"] });

/* -------------------------------------------- */

DND4E.distanceUnits = {
	"none": "DND4E.None",
	"self": "DND4E.DistSelf",
	"touch": "DND4E.DistTouch",
	"ft": "DND4E.DistFt",
	"mi": "DND4E.DistMi",
	"spec": "DND4E.Special",
	"any": "DND4E.DistAny"
};

/* -------------------------------------------- */

DND4E.durationType = {
	"endOfTargetTurn": "DND4E.DurationEndOfTargetTurn",
	"endOfUserTurn": "DND4E.DurationEndOfUserTurn",
	"endOfUserCurrent": "DND4E.DurationEndOfUserCurrent",
	"startOfTargetTurn": "DND4E.DurationStartOfTargetTurn",
	"startOfUserTurn": "DND4E.DurationStartOfUserTurn",
	"saveEnd": "DND4E.DurationSaveEnd",
	"endOfEncounter": "DND4E.DurationEndOfEnc",
	"endOfDay": "DND4E.DurationEndOfDay",
	"custom": "DND4E.DurationCustom",
}

/* -------------------------------------------- */

DND4E.PhysicalItemTemplate = {
	MAX_DEPTH: 5
}

/* -------------------------------------------- */

DND4E.powerEffectTypes = {
	"all": "DND4E.TargetAll",
	"allies": "DND4E.TargetAllies",
	"enemies": "DND4E.TargetEnemies",
	"hit": "DND4E.TargetHit",
	"miss": "DND4E.TargetMiss",
	"hitOrMiss": "DND4E.TargetHitOrMiss",
	"self": "DND4E.TargetSelf",
	"selfAfterAttack": "DND4E.TargetSelfAfterAttack",
	"selfHit": "DND4E.TargetSelfHit",
	"selfMiss": "DND4E.TargetSelfMiss",
	"misc": "DND4E.TargetMisc"
}

/* -------------------------------------------- */

DND4E.profArmor = {
	cloth: "DND4E.ArmourProfCloth",
	leather: "DND4E.ArmourProfLeather",
	hide: "DND4E.ArmourProfHide",
	chain: "DND4E.ArmourProfChain",
	scale: "DND4E.ArmourProfScale",
	plate: "DND4E.ArmourProfPlate",
	light: "DND4E.ArmourProfShieldLight",
	heavy: "DND4E.ArmourProfShieldHeavy",
};

DND4E.cloth = {
	cloth: "DND4E.ArmourProfCloth",
};
DND4E.light = {
	leather: "DND4E.ArmourProfLeather",
	hide: "DND4E.ArmourProfHide",
};
DND4E.heavy = {
	chain: "DND4E.ArmourProfChain",
	scale: "DND4E.ArmourProfScale",
	plate: "DND4E.ArmourProfPlate",
};
DND4E.natural = {

};
DND4E.shield = {
	light: "DND4E.ArmourProfShieldLight",
	heavy: "DND4E.ArmourProfShieldHeavy",
};
DND4E.weaponProficiencies = {
	simpleM: "DND4E.WeaponSimpleM",
	simpleR: "DND4E.WeaponSimpleR",
	militaryM: "DND4E.WeaponMilitaryM",
	militaryR: "DND4E.WeaponMilitaryR",
	superiorM: "DND4E.WeaponSuperiorM",
	superiorR: "DND4E.WeaponSuperiorR",
	improvisedM: "DND4E.WeaponImprovisedM",
	improvisedR: "DND4E.WeaponImprovisedR",
};

DND4E.weaponProficienciesMap = {
	simpleM: "SimpleM",
	simpleR: "SimpleR",	
	militaryM: "MilitaryM",
	militaryR: "MilitaryR",
	superiorM: "SuperiorM",
	superiorR: "SuperiorR",
	improvisedM: "ImprovisedM",
	improvisedR: "ImprovisedR",
	implement: "Implement"
};

DND4E.simpleM = {
	club:"DND4E.WeaponClub",
	dagger:"DND4E.WeaponDagger",
	greatclub:"DND4E.WeaponGreatclub",
	javelin:"DND4E.WeaponJavelin",
	lightMace:"DND4E.WeaponLightMace",
	mace:"DND4E.WeaponMace",
	morningstar:"DND4E.WeaponMorningStar",
	quarterstaff:"DND4E.WeaponQuarterStaff",
	scythe:"DND4E.WeaponScythe",
	shortSpear:"DND4E.WeaponShortSpear",
	sickle:"DND4E.WeaponSickle",
	spear:"DND4E.WeaponSpear",
	spikeGauntlet:"DND4E.WeaponSpikeGauntlet",
	wristRazor:"DND4E.WeaponWristRazor"
};
DND4E.simpleR = {
	crossbow:"DND4E.WeaponCrossbow",
	dejada:"DND4E.WeaponDejada",
	handcrossbow:"DND4E.WeaponHandcrossbow",
	repeatCrossbow:"DND4E.WeaponRepeatCrossbow",
	sling:"DND4E.WeaponSling"
};

DND4E.militaryM = {
	alhulak:"DND4E.WeaponAlhulak",
	battleaxe:"DND4E.WeaponBattleaxe",
	broadsword:"DND4E.WeaponBroadsword",
	carrikal:"DND4E.WeaponCarrikal",
	falchion:"DND4E.WeaponFalchion",
	flail:"DND4E.WeaponFlail",
	glaive:"DND4E.WeaponGlaive",
	greataxe:"DND4E.WeaponGreataxe",
	greatsword:"DND4E.WeaponGreatsword",
	halberd:"DND4E.WeaponHalberd",
	handaxe:"DND4E.WeaponHandaxe",
	heavyflail:"DND4E.WeaponHeavyflail",
	heavyWarpick:"DND4E.WeaponHeavyWarPick",
	khopesh:"DND4E.WeaponKhopesh",
	lance:"DND4E.WeaponLance",
	lightWarpick:"DND4E.WeaponLightWarPick",
	longspear:"DND4E.WeaponLongspear",
	longsword:"DND4E.WeaponLongsword",
	maul:"DND4E.WeaponMaul",
	pike:"DND4E.WeaponPike",
	rapier:"DND4E.WeaponRapier",
	scimitar:"DND4E.WeaponScimitar",
	scourge:"DND4E.WeaponScourge",
	shortsword:"DND4E.WeaponShortsword",
	throwinghammer:"DND4E.WeaponThrowingHammer",
	trident:"DND4E.WeaponTrident",
	trikal:"DND4E.WeaponTrikal",
	warhammer:"DND4E.WeaponWarhammer",
	warpick:"DND4E.WeaponWarpick"
};
DND4E.militaryR = {
	longbow:"DND4E.WeaponLongbow",
	shortbow:"DND4E.WeaponShortbow",
	chatchka:"DND4E.WeaponChatchka"
};

DND4E.superiorM = {
	bastardsword:"DND4E.WeaponBastardsword",
	cahulaks:"DND4E.WeaponCahulaks",
	craghammer:"DND4E.WeaponCraghammer",
	cutWheel:"DND4E.WeaponCutWheel",
	doubleAxe:"DND4E.WeaponDoubleAxe",
	doubleFlail:"DND4E.WeaponDoubleFlail",
	doubleScimitar:"DND4E.WeaponDoubleScimitar",
	doubleSword:"DND4E.WeaponDoubleSword",
	dragonPaw:"DND4E.WeaponDragonPaw",
	executionAxe:"DND4E.WeaponExecutionAxe",
	fullblade:"DND4E.WeaponFullblade",
	garrote:"DND4E.WeaponGarrote",
	gauntletAxe:"DND4E.WeaponGauntletAxe",
	gouge:"DND4E.WeaponGouge",
	greatspear:"DND4E.WeaponGreatspear",
	gythka:"DND4E.WeaponGythka",
	katar:"DND4E.WeaponKatar",
	kukri:"DND4E.WeaponKukri",
	kusariGama:"DND4E.WeaponKusariGama",
	longKnife:"DND4E.WeaponLongKnife",
	lotulis:"DND4E.WeaponLotulis",
	mordenkrad:"DND4E.WeaponMordenkrad",
	net:"DND4E.WeaponNet",
	parryDagger:"DND4E.WeaponParryDagger",
	serratedPick:"DND4E.WeaponSerratedPick",
	sharrash:"DND4E.WeaponSharrash",
	singingStick:"DND4E.WeaponSingingStick",
	spikeChain:"DND4E.WeaponSpikeChain",
	spikeShield:"DND4E.WeaponSpikeShield",
	tangat:"DND4E.WeaponTangat",
	tortoiseBlade:"DND4E.WeaponTortoiseBlade",
	tratnyr:"DND4E.WeaponTratnyr",
	triFlail:"DND4E.WeaponTriFlail",
	urgrosh:"DND4E.WeaponUrgrosh",
	waraxe:"DND4E.WeaponWaraxe",
	whip:"DND4E.WeaponWhip",
	zadatl:"DND4E.WeaponZadatl",
	zulaat:"DND4E.WeaponZulaat"
};
DND4E.superiorR = {
	boomerang:"DND4E.WeaponBoomerang",
	bola:"DND4E.WeaponBola",
	blowgun:"DND4E.WeaponBlowgun",
	greatbow:"DND4E.WeaponGreatbow",
	shuriken:"DND4E.WeaponShuriken",
	superCrossbow:"DND4E.WeaponSuperCrossbow"
};

DND4E.improvisedM = {};
DND4E.improvisedR = {};

/**
 * Configure aspects of encumbrance calculation so that it could be configured by modules
 * @type {Object}
 */
DND4E.encumbrance = {
	currencyPerWeight: 50,
	strMultiplier: 15
};

/* -------------------------------------------- */

/**
 * This Object defines the types of single or area targets which can be applied in D&D4e (Not currently used?)
 * @type {Object}
 */
DND4E.targetTypes = {
	"none": "DND4E.None",
	"ally": "DND4E.TargetAlly",
	"creature": "DND4E.TargetCreature",
	"enemy": "DND4E.TargetEnemy",
	"personal": "DND4E.TargetPersonal",
	"object": "DND4E.TargetObject",
	"square": "DND4E.TargetSquare",
	"wall": "DND4E.TargetWall",
	"allyA": "DND4E.TargetAllyAdjacent",
	"creatureA": "DND4E.TargetCreatureAdjacent",
	"enemyA": "DND4E.TargetEnemyAdjacent",
};


/* -------------------------------------------- */


/**
 * Map the subset of target types which produce a template area of effect
 * The keys are DND4E target types and the values are MeasuredTemplate shape types
 * @type {Object}
 */
DND4E.areaTargetTypes = {
	cone: "cone",
	cube: "rect",
	cylinder: "circle",
	line: "ray",
	radius: "circle",
	sphere: "circle",
	square: "rect",
	wall: "ray",
	closeBlast: "rect",
	closeBurst: "circle",
	rangeBlast: "rect",
	rangeBurst: "circle",
};


/* -------------------------------------------- */

// Healing Types
DND4E.healingTypes = {
	"healing": "DND4E.Healing",
	"temphp": "DND4E.HealingTemp"
};

/* -------------------------------------------- */

DND4E.featureSortTypes = {
	"name": {label: "DND4E.Name"},
	"level": {label: "DND4E.Level"},
	"none": {label: "DND4E.None"}
};
preLocalize("featureSortTypes", { keys: ["label"] });

DND4E.featureTypes = {
	"race": { 
		label: "DND4E.FeatRace",
		groupLabel: "DND4E.Group.Feat.Race"
	},
	"class": {
		label: "DND4E.FeatClass",
		groupLabel: "DND4E.Group.Feat.Class"
	},
	"feat": {
		label: "DND4E.Feat",
		groupLabel: "DND4E.Feats"
	},
	"path": {
		label: "DND4E.FeatPath",
		groupLabel: "DND4E.Group.Feat.Path"
	},
	"destiny": {
		label: "DND4E.FeatDestiny",
		groupLabel: "DND4E.Group.Feat.Destiny"
	},
	"theme": {
		label: "DND4E.FeatTheme",
		groupLabel: "DND4E.Group.Feat.Theme"
	},
	"background": {
		label: "DND4E.FeatBG",
		groupLabel: "DND4E.Group.Feat.BG"
	},
	"trait": {
		label: "DND4E.FeatTrait",
		groupLabel: "DND4E.Group.Feat.Trait"
	},
	"other": {
		label: "DND4E.Other",
		groupLabel: "DND4E.Other"
	}
};
preLocalize("featureTypes", { keys: ["label","groupLabel"] });


/* -------------------------------------------- */

DND4E.powerType = {
	"inherent": "DND4E.Inherent",
	"class": "DND4E.Class",
	"race": "DND4E.Racial",
	"paragon": "DND4E.Paragon",
	"epic": "DND4E.Epic",
	"theme": "DND4E.Theme",
	"item": "DND4E.PowerItem",
	"feat": "DND4E.Feat",
	"skill": "DND4E.Skill",
	"utility": "DND4E.PowerUtil" //Better keep this for legacy
};
DND4E.powerSubtype = {
	"attack": "DND4E.PowerAttack",
	"utility": "DND4E.PowerUtil",
	"feature": "DND4E.PowerFeature"
};

DND4E.powerUseType = {
	"atwill": "DND4E.PowerAt",
	"encounter": "DND4E.PowerEnc",
	"daily": "DND4E.PowerDaily",
	"recharge": "DND4E.PowerRecharge",
	"other": "DND4E.PowerOther",
	"item": "DND4E.PowerItem",
	// "utility": "DND4E.PowerUtil"
};
DND4E.powerSource = {
	"arcane": "DND4E.Arcane",
	"divine": "DND4E.Divine",
	"martial": "DND4E.Martial",
	"Elemental": "DND4E.Elemental",
	"ki": "DND4E.Ki",
	"primal": "DND4E.Primal",
	"psionic": "DND4E.Psionic",
	"shadow": "DND4E.Shadow",
};

DND4E.powerGroupTypes = {
	usage: {label: "DND4E.Usage"},
	action: {label: "DND4E.Action"},
	actionMod: {label: "DND4E.PowerGroupingModern"},
	type: {label: "DND4E.Type"},
	powerSubtype: {label: "DND4E.PowerSubtype"}
};
preLocalize("powerGroupTypes", { keys: ["label"] });

// the actual groupings by powerGroupTypes
DND4E.powerGroupings = {
	action: {
		standard: {label: "DND4E.ActionStandard" },
		move: {label: "DND4E.ActionMove" },
		minor: {label: "DND4E.ActionMinor" },
		free: {label: "DND4E.ActionFree" },
		reaction: {label: "DND4E.ActionReaction" },
		interrupt: {label: "DND4E.ActionInterrupt" },
		opportunity: {label: "DND4E.ActionOpportunity" },
		other: {label: "DND4E.Other" }
	},
	actionMod: {
		standard: {label: "DND4E.ActionStandard" },
		move: {label: "DND4E.ActionMove" },
		minor: {label: "DND4E.ActionMinor" },
		triggered: {label: "DND4E.ActionTriggered" },
		other: {label: "DND4E.Other" }
	},
	type: {
		inherent: {label: "DND4E.Inherent"},
		class: {label: "DND4E.Class"},
		race: {label: "DND4E.Race"},
		paragon: {label: "DND4E.Paragon"},
		epic: {label: "DND4E.Epic"},
		theme: {label: "DND4E.Theme"},
		feat: {label: "DND4E.Feat"},
		item: {label: "DND4E.PowerItem"},
		other: {label: "DND4E.Other"}
	},
	powerSubtype: {
		attack: {label: "DND4E.PowerAttack"},
		utility: {label: "DND4E.PowerUtil"},
		feature: {label: "DND4E.PowerFeature"},
		other: {label: "DND4E.Other"},
	},
	usage: {
		atwill: {label: "DND4E.PowerAt"},
		encounter: {label: "DND4E.PowerEnc"},
		daily: {label: "DND4E.PowerDaily"},
		item: {label: "DND4E.PowerItem"},
		recharge: {label: "DND4E.PowerRecharge"},
		other: {label: "DND4E.Other"}
	}
};

DND4E.powerSortTypes = {
	"name": {label: "DND4E.ItemName"},
	"level": {label: "DND4E.Level"},
	"actionType": {label: "DND4E.Action"},
	"rangeTextShort": {label: "DND4E.Range"},
	"useType": {label: "DND4E.Usage"},
	"use.value": {label: "DND4E.Used"},
	"powerSubtype": {label: "DND4E.PowerSubtype"},
	"none": {label: "DND4E.None"},
};
preLocalize("powerSortTypes", { keys: ["label"] });


DND4E.inventoryTypes = {
	weapon: { label: "DND4E.ItemTypeWeaponPl" },
	equipment: { label: "DND4E.ItemTypeEquipmentPl" },
	consumable: { label: "DND4E.ItemTypeConsumablePl" },
	tool: { label: "DND4E.ItemTypeToolPl" },
	backpack: { label: "DND4E.ItemTypeContainerPl" },
	loot: { label: "DND4E.ItemTypeLootPl" }
};

/*DND4E.featureTypes = {
	raceFeats: { label: "DND4E.FeatRace" },
	classFeats: { label: "DND4E.FeatClass" },
	pathFeats: { label: "DND4E.FeatPath" },
	destinyFeats: { label: "DND4E.FeatDestiny" },
	feat: { label: "DND4E.FeatLevel" },
	ritual: { label: "DND4E.FeatRitual" },
	feature: { label: "DND4E.Feature" }
};*/

DND4E.ritualTypes = {
	"binding": { label: "DND4E.Group.Ritual.Binding" },
	"creation": { label: "DND4E.Group.Ritual.Creation" },
	"deception": { label: "DND4E.Group.Ritual.Deception" },
	"divination": { label: "DND4E.Group.Ritual.Divination" },
	"exploration": { label: "DND4E.Group.Ritual.Exploration" },
	"restoration": { label: "DND4E.Group.Ritual.Restoration" },
	"scrying": { label: "DND4E.Group.Ritual.Scrying" },
	"travel": { label: "DND4E.Group.Ritual.Travel" },
	"warding": { label: "DND4E.Group.Ritual.Warding" },
	"other": { label: "DND4E.Other" }
};
preLocalize("ritualTypes", { keys: ["label"] });

DND4E.ritualSortTypes = {
	"name": {label: "DND4E.Name"},
	"level": {label: "DND4E.Level"},
	"attribute":  {label: "DND4E.Skill"},
	"none": {label: "DND4E.None"}
};
preLocalize("ritualSortTypes", { keys: ["label"] });

DND4E.powerDiceTypes = {
	"weapon": "Base Weapon Damage",
	"flat": "Flat Damage",
	"d4": "d4",
	"d6": "d6",
	"d8": "d8",
	"d10": "d10",
	"d12": "d12",
	"d20": "d20"
};

/* -------------------------------------------- */
/**
 * Character senses options
 * @type {Object}
 */
DND4E.special = {
	"nv": "DND4E.VisionNormal",
	"lv": "DND4E.VisionLowLight",
	"bv": "DND4E.VisionBlind",
	"aa": "DND4E.SpecialSensesAA",
	"bs": "DND4E.SpecialSensesBS",
	"dv": "DND4E.SpecialSensesDV",
	"ts": "DND4E.SpecialSensesTS",
	"tr": "DND4E.SpecialSensesTR"
};

DND4E.vision = {
	"nv": "DND4E.VisionNormal",
	"lv": "DND4E.VisionLowLight",
	"bv": "DND4E.VisionBlind"
};

DND4E.weaponType = {
	"melee": "DND4E.WeaponMelee",
	"meleeRanged": "DND4E.WeaponMeleeRanged",
	"ranged": "DND4E.WeaponRanged",
	"implement": "DND4E.WeaponPropertiesImp",
	"none": "DND4E.None",
	"any": "DND4E.AnyW",
};

DND4E.rangeType = {
	"weapon": {label: "DND4E.rangeWeapon"},
	"melee": {label: "DND4E.rangeMelee"},
	"reach": {label: "DND4E.rangeReach"},
	"range" : {label: "DND4E.rangeRanged"},
	"closeBurst": {label: "DND4E.rangeCloseBurst"},
	"closeBlast": {label: "DND4E.rangeCloseBlast"},
	"rangeBurst": {label: "DND4E.rangeBurst"},
	"rangeBlast": {label: "DND4E.rangeBlast"},
	"wall": {label: "DND4E.rangeWall"},
	"personal": {label: "DND4E.rangePersonal"},
	"touch": {label: "DND4E.rangeTouch"},
	"special": {label: "DND4E.rangeSpecial"},
};
preLocalize("rangeType", { keys: ["label"] });

DND4E.rangeTypeNoWeapon = Object.fromEntries(Object.entries(DND4E.rangeType).filter(function ([key, value]) {
	return key !== "weapon";
}));

// Bonus keys for tool required by a power—NOT the same as the keywords pulled from the weapon.
DND4E.toolKeys = {
	"meleeWeapon": "DND4E.WeaponMelee",
	"rangedWeapon": "DND4E.WeaponRanged",
	"weapon": "DND4E.Weapon",
	"usesImplement": "DND4E.WeaponPropertiesImp"
};

// Bonus keys for range/shape—NOT the same as the plain range values.
DND4E.rangeKeys = {
	"melee": "DND4E.rangeMelee",
	"ranged" : "DND4E.rangeRanged",
	"close": "DND4E.rangeWeapon",
	"area": "DND4E.rangeArea",
	"blast": "DND4E.rangeJustBlast",
	"burst" : "DND4E.rangeJustBurst",
	"closeBurst": "DND4E.rangeCloseBurst",
	"closeBlast": "DND4E.rangeCloseBlast",
	"areaBurst": "DND4E.rangeBurst",
	"areaBlast": "DND4E.rangeBlast",
	"wall": "DND4E.rangeWall"
};

DND4E.effectTypes = {
	"augmentable": "DND4E.Augmentable",
	"aura": "DND4E.Aura",
	"beast": "DND4E.Beast",
	"beastForm": "DND4E.BeastForm",
	"channelDiv": "DND4E.ChannelDivinity",
	"charm": "DND4E.Charm",
	"conjuration": "DND4E.Conjuration",
	"disease": "DND4E.Disease",
	"elemental": "DND4E.Elemental",
	"enchantment": "DND4E.Enchantment",
	"evocation": "DND4E.Evocation",
	"fear": "DND4E.Fear",
	"fullDis": "DND4E.FullDis",
	"gaze": "DND4E.Gaze",
	"healing": "DND4E.Healing",
	"illusion": "DND4E.Illusion",
	"invigorating": "DND4E.Invigorating",
	"mount": "DND4E.Mount",
	"necro": "DND4E.Necro",
	"nether": "DND4E.Nether",
	"poison": "DND4E.DamagePoison",
	"polymorph": "DND4E.Polymorph",
	"rage": "DND4E.Rage",
	"rattling": "DND4E.Rattling",
	"reliable": "DND4E.Reliable",
	"runic": "DND4E.Runic",
	"shadow": "DND4E.Shadow",
	"sleep": "DND4E.Sleep",
	"spirit": "DND4E.Spirit",
	"stance": "DND4E.Stance",
	"summoning": "DND4E.Summoning",
	"teleportation": "DND4E.Teleportation",
	"transmutation": "DND4E.Transmutation",
	"zone": "DND4E.Zone",
};

/**
 * Save types (5e/Vestigial?)
 * @type {Object}
 */
DND4E.saves = {
	"Arcane": "DND4E.Arcane",
	"Divine": "DND4E.Divine",
	"Martial": "DND4E.Martial",
	"Elemental": "DND4E.Elemental",
	"Ki": "DND4E.Ki",
	"Primal": "DND4E.Primal",
	"Psionic": "DND4E.Psionic",
	"Shadow": "DND4E.Shadow",

	"Acid": "DND4E.DamageAcid",
	"Cold": "DND4E.DamageCold",
	"Fire": "DND4E.DamageFire",
	"Force": "DND4E.DamageForce",
	"Lighting": "DND4E.DamageLightning",
	"Necrotic": "DND4E.DamageNecrotic",
	"Poison": "DND4E.DamagePoison",
	"Psychic": "DND4E.DamagePsychic",
	"Radiant": "DND4E.DamageRadiant",
	"Thunder ": "DND4E.DamageThunder",
	"Ongoing ": "DND4E.Ongoing",

	"Charm": "DND4E.Charm",
	"Fear": "DND4E.Fear",
	"Healing": "DND4E.Healing",
	"Illusion": "DND4E.Illusion",
	"Invigorating": "DND4E.Invigorating",
	"Polymorph": "DND4E.Polymorph",
	"Rage": "DND4E.Rage",
	"Sleep": "DND4E.Sleep",
	"Spirit": "DND4E.Spirit",
	"Teleportation": "DND4E.Teleportation"
};
/* -------------------------------------------- */

/**
 * The set of skill which can be trained in D&D4eBeta
 * @type {Object}
 */
DND4E.skills = {
	"acr": "DND4E.SkillAcr",
	"arc": "DND4E.SkillArc",
	"ath": "DND4E.SkillAth",
	"blu": "DND4E.SkillBlu",
	"dip": "DND4E.SkillDip",
	"dun": "DND4E.SkillDun",
	"end": "DND4E.SkillEnd",
	"hea": "DND4E.SkillHea",
	"his": "DND4E.SkillHis",
	"ins": "DND4E.SkillIns",
	"itm": "DND4E.SkillItm",
	"nat": "DND4E.SkillNat",
	"prc": "DND4E.SkillPrc",
	"rel": "DND4E.SkillRel",
	"stl": "DND4E.SkillStl",
	"stw": "DND4E.SkillStw",
	"thi": "DND4E.SkillThi"
};

/* -------------------------------------------- */
DND4E.modifiers ={
	"attack": "DND4E.ModifierAttack",
	"damage": "DND4E.ModifierDamage",
	"skills": "DND4E.ModifierSkills",
	"defences": "DND4E.ModifierDefences"
};


/**
 * Spellcasting progression and modes (5e/Vestigial?)
 * @type {Object}
 */
DND4E.spellPreparationModes = {
	"always": "DND4E.SpellPrepAlways",
	"atwill": "DND4E.SpellPrepAtWill",
	"innate": "DND4E.SpellPrepInnate",
	"pact": "DND4E.PactMagic",
	"prepared": "DND4E.SpellPrepPrepared"
};

DND4E.spellUpcastModes = ["always", "pact", "prepared"];

DND4E.spellProgression = {
	"none": "DND4E.SpellNone",
	"full": "DND4E.SpellProgFull",
	"half": "DND4E.SpellProgHalf",
	"third": "DND4E.SpellProgThird",
	"pact": "DND4E.SpellProgPact",
	"artificer": "DND4E.SpellProgArt"
};

/* -------------------------------------------- */

/**
 * The available choices for how spell damage scaling may be computed (5e/Vestigial?)
 * @type {Object}
 */
DND4E.spellScalingModes = {
	"none": "DND4E.SpellNone",
	"cantrip": "DND4E.SpellCantrip",
	"level": "DND4E.SpellLevel"
};

/* -------------------------------------------- */


/**
 * Define the set of types which a weapon item can take
 * @type {Object}
 */
DND4E.weaponTypes = {
	"simpleM": "DND4E.WeaponSimpleM",
	"militaryM": "DND4E.WeaponMilitaryM",
	"superiorM": "DND4E.WeaponSuperiorM",
	"improvM": "DND4E.WeaponImprovisedM",
	"simpleR": "DND4E.WeaponSimpleR",	
	"militaryR": "DND4E.WeaponMilitaryR",
	"superiorR": "DND4E.WeaponSuperiorR",
	"improvR": "DND4E.WeaponImprovisedR",
	"implement": "DND4E.WeaponImplement",
	"siegeM": "DND4E.WeaponSiegeM",
	"siegeR": "DND4E.WeaponSiegeR",
	"naturalM": "DND4E.WeaponNaturalM",
	"naturalR": "DND4E.WeaponNaturalR",
	"improv": "DND4E.WeaponImprov",
	"other": "DND4E.EquipmentTypeOther"
};

/* -------------------------------------------- */


/**
 * Define the set of hands configurations which a weapon item can take
 * @type {Object}
 */
DND4E.weaponHands = {
	"hMain": "DND4E.HMain",
	"hTwo": "DND4E.HTwo",
	"hOff": "DND4E.HOff",
	"hNone": "DND4E.HNone"
};


/* -------------------------------------------- */

/**
 * Define the set of weapon property flags which can exist on a weapon
 * @type {Object}
 */
DND4E.weaponProperties = {
	"amm": "DND4E.WeaponPropertiesAmm",
	"bru": "DND4E.WeaponPropertiesBru",
	"def": "DND4E.WeaponPropertiesDef",
	"hic": "DND4E.WeaponPropertiesHic",
	"imp": "DND4E.WeaponPropertiesImp",
	"lof": "DND4E.WeaponPropertiesLof",
	"lom": "DND4E.WeaponPropertiesLom",
	"mou": "DND4E.WeaponPropertiesMou",
	"off": "DND4E.WeaponPropertiesOff",
	"rch": "DND4E.WeaponPropertiesRch",
	"rel": "DND4E.WeaponPropertiesRel",
	"sml": "DND4E.WeaponPropertiesSml",
	"spc": "DND4E.WeaponPropertiesSpc",
	"sto": "DND4E.WeaponPropertiesSto",
	"thv": "DND4E.WeaponPropertiesThv",
	"tlg": "DND4E.WeaponPropertiesTlg",
	"two": "DND4E.WeaponPropertiesTwo",
	"ver": "DND4E.WeaponPropertiesVer"
};

DND4E.weaponGroup = {
	"axe": "DND4E.WeaponGroupAxe",
	"bladeH": "DND4E.WeaponGroupBladeH",
	"bladeL": "DND4E.WeaponGroupBladeL",
	"blowgun": "DND4E.WeaponGroupBlowgun",
	"bow": "DND4E.WeaponGroupBow",
	"cbow": "DND4E.WeaponGroupCBow",
	"dragon": "DND4E.WeaponGroupDragonShard",
	"flail": "DND4E.WeaponGroupFlail",
	"garrote": "DND4E.WeaponGroupGarrote",
	"ham": "DND4E.WeaponGroupHam",
	"mace": "DND4E.WeaponGroupMace",
	"pik": "DND4E.WeaponGroupPik",
	"pole": "DND4E.WeaponGroupPole",
	"sling": "DND4E.WeaponGroupSling",
	"spear": "DND4E.WeaponGroupSpear",
	"staff": "DND4E.WeaponGroupStaff",
	"unarm": "DND4E.WeaponGroupUnarm",
	"whip": "DND4E.WeaponGroupWhip"
};

DND4E.implement = {
	"holyS": "DND4E.ImplementHolySymbol",
	"ki": "DND4E.ImplementKiFocus",
	"orb": "DND4E.ImplementOrb",
	"rod": "DND4E.ImplementRod",
	"staff": "DND4E.ImplementStaff",
	"tome": "DND4E.ImplementTome",
	"totem": "DND4E.ImplementTotem",
	"wand": "DND4E.ImplementWand"
};

/* -------------------------------------------- */

/**
 * Skill, ability, and tool proficiency levels
 * Each level provides a proficiency multiplier
 * @type {Object}
 */

DND4E.trainingLevels = {
	0: "DND4E.NotTrained",
	5: "DND4E.Trained",
	8: "DND4E.FocusTrained"
};
/* -------------------------------------------- */

// Condition Types
DND4E.conditionTypes = {
	"blinded": "DND4E.ConBlinded",
	"bloodied": "DND4E.ConBlood",
	"dazed": "DND4E.ConDazed",
	"deafened": "DND4E.ConDeafened",
	"dominated": "DND4E.ConDominated",
	"dying": "DND4E.ConDying",
	"helpless": "DND4E.ConHelpless",
	"immobilized": "DND4E.Immobilized",
	"invisible": "DND4E.ConInvisible",
	"marked": "DND4E.ConMarked",
	"petrified": "DND4E.ConPetrified",
	"prone": "DND4E.ConProne",
	"restrained": "DND4E.ConRestrained",
	"slowed": "DND4E.ConSlower",
	"stunned": "DND4E.ConStunned",
	"surprised": "DND4E.ConSurprised",
	"unconscious": "DND4E.ConUnconscious",
	"weakened": "DND4E.ConWeakened",
};


DND4E.statusEffect = [
	//row 1
	{
		id: "mark_1",
		label: "EFFECT.statusMark",
		img: "systems/dnd4e/icons/statusEffects/mark_1.svg",
		description: "EFFECTDESC.mark"
	},
	{
		id: "mark_2",
		label: "EFFECT.statusMark",
		img: "systems/dnd4e/icons/statusEffects/mark_2.svg",
		description: "EFFECTDESC.mark"
	},
	{
		id: "mark_3",
		label: "EFFECT.statusMark",
		img: "systems/dnd4e/icons/statusEffects/mark_3.svg",
		description: "EFFECTDESC.mark"
	},
	{
		id: "mark_4",
		label: "EFFECT.statusMark",
		img: "systems/dnd4e/icons/statusEffects/mark_4.svg",
		description: "EFFECTDESC.mark"
	},
	{
		id: "mark_5",
		label: "EFFECT.statusMark",
		img: "systems/dnd4e/icons/statusEffects/mark_5.svg",
		description: "EFFECTDESC.mark"
	},
	{
		id: "mark_6",
		label: "EFFECT.statusMark",
		img: "systems/dnd4e/icons/statusEffects/mark_6.svg",
		description: "EFFECTDESC.mark"
	},
	{
		id: "mark_7",
		label: "EFFECT.statusMark",
		img: "systems/dnd4e/icons/statusEffects/mark_7.svg",
		description: "EFFECTDESC.mark"
	},
	//row 2
	{
		id: "bloodied",
		label: "EFFECT.statusBloodied",
		img: "systems/dnd4e/icons/statusEffects/bloodied.svg",
		description: "EFFECTDESC.bloodied"
	},
	{
		id: "attack_up",
		label: "EFFECT.statusAttackUp",
		img: "systems/dnd4e/icons/statusEffects/attack_up.svg",
		description: "EFFECTDESC.attackUp"
	},
	{
		id: "attack_down",
		label: "EFFECT.statusAttackDown",
		img: "systems/dnd4e/icons/statusEffects/attack_down.svg",
		description: "EFFECTDESC.attackDown"
	},
	{
		id: "defUp",
		label: "EFFECT.statusDefUp",
		img: "systems/dnd4e/icons/statusEffects/def_up.svg",
		description: "EFFECTDESC.defUp"
	},
	{
		id: "defDown",
		label: "EFFECT.statusDefDown",
		img: "systems/dnd4e/icons/statusEffects/def_down.svg",
		description: "EFFECTDESC.defDown"
	},
	{
		id: "regen",
		label: "EFFECT.statusRegen",
		img: "systems/dnd4e/icons/statusEffects/regen.svg",
		description: "EFFECTDESC.regen"
	},
	{
		id: "ammo_count",
		label: "EFFECT.statusAmmoCount",
		img: "systems/dnd4e/icons/statusEffects/ammo_count.svg",
		description: "EFFECTDESC.ammoCount"
	},
	//row 3
	{
		id: "curse",
		label: "EFFECT.statusCurse",
		img: "systems/dnd4e/icons/statusEffects/curse.svg",
		description: "EFFECTDESC.curse"
	},
	{
		id: "oath",
		label: "EFFECT.statusOath",
		img: "systems/dnd4e/icons/statusEffects/oath.svg",
		description: "EFFECTDESC.oath"
	},
	{
		id: "hunter_mark",
		label: "EFFECT.statusHunterMark",
		img: "systems/dnd4e/icons/statusEffects/hunter_mark.svg",
		description: "EFFECTDESC.huntermark"
	},
	{
		id: "target",
		label: "EFFECT.statusTarget",
		img: "systems/dnd4e/icons/statusEffects/target.svg",
		description: "EFFECTDESC.target"
	},
	{
		id: "ongoing_1",
		label: "EFFECT.statusOngoing1",
		img: "systems/dnd4e/icons/statusEffects/ongoing_1.svg",
		description: "EFFECTDESC.ongoing"
	},
	{
		id: "ongoing_2",
		label: "EFFECT.statusOngoing2",
		img: "systems/dnd4e/icons/statusEffects/ongoing_2.svg",
		description: "EFFECTDESC.ongoing"
	},
	{
		id: "ongoing_3",
		label: "EFFECT.statusOngoing3",
		img: "systems/dnd4e/icons/statusEffects/ongoing_3.svg",
		description: "EFFECTDESC.ongoing"
	},
	//row 4
	{
		id: "blinded",
		label: "EFFECT.statusBlind",
		img: "systems/dnd4e/icons/statusEffects/blinded.svg",
		description: "EFFECTDESC.blinded"
	},
	{
		id: "concealed",
		label: "EFFECT.statusConceal",
		img: "systems/dnd4e/icons/statusEffects/concealment.svg",
		description: "EFFECTDESC.concealed"
	},
	{
		id: "concealedfull",
		label: "EFFECT.statusConcealFull",
		img: "systems/dnd4e/icons/statusEffects/concealment-full.svg",
		description: "EFFECTDESC.concealedfull"
	},
	{
		id: "dazed",
		label: "EFFECT.statusDazed",
		img: "systems/dnd4e/icons/statusEffects/dazed.svg",
		description: "EFFECTDESC.dazed"
	},
	{
		id: "dead",
		label: "EFFECT.statusDead",
		img: "icons/svg/skull.svg",
		description: "EFFECTDESC.dead"
	},
	{
		id: "deafened",
		label: "EFFECT.statusDeafened",
		img: "systems/dnd4e/icons/statusEffects/deafened.svg",
		description: "EFFECTDESC.deafened"
	},
	{
		id: "disarmed",
		label: "EFFECT.statusDisarmed",
		img: "systems/dnd4e/icons/statusEffects/disarmed.svg",
		description: "EFFECTDESC.disarmed"
	},
	//row 5
	{
		id: "dominated",
		label: "EFFECT.statusDominated",
		img: "systems/dnd4e/icons/statusEffects/dominated.svg",
		description: "EFFECTDESC.dominated"
	},
	{
		id: "drunk",
		label: "EFFECT.statusDrunk",
		img: "systems/dnd4e/icons/statusEffects/drunk.svg",
		description: "EFFECTDESC.drunk"
	},	
	{
		id: "dying",
		label: "EFFECT.statusDying",
		img: "systems/dnd4e/icons/statusEffects/dying.svg",
		description: "EFFECTDESC.dying"
	},
	{
		id: "flying",
		label: "EFFECT.statusFlying",
		img: "systems/dnd4e/icons/statusEffects/flying.svg",
		description: "EFFECTDESC.flying"
	},
	{
		id: "grabbed",
		label: "EFFECT.statusGrabbed",
		img: "systems/dnd4e/icons/statusEffects/grabbed.svg",
		description: "EFFECTDESC.grabbed"
	},
	{
		id: "immobilized",
		label: "EFFECT.statusImmobilized",
		img: "systems/dnd4e/icons/statusEffects/immobilized.svg",
		description: "EFFECTDESC.immobilized"
	},
	{
		id: "insubstantial",
		label: "EFFECT.statusInsubstantial",
		img: "systems/dnd4e/icons/statusEffects/insubstantial.svg",
		description: "EFFECTDESC.insubstantial"
	},
	//row 6
	{
		id: "invisible",
		label: "EFFECT.statusInvisible",
		img: "systems/dnd4e/icons/statusEffects/invisible.svg",
		description: "EFFECTDESC.invisible"
	},
	{
		id: "mounted",
		label: "EFFECT.statusMounted",
		img: "systems/dnd4e/icons/statusEffects/mounted.svg",
		description: "EFFECTDESC.mounted"
	},		

	{
		id: "petrified",
		label: "EFFECT.statusPetrified",
		img: "systems/dnd4e/icons/statusEffects/petrified.svg",
		description: "EFFECTDESC.petrified"
	},
	{
		id: "prone",
		label: "EFFECT.statusProne",
		img: "systems/dnd4e/icons/statusEffects/prone.svg",
		description: "EFFECTDESC.prone"
	},
	{
		id: "removed",
		label: "EFFECT.statusRemoved",
		img: "systems/dnd4e/icons/statusEffects/removed.svg",
		description: "EFFECTDESC.removed"
	},	
	{
		id: "restrained",
		label: "EFFECT.statusRestrained",
		img: "systems/dnd4e/icons/statusEffects/restrained.svg",
		description: "EFFECTDESC.restrained"
	},	
	{
		id: "sleeping",
		label: "EFFECT.statusSleeping",
		img: "systems/dnd4e/icons/statusEffects/sleeping.svg",
		description: "EFFECTDESC.sleeping"
	},
	//row 7
	{
		id: "slowed",
		label: "EFFECT.statusSlowed",
		img: "systems/dnd4e/icons/statusEffects/slowed.svg",
		description: "EFFECTDESC.slowed"
	},
	{
		id: "stunned",
		label: "EFFECT.statusStunned",
		img: "systems/dnd4e/icons/statusEffects/stunned.svg",
		description: "EFFECTDESC.stunned"
	},
	{
		id: "surprised",
		label: "EFFECT.statusSurprised",
		img: "systems/dnd4e/icons/statusEffects/surprised.svg",
		description: "EFFECTDESC.surprised"
	},
	{
		id: "unconscious",
		label: "EFFECT.statusUnconscious",
		img: "systems/dnd4e/icons/statusEffects/unconscious.svg",
		description: "EFFECTDESC.unconscious"
	},
	{
		id: "weakened",
		label: "EFFECT.statusWeakened",
		img: "systems/dnd4e/icons/statusEffects/weakend.svg",
		description: "EFFECTDESC.weakened"
	},
	{
		id: "hidden",
		label: "EFFECT.statusHidden",
		img: "systems/dnd4e/icons/statusEffects/hidden.svg",
		description: "EFFECTDESC.hidden"
	},
	{
		id: "sneaking",
		label: "EFFECT.statusSneaking",
		img: "systems/dnd4e/icons/statusEffects/sneaking.svg",
		description: "EFFECTDESC.sneaking"
	},
	//row 8
	{
		id: "running",
		label: "EFFECT.statusRunning",
		img: "systems/dnd4e/icons/statusEffects/running.svg",
		description: "EFFECTDESC.running"
	},
	{
		id: "squeezing",
		label: "EFFECT.statusSqueezing",
		img: "systems/dnd4e/icons/statusEffects/squeezing.svg",
		description: "EFFECTDESC.squeezing"
	},
	{
		id: "torch",
		label: "EFFECT.statusTorch",
		img: "systems/dnd4e/icons/statusEffects/torch.svg",
		description: "EFFECTDESC.torch"
	},
];

// Languages
DND4E.spoken = {
	"Abyssal": "DND4E.SpokenAbyssal",
	"Common": "DND4E.SpokenCommon",
	"DeepSpeech": "DND4E.SpokenDeepSpeech",
	"Draconic": "DND4E.SpokenDraconic",
	"Dwarven": "DND4E.SpokenDwarven",
	"Elven": "DND4E.SpokenElven",
	"Giant": "DND4E.SpokenGiant",
	"Goblin": "DND4E.SpokenGoblin",
	"Primordial": "DND4E.SpokenPrimordial",
	"Supernal": "DND4E.SpokenSupernal",
};
DND4E.script = {
	"Common": "DND4E.ScriptCommon",
	"Barazhad": "DND4E.ScriptBarazhad",
	"Davek": "DND4E.ScriptDavek",
	"Iokharic": "DND4E.ScriptIokharic",
	"Rellanic": "DND4E.ScriptRellanic",
};

//use @level to derive value
DND4E.SCALE = {
	basic: {
		1: 1,
		6: 2,
		11: 3,
		16: 4,
		21: 5,
		26: 6
	},
}

DND4E.SNEAKSCALE = {//uses @tier to derive value 
	1: 2,
	2: 3,
	3: 5,
}

// Character Level XP Requirements
DND4E.CHARACTER_EXP_LEVELS =	[
	0, 1000, 2250, 3750, 5500, 7500, 10000, 13000, 16500, 20500,
	26000, 32000, 39000, 47000, 57000, 69000, 83000, 99000, 119000, 143000,
	175000, 210000, 255000, 310000, 375000, 450000, 550000, 675000, 825000, 1000000 
	];

// Configure Optional Character Flags (vestigial/5e?)
DND4E.characterFlags = {
	"powerfulBuild": {
		name: "DND4E.FlagsPowerfulBuild",
		hint: "DND4E.FlagsPowerfulBuildHint",
		section: "Racial Traits",
		type: Boolean
	},
	"savageAttacks": {
		name: "DND4E.FlagsSavageAttacks",
		hint: "DND4E.FlagsSavageAttacksHint",
		section: "Racial Traits",
		type: Boolean
	},
	"elvenAccuracy": {
		name: "DND4E.FlagsElvenAccuracy",
		hint: "DND4E.FlagsElvenAccuracyHint",
		section: "Racial Traits",
		type: Boolean
	},
	"halflingLucky": {
		name: "DND4E.FlagsHalflingLucky",
		hint: "DND4E.FlagsHalflingLuckyHint",
		section: "Racial Traits",
		type: Boolean
	},
	"initiativeAdv": {
		name: "DND4E.FlagsInitiativeAdv",
		hint: "DND4E.FlagsInitiativeAdvHint",
		section: "Feats",
		type: Boolean
	},
	"initiativeAlert": {
		name: "DND4E.FlagsAlert",
		hint: "DND4E.FlagsAlertHint",
		section: "Feats",
		type: Boolean
	},
	"jackOfAllTrades": {
		name: "DND4E.FlagsJOAT",
		hint: "DND4E.FlagsJOATHint",
		section: "Feats",
		type: Boolean
	},
	"observantFeat": {
		name: "DND4E.FlagsObservant",
		hint: "DND4E.FlagsObservantHint",
		skills: ['prc','inv'],
		section: "Feats",
		type: Boolean
	},
	"reliableTalent": {
		name: "DND4E.FlagsReliableTalent",
		hint: "DND4E.FlagsReliableTalentHint",
		section: "Feats",
		type: Boolean
	},
	"remarkableAthlete": {
		name: "DND4E.FlagsRemarkableAthlete",
		hint: "DND4E.FlagsRemarkableAthleteHint",
		abilities: ['str','dex','con'],
		section: "Feats",
		type: Boolean
	},
	"weaponCriticalThreshold": {
		name: "DND4E.FlagsCritThreshold",
		hint: "DND4E.FlagsCritThresholdHint",
		section: "Feats",
		type: Number,
		placeholder: 20
	}
};

// Configure allowed status flags
DND4E.allowedActorFlags = [
	"isPolymorphed", "originalActor"
].concat(Object.keys(DND4E.characterFlags));

