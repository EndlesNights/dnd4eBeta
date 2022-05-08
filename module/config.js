// Namespace D&D4e Configuration Values
export const DND4EBETA = {};

// ASCII Artwork
DND4EBETA.ASCII = `__________________________________________________________
______      ______   ___     ______      _        
|  _  \\___  |  _  \\ /   |    | ___ \\    | |       
| | | ( _ ) | | | |/ /| | ___| |_/ / ___| |_ __ _ 
| | | / _ \\/\\ | | / /_| |/ _ \\ ___ \\/ _ \\ __/ _\' |
| |/ / (_>  < |/ /\\___  |  __/ |_/ /  __/ || (_| |
|___/ \\___/\\/___/     |_/\\___\\____/ \\___|\\__\\__,_|
__________________________________________________________`;


/**
 * The set of Ability Scores used within the system
 * @type {Object}
 */
DND4EBETA.abilities = {
  "str": "DND4EBETA.AbilityStr",
  "con": "DND4EBETA.AbilityCon",
  "dex": "DND4EBETA.AbilityDex",
  "int": "DND4EBETA.AbilityInt",
  "wis": "DND4EBETA.AbilityWis",
  "cha": "DND4EBETA.AbilityCha"
};

/* -------------------------------------------- */

/**
 * Character alignment options
 * @type {Object}
 */
DND4EBETA.alignments = {
  'lg': "DND4EBETA.AlignmentLG",
  'ng': "DND4EBETA.AlignmentNG",
  'cg': "DND4EBETA.AlignmentCG",
  'ln': "DND4EBETA.AlignmentLN",
  'tn': "DND4EBETA.AlignmentTN",
  'cn': "DND4EBETA.AlignmentCN",
  'le': "DND4EBETA.AlignmentLE",
  'ne': "DND4EBETA.AlignmentNE",
  'ce': "DND4EBETA.AlignmentCE"
};


DND4EBETA.weaponProficiencies = {
  "sim": "DND4EBETA.WeaponSimpleProficiency",
  "mar": "DND4EBETA.WeaponMartialProficiency"
};

DND4EBETA.toolProficiencies = {
  "art": "DND4EBETA.ToolArtisans",
  "disg": "DND4EBETA.ToolDisguiseKit",
  "forg": "DND4EBETA.ToolForgeryKit",
  "game": "DND4EBETA.ToolGamingSet",
  "herb": "DND4EBETA.ToolHerbalismKit",
  "music": "DND4EBETA.ToolMusicalInstrument",
  "navg": "DND4EBETA.ToolNavigators",
  "pois": "DND4EBETA.ToolPoisonersKit",
  "thief": "DND4EBETA.ToolThieves",
  "vehicle": "DND4EBETA.ToolVehicle"
};


/* -------------------------------------------- */

/**
 * This Object defines the various lengths of time which can occur in D&D4e
 * @type {Object}
 */
DND4EBETA.timePeriods = {
  "inst": "DND4EBETA.TimeInst",
  "turn": "DND4EBETA.TimeTurn",
  "round": "DND4EBETA.TimeRound",
  "minute": "DND4EBETA.TimeMinute",
  "hour": "DND4EBETA.TimeHour",
  "day": "DND4EBETA.TimeDay",
  "month": "DND4EBETA.TimeMonth",
  "year": "DND4EBETA.TimeYear",
  "perm": "DND4EBETA.TimePerm",
  "spec": "DND4EBETA.Special"
};

/* -------------------------------------------- */

/**
 * This describes the ways that an ability can be activated
 * @type {Object}
 */
DND4EBETA.abilityActivationTypes = {
  "none": "DND4EBETA.NoAction",
  "standard": "DND4EBETA.ActionStandard",
  "move": "DND4EBETA.ActionMove",
  "minor": "DND4EBETA.ActionMinor",
  "free": "DND4EBETA.ActionFree",
  "reaction": "DND4EBETA.ActionReaction",
  "interrupt": "DND4EBETA.ActionInterrupt",
  "opportunity": "DND4EBETA.ActionOpportunity",
};

DND4EBETA.abilityActivationTypesShort = {
  "none": "DND4EBETA.NoActionShort",
  "standard": "DND4EBETA.ActionStandardShort",
  "move": "DND4EBETA.ActionMoveShort",
  "minor": "DND4EBETA.ActionMinorShort",
  "free": "DND4EBETA.ActionFreeShort",
  "reaction": "DND4EBETA.ActionReactionShort",
  "interrupt": "DND4EBETA.ActionInterruptShort",
  "opportunity": "DND4EBETA.ActionOpportunityShort",
};
/* -------------------------------------------- */


DND4EBETA.abilityConsumptionTypes = {
  "ammo": "DND4EBETA.ConsumeAmmunition",
  "attribute": "DND4EBETA.ConsumeAttribute",
  "material": "DND4EBETA.ConsumeMaterial",
  "charges": "DND4EBETA.ConsumeCharges"
};


/* -------------------------------------------- */

// Creature Sizes
DND4EBETA.actorSizes = {
  "tiny": "DND4EBETA.SizeTiny",
  "sm": "DND4EBETA.SizeSmall",
  "med": "DND4EBETA.SizeMedium",
  "lg": "DND4EBETA.SizeLarge",
  "huge": "DND4EBETA.SizeHuge",
  "grg": "DND4EBETA.SizeGargantuan"
};

