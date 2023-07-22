// Namespace D&D4e Configuration Values
export const DND4EALTUS = {};

// ASCII Artwork
DND4EALTUS.ASCII = `__________________________________________________________
______      ______   ___  _____     ___  _ _             
|  _  \\___  |  _  \\ /   ||  ___|   / _ \\| | |            
| | | ( _ ) | | | |/ /| || |__    / /_\\ \\ | |_ _   _ ___ 
| | | / _ \\/\\ | | / /_| ||  __|   |  _  | | __| | | / __|
| |/ / (_>  < |/ /\\___  || |___   | | | | | |_| |_| \\__ \\
|___/ \\___/\\/___/     |_/\\____/   \\_| |_/_|\\__|\\__,_|___/
__________________________________________________________`;


/**
 * The set of Ability Scores used within the system
 * @type {Object}
 */
DND4EALTUS.abilities = {
  "str": "DND4EALTUS.AbilityStr",
  "con": "DND4EALTUS.AbilityCon",
  "dex": "DND4EALTUS.AbilityDex",
  "int": "DND4EALTUS.AbilityInt",
  "wis": "DND4EALTUS.AbilityWis",
  "cha": "DND4EALTUS.AbilityCha"
};

/* -------------------------------------------- */

/**
 * Character alignment options
 * @type {Object}
 */
DND4EALTUS.alignments = {
  'lg': "DND4EALTUS.AlignmentLG",
  'ng': "DND4EALTUS.AlignmentNG",
  'cg': "DND4EALTUS.AlignmentCG",
  'ln': "DND4EALTUS.AlignmentLN",
  'tn': "DND4EALTUS.AlignmentTN",
  'cn': "DND4EALTUS.AlignmentCN",
  'le': "DND4EALTUS.AlignmentLE",
  'ne': "DND4EALTUS.AlignmentNE",
  'ce': "DND4EALTUS.AlignmentCE"
};


DND4EALTUS.weaponProficiencies = {
  "sim": "DND4EALTUS.WeaponSimpleProficiency",
  "mar": "DND4EALTUS.WeaponMartialProficiency"
};

DND4EALTUS.toolProficiencies = {
  "art": "DND4EALTUS.ToolArtisans",
  "disg": "DND4EALTUS.ToolDisguiseKit",
  "forg": "DND4EALTUS.ToolForgeryKit",
  "game": "DND4EALTUS.ToolGamingSet",
  "herb": "DND4EALTUS.ToolHerbalismKit",
  "music": "DND4EALTUS.ToolMusicalInstrument",
  "navg": "DND4EALTUS.ToolNavigators",
  "pois": "DND4EALTUS.ToolPoisonersKit",
  "thief": "DND4EALTUS.ToolThieves",
  "vehicle": "DND4EALTUS.ToolVehicle"
};


/* -------------------------------------------- */

/**
 * This Object defines the various lengths of time which can occur in D&D4e
 * @type {Object}
 */
DND4EALTUS.timePeriods = {
  "inst": "DND4EALTUS.TimeInst",
  "turn": "DND4EALTUS.TimeTurn",
  "round": "DND4EALTUS.TimeRound",
  "minute": "DND4EALTUS.TimeMinute",
  "hour": "DND4EALTUS.TimeHour",
  "day": "DND4EALTUS.TimeDay",
  "month": "DND4EALTUS.TimeMonth",
  "year": "DND4EALTUS.TimeYear",
  "perm": "DND4EALTUS.TimePerm",
  "spec": "DND4EALTUS.Special"
};

/* -------------------------------------------- */

/**
 * This describes the ways that an ability can be activated
 * @type {Object}
 */
DND4EALTUS.abilityActivationTypes = {
  "none": "DND4EALTUS.NoAction",
  "standard": "DND4EALTUS.ActionStandard",
  "move": "DND4EALTUS.ActionMove",
  "minor": "DND4EALTUS.ActionMinor",
  "free": "DND4EALTUS.ActionFree",
  "reaction": "DND4EALTUS.ActionReaction",
  "interrupt": "DND4EALTUS.ActionInterrupt",
  "opportunity": "DND4EALTUS.ActionOpportunity",
};

DND4EALTUS.abilityActivationTypesShort = {
  "none": "DND4EALTUS.NoActionShort",
  "standard": "DND4EALTUS.ActionStandardShort",
  "move": "DND4EALTUS.ActionMoveShort",
  "minor": "DND4EALTUS.ActionMinorShort",
  "free": "DND4EALTUS.ActionFreeShort",
  "reaction": "DND4EALTUS.ActionReactionShort",
  "interrupt": "DND4EALTUS.ActionInterruptShort",
  "opportunity": "DND4EALTUS.ActionOpportunityShort",
};
/* -------------------------------------------- */


DND4EALTUS.abilityConsumptionTypes = {
  "ammo": "DND4EALTUS.ConsumeAmmunition",
  "attribute": "DND4EALTUS.ConsumeAttribute",
  "material": "DND4EALTUS.ConsumeMaterial",
  "charges": "DND4EALTUS.ConsumeCharges"
};


/* -------------------------------------------- */

// Creature Sizes
DND4EALTUS.actorSizes = {
  "tiny": "DND4EALTUS.SizeTiny",
  "sm": "DND4EALTUS.SizeSmall",
  "med": "DND4EALTUS.SizeMedium",
  "lg": "DND4EALTUS.SizeLarge",
  "huge": "DND4EALTUS.SizeHuge",
  "grg": "DND4EALTUS.SizeGargantuan"
};