DND4EBETA.tokenSizes = {
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
DND4EBETA.tokenHPColors = {
	damage: 0xFF0000,
	healing: 0x00FF00,
	temp: 0x66CCFF,
	tempmax: 0x440066,
	negmax: 0x550000
};

/* -------------------------------------------- */

/**
 * Classification types for item action types
 * @type {Object}
 */
DND4EBETA.itemActionTypes = {
  "mwak": "DND4EBETA.ActionMWAK",
  "rwak": "DND4EBETA.ActionRWAK",
  "msak": "DND4EBETA.ActionMSAK",
  "rsak": "DND4EBETA.ActionRSAK",
  "save": "DND4EBETA.ActionSave",
  "heal": "DND4EBETA.ActionHeal",
  "abil": "DND4EBETA.ActionAbil",
  "util": "DND4EBETA.ActionUtil",
  "other": "DND4EBETA.ActionOther"
};

/* -------------------------------------------- */

DND4EBETA.itemCapacityTypes = {
  "items": "DND4EBETA.ItemContainerCapacityItems",
  "weight": "DND4EBETA.ItemContainerCapacityWeight"
};

/* -------------------------------------------- */

/**
 * Enumerate the lengths of time over which an item can have limited use ability
 * @type {Object}
 */
DND4EBETA.limitedUsePeriods = {
  "enc": "DND4EBETA.Encounter",
  "day": "DND4EBETA.Day",
  "charges": "DND4EBETA.Charges",
  "round": "DND4EBETA.Round"
};

/* -------------------------------------------- */

DND4EBETA.launchOrder = {
	"both": "DND4EBETA.LaunchOrderBoth",
	"off": "DND4EBETA.LaunchOrderOff",
	"pre": "DND4EBETA.LaunchOrderPre",
	"post": "DND4EBETA.LaunchOrderPost",
	"sub": "DND4EBETA.LaunchOrderSub"
}

/* -------------------------------------------- */

/**
 * The set of equipment types for armour, clothing, and other objects which can ber worn by the character
 * @type {Object}
 */
DND4EBETA.equipmentTypes = {
  // "light": "DND4EBETA.EquipmentLight",
  // "medium": "DND4EBETA.EquipmentMedium",
  // "heavy": "DND4EBETA.EquipmentHeavy",
  // "bonus": "DND4EBETA.EquipmentBonus",
  // "natural": "DND4EBETA.EquipmentNatural",
  // "shield": "DND4EBETA.EquipmentShield",
  // "clothing": "DND4EBETA.EquipmentClothing",
  // "trinket": "DND4EBETA.EquipmentTrinket"
	"armour": "DND4EBETA.EquipmentTypeArmour",
	"arms": "DND4EBETA.EquipmentTypeArms",
	"feet": "DND4EBETA.EquipmentTypeFeet",
	"hands": "DND4EBETA.EquipmentTypeHands",
	"head": "DND4EBETA.EquipmentTypeHead",
	"neck": "DND4EBETA.EquipmentTypeNeck",
	"ring": "DND4EBETA.EquipmentTypeRing",
	"waist": "DND4EBETA.EquipmentTypeWaist",
	"natural": "DND4EBETA.EquipmentTypeNatural",
	"other": "DND4EBETA.EquipmentTypeOther",
};

DND4EBETA.equipmentTypesArmour = {
	"cloth": "DND4EBETA.EquipmentArmourCloth",
	"light": "DND4EBETA.EquipmentArmourLight",
	"heavy": "DND4EBETA.EquipmentArmourHeavy",
	"natural": "DND4EBETA.EquipmentArmourNatural",
};
DND4EBETA.equipmentTypesArms = {
	"light": "DND4EBETA.EquipmentArmsLight",
	"heavy": "DND4EBETA.EquipmentArmsHeavy",
	"bracers": "DND4EBETA.EquipmentArmsBracers",
	"bracelet": "DND4EBETA.EquipmentArmsBracelet",
};
DND4EBETA.equipmentTypesFeet = {
	"shoe": "DND4EBETA.EquipmentFeetShoe",
	"boot": "DND4EBETA.EquipmentFeetBoot",
	"greave": "DND4EBETA.EquipmentFeetGreave",
};
DND4EBETA.equipmentTypesHands = {
	"gloves": "DND4EBETA.EquipmentHandsGloves",
	"gauntlets": "DND4EBETA.EquipmentHandsGauntlets",
};
DND4EBETA.equipmentTypesHead = {
	"hat": "DND4EBETA.EquipmentHeadHat",
	"helmet": "DND4EBETA.EquipmentHeadHelmet",
	"eyewear": "DND4EBETA.EquipmentHeadEyewear",

};
DND4EBETA.equipmentTypesNeck = {
	"necklace": "DND4EBETA.EquipmentNeckNecklace",
	"amulet": "DND4EBETA.EquipmentNeckAmulet",
	"cloak": "DND4EBETA.EquipmentCloak",
};
DND4EBETA.equipmentTypesWaist = {
	"belt": "DND4EBETA.EquipmentWaistBelt",
};

/* -------------------------------------------- */

/**
 * The set of armour Proficiencies which a character may have
 * @type {Object}
 */
DND4EBETA.armourProficiencies = {
  "lgt": DND4EBETA.equipmentTypes.light,
  "med": DND4EBETA.equipmentTypes.medium,
  "hvy": DND4EBETA.equipmentTypes.heavy,
  "shl": "DND4EBETA.EquipmentShieldProficiency"
};


/* -------------------------------------------- */

DND4EBETA.creatureOrigin = {
	"aberrant": "DND4EBETA.CreatureOriginAberrant",
	"elemental": "DND4EBETA.CreatureOriginElemental",
	"fey": "DND4EBETA.CreatureOriginFey",
	"immortal": "DND4EBETA.CreatureOriginImmortal",
	"natural": "DND4EBETA.CreatureOriginNatural",
	"shadow": "DND4EBETA.CreatureOriginShadow",

}

/* -------------------------------------------- */

DND4EBETA.creatureRole = {
	"artillery": "DND4EBETA.CreatureRoleArtillery",
	"brute": "DND4EBETA.CreatureRoleBrute",
	"controller": "DND4EBETA.CreatureRoleController",
	"defender": "DND4EBETA.CreatureRoleDefender",
	"leader": "DND4EBETA.CreatureRoleLeader",
	"lurker": "DND4EBETA.CreatureRoleLurker",
	"skirmisher": "DND4EBETA.CreatureRoleSkirmisher",
	"striker": "DND4EBETA.CreatureRoleStriker",
	"soldier": "DND4EBETA.CreatureRoleSoldier",
}

/* -------------------------------------------- */

DND4EBETA.creatureRoleSecond = {
	"standard": "DND4EBETA.CreatureRoleSecStandard",
	"elite": "DND4EBETA.CreatureRoleSecElite",
	"solo": "DND4EBETA.CreatureRoleSecSolo",
	"minion": "DND4EBETA.CreatureRoleSecMinion",
	"other": "DND4EBETA.CreatureRoleSecOther",
}

/* -------------------------------------------- */

DND4EBETA.creatureType = {
	"animate": "DND4EBETA.CreatureTypeAnimate",
	"beast": "DND4EBETA.CreatureTypeBeast",
	"humanoid": "DND4EBETA.CreatureTypeHumanoid",
	"magical": "DND4EBETA.CreatureTypeMagicalBeaste",
}

/* -------------------------------------------- */

/**
 * Enumerate the valid consumable types which are recognized by the system
 * @type {Object}
 */
DND4EBETA.consumableTypes = {
  "alchemical": "DND4EBETA.ConsumableAlchemical",
  "ammo": "DND4EBETA.ConsumableAmmunition",
  "potion": "DND4EBETA.ConsumablePotion",
  "poison": "DND4EBETA.ConsumablePoison",
  "food": "DND4EBETA.ConsumableFood",
  "scroll": "DND4EBETA.ConsumableScroll",
  "trinket": "DND4EBETA.ConsumableTrinket"
};

/* -------------------------------------------- */
DND4EBETA.commonAttackBonuses = {
	comAdv: {value: 2, label:"DND4EBETA.CommonAttackComAdv"},
	charge: {value: 1, label:"DND4EBETA.CommonAttackCharge"},
	conceal: {value: -2, label:"DND4EBETA.CommonAttackConceal"},
	concealTotal: {value: -5, label:"DND4EBETA.CommonAttackConcealTotal"},
	cover: {value: -2, label:"DND4EBETA.CommonAttackCover"},
	coverSup: {value: -5, label:"DND4EBETA.CommonAttackCoverSup"},
	longRange: {value: -2, label:"DND4EBETA.CommonAttackLongRange"},
	prone: {value: -2, label:"DND4EBETA.CommonAttackProne"},
	restrained: {value: -2, label:"DND4EBETA.CommonAttackRestrained"},
	running: {value: -5, label:"DND4EBETA.CommonAttackRunning"},
	squeez: {value: -5, label:"DND4EBETA.CommonAttackSqueez"},
}
/* -------------------------------------------- */

/**
 * The valid currency denominations supported by the 4e system
 * @type {Object}
 */
DND4EBETA.currencies = {
  "ad": "DND4EBETA.CurrencyAD",
  "pp": "DND4EBETA.CurrencyPP",
  "gp": "DND4EBETA.CurrencyGP",
  "sp": "DND4EBETA.CurrencySP",
  "cp": "DND4EBETA.CurrencyCP"
};

/**
 * Define the upwards-conversion rules for registered currency types
 * @type {{string, object}}
 */
DND4EBETA.currencyConversion = {
  cp: {into: "sp", each: 10},
  sp: {into: "gp", each: 10 },
  gp: {into: "pp", each: 100},
  pp: {into: "ad", each: 100}
};

/* -------------------------------------------- */

DND4EBETA.ritualcomponents = {
	"ar": "DND4EBETA.RitualCompAR",
	"ms": "DND4EBETA.RitualCompMS",
	"rh": "DND4EBETA.RitualCompRH",
	"si": "DND4EBETA.RitualCompSI",
	"rs": "DND4EBETA.RitualCompRS"
};

/* -------------------------------------------- */

// Damage Types
DND4EBETA.damageTypes = {
	
  "damage": "DND4EBETA.Damage",
  "acid": "DND4EBETA.DamageAcid",
  // "bludgeoning": "DND4EBETA.DamageBludgeoning",
  // "bludgeon": "DND4EBETA.DamageBludgeoning",
  "cold": "DND4EBETA.DamageCold",
  "fire": "DND4EBETA.DamageFire",
  "force": "DND4EBETA.DamageForce",
  "lightning": "DND4EBETA.DamageLightning",
  "necrotic": "DND4EBETA.DamageNecrotic",
  // "pierce": "DND4EBETA.DamagePiercing",
  // "piercing": "DND4EBETA.DamagePiercing",
  "physical": "DND4EBETA.Damagephysical",
  "poison": "DND4EBETA.DamagePoison",
  "psychic": "DND4EBETA.DamagePsychic",
  "radiant": "DND4EBETA.DamageRadiant",
  // "slashing": "DND4EBETA.DamageSlashing",
  // "slash": "DND4EBETA.DamageSlashing",
  "thunder": "DND4EBETA.DamageThunder"
};

/* -------------------------------------------- */

// Def
DND4EBETA.def = {
  "ac": "DND4EBETA.DefAC",
  "fort": "DND4EBETA.DefFort",
  "ref": "DND4EBETA.DefRef",
  "wil": "DND4EBETA.DefWil"
};/* -------------------------------------------- */


// Defensives
DND4EBETA.defensives = {
  "ac": "DND4EBETA.DefenceAC",
  "fort": "DND4EBETA.DefenceFort",
  "ref": "DND4EBETA.DefenceRef",
  "wil": "DND4EBETA.DefenceWil"
};

/* -------------------------------------------- */

DND4EBETA.distanceUnits = {
  "none": "DND4EBETA.None",
  "self": "DND4EBETA.DistSelf",
  "touch": "DND4EBETA.DistTouch",
  "ft": "DND4EBETA.DistFt",
  "mi": "DND4EBETA.DistMi",
  "spec": "DND4EBETA.Special",
  "any": "DND4EBETA.DistAny"
};

/* -------------------------------------------- */

DND4EBETA.durationType = {
	"endOfTargetTurn": "DND4EBETA.DurationEndOfTargetTurn",
	"endOfUserTurn": "DND4EBETA.DurationEndOfUserTurn",
	"startOfTargetTurn": "DND4EBETA.DurationStartOfTargetTurn",
	"startOfUserTurn": "DND4EBETA.DurationStartOfUserTurn",
	"saveEnd": "DND4EBETA.DurationSaveEnd",
	"endOfEncounter": "DND4EBETA.DurationEndOfEnc",
	"endOfDay": "DND4EBETA.DurationEndOfDay",
	"custom": "DND4EBETA.DurationCustom",
}

/* -------------------------------------------- */

DND4EBETA.powerEffectTypes = {
	"all": "DND4EBETA.TargetAll",
	"hit": "DND4EBETA.TargetHit",
	"miss": "DND4EBETA.TargetMiss",
	"self": "DND4EBETA.TargetSelf",
}
/* -------------------------------------------- */


/**
 * Configure aspects of encumbrance calculation so that it could be configured by modules
 * @type {Object}
 */
DND4EBETA.encumbrance = {
  currencyPerWeight: 50,
  strMultiplier: 15
};

/* -------------------------------------------- */

/**
 * This Object defines the types of single or area targets which can be applied in D&D4e
 * @type {Object}
 */
DND4EBETA.targetTypes = {
  "none": "DND4EBETA.None",
  "ally": "DND4EBETA.TargetAlly",
  "creature": "DND4EBETA.TargetCreature",
  "enemy": "DND4EBETA.TargetEnemy",
  "personal": "DND4EBETA.TargetPersonal",
  "object": "DND4EBETA.TargetObject",
  "square": "DND4EBETA.TargetSquare",
  "wall": "DND4EBETA.TargetWall",
  "allyA": "DND4EBETA.TargetAllyAdjacent",
  "creatureA": "DND4EBETA.TargetCreatureAdjacent",
  "enemyA": "DND4EBETA.TargetEnemyAdjacent",
};


/* -------------------------------------------- */


/**
 * Map the subset of target types which produce a template area of effect
 * The keys are DND4EBETA target types and the values are MeasuredTemplate shape types
 * @type {Object}
 */
DND4EBETA.areaTargetTypes = {
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
DND4EBETA.healingTypes = {
  "healing": "DND4EBETA.Healing",
  "temphp": "DND4EBETA.HealingTemp"
};

/* -------------------------------------------- */

DND4EBETA.featureSortTypes = {
	"name": "DND4EBETA.ItemName",
	"level": "DND4EBETA.Level",
	"none": "DND4EBETA.None",
};

/* -------------------------------------------- */

DND4EBETA.powerType = {
	"inherent": "DND4EBETA.Inherent",
	"class": "DND4EBETA.Class",
	"race": "DND4EBETA.Racial",
	"paragon": "DND4EBETA.Paragon",
	"epic": "DND4EBETA.Epic",
	"theme": "DND4EBETA.Theme",
	"item": "DND4EBETA.PowerItem",
	"feat": "DND4EBETA.Feat",
	"skill": "DND4EBETA.Skill",
	"utility": "DND4EBETA.PowerUtil" //Better keep this for legacy
};
DND4EBETA.powerSubtype = {
	"attack": "DND4EBETA.PowerAttack",
	"utility": "DND4EBETA.PowerUtil",
	"feature": "DND4EBETA.PowerFeature"
};

DND4EBETA.powerUseType = {
	"atwill": "DND4EBETA.PowerAt",
	"encounter": "DND4EBETA.PowerEnc",
	"daily": "DND4EBETA.PowerDaily",
	"recharge": "DND4EBETA.PowerRecharge",
	"other": "DND4EBETA.PowerOther",
	"item": "DND4EBETA.PowerItem",
	// "utility": "DND4EBETA.PowerUtil"
};
DND4EBETA.powerSource = {
	"arcane": "DND4EBETA.Arcane",
	"divine": "DND4EBETA.Divine",
	"martial": "DND4EBETA.Martial",
	"Elemental": "DND4EBETA.Elemental",
	"ki": "DND4EBETA.Ki",
	"primal": "DND4EBETA.Primal",
	"psionic": "DND4EBETA.Psionic",
	"shadow": "DND4EBETA.Shadow",
};

DND4EBETA.powerGroupTypes = {
	"usage": "DND4EBETA.Usage",
	"action": "DND4EBETA.Action",
	"type": "DND4EBETA.Type",
	"powerSubtype": "DND4EBETA.PowerSubtype",
};

DND4EBETA.powerSortTypes = {
	"name": "DND4EBETA.ItemName",
	"level": "DND4EBETA.Level",
	"actionType": "DND4EBETA.Action",
	"rangeTextShort": "DND4EBETA.Range",
	"useType": "DND4EBETA.Usage",
	"use.value": "DND4EBETA.Used",
	"powerSubtype": "DND4EBETA.PowerSubtype",
	"none": "DND4EBETA.None",
};

DND4EBETA.powerDiceTypes = {
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
DND4EBETA.special = {
	"nv": "DND4EBETA.VisionNormal",
	"lv": "DND4EBETA.VisionLowLight",
	"bv": "DND4EBETA.VisionBlind",
	"aa": "DND4EBETA.SpecialSensesAA",
	"bs": "DND4EBETA.SpecialSensesBS",
	"dv": "DND4EBETA.SpecialSensesDV",
	"ts": "DND4EBETA.SpecialSensesTS",
	"tr": "DND4EBETA.SpecialSensesTR"
};

DND4EBETA.vision = {
	"nv": "DND4EBETA.VisionNormal",
	"lv": "DND4EBETA.VisionLowLight",
	"bv": "DND4EBETA.VisionBlind"
};

DND4EBETA.weaponType = {
	"melee": "DND4EBETA.WeaponMelee",
	"meleeRanged": "DND4EBETA.WeaponMeleeRanged",
	"ranged": "DND4EBETA.WeaponRanged",
	"implement": "DND4EBETA.WeaponPropertiesImp",
	"none": "DND4EBETA.None",
	"any": "DND4EBETA.AnyW",
};

DND4EBETA.rangeType = {
	"weapon": "DND4EBETA.rangeWeapon",
	"melee": "DND4EBETA.rangeMelee",
	"reach": "DND4EBETA.rangeReach",
	"range" : "DND4EBETA.rangeRanged",
	"closeBurst": "DND4EBETA.rangeCloseBurst",
	"closeBlast": "DND4EBETA.rangeCloseBlast",
	"rangeBurst": "DND4EBETA.rangeBurst",
	"rangeBlast": "DND4EBETA.rangeBlast",
	"wall": "DND4EBETA.rangeWall",
	"personal": "DND4EBETA.rangePersonal",
	"touch": "DND4EBETA.rangeTouch",
	"special": "DND4EBETA.rangeSpecial",
};

DND4EBETA.rangeTypeNoWeapon = Object.fromEntries(Object.entries(DND4EBETA.rangeType).filter(function ([key, value]) {
	return key !== "weapon";
}));

DND4EBETA.effectTypes = {
	"augmentable": "DND4EBETA.Augmentable",
	"aura": "DND4EBETA.Aura",
	"beast": "DND4EBETA.Beast",
	"beastForm": "DND4EBETA.BeastForm",
	"channelDiv": "DND4EBETA.ChannelDivinity",
	"charm": "DND4EBETA.Charm",
	"conjuration": "DND4EBETA.Conjuration",
	"disease": "DND4EBETA.Disease",
	"elemental": "DND4EBETA.Elemental",
	"enchantment": "DND4EBETA.Enchantment",
	"evocation": "DND4EBETA.Evocation",
	"fear": "DND4EBETA.Fear",
	"fullDis": "DND4EBETA.FullDis",
	"gaze": "DND4EBETA.Gaze",
	"healing": "DND4EBETA.Healing",
	"illusion": "DND4EBETA.Illusion",
	"invigorating": "DND4EBETA.Invigorating",
	"mount": "DND4EBETA.Mount",
	"necro": "DND4EBETA.Necro",
	"nether": "DND4EBETA.Nether",
	"poison": "DND4EBETA.DamagePoison",
	"polymorph": "DND4EBETA.Polymorph",
	"rage": "DND4EBETA.Rage",
	"rattling": "DND4EBETA.Rattling",
	"reliable": "DND4EBETA.Reliable",
	"runic": "DND4EBETA.Runic",
	"sleep": "DND4EBETA.Sleep",
	"spirit": "DND4EBETA.Spirit",
	"stance": "DND4EBETA.Stance",
	"summoning": "DND4EBETA.Summoning",
	"teleportation": "DND4EBETA.Teleportation",
	"transmutation": "DND4EBETA.Transmutation",
	"zone": "DND4EBETA.Zone",
};

DND4EBETA.saves = {
	"Arcane": "DND4EBETA.Arcane",
	"Divine": "DND4EBETA.Divine",
	"Martial": "DND4EBETA.Martial",
	"Elemental": "DND4EBETA.Elemental",
	"Ki": "DND4EBETA.Ki",
	"Primal": "DND4EBETA.Primal",
	"Psionic": "DND4EBETA.Psionic",
	"Shadow": "DND4EBETA.Shadow",

	"Acid": "DND4EBETA.DamageAcid",
	"Cold": "DND4EBETA.DamageCold",
	"Fire": "DND4EBETA.DamageFire",
	"Force": "DND4EBETA.DamageForce",
	"Lighting": "DND4EBETA.DamageLightning",
	"Necrotic": "DND4EBETA.DamageNecrotic",
	"Poison": "DND4EBETA.DamagePoison",
	"Psychic": "DND4EBETA.DamagePsychic",
	"Radiant": "DND4EBETA.DamageRadiant",
	"Thunder ": "DND4EBETA.DamageThunder",

	"Charm": "DND4EBETA.Charm",
	"Fear": "DND4EBETA.Fear",
	"Healing": "DND4EBETA.Healing",
	"Illusion": "DND4EBETA.Illusion",
	"Invigorating": "DND4EBETA.Invigorating",
	"Polymorph": "DND4EBETA.Polymorph",
	"Rage": "DND4EBETA.Rage",
	"Sleep": "DND4EBETA.Sleep",
	"Spirit": "DND4EBETA.Spirit",
	"Teleportation": "DND4EBETA.Teleportation"
};
/* -------------------------------------------- */

/**
 * The set of skill which can be trained in D&D4eBeta
 * @type {Object}
 */
DND4EBETA.skills = {
  "acr": "DND4EBETA.SkillAcr",
  "arc": "DND4EBETA.SkillArc",
  "ath": "DND4EBETA.SkillAth",
  "blu": "DND4EBETA.SkillBlu",
  "dip": "DND4EBETA.SkillDip",
  "dun": "DND4EBETA.SkillDun",
  "end": "DND4EBETA.SkillEnd",
  "hea": "DND4EBETA.SkillHea",
  "his": "DND4EBETA.SkillHis",
  "ins": "DND4EBETA.SkillIns",
  "itm": "DND4EBETA.SkillItm",
  "nat": "DND4EBETA.SkillNat",
  "prc": "DND4EBETA.SkillPrc",
  "rel": "DND4EBETA.SkillRel",
  "stl": "DND4EBETA.SkillStl",
  "stw": "DND4EBETA.SkillStw",
  "thi": "DND4EBETA.SkillThi"
};

/* -------------------------------------------- */
DND4EBETA.modifiers ={
	"attack": "DND4EBETA.ModifierAttack",
	"damage": "DND4EBETA.ModifierDamage",
}

/* -------------------------------------------- */

DND4EBETA.spellPreparationModes = {
  "always": "DND4EBETA.SpellPrepAlways",
  "atwill": "DND4EBETA.SpellPrepAtWill",
  "innate": "DND4EBETA.SpellPrepInnate",
  "pact": "DND4EBETA.PactMagic",
  "prepared": "DND4EBETA.SpellPrepPrepared"
};

DND4EBETA.spellUpcastModes = ["always", "pact", "prepared"];


DND4EBETA.spellProgression = {
  "none": "DND4EBETA.SpellNone",
  "full": "DND4EBETA.SpellProgFull",
  "half": "DND4EBETA.SpellProgHalf",
  "third": "DND4EBETA.SpellProgThird",
  "pact": "DND4EBETA.SpellProgPact",
  "artificer": "DND4EBETA.SpellProgArt"
};

/* -------------------------------------------- */

/**
 * The available choices for how spell damage scaling may be computed
 * @type {Object}
 */
DND4EBETA.spellScalingModes = {
  "none": "DND4EBETA.SpellNone",
  "cantrip": "DND4EBETA.SpellCantrip",
  "level": "DND4EBETA.SpellLevel"
};

/* -------------------------------------------- */


/**
 * Define the set of types which a weapon item can take
 * @type {Object}
 */
DND4EBETA.weaponTypes = {
	"simpleM": "DND4EBETA.WeaponSimpleM",
	"militaryM": "DND4EBETA.WeaponMilitaryM",
	"superiorM": "DND4EBETA.WeaponSuperiorM",
	"improvM": "DND4EBETA.WeaponImprovisedM",
	"simpleR": "DND4EBETA.WeaponSimpleR",  
	"militaryR": "DND4EBETA.WeaponMilitaryR",
	"superiorR": "DND4EBETA.WeaponSuperiorR",
	"improvR": "DND4EBETA.WeaponImprovisedR",
	"implement": "DND4EBETA.WeaponImplement",
	"siegeM": "DND4EBETA.WeaponSiegeM",
	"siegeR": "DND4EBETA.WeaponSiegeR",
	"naturalM": "DND4EBETA.WeaponNaturalM",
	"naturalR": "DND4EBETA.WeaponNaturalR",
	"improv": "DND4EBETA.WeaponImprov",
	"other": "DND4EBETA.EquipmentTypeOther",

};

/* -------------------------------------------- */


/**
 * Define the set of hands configurations which a weapon item cantake
 * @type {Object}
 */
DND4EBETA.weaponHands = {
  "hMain": "DND4EBETA.HMain",
  "hTwo": "DND4EBETA.HTwo",
  "hOff": "DND4EBETA.HOff",
};


/* -------------------------------------------- */

/**
 * Define the set of weapon property flags which can exist on a weapon
 * @type {Object}
 */
DND4EBETA.weaponProperties = {
  "amm": "DND4EBETA.WeaponPropertiesAmm",
  "bru": "DND4EBETA.WeaponPropertiesBru",
  "def": "DND4EBETA.WeaponPropertiesDef",
  "hic": "DND4EBETA.WeaponPropertiesHic",
  "imp": "DND4EBETA.WeaponPropertiesImp",
  "lof": "DND4EBETA.WeaponPropertiesLof",
  "lom": "DND4EBETA.WeaponPropertiesLom",
  "off": "DND4EBETA.WeaponPropertiesOff",
  "rch": "DND4EBETA.WeaponPropertiesRch",
  "rel": "DND4EBETA.WeaponPropertiesRel",
  "sml": "DND4EBETA.WeaponPropertiesSml",
  "spc": "DND4EBETA.WeaponPropertiesSpc",
  "thv": "DND4EBETA.WeaponPropertiesThv",
  "tlg": "DND4EBETA.WeaponPropertiesTlg",
  "two": "DND4EBETA.WeaponPropertiesTwo",
  "ver": "DND4EBETA.WeaponPropertiesVer"
};

DND4EBETA.weaponGroup = {
	"axe": "DND4EBETA.WeaponGroupAxe",
	"bladeH": "DND4EBETA.WeaponGroupBladeH",
	"bladeL": "DND4EBETA.WeaponGroupBladeL",
	"blowgun": "DND4EBETA.WeaponGroupBlowgun",
	"bow": "DND4EBETA.WeaponGroupBow",
	"cbow": "DND4EBETA.WeaponGroupCBow",
	"dragon": "DND4EBETA.WeaponGroupDragonShard",
	"flail": "DND4EBETA.WeaponGroupFlail",
	"garrote": "DND4EBETA.WeaponGroupGarrote",
	"ham": "DND4EBETA.WeaponGroupHam",
	"mace": "DND4EBETA.WeaponGroupMace",
	"pik": "DND4EBETA.WeaponGroupPik",
	"pole": "DND4EBETA.WeaponGroupPole",
	"sling": "DND4EBETA.WeaponGroupSling",
	"spear": "DND4EBETA.WeaponGroupSpear",
	"staff": "DND4EBETA.WeaponGroupStaff",
	"unarm": "DND4EBETA.WeaponGroupUnarm",
	"whip": "DND4EBETA.WeaponGroupWhip"
};

DND4EBETA.implementGroup = {
	"holyS": "DND4EBETA.ImplementGroupHolySymbol",
	"ki": "DND4EBETA.ImplementGroupKiFocus",
	"orb": "DND4EBETA.ImplementGroupOrb",
	"rod": "DND4EBETA.ImplementGroupRod",
	"staff": "DND4EBETA.ImplementGroupStaff",
	"tome": "DND4EBETA.ImplementGroupTome",
	"totem": "DND4EBETA.ImplementGroupTotem",
	"wand": "DND4EBETA.ImplementGroupWand"
};

/* -------------------------------------------- */

/**
 * Skill, ability, and tool proficiency levels
 * Each level provides a proficiency multiplier
 * @type {Object}
 */

DND4EBETA.trainingLevels = {
  0: "DND4EBETA.NotTrained",
  5: "DND4EBETA.Trained",
  8: "DND4EBETA.FocusTrained"
};
/* -------------------------------------------- */

// Condition Types
DND4EBETA.conditionTypes = {
	"blinded": "DND4EBETA.ConBlinded",
	"bloodied": "DND4EBETA.ConBlood",
	"dazed": "DND4EBETA.ConDazed",
	"deafened": "DND4EBETA.ConDeafened",
	"dominated": "DND4EBETA.ConDominated",
	"dying": "DND4EBETA.ConDying",
	"helpless": "DND4EBETA.ConHelpless",
	"immobilized": "DND4EBETA.Immobilized",
	"invisible": "DND4EBETA.ConInvisible",
	"marked": "DND4EBETA.ConMarked",
	"petrified": "DND4EBETA.ConPetrified",
	"prone": "DND4EBETA.ConProne",
	"restrained": "DND4EBETA.ConRestrained",
	"slowed": "DND4EBETA.ConSlower",
	"stunned": "DND4EBETA.ConStunned",
	"surprised": "DND4EBETA.ConSurprised",
	"unconscious": "DND4EBETA.ConUnconscious",
	"weakened": "DND4EBETA.ConWeakened",
};


DND4EBETA.statusEffect = [
	//row 1
	{
		id: "mark_1",
		label: "EFFECT.statusMark",
		icon: "systems/dnd4e/icons/statusEffects/mark_1.svg"
	},
	{
		id: "mark_2",
		label: "EFFECT.statusMark",
		icon: "systems/dnd4e/icons/statusEffects/mark_2.svg"
	},
	{
		id: "mark_3",
		label: "EFFECT.statusMark",
		icon: "systems/dnd4e/icons/statusEffects/mark_3.svg"
	},
	{
		id: "mark_4",
		label: "EFFECT.statusMark",
		icon: "systems/dnd4e/icons/statusEffects/mark_4.svg"
	},
	{
		id: "mark_5",
		label: "EFFECT.statusMark",
		icon: "systems/dnd4e/icons/statusEffects/mark_5.svg"
	},
	{
		id: "mark_6",
		label: "EFFECT.statusMark",
		icon: "systems/dnd4e/icons/statusEffects/mark_6.svg"
	},
	{
		id: "mark_7",
		label: "EFFECT.statusMark",
		icon: "systems/dnd4e/icons/statusEffects/mark_7.svg"
	},
	//row 2
	{
		id: "bloodied",
		label: "EFFECT.statusBloodied",
		icon: "systems/dnd4e/icons/statusEffects/bloodied.svg"
	},
	{
		id: "attack_up",
		label: "EFFECT.statusAttackUp",
		icon: "systems/dnd4e/icons/statusEffects/attack_up.svg"
	},
	{
		id: "attack_down",
		label: "EFFECT.statusAttackDown",
		icon: "systems/dnd4e/icons/statusEffects/attack_down.svg"
	},
	{
		id: "defUp",
		label: "EFFECT.statusDefUp",
		icon: "systems/dnd4e/icons/statusEffects/def_up.svg"
	},
	{
		id: "defDown",
		label: "EFFECT.statusDefDown",
		icon: "systems/dnd4e/icons/statusEffects/def_down.svg"
	},
	{
		id: "regen",
		label: "EFFECT.statusRegen",
		icon: "systems/dnd4e/icons/statusEffects/regen.svg"
	},
	{
		id: "ammo_count",
		label: "EFFECT.statusAmmoCount",
		icon: "systems/dnd4e/icons/statusEffects/ammo_count.svg"
	},
	//row 3
	{
		id: "curse",
		label: "EFFECT.statusCurse",
		icon: "systems/dnd4e/icons/statusEffects/curse.svg"
	},
	{
		id: "oath",
		label: "EFFECT.statusOath",
		icon: "systems/dnd4e/icons/statusEffects/oath.svg"
	},
	{
		id: "hunter_mark",
		label: "EFFECT.statusHunterMark",
		icon: "systems/dnd4e/icons/statusEffects/hunter_mark.svg"
	},
	{
		id: "target",
		label: "EFFECT.statusTarget",
		icon: "systems/dnd4e/icons/statusEffects/target.svg"
	},
	{
		id: "ongoing_1",
		label: "EFFECT.statusOngoing1",
		icon: "systems/dnd4e/icons/statusEffects/ongoing_1.svg"
	},
	{
		id: "ongoing_2",
		label: "EFFECT.statusOngoing2",
		icon: "systems/dnd4e/icons/statusEffects/ongoing_2.svg"
	},
	{
		id: "ongoing_3",
		label: "EFFECT.statusOngoing3",
		icon: "systems/dnd4e/icons/statusEffects/ongoing_3.svg"
	},
	//row 4
	{
		id: "blinded",
		label: "EFFECT.statusBlind",
		icon: "systems/dnd4e/icons/statusEffects/blinded.svg"
	},
	{
		id: "dazed",
		label: "EFFECT.statusDazed",
		icon: "systems/dnd4e/icons/statusEffects/dazed.svg"
	},
	{
		id: "dead",
		label: "EFFECT.statusDead",
		icon: "icons/svg/skull.svg"
	},
	{
		id: "deafened",
		label: "EFFECT.statusDeafened",
		icon: "systems/dnd4e/icons/statusEffects/deafened.svg"
	},
	{
		id: "disarmed",
		label: "EFFECT.statusDisarmed",
		icon: "systems/dnd4e/icons/statusEffects/disarmed.svg"
	},
	{
		id: "dominated",
		label: "EFFECT.statusDominated",
		icon: "systems/dnd4e/icons/statusEffects/dominated.svg"
	},
	{
		id: "drunk",
		label: "EFFECT.statusDrunk",
		icon: "systems/dnd4e/icons/statusEffects/drunk.svg"
	},	
	//row 5
	{
		id: "dying",
		label: "EFFECT.statusDying",
		icon: "systems/dnd4e/icons/statusEffects/dying.svg"
	},
	{
		id: "flying",
		label: "EFFECT.statusFlying",
		icon: "systems/dnd4e/icons/statusEffects/flying.svg"
	},
	{
		id: "grabbed",
		label: "EFFECT.statusGrabbed",
		icon: "systems/dnd4e/icons/statusEffects/grabbed.svg"
	},
	{
		id: "immobilized",
		label: "EFFECT.statusImmobilized",
		icon: "systems/dnd4e/icons/statusEffects/immobilized.svg"
	},
	{
		id: "insubstantial",
		label: "EFFECT.statusInsubstantial",
		icon: "systems/dnd4e/icons/statusEffects/insubstantial.svg"
	},
	{
		id: "invisible",
		label: "EFFECT.statusInvisible",
		icon: "systems/dnd4e/icons/statusEffects/invisible.svg"
	},
	{
		id: "mounted",
		label: "EFFECT.statusMounted",
		icon: "systems/dnd4e/icons/statusEffects/mounted.svg"
	},		
	//row 6

	{
		id: "petrified",
		label: "EFFECT.statusPetrified",
		icon: "systems/dnd4e/icons/statusEffects/petrified.svg"
	},
	{
		id: "prone",
		label: "EFFECT.statusProne",
		icon: "systems/dnd4e/icons/statusEffects/prone.svg"
	},
	{
		id: "removed",
		label: "EFFECT.statusRemoved",
		icon: "systems/dnd4e/icons/statusEffects/removed.svg"
	},	
	{
		id: "restrained",
		label: "EFFECT.statusRestrained",
		icon: "systems/dnd4e/icons/statusEffects/restrained.svg"
	},	
	{
		id: "sleeping",
		label: "EFFECT.statusSleeping",
		icon: "systems/dnd4e/icons/statusEffects/sleeping.svg"
	},
	{
		id: "slowed",
		label: "EFFECT.statusSlowed",
		icon: "systems/dnd4e/icons/statusEffects/slowed.svg"
	},
	{
		id: "sneaking",
		label: "EFFECT.statusSneaking",
		icon: "systems/dnd4e/icons/statusEffects/sneaking.svg"
	},
	//row 7
	{
		id: "stunned",
		label: "EFFECT.statusStunned",
		icon: "systems/dnd4e/icons/statusEffects/stunned.svg"
	},
	{
		id: "surprised",
		label: "EFFECT.statusSurprised",
		icon: "systems/dnd4e/icons/statusEffects/surprised.svg"
	},
	{
		id: "torch",
		label: "EFFECT.statusTorch",
		icon: "systems/dnd4e/icons/statusEffects/torch.svg"
	},
	{
		id: "unconscious",
		label: "EFFECT.statusUnconscious",
		icon: "systems/dnd4e/icons/statusEffects/unconscious.svg"
	},
	{
		id: "weakened",
		label: "EFFECT.statusWeakened",
		icon: "systems/dnd4e/icons/statusEffects/weakend.svg"
	}
];
// Languages
DND4EBETA.spoken = {
  "Abyssal": "DND4EBETA.SpokenAbyssal",
  "Common": "DND4EBETA.SpokenCommon",
  "DeepSpeech": "DND4EBETA.SpokenDeepSpeech",
  "Draconic": "DND4EBETA.SpokenDraconic",
  "Dwarven": "DND4EBETA.SpokenDwarven",
  "Elven": "DND4EBETA.SpokenElven",
  "Giant": "DND4EBETA.SpokenGiant",
  "Goblin": "DND4EBETA.SpokenGoblin",
  "Primordial": "DND4EBETA.SpokenPrimordial",
  "Supernal": "DND4EBETA.SpokenSupernal",
};
DND4EBETA.script = {
  "Common": "DND4EBETA.ScriptCommon",
  "Barazhad": "DND4EBETA.ScriptBarazhad",
  "Davek": "DND4EBETA.ScriptDavek",
  "Iokharic": "DND4EBETA.ScriptIokharic",
  "Rellanic": "DND4EBETA.ScriptRellanic",

};

// Character Level XP Requirements
DND4EBETA.CHARACTER_EXP_LEVELS =  [
	0, 1000, 2250, 3750, 5500, 7500, 10000, 13000, 16500, 20500,
	26000, 32000, 39000, 47000, 57000, 69000, 83000, 99000, 119000, 143000,
	175000, 210000, 255000, 310000, 375000, 450000, 550000, 675000, 825000, 1000000 
	];

// Configure Optional Character Flags
DND4EBETA.characterFlags = {
  "powerfulBuild": {
    name: "DND4EBETA.FlagsPowerfulBuild",
    hint: "DND4EBETA.FlagsPowerfulBuildHint",
    section: "Racial Traits",
    type: Boolean
  },
  "savageAttacks": {
    name: "DND4EBETA.FlagsSavageAttacks",
    hint: "DND4EBETA.FlagsSavageAttacksHint",
    section: "Racial Traits",
    type: Boolean
  },
  "elvenAccuracy": {
    name: "DND4EBETA.FlagsElvenAccuracy",
    hint: "DND4EBETA.FlagsElvenAccuracyHint",
    section: "Racial Traits",
    type: Boolean
  },
  "halflingLucky": {
    name: "DND4EBETA.FlagsHalflingLucky",
    hint: "DND4EBETA.FlagsHalflingLuckyHint",
    section: "Racial Traits",
    type: Boolean
  },
  "initiativeAdv": {
    name: "DND4EBETA.FlagsInitiativeAdv",
    hint: "DND4EBETA.FlagsInitiativeAdvHint",
    section: "Feats",
    type: Boolean
  },
  "initiativeAlert": {
    name: "DND4EBETA.FlagsAlert",
    hint: "DND4EBETA.FlagsAlertHint",
    section: "Feats",
    type: Boolean
  },
  "jackOfAllTrades": {
    name: "DND4EBETA.FlagsJOAT",
    hint: "DND4EBETA.FlagsJOATHint",
    section: "Feats",
    type: Boolean
  },
  "observantFeat": {
    name: "DND4EBETA.FlagsObservant",
    hint: "DND4EBETA.FlagsObservantHint",
    skills: ['prc','inv'],
    section: "Feats",
    type: Boolean
  },
  "reliableTalent": {
    name: "DND4EBETA.FlagsReliableTalent",
    hint: "DND4EBETA.FlagsReliableTalentHint",
    section: "Feats",
    type: Boolean
  },
  "remarkableAthlete": {
    name: "DND4EBETA.FlagsRemarkableAthlete",
    hint: "DND4EBETA.FlagsRemarkableAthleteHint",
    abilities: ['str','dex','con'],
    section: "Feats",
    type: Boolean
  },
  "weaponCriticalThreshold": {
    name: "DND4EBETA.FlagsCritThreshold",
    hint: "DND4EBETA.FlagsCritThresholdHint",
    section: "Feats",
    type: Number,
    placeholder: 20
  }
};

// Configure allowed status flags
DND4EBETA.allowedActorFlags = [
  "isPolymorphed", "originalActor"
].concat(Object.keys(DND4EBETA.characterFlags));