DND4EALTUS.tokenSizes = {
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
DND4EALTUS.tokenHPColors = {
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
DND4EALTUS.itemActionTypes = {
  "mwak": "DND4EALTUS.ActionMWAK",
  "rwak": "DND4EALTUS.ActionRWAK",
  "msak": "DND4EALTUS.ActionMSAK",
  "rsak": "DND4EALTUS.ActionRSAK",
  "save": "DND4EALTUS.ActionSave",
  "heal": "DND4EALTUS.ActionHeal",
  "abil": "DND4EALTUS.ActionAbil",
  "util": "DND4EALTUS.ActionUtil",
  "other": "DND4EALTUS.ActionOther"
};

/* -------------------------------------------- */

DND4EALTUS.itemCapacityTypes = {
  "items": "DND4EALTUS.ItemContainerCapacityItems",
  "weight": "DND4EALTUS.ItemContainerCapacityWeight"
};

/* -------------------------------------------- */

/**
 * Enumerate the lengths of time over which an item can have limited use ability
 * @type {Object}
 */
DND4EALTUS.limitedUsePeriods = {
  "enc": "DND4EALTUS.Encounter",
  "day": "DND4EALTUS.Day",
  "charges": "DND4EALTUS.Charges",
  "round": "DND4EALTUS.Round"
};

/* -------------------------------------------- */

DND4EALTUS.launchOrder = {
	"both": "DND4EALTUS.LaunchOrderBoth",
	"off": "DND4EALTUS.LaunchOrderOff",
	"pre": "DND4EALTUS.LaunchOrderPre",
	"post": "DND4EALTUS.LaunchOrderPost",
	"sub": "DND4EALTUS.LaunchOrderSub"
}

/* -------------------------------------------- */

DND4EALTUS.autoanimationHook = {
  "attack": "DND4EALTUS.AutoanimationHookAttack",
  "damage": "DND4EALTUS.AutoanimationHookDamage",
  "healing": "DND4EALTUS.AutoanimationHookHealing",
  "usePower": "DND4EALTUS.AutoanimationHookUsePower",
  "template": "DND4EALTUS.AutoanimationHookTemplate",
};

/* -------------------------------------------- */

/**
 * The set of equipment types for armour, clothing, and other objects which can ber worn by the character
 * @type {Object}
 */
DND4EALTUS.equipmentTypes = {
  // "light": "DND4EALTUS.EquipmentLight",
  // "medium": "DND4EALTUS.EquipmentMedium",
  // "heavy": "DND4EALTUS.EquipmentHeavy",
  // "bonus": "DND4EALTUS.EquipmentBonus",
  // "natural": "DND4EALTUS.EquipmentNatural",
  // "shield": "DND4EALTUS.EquipmentShield",
  // "clothing": "DND4EALTUS.EquipmentClothing",
  // "trinket": "DND4EALTUS.EquipmentTrinket"
	"armour": "DND4EALTUS.EquipmentTypeArmour",
	"arms": "DND4EALTUS.EquipmentTypeArms",
	"feet": "DND4EALTUS.EquipmentTypeFeet",
	"hands": "DND4EALTUS.EquipmentTypeHands",
	"head": "DND4EALTUS.EquipmentTypeHead",
	"neck": "DND4EALTUS.EquipmentTypeNeck",
	"ring": "DND4EALTUS.EquipmentTypeRing",
	"waist": "DND4EALTUS.EquipmentTypeWaist",
	"natural": "DND4EALTUS.EquipmentTypeNatural",
	"other": "DND4EALTUS.EquipmentTypeOther",
};

DND4EALTUS.equipmentTypesArmour = {
	//"cloth": "DND4EALTUS.EquipmentArmourCloth",
	"light": "DND4EALTUS.EquipmentArmourLight",
	"heavy": "DND4EALTUS.EquipmentArmourHeavy",
	"natural": "DND4EALTUS.EquipmentArmourNatural",
};
DND4EALTUS.equipmentTypesArms = {
	"light": "DND4EALTUS.EquipmentArmsLight",
	"heavy": "DND4EALTUS.EquipmentArmsHeavy",
	"bracers": "DND4EALTUS.EquipmentArmsBracers",
	"bracelet": "DND4EALTUS.EquipmentArmsBracelet",
};
DND4EALTUS.equipmentTypesFeet = {
	"shoe": "DND4EALTUS.EquipmentFeetShoe",
	"boot": "DND4EALTUS.EquipmentFeetBoot",
	"greave": "DND4EALTUS.EquipmentFeetGreave",
};
DND4EALTUS.equipmentTypesHands = {
	"gloves": "DND4EALTUS.EquipmentHandsGloves",
	"gauntlets": "DND4EALTUS.EquipmentHandsGauntlets",
};
DND4EALTUS.equipmentTypesHead = {
	"hat": "DND4EALTUS.EquipmentHeadHat",
	"helmet": "DND4EALTUS.EquipmentHeadHelmet",
	"eyewear": "DND4EALTUS.EquipmentHeadEyewear",

};
DND4EALTUS.equipmentTypesNeck = {
	"necklace": "DND4EALTUS.EquipmentNeckNecklace",
	"amulet": "DND4EALTUS.EquipmentNeckAmulet",
	"cloak": "DND4EALTUS.EquipmentCloak",
};
DND4EALTUS.equipmentTypesWaist = {
	"belt": "DND4EALTUS.EquipmentWaistBelt",
};

/* -------------------------------------------- */

/**
 * The set of armour Proficiencies which a character may have
 * @type {Object}
 */
DND4EALTUS.armourProficiencies = {
  "lgt": "DND4EALTUS.equipmentTypes.light",
  "med": "DND4EALTUS.equipmentTypes.medium",
  "hvy": "DND4EALTUS.equipmentTypes.heavy",
  "shl": "DND4EALTUS.EquipmentShieldProficiency"
};


/* -------------------------------------------- */

DND4EALTUS.creatureOrigin = {
	"aberrant": "DND4EALTUS.CreatureOriginAberrant",
	"elemental": "DND4EALTUS.CreatureOriginElemental",
	"fey": "DND4EALTUS.CreatureOriginFey",
	"immortal": "DND4EALTUS.CreatureOriginImmortal",
	"natural": "DND4EALTUS.CreatureOriginNatural",
	"shadow": "DND4EALTUS.CreatureOriginShadow",

}

/* -------------------------------------------- */

DND4EALTUS.creatureRole = {
	"artillery": "DND4EALTUS.CreatureRoleArtillery",
	"brute": "DND4EALTUS.CreatureRoleBrute",
	"controller": "DND4EALTUS.CreatureRoleController",
	"defender": "DND4EALTUS.CreatureRoleDefender",
	"leader": "DND4EALTUS.CreatureRoleLeader",
	"lurker": "DND4EALTUS.CreatureRoleLurker",
	"skirmisher": "DND4EALTUS.CreatureRoleSkirmisher",
	"striker": "DND4EALTUS.CreatureRoleStriker",
	"soldier": "DND4EALTUS.CreatureRoleSoldier",
}

/* -------------------------------------------- */

DND4EALTUS.creatureRoleSecond = {
	"standard": "DND4EALTUS.CreatureRoleSecStandard",
	"elite": "DND4EALTUS.CreatureRoleSecElite",
	"solo": "DND4EALTUS.CreatureRoleSecSolo",
	"minion": "DND4EALTUS.CreatureRoleSecMinion",
	"other": "DND4EALTUS.CreatureRoleSecOther",
}

/* -------------------------------------------- */

DND4EALTUS.creatureType = {
	"animate": "DND4EALTUS.CreatureTypeAnimate",
	"beast": "DND4EALTUS.CreatureTypeBeast",
	"humanoid": "DND4EALTUS.CreatureTypeHumanoid",
	"magical": "DND4EALTUS.CreatureTypeMagicalBeaste",
}

/* -------------------------------------------- */

/**
 * Enumerate the valid consumable types which are recognized by the system
 * @type {Object}
 */
DND4EALTUS.consumableTypes = {
  "alchemical": "DND4EALTUS.ConsumableAlchemical",
  "ammo": "DND4EALTUS.ConsumableAmmunition",
  "potion": "DND4EALTUS.ConsumablePotion",
  "poison": "DND4EALTUS.ConsumablePoison",
  "food": "DND4EALTUS.ConsumableFood",
  "scroll": "DND4EALTUS.ConsumableScroll",
  "trinket": "DND4EALTUS.ConsumableTrinket"
};

/* -------------------------------------------- */
DND4EALTUS.commonAttackBonuses = {
	comAdv: {value: 2, label:"DND4EALTUS.CommonAttackComAdv"},
	charge: {value: 1, label:"DND4EALTUS.CommonAttackCharge"},
	conceal: {value: -2, label:"DND4EALTUS.CommonAttackConceal"},
	concealTotal: {value: -5, label:"DND4EALTUS.CommonAttackConcealTotal"},
	cover: {value: -2, label:"DND4EALTUS.CommonAttackCover"},
	coverSup: {value: -5, label:"DND4EALTUS.CommonAttackCoverSup"},
	longRange: {value: -2, label:"DND4EALTUS.CommonAttackLongRange"},
	prone: {value: -2, label:"DND4EALTUS.CommonAttackProne"},
	restrained: {value: -2, label:"DND4EALTUS.CommonAttackRestrained"},
	running: {value: -5, label:"DND4EALTUS.CommonAttackRunning"},
	squeez: {value: -5, label:"DND4EALTUS.CommonAttackSqueez"},
}
/* -------------------------------------------- */

/**
 * The valid currency denominations supported by the 4e system
 * @type {Object}
 */
DND4EALTUS.currencies = {
  "ad": "DND4EALTUS.CurrencyAD",
  "pp": "DND4EALTUS.CurrencyPP",
  "gp": "DND4EALTUS.CurrencyGP",
  "sp": "DND4EALTUS.CurrencySP",
  "cp": "DND4EALTUS.CurrencyCP"
};

/**
 * Define the upwards-conversion rules for registered currency types
 * @type {{string, object}}
 */
DND4EALTUS.currencyConversion = {
  cp: {into: "sp", each: 10},
  sp: {into: "gp", each: 10 },
  gp: {into: "pp", each: 100},
  pp: {into: "ad", each: 100}
};

/* -------------------------------------------- */

DND4EALTUS.ritualcomponents = {
	"ar": "DND4EALTUS.RitualCompAR",
	"ms": "DND4EALTUS.RitualCompMS",
	"rh": "DND4EALTUS.RitualCompRH",
	"si": "DND4EALTUS.RitualCompSI",
	"rs": "DND4EALTUS.RitualCompRS"
};

/* -------------------------------------------- */

// Damage Types
DND4EALTUS.damageTypes = {
	
  "damage": "DND4EALTUS.DamageAll",
  "acid": "DND4EALTUS.DamageAcid",
  // "bludgeoning": "DND4EALTUS.DamageBludgeoning",
  // "bludgeon": "DND4EALTUS.DamageBludgeoning",
  "cold": "DND4EALTUS.DamageCold",
  "fire": "DND4EALTUS.DamageFire",
  "force": "DND4EALTUS.DamageForce",
  "lightning": "DND4EALTUS.DamageLightning",
  "necrotic": "DND4EALTUS.DamageNecrotic",
  // "pierce": "DND4EALTUS.DamagePiercing",
  // "piercing": "DND4EALTUS.DamagePiercing",
  "physical": "DND4EALTUS.Damagephysical",
  "poison": "DND4EALTUS.DamagePoison",
  "psychic": "DND4EALTUS.DamagePsychic",
  "radiant": "DND4EALTUS.DamageRadiant",
  // "slashing": "DND4EALTUS.DamageSlashing",
  // "slash": "DND4EALTUS.DamageSlashing",
  "thunder": "DND4EALTUS.DamageThunder"
};

/* -------------------------------------------- */

// Def
DND4EALTUS.def = {
  "ac": "DND4EALTUS.DefAC",
  "fort": "DND4EALTUS.DefFort",
  "ref": "DND4EALTUS.DefRef",
  "wil": "DND4EALTUS.DefWil"
};/* -------------------------------------------- */


// Defensives
DND4EALTUS.defensives = {
  "ac": "DND4EALTUS.DefenceAC",
  "fort": "DND4EALTUS.DefenceFort",
  "ref": "DND4EALTUS.DefenceRef",
  "wil": "DND4EALTUS.DefenceWil"
};

/* -------------------------------------------- */

DND4EALTUS.distanceUnits = {
  "none": "DND4EALTUS.None",
  "self": "DND4EALTUS.DistSelf",
  "touch": "DND4EALTUS.DistTouch",
  "ft": "DND4EALTUS.DistFt",
  "mi": "DND4EALTUS.DistMi",
  "spec": "DND4EALTUS.Special",
  "any": "DND4EALTUS.DistAny"
};

/* -------------------------------------------- */

DND4EALTUS.durationType = {
	"endOfTargetTurn": "DND4EALTUS.DurationEndOfTargetTurn",
	"endOfUserTurn": "DND4EALTUS.DurationEndOfUserTurn",
	"startOfTargetTurn": "DND4EALTUS.DurationStartOfTargetTurn",
	"startOfUserTurn": "DND4EALTUS.DurationStartOfUserTurn",
	"saveEnd": "DND4EALTUS.DurationSaveEnd",
	"endOfEncounter": "DND4EALTUS.DurationEndOfEnc",
	"endOfDay": "DND4EALTUS.DurationEndOfDay",
	"custom": "DND4EALTUS.DurationCustom",
}

/* -------------------------------------------- */

DND4EALTUS.powerEffectTypes = {
	"all": "DND4EALTUS.TargetAll",
	"hit": "DND4EALTUS.TargetHit",
	"miss": "DND4EALTUS.TargetMiss",
	"self": "DND4EALTUS.TargetSelf",
}

/* -------------------------------------------- */

DND4EALTUS.profArmor = {
	cloth: "DND4EALTUS.ArmourProfCloth",
	leather: "DND4EALTUS.ArmourProfLeather",
	hide: "DND4EALTUS.ArmourProfHide",
	chain: "DND4EALTUS.ArmourProfChain",
	scale: "DND4EALTUS.ArmourProfScale",
	plate: "DND4EALTUS.ArmourProfPlate",
	light: "DND4EALTUS.ArmourProfShieldLight",
	heavy: "DND4EALTUS.ArmourProfShieldHeavy",
};

DND4EALTUS.cloth = {
	
};
DND4EALTUS.light = {
	cloth: "DND4EALTUS.ArmourProfCloth",
	leather: "DND4EALTUS.ArmourProfLeather",
	hide: "DND4EALTUS.ArmourProfHide",
};
DND4EALTUS.heavy = {
	chain: "DND4EALTUS.ArmourProfChain",
	scale: "DND4EALTUS.ArmourProfScale",
	plate: "DND4EALTUS.ArmourProfPlate",
};
DND4EALTUS.natural = {

};
DND4EALTUS.shield = {
	light: "DND4EALTUS.ArmourProfShieldLight",
	heavy: "DND4EALTUS.ArmourProfShieldHeavy",
};
DND4EALTUS.weaponProficiencies = {
	simpleM: "DND4EALTUS.WeaponSimpleM",
	simpleR: "DND4EALTUS.WeaponSimpleR",
	militaryM: "DND4EALTUS.WeaponMilitaryM",
	militaryR: "DND4EALTUS.WeaponMilitaryR",
	superiorM: "DND4EALTUS.WeaponSuperiorM",
	superiorR: "DND4EALTUS.WeaponSuperiorR",
	improvisedM: "DND4EALTUS.WeaponImprovisedM",
	improvisedR: "DND4EALTUS.WeaponImprovisedR",
};

DND4EALTUS.weaponProficienciesMap = {
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

DND4EALTUS.simpleM = {
	club:"DND4EALTUS.WeaponClub",
	dagger:"DND4EALTUS.WeaponDagger",
	greatclub:"DND4EALTUS.WeaponGreatclub",
	javelin:"DND4EALTUS.WeaponJavelin",
	lightMace:"DND4EALTUS.WeaponMace",
	mace:"DND4EALTUS.WeaponMace",
	morningstar:"DND4EALTUS.WeaponMorningStar",
	quarterstaff:"DND4EALTUS.WeaponQuarterStaff",
	scythe:"DND4EALTUS.WeaponScythe",
	shortSpear:"DND4EALTUS.WeaponShortSpear",
	sickle:"DND4EALTUS.WeaponSickle",
	spear:"DND4EALTUS.WeaponSpear",
	spikeGauntlet:"DND4EALTUS.WeaponSpikeGauntlet",
	wristRazor:"DND4EALTUS.WeaponWristRazor"
};
DND4EALTUS.simpleR = {
	crossbow:"DND4EALTUS.WeaponCrossbow",
	dejada:"DND4EALTUS.WeaponDejada",
	handcrossbow:"DND4EALTUS.WeaponHandcrossbow",
	repeatCrossbow:"DND4EALTUS.WeaponRepeatCrossbow",
	sling:"DND4EALTUS.WeaponSling"
};

DND4EALTUS.militaryM = {
	alhulak:"DND4EALTUS.WeaponAlhulak",
	battleaxe:"DND4EALTUS.WeaponBattleaxe",
	broadsword:"DND4EALTUS.WeaponBroadsword",
	carrikal:"DND4EALTUS.WeaponCarrikal",
	chatchka:"DND4EALTUS.WeaponChatchka",
	falchion:"DND4EALTUS.WeaponFalchion",
	flail:"DND4EALTUS.WeaponFlail",
	glaive:"DND4EALTUS.WeaponGlaive",
	greataxe:"DND4EALTUS.WeaponGreataxe",
	greatsword:"DND4EALTUS.WeaponGreatsword",
	halberd:"DND4EALTUS.WeaponHalberd",
	handaxe:"DND4EALTUS.WeaponHandaxe",
	heavyflail:"DND4EALTUS.WeaponHeavyflail",
	heavyWarpick:"DND4EALTUS.WeaponHeavyWarPick",
	khopesh:"DND4EALTUS.WeaponKhopesh",
	lance:"DND4EALTUS.WeaponLance",
	lightWarpick:"DND4EALTUS.WeaponLightWarPick",
	longspear:"DND4EALTUS.WeaponLongspear",
	longsword:"DND4EALTUS.WeaponLongsword",
	maul:"DND4EALTUS.WeaponMaul",
	pike:"DND4EALTUS.WeaponPike",
	rapier:"DND4EALTUS.WeaponRapier",
	scimitar:"DND4EALTUS.WeaponScimitar",
	scourge:"DND4EALTUS.WeaponScourge",
	shortsword:"DND4EALTUS.WeaponShortsword",
	throwinghammer:"DND4EALTUS.WeaponThrowingHammer",
	trident:"DND4EALTUS.WeaponTrident",
	trikal:"DND4EALTUS.WeaponTrikal",
	warhammer:"DND4EALTUS.WeaponWarhammer",
	warpick:"DND4EALTUS.WeaponWarpick"
};
DND4EALTUS.militaryR = {
	longbow:"DND4EALTUS.WeaponLongbow",
	shortbow:"DND4EALTUS.WeaponShortbow"
};

DND4EALTUS.superiorM = {
	bastardsword:"DND4EALTUS.WeaponBastardsword",
	cahulaks:"DND4EALTUS.WeaponCahulaks",
	craghammer:"DND4EALTUS.WeaponCraghammer",
	cutWheel:"DND4EALTUS.WeaponCutWheel",
	doubleAxe:"DND4EALTUS.WeaponDoubleAxe",
	doubleFlail:"DND4EALTUS.WeaponDoubleFlail",
	doubleScimitar:"DND4EALTUS.WeaponDoubleScimitar",
	doubleSword:"DND4EALTUS.WeaponDoubleSword",
	dragonPaw:"DND4EALTUS.WeaponDragonPaw",
	executionAxe:"DND4EALTUS.WeaponExecutionAxe",
	fullblade:"DND4EALTUS.WeaponFullblade",
	garrote:"DND4EALTUS.WeaponGarrote",
	gauntletAxe:"DND4EALTUS.WeaponGauntletAxe",
	gouge:"DND4EALTUS.WeaponGouge",
	greatspear:"DND4EALTUS.WeaponGreatspear",
	gythka:"DND4EALTUS.WeaponGythka",
	katar:"DND4EALTUS.WeaponKatar",
	kukri:"DND4EALTUS.WeaponKukri",
	longKnife:"DND4EALTUS.WeaponLongKnife",
	lotulis:"DND4EALTUS.WeaponLotulis",
	mordenkrad:"DND4EALTUS.WeaponMordenkrad",
	net:"DND4EALTUS.WeaponNet",
	parryDagger:"DND4EALTUS.WeaponParryDagger",
	serratedPick:"DND4EALTUS.WeaponSerratedPick",
	sharrash:"DND4EALTUS.WeaponSharrash",
	singingStick:"DND4EALTUS.WeaponSingingStick",
	spikeChain:"DND4EALTUS.WeaponSpikeChain",
	spikeShield:"DND4EALTUS.WeaponSpikeShield",
	tangat:"DND4EALTUS.WeaponTangat",
	tortoiseBlade:"DND4EALTUS.WeaponTortoiseBlade",
	tratnyr:"DND4EALTUS.WeaponTratnyr",
	triFlail:"DND4EALTUS.WeaponTriFlail",
	urgrosh:"DND4EALTUS.WeaponUrgrosh",
	waraxe:"DND4EALTUS.WeaponWaraxe",
	whip:"DND4EALTUS.WeaponWhip",
	zadatl:"DND4EALTUS.WeaponZadatl",
	zulaat:"DND4EALTUS.WeaponZulaat"
};
DND4EALTUS.superiorR = {
	boomerang:"DND4EALTUS.WeaponBoomerang",
	bola:"DND4EALTUS.WeaponBola",
	blowgun:"DND4EALTUS.WeaponBlowgun",
	greatbow:"DND4EALTUS.WeaponGreatbow",
	shuriken:"DND4EALTUS.WeaponShuriken",
	superCrossbow:"DND4EALTUS.WeaponSuperCrossbow"
};

DND4EALTUS.improvisedM = {};
DND4EALTUS.improvisedR = {};

/**
 * Configure aspects of encumbrance calculation so that it could be configured by modules
 * @type {Object}
 */
DND4EALTUS.encumbrance = {
  currencyPerWeight: 50,
  strMultiplier: 15
};

/* -------------------------------------------- */

/**
 * This Object defines the types of single or area targets which can be applied in D&D4e
 * @type {Object}
 */
DND4EALTUS.targetTypes = {
  "none": "DND4EALTUS.None",
  "ally": "DND4EALTUS.TargetAlly",
  "creature": "DND4EALTUS.TargetCreature",
  "enemy": "DND4EALTUS.TargetEnemy",
  "personal": "DND4EALTUS.TargetPersonal",
  "object": "DND4EALTUS.TargetObject",
  "square": "DND4EALTUS.TargetSquare",
  "wall": "DND4EALTUS.TargetWall",
  "allyA": "DND4EALTUS.TargetAllyAdjacent",
  "creatureA": "DND4EALTUS.TargetCreatureAdjacent",
  "enemyA": "DND4EALTUS.TargetEnemyAdjacent",
};


/* -------------------------------------------- */


/**
 * Map the subset of target types which produce a template area of effect
 * The keys are DND4EALTUS target types and the values are MeasuredTemplate shape types
 * @type {Object}
 */
DND4EALTUS.areaTargetTypes = {
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
DND4EALTUS.healingTypes = {
  "healing": "DND4EALTUS.Healing",
  "temphp": "DND4EALTUS.HealingTemp"
};

/* -------------------------------------------- */

DND4EALTUS.featureSortTypes = {
	"name": "DND4EALTUS.ItemName",
	"level": "DND4EALTUS.Level",
	"none": "DND4EALTUS.None",
};

/* -------------------------------------------- */

DND4EALTUS.powerType = {
	"inherent": "DND4EALTUS.Inherent",
	"class": "DND4EALTUS.Class",
	"race": "DND4EALTUS.Racial",
	"paragon": "DND4EALTUS.Paragon",
	"epic": "DND4EALTUS.Epic",
	"theme": "DND4EALTUS.Theme",
	"item": "DND4EALTUS.PowerItem",
	"feat": "DND4EALTUS.Feat",
	"skill": "DND4EALTUS.Skill",
	"utility": "DND4EALTUS.PowerUtil" //Better keep this for legacy
};
DND4EALTUS.powerSubtype = {
	"attack": "DND4EALTUS.PowerAttack",
	"utility": "DND4EALTUS.PowerUtil",
	"feature": "DND4EALTUS.PowerFeature"
};

DND4EALTUS.powerUseType = {
	"atwill": "DND4EALTUS.PowerAt",
	"encounter": "DND4EALTUS.PowerEnc",
	"daily": "DND4EALTUS.PowerDaily",
	"recharge": "DND4EALTUS.PowerRecharge",
	"other": "DND4EALTUS.PowerOther",
	"item": "DND4EALTUS.PowerItem",
	// "utility": "DND4EALTUS.PowerUtil"
};
DND4EALTUS.powerSource = {
	"arcane": "DND4EALTUS.Arcane",
	"divine": "DND4EALTUS.Divine",
	"martial": "DND4EALTUS.Martial",
	"Elemental": "DND4EALTUS.Elemental",
	"ki": "DND4EALTUS.Ki",
	"primal": "DND4EALTUS.Primal",
	"psionic": "DND4EALTUS.Psionic",
	"shadow": "DND4EALTUS.Shadow",
};

DND4EALTUS.powerGroupTypes = {
	"usage": "DND4EALTUS.Usage",
	"action": "DND4EALTUS.Action",
	"type": "DND4EALTUS.Type",
	"powerSubtype": "DND4EALTUS.PowerSubtype",
};

DND4EALTUS.powerSortTypes = {
	"name": "DND4EALTUS.ItemName",
	"level": "DND4EALTUS.Level",
	"actionType": "DND4EALTUS.Action",
	"rangeTextShort": "DND4EALTUS.Range",
	"useType": "DND4EALTUS.Usage",
	"use.value": "DND4EALTUS.Used",
	"powerSubtype": "DND4EALTUS.PowerSubtype",
	"none": "DND4EALTUS.None",
};

DND4EALTUS.powerDiceTypes = {
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
DND4EALTUS.special = {
	"nv": "DND4EALTUS.VisionNormal",
	"lv": "DND4EALTUS.VisionLowLight",
	"bv": "DND4EALTUS.VisionBlind",
	"aa": "DND4EALTUS.SpecialSensesAA",
	"bs": "DND4EALTUS.SpecialSensesBS",
	"dv": "DND4EALTUS.SpecialSensesDV",
	"ts": "DND4EALTUS.SpecialSensesTS",
	"tr": "DND4EALTUS.SpecialSensesTR"
};

DND4EALTUS.vision = {
	"nv": "DND4EALTUS.VisionNormal",
	"lv": "DND4EALTUS.VisionLowLight",
	"bv": "DND4EALTUS.VisionBlind"
};

DND4EALTUS.weaponType = {
	"melee": "DND4EALTUS.WeaponMelee",
	"meleeRanged": "DND4EALTUS.WeaponMeleeRanged",
	"ranged": "DND4EALTUS.WeaponRanged",
	"implement": "DND4EALTUS.WeaponPropertiesImp",
	"none": "DND4EALTUS.None",
	"any": "DND4EALTUS.AnyW",
};

DND4EALTUS.rangeType = {
	"weapon": "DND4EALTUS.rangeWeapon",
	"melee": "DND4EALTUS.rangeMelee",
	"reach": "DND4EALTUS.rangeReach",
	"range" : "DND4EALTUS.rangeRanged",
	"closeBurst": "DND4EALTUS.rangeCloseBurst",
	"closeBlast": "DND4EALTUS.rangeCloseBlast",
	"rangeBurst": "DND4EALTUS.rangeBurst",
	"rangeBlast": "DND4EALTUS.rangeBlast",
	"wall": "DND4EALTUS.rangeWall",
	"personal": "DND4EALTUS.rangePersonal",
	"touch": "DND4EALTUS.rangeTouch",
	"special": "DND4EALTUS.rangeSpecial",
};

DND4EALTUS.rangeTypeNoWeapon = Object.fromEntries(Object.entries(DND4EALTUS.rangeType).filter(function ([key, value]) {
	return key !== "weapon";
}));

// Bonus keys for tool required by a power—NOT the same as the keywords pulled from the weapon.
DND4EALTUS.toolKeys = {
	"meleeWeapon": "DND4EALTUS.WeaponMelee",
	"rangedWeapon": "DND4EALTUS.WeaponRanged",
	"weapon": "DND4EALTUS.Weapon",
	"usesImplement": "DND4EALTUS.WeaponPropertiesImp"
};

// Bonus keys for range/shape—NOT the same as the plain range values.
DND4EALTUS.rangeKeys = {
	"melee": "DND4EALTUS.rangeMelee",
	"ranged" : "DND4EALTUS.rangeRanged",
	"close": "DND4EALTUS.rangeWeapon",
	"area": "DND4EALTUS.rangeArea",
	"blast": "DND4EALTUS.rangeJustBlast",
	"burst" : "DND4EALTUS.rangeJustBurst",
	"closeBurst": "DND4EALTUS.rangeCloseBurst",
	"closeBlast": "DND4EALTUS.rangeCloseBlast",
	"areaBurst": "DND4EALTUS.rangeBurst",
	"areaBlast": "DND4EALTUS.rangeBlast",
	"wall": "DND4EALTUS.rangeWall"
};

DND4EALTUS.effectTypes = {
	"augmentable": "DND4EALTUS.Augmentable",
	"aura": "DND4EALTUS.Aura",
	"beast": "DND4EALTUS.Beast",
	"beastForm": "DND4EALTUS.BeastForm",
	"channelDiv": "DND4EALTUS.ChannelDivinity",
	"charm": "DND4EALTUS.Charm",
	"conjuration": "DND4EALTUS.Conjuration",
	"disease": "DND4EALTUS.Disease",
	"elemental": "DND4EALTUS.Elemental",
	"enchantment": "DND4EALTUS.Enchantment",
	"evocation": "DND4EALTUS.Evocation",
	"fear": "DND4EALTUS.Fear",
	"fullDis": "DND4EALTUS.FullDis",
	"gaze": "DND4EALTUS.Gaze",
	"healing": "DND4EALTUS.Healing",
	"illusion": "DND4EALTUS.Illusion",
	"invigorating": "DND4EALTUS.Invigorating",
	"mount": "DND4EALTUS.Mount",
	"necro": "DND4EALTUS.Necro",
	"nether": "DND4EALTUS.Nether",
	"poison": "DND4EALTUS.DamagePoison",
	"polymorph": "DND4EALTUS.Polymorph",
	"rage": "DND4EALTUS.Rage",
	"rattling": "DND4EALTUS.Rattling",
	"reliable": "DND4EALTUS.Reliable",
	"runic": "DND4EALTUS.Runic",
	"sleep": "DND4EALTUS.Sleep",
	"spirit": "DND4EALTUS.Spirit",
	"stance": "DND4EALTUS.Stance",
	"summoning": "DND4EALTUS.Summoning",
	"teleportation": "DND4EALTUS.Teleportation",
	"transmutation": "DND4EALTUS.Transmutation",
	"zone": "DND4EALTUS.Zone",
};

DND4EALTUS.saves = {
	"Arcane": "DND4EALTUS.Arcane",
	"Divine": "DND4EALTUS.Divine",
	"Martial": "DND4EALTUS.Martial",
	"Elemental": "DND4EALTUS.Elemental",
	"Ki": "DND4EALTUS.Ki",
	"Primal": "DND4EALTUS.Primal",
	"Psionic": "DND4EALTUS.Psionic",
	"Shadow": "DND4EALTUS.Shadow",

	"Acid": "DND4EALTUS.DamageAcid",
	"Cold": "DND4EALTUS.DamageCold",
	"Fire": "DND4EALTUS.DamageFire",
	"Force": "DND4EALTUS.DamageForce",
	"Lighting": "DND4EALTUS.DamageLightning",
	"Necrotic": "DND4EALTUS.DamageNecrotic",
	"Poison": "DND4EALTUS.DamagePoison",
	"Psychic": "DND4EALTUS.DamagePsychic",
	"Radiant": "DND4EALTUS.DamageRadiant",
	"Thunder ": "DND4EALTUS.DamageThunder",

	"Charm": "DND4EALTUS.Charm",
	"Fear": "DND4EALTUS.Fear",
	"Healing": "DND4EALTUS.Healing",
	"Illusion": "DND4EALTUS.Illusion",
	"Invigorating": "DND4EALTUS.Invigorating",
	"Polymorph": "DND4EALTUS.Polymorph",
	"Rage": "DND4EALTUS.Rage",
	"Sleep": "DND4EALTUS.Sleep",
	"Spirit": "DND4EALTUS.Spirit",
	"Teleportation": "DND4EALTUS.Teleportation"
};
/* -------------------------------------------- */

/**
 * The set of skill which can be trained in D&D4eBeta
 * @type {Object}
 */
DND4EALTUS.skills = {
  "acr": "DND4EALTUS.SkillAcr",
  "arc": "DND4EALTUS.SkillArc",
  "ath": "DND4EALTUS.SkillAth",
  "blu": "DND4EALTUS.SkillBlu",
  "dip": "DND4EALTUS.SkillDip",
  "dun": "DND4EALTUS.SkillDun",
  "end": "DND4EALTUS.SkillEnd",
  "eng": "DND4EALTUS.SkillEng",
  "hea": "DND4EALTUS.SkillHea",
  "his": "DND4EALTUS.SkillHis",
  "ins": "DND4EALTUS.SkillIns",
  "itm": "DND4EALTUS.SkillItm",
  "nat": "DND4EALTUS.SkillNat",
  "prc": "DND4EALTUS.SkillPrc",
  "pra": "DND4EALTUS.SkillPra",
  "rel": "DND4EALTUS.SkillRel",
  "stl": "DND4EALTUS.SkillStl",
  "stw": "DND4EALTUS.SkillStw",
  "thi": "DND4EALTUS.SkillThi"
};

/* -------------------------------------------- */
DND4EALTUS.modifiers ={
	"attack": "DND4EALTUS.ModifierAttack",
	"damage": "DND4EALTUS.ModifierDamage",
}

/* -------------------------------------------- */

DND4EALTUS.spellPreparationModes = {
  "always": "DND4EALTUS.SpellPrepAlways",
  "atwill": "DND4EALTUS.SpellPrepAtWill",
  "innate": "DND4EALTUS.SpellPrepInnate",
  "pact": "DND4EALTUS.PactMagic",
  "prepared": "DND4EALTUS.SpellPrepPrepared"
};

DND4EALTUS.spellUpcastModes = ["always", "pact", "prepared"];


DND4EALTUS.spellProgression = {
  "none": "DND4EALTUS.SpellNone",
  "full": "DND4EALTUS.SpellProgFull",
  "half": "DND4EALTUS.SpellProgHalf",
  "third": "DND4EALTUS.SpellProgThird",
  "pact": "DND4EALTUS.SpellProgPact",
  "artificer": "DND4EALTUS.SpellProgArt"
};

/* -------------------------------------------- */

/**
 * The available choices for how spell damage scaling may be computed
 * @type {Object}
 */
DND4EALTUS.spellScalingModes = {
  "none": "DND4EALTUS.SpellNone",
  "cantrip": "DND4EALTUS.SpellCantrip",
  "level": "DND4EALTUS.SpellLevel"
};

/* -------------------------------------------- */


/**
 * Define the set of types which a weapon item can take
 * @type {Object}
 */
DND4EALTUS.weaponTypes = {
	"simpleM": "DND4EALTUS.WeaponSimpleM",
	"militaryM": "DND4EALTUS.WeaponMilitaryM",
	"superiorM": "DND4EALTUS.WeaponSuperiorM",
	"improvM": "DND4EALTUS.WeaponImprovisedM",
	"simpleR": "DND4EALTUS.WeaponSimpleR",  
	"militaryR": "DND4EALTUS.WeaponMilitaryR",
	"superiorR": "DND4EALTUS.WeaponSuperiorR",
	"improvR": "DND4EALTUS.WeaponImprovisedR",
	"implement": "DND4EALTUS.WeaponImplement",
	"siegeM": "DND4EALTUS.WeaponSiegeM",
	"siegeR": "DND4EALTUS.WeaponSiegeR",
	"naturalM": "DND4EALTUS.WeaponNaturalM",
	"naturalR": "DND4EALTUS.WeaponNaturalR",
	"improv": "DND4EALTUS.WeaponImprov",
	"other": "DND4EALTUS.EquipmentTypeOther",

};

/* -------------------------------------------- */


/**
 * Define the set of hands configurations which a weapon item cantake
 * @type {Object}
 */
DND4EALTUS.weaponHands = {
  "hMain": "DND4EALTUS.HMain",
  "hTwo": "DND4EALTUS.HTwo",
  "hOff": "DND4EALTUS.HOff",
};


/* -------------------------------------------- */

/**
 * Define the set of weapon property flags which can exist on a weapon
 * @type {Object}
 */
DND4EALTUS.weaponProperties = {
  "amm": "DND4EALTUS.WeaponPropertiesAmm",
  "bru": "DND4EALTUS.WeaponPropertiesBru",
  "def": "DND4EALTUS.WeaponPropertiesDef",
  "hic": "DND4EALTUS.WeaponPropertiesHic",
  "imp": "DND4EALTUS.WeaponPropertiesImp",
  "lof": "DND4EALTUS.WeaponPropertiesLof",
  "lom": "DND4EALTUS.WeaponPropertiesLom",
  "off": "DND4EALTUS.WeaponPropertiesOff",
  "rch": "DND4EALTUS.WeaponPropertiesRch",
  "rel": "DND4EALTUS.WeaponPropertiesRel",
  "sml": "DND4EALTUS.WeaponPropertiesSml",
  "spc": "DND4EALTUS.WeaponPropertiesSpc",
  "thv": "DND4EALTUS.WeaponPropertiesThv",
  "tlg": "DND4EALTUS.WeaponPropertiesTlg",
  "two": "DND4EALTUS.WeaponPropertiesTwo",
  "ver": "DND4EALTUS.WeaponPropertiesVer"
};

DND4EALTUS.weaponGroup = {
	"axe": "DND4EALTUS.WeaponGroupAxe",
	"bladeH": "DND4EALTUS.WeaponGroupBladeH",
	"bladeL": "DND4EALTUS.WeaponGroupBladeL",
	"blowgun": "DND4EALTUS.WeaponGroupBlowgun",
	"bow": "DND4EALTUS.WeaponGroupBow",
	"cbow": "DND4EALTUS.WeaponGroupCBow",
	"dragon": "DND4EALTUS.WeaponGroupDragonShard",
	"flail": "DND4EALTUS.WeaponGroupFlail",
	"garrote": "DND4EALTUS.WeaponGroupGarrote",
	"ham": "DND4EALTUS.WeaponGroupHam",
	"mace": "DND4EALTUS.WeaponGroupMace",
	"pik": "DND4EALTUS.WeaponGroupPik",
	"pole": "DND4EALTUS.WeaponGroupPole",
	"sling": "DND4EALTUS.WeaponGroupSling",
	"spear": "DND4EALTUS.WeaponGroupSpear",
	"staff": "DND4EALTUS.WeaponGroupStaff",
	"unarm": "DND4EALTUS.WeaponGroupUnarm",
	"whip": "DND4EALTUS.WeaponGroupWhip"
};

DND4EALTUS.implement = {
	"holyS": "DND4EALTUS.ImplementHolySymbol",
	"ki": "DND4EALTUS.ImplementKiFocus",
	"orb": "DND4EALTUS.ImplementOrb",
	"rod": "DND4EALTUS.ImplementRod",
	"staff": "DND4EALTUS.ImplementStaff",
	"tome": "DND4EALTUS.ImplementTome",
	"totem": "DND4EALTUS.ImplementTotem",
	"wand": "DND4EALTUS.ImplementWand"
};

/* -------------------------------------------- */

/**
 * Skill, ability, and tool proficiency levels
 * Each level provides a proficiency multiplier
 * @type {Object}
 */

DND4EALTUS.trainingLevels = {
  0: "DND4EALTUS.NotTrained",
  5: "DND4EALTUS.Trained",
  8: "DND4EALTUS.FocusTrained"
};
/* -------------------------------------------- */

// Condition Types
DND4EALTUS.conditionTypes = {
	"blinded": "DND4EALTUS.ConBlinded",
	"bloodied": "DND4EALTUS.ConBlood",
	"dazed": "DND4EALTUS.ConDazed",
	"deafened": "DND4EALTUS.ConDeafened",
	"dominated": "DND4EALTUS.ConDominated",
	"dying": "DND4EALTUS.ConDying",
	"helpless": "DND4EALTUS.ConHelpless",
	"immobilized": "DND4EALTUS.Immobilized",
	"invisible": "DND4EALTUS.ConInvisible",
	"marked": "DND4EALTUS.ConMarked",
	"petrified": "DND4EALTUS.ConPetrified",
	"prone": "DND4EALTUS.ConProne",
	"restrained": "DND4EALTUS.ConRestrained",
	"slowed": "DND4EALTUS.ConSlower",
	"stunned": "DND4EALTUS.ConStunned",
	"surprised": "DND4EALTUS.ConSurprised",
	"unconscious": "DND4EALTUS.ConUnconscious",
	"weakened": "DND4EALTUS.ConWeakened",
};


DND4EALTUS.statusEffect = [
	//row 1
	{
		id: "mark_1",
		label: "EFFECT.statusMark",
		icon: "systems/dnd4eAltus/icons/statusEffects/mark_1.svg"
	},
	{
		id: "mark_2",
		label: "EFFECT.statusMark",
		icon: "systems/dnd4eAltus/icons/statusEffects/mark_2.svg"
	},
	{
		id: "mark_3",
		label: "EFFECT.statusMark",
		icon: "systems/dnd4eAltus/icons/statusEffects/mark_3.svg"
	},
	{
		id: "mark_4",
		label: "EFFECT.statusMark",
		icon: "systems/dnd4eAltus/icons/statusEffects/mark_4.svg"
	},
	{
		id: "mark_5",
		label: "EFFECT.statusMark",
		icon: "systems/dnd4eAltus/icons/statusEffects/mark_5.svg"
	},
	{
		id: "mark_6",
		label: "EFFECT.statusMark",
		icon: "systems/dnd4eAltus/icons/statusEffects/mark_6.svg"
	},
	{
		id: "mark_7",
		label: "EFFECT.statusMark",
		icon: "systems/dnd4eAltus/icons/statusEffects/mark_7.svg"
	},
	//row 2
	{
		id: "bloodied",
		label: "EFFECT.statusBloodied",
		icon: "systems/dnd4eAltus/icons/statusEffects/bloodied.svg"
	},
	{
		id: "attack_up",
		label: "EFFECT.statusAttackUp",
		icon: "systems/dnd4eAltus/icons/statusEffects/attack_up.svg"
	},
	{
		id: "attack_down",
		label: "EFFECT.statusAttackDown",
		icon: "systems/dnd4eAltus/icons/statusEffects/attack_down.svg"
	},
	{
		id: "defUp",
		label: "EFFECT.statusDefUp",
		icon: "systems/dnd4eAltus/icons/statusEffects/def_up.svg"
	},
	{
		id: "defDown",
		label: "EFFECT.statusDefDown",
		icon: "systems/dnd4eAltus/icons/statusEffects/def_down.svg"
	},
	{
		id: "regen",
		label: "EFFECT.statusRegen",
		icon: "systems/dnd4eAltus/icons/statusEffects/regen.svg"
	},
	{
		id: "ammo_count",
		label: "EFFECT.statusAmmoCount",
		icon: "systems/dnd4eAltus/icons/statusEffects/ammo_count.svg"
	},
	//row 3
	{
		id: "curse",
		label: "EFFECT.statusCurse",
		icon: "systems/dnd4eAltus/icons/statusEffects/curse.svg"
	},
	{
		id: "oath",
		label: "EFFECT.statusOath",
		icon: "systems/dnd4eAltus/icons/statusEffects/oath.svg"
	},
	{
		id: "hunter_mark",
		label: "EFFECT.statusHunterMark",
		icon: "systems/dnd4eAltus/icons/statusEffects/hunter_mark.svg"
	},
	{
		id: "target",
		label: "EFFECT.statusTarget",
		icon: "systems/dnd4eAltus/icons/statusEffects/target.svg"
	},
	{
		id: "ongoing_1",
		label: "EFFECT.statusOngoing1",
		icon: "systems/dnd4eAltus/icons/statusEffects/ongoing_1.svg"
	},
	{
		id: "ongoing_2",
		label: "EFFECT.statusOngoing2",
		icon: "systems/dnd4eAltus/icons/statusEffects/ongoing_2.svg"
	},
	{
		id: "ongoing_3",
		label: "EFFECT.statusOngoing3",
		icon: "systems/dnd4eAltus/icons/statusEffects/ongoing_3.svg"
	},
	//row 4
	{
		id: "blinded",
		label: "EFFECT.statusBlind",
		icon: "systems/dnd4eAltus/icons/statusEffects/blinded.svg"
	},
	{
		id: "concealed",
		label: "EFFECT.statusConceal",
		icon: "systems/dnd4eAltus/icons/statusEffects/concealment.svg"
	},
	{
		id: "concealedfull",
		label: "EFFECT.statusConcealFull",
		icon: "systems/dnd4eAltus/icons/statusEffects/concealment-full.svg"
	},
	{
		id: "dazed",
		label: "EFFECT.statusDazed",
		icon: "systems/dnd4eAltus/icons/statusEffects/dazed.svg"
	},
	{
		id: "dead",
		label: "EFFECT.statusDead",
		icon: "icons/svg/skull.svg"
	},
	{
		id: "deafened",
		label: "EFFECT.statusDeafened",
		icon: "systems/dnd4eAltus/icons/statusEffects/deafened.svg"
	},
	{
		id: "disarmed",
		label: "EFFECT.statusDisarmed",
		icon: "systems/dnd4eAltus/icons/statusEffects/disarmed.svg"
	},
	//row 5
	{
		id: "dominated",
		label: "EFFECT.statusDominated",
		icon: "systems/dnd4eAltus/icons/statusEffects/dominated.svg"
	},
	{
		id: "drunk",
		label: "EFFECT.statusDrunk",
		icon: "systems/dnd4eAltus/icons/statusEffects/drunk.svg"
	},	
	{
		id: "dying",
		label: "EFFECT.statusDying",
		icon: "systems/dnd4eAltus/icons/statusEffects/dying.svg"
	},
	{
		id: "flying",
		label: "EFFECT.statusFlying",
		icon: "systems/dnd4eAltus/icons/statusEffects/flying.svg"
	},
	{
		id: "grabbed",
		label: "EFFECT.statusGrabbed",
		icon: "systems/dnd4eAltus/icons/statusEffects/grabbed.svg"
	},
	{
		id: "immobilized",
		label: "EFFECT.statusImmobilized",
		icon: "systems/dnd4eAltus/icons/statusEffects/immobilized.svg"
	},
	{
		id: "insubstantial",
		label: "EFFECT.statusInsubstantial",
		icon: "systems/dnd4eAltus/icons/statusEffects/insubstantial.svg"
	},
	//row 6
	{
		id: "invisible",
		label: "EFFECT.statusInvisible",
		icon: "systems/dnd4eAltus/icons/statusEffects/invisible.svg"
	},
	{
		id: "mounted",
		label: "EFFECT.statusMounted",
		icon: "systems/dnd4eAltus/icons/statusEffects/mounted.svg"
	},		

	{
		id: "petrified",
		label: "EFFECT.statusPetrified",
		icon: "systems/dnd4eAltus/icons/statusEffects/petrified.svg"
	},
	{
		id: "prone",
		label: "EFFECT.statusProne",
		icon: "systems/dnd4eAltus/icons/statusEffects/prone.svg"
	},
	{
		id: "removed",
		label: "EFFECT.statusRemoved",
		icon: "systems/dnd4eAltus/icons/statusEffects/removed.svg"
	},	
	{
		id: "restrained",
		label: "EFFECT.statusRestrained",
		icon: "systems/dnd4eAltus/icons/statusEffects/restrained.svg"
	},	
	{
		id: "sleeping",
		label: "EFFECT.statusSleeping",
		icon: "systems/dnd4eAltus/icons/statusEffects/sleeping.svg"
	},
	//row 7
	{
		id: "slowed",
		label: "EFFECT.statusSlowed",
		icon: "systems/dnd4eAltus/icons/statusEffects/slowed.svg"
	},
	{
		id: "stunned",
		label: "EFFECT.statusStunned",
		icon: "systems/dnd4eAltus/icons/statusEffects/stunned.svg"
	},
	{
		id: "surprised",
		label: "EFFECT.statusSurprised",
		icon: "systems/dnd4eAltus/icons/statusEffects/surprised.svg"
	},
	{
		id: "unconscious",
		label: "EFFECT.statusUnconscious",
		icon: "systems/dnd4eAltus/icons/statusEffects/unconscious.svg"
	},
	{
		id: "weakened",
		label: "EFFECT.statusWeakened",
		icon: "systems/dnd4eAltus/icons/statusEffects/weakend.svg"
	},
	{
		id: "hidden",
		label: "EFFECT.statusHidden",
		icon: "systems/dnd4eAltus/icons/statusEffects/hidden.svg"
	},
	{
		id: "sneaking",
		label: "EFFECT.statusSneaking",
		icon: "systems/dnd4eAltus/icons/statusEffects/sneaking.svg"
	},
	//row 8
	{
		id: "torch",
		label: "EFFECT.statusTorch",
		icon: "systems/dnd4eAltus/icons/statusEffects/torch.svg"
	},
	{
		id: "shitter",
		label: "EFFECT.statusShitter",
		icon: "systems/dnd4eAltus/icons/statusEffects/shitter.svg"
	},
	{
		id: "sitting",
		label: "EFFECT.statusSitting",
		icon: "systems/dnd4eAltus/icons/statusEffects/sitting.svg"
	},
	{
		id: "nuke",
		label: "EFFECT.statusNuke",
		icon: "systems/dnd4eAltus/icons/statusEffects/nuke.svg"
	}

];

// Languages
DND4EALTUS.spoken = {
	"Alti": "DND4EALTUS.SpokenAlti",
	"Cellian": "DND4EALTUS.SpokenCellian",
	"Ghido": "DND4EALTUS.SpokenGhido",
	"Jarissian": "DND4EALTUS.SpokenJarissian",
	"Luxen": "DND4EALTUS.SpokenLuxen",
	"Saeven": "DND4EALTUS.SpokenSaeven",
	"Token": "DND4EALTUS.SpokenToken",
	"Vasten": "DND4EALTUS.SpokenVasten"
};
DND4EALTUS.script = {
	"Alti": "DND4EALTUS.ScriptAlti",
	"Cellian": "DND4EALTUS.ScriptCellian",
	"Ghido": "DND4EALTUS.ScriptGhido",
	"Token": "DND4EALTUS.ScriptToken"
};

// Character Level XP Requirements
DND4EALTUS.CHARACTER_EXP_LEVELS =  [
	0, 1000, 2250, 3750, 5500, 7500, 10000, 13000, 16500, 20500,
	26000, 32000, 39000, 47000, 57000, 69000, 83000, 99000, 119000, 143000,
	175000, 210000, 255000, 310000, 375000, 450000, 550000, 675000, 825000, 1000000 
	];

// Configure Optional Character Flags
DND4EALTUS.characterFlags = {
  "powerfulBuild": {
    name: "DND4EALTUS.FlagsPowerfulBuild",
    hint: "DND4EALTUS.FlagsPowerfulBuildHint",
    section: "Racial Traits",
    type: Boolean
  },
  "savageAttacks": {
    name: "DND4EALTUS.FlagsSavageAttacks",
    hint: "DND4EALTUS.FlagsSavageAttacksHint",
    section: "Racial Traits",
    type: Boolean
  },
  "elvenAccuracy": {
    name: "DND4EALTUS.FlagsElvenAccuracy",
    hint: "DND4EALTUS.FlagsElvenAccuracyHint",
    section: "Racial Traits",
    type: Boolean
  },
  "halflingLucky": {
    name: "DND4EALTUS.FlagsHalflingLucky",
    hint: "DND4EALTUS.FlagsHalflingLuckyHint",
    section: "Racial Traits",
    type: Boolean
  },
  "initiativeAdv": {
    name: "DND4EALTUS.FlagsInitiativeAdv",
    hint: "DND4EALTUS.FlagsInitiativeAdvHint",
    section: "Feats",
    type: Boolean
  },
  "initiativeAlert": {
    name: "DND4EALTUS.FlagsAlert",
    hint: "DND4EALTUS.FlagsAlertHint",
    section: "Feats",
    type: Boolean
  },
  "jackOfAllTrades": {
    name: "DND4EALTUS.FlagsJOAT",
    hint: "DND4EALTUS.FlagsJOATHint",
    section: "Feats",
    type: Boolean
  },
  "observantFeat": {
    name: "DND4EALTUS.FlagsObservant",
    hint: "DND4EALTUS.FlagsObservantHint",
    skills: ['prc','inv'],
    section: "Feats",
    type: Boolean
  },
  "reliableTalent": {
    name: "DND4EALTUS.FlagsReliableTalent",
    hint: "DND4EALTUS.FlagsReliableTalentHint",
    section: "Feats",
    type: Boolean
  },
  "remarkableAthlete": {
    name: "DND4EALTUS.FlagsRemarkableAthlete",
    hint: "DND4EALTUS.FlagsRemarkableAthleteHint",
    abilities: ['str','dex','con'],
    section: "Feats",
    type: Boolean
  },
  "weaponCriticalThreshold": {
    name: "DND4EALTUS.FlagsCritThreshold",
    hint: "DND4EALTUS.FlagsCritThresholdHint",
    section: "Feats",
    type: Number,
    placeholder: 20
  }
};

// Configure allowed status flags
DND4EALTUS.allowedActorFlags = [
  "isPolymorphed", "originalActor"
].concat(Object.keys(DND4EALTUS.characterFlags));
