// Namespace D&D4e Configuration Values
export const DND4E = {};

// ASCII Artwork
DND4E.ASCII = `__________________________________________________________
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
DND4E.abilities = {
  "str": "DND4E.AbilityStr",
  "con": "DND4E.AbilityCon",
  "dex": "DND4E.AbilityDex",
  "int": "DND4E.AbilityInt",
  "wis": "DND4E.AbilityWis",
  "cha": "DND4E.AbilityCha"
};

/* -------------------------------------------- */

/**
 * Character alignment options
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

/* -------------------------------------------- */

/**
 * This describes the ways that an ability can be activated
 * @type {Object}
 */
DND4E.abilityActivationTypes = {
  "none": "DND4E.NoAction",
  "standard": "DND4E.ActionStandard",
  "move": "DND4E.ActionMove",
  "minor": "DND4E.ActionMinor",
  "free": "DND4E.ActionFree",
  "reaction": "DND4E.ActionReaction",
  "interrupt": "DND4E.ActionInterrupt",
  "opportunity": "DND4E.ActionOpportunity",
};

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
  "ammo": "DND4E.ConsumeAmmunition",
  "attribute": "DND4E.ConsumeAttribute",
  "material": "DND4E.ConsumeMaterial",
  "charges": "DND4E.ConsumeCharges"
};


/* -------------------------------------------- */

// Creature Sizes
DND4E.actorSizes = {
  "tiny": "DND4E.SizeTiny",
  "sm": "DND4E.SizeSmall",
  "med": "DND4E.SizeMedium",
  "lg": "DND4E.SizeLarge",
  "huge": "DND4E.SizeHuge",
  "grg": "DND4E.SizeGargantuan"
};

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
 * Classification types for item action types
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
  "items": "DND4E.ItemContainerCapacityItems",
  "weight": "DND4E.ItemContainerCapacityWeight"
};

/* -------------------------------------------- */

/**
 * Enumerate the lengths of time over which an item can have limited use ability
 * @type {Object}
 */
DND4E.limitedUsePeriods = {
  "enc": "DND4E.Encounter",
  "day": "DND4E.Day",
  "charges": "DND4E.Charges",
  "round": "DND4E.Round"
};

/* -------------------------------------------- */

DND4E.launchOrder = {
	"both": "DND4E.LaunchOrderBoth",
	"off": "DND4E.LaunchOrderOff",
	"pre": "DND4E.LaunchOrderPre",
	"post": "DND4E.LaunchOrderPost",
	"sub": "DND4E.LaunchOrderSub"
}

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
  // "light": "DND4E.EquipmentLight",
  // "medium": "DND4E.EquipmentMedium",
  // "heavy": "DND4E.EquipmentHeavy",
  // "bonus": "DND4E.EquipmentBonus",
  // "natural": "DND4E.EquipmentNatural",
  // "shield": "DND4E.EquipmentShield",
  // "clothing": "DND4E.EquipmentClothing",
  // "trinket": "DND4E.EquipmentTrinket"
	"armour": "DND4E.EquipmentTypeArmour",
	"arms": "DND4E.EquipmentTypeArms",
	"feet": "DND4E.EquipmentTypeFeet",
	"hands": "DND4E.EquipmentTypeHands",
	"head": "DND4E.EquipmentTypeHead",
	"neck": "DND4E.EquipmentTypeNeck",
	"ring": "DND4E.EquipmentTypeRing",
	"waist": "DND4E.EquipmentTypeWaist",
	"natural": "DND4E.EquipmentTypeNatural",
	"other": "DND4E.EquipmentTypeOther",
};

DND4E.equipmentTypesArmour = {
	//"cloth": "DND4E.EquipmentArmourCloth",
	"light": "DND4E.EquipmentArmourLight",
	"heavy": "DND4E.EquipmentArmourHeavy",
	"natural": "DND4E.EquipmentArmourNatural",
};
DND4E.equipmentTypesArms = {
	"light": "DND4E.EquipmentArmsLight",
	"heavy": "DND4E.EquipmentArmsHeavy",
	"bracers": "DND4E.EquipmentArmsBracers",
	"bracelet": "DND4E.EquipmentArmsBracelet",
};
DND4E.equipmentTypesFeet = {
	"shoe": "DND4E.EquipmentFeetShoe",
	"boot": "DND4E.EquipmentFeetBoot",
	"greave": "DND4E.EquipmentFeetGreave",
};
DND4E.equipmentTypesHands = {
	"gloves": "DND4E.EquipmentHandsGloves",
	"gauntlets": "DND4E.EquipmentHandsGauntlets",
};
DND4E.equipmentTypesHead = {
	"hat": "DND4E.EquipmentHeadHat",
	"helmet": "DND4E.EquipmentHeadHelmet",
	"eyewear": "DND4E.EquipmentHeadEyewear",

};
DND4E.equipmentTypesNeck = {
	"necklace": "DND4E.EquipmentNeckNecklace",
	"amulet": "DND4E.EquipmentNeckAmulet",
	"cloak": "DND4E.EquipmentCloak",
};
DND4E.equipmentTypesWaist = {
	"belt": "DND4E.EquipmentWaistBelt",
};

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
	"aberrant": "DND4E.CreatureOriginAberrant",
	"elemental": "DND4E.CreatureOriginElemental",
	"fey": "DND4E.CreatureOriginFey",
	"immortal": "DND4E.CreatureOriginImmortal",
	"natural": "DND4E.CreatureOriginNatural",
	"shadow": "DND4E.CreatureOriginShadow",

}

/* -------------------------------------------- */

DND4E.creatureRole = {
	"artillery": "DND4E.CreatureRoleArtillery",
	"brute": "DND4E.CreatureRoleBrute",
	"controller": "DND4E.CreatureRoleController",
	"defender": "DND4E.CreatureRoleDefender",
	"leader": "DND4E.CreatureRoleLeader",
	"lurker": "DND4E.CreatureRoleLurker",
	"skirmisher": "DND4E.CreatureRoleSkirmisher",
	"striker": "DND4E.CreatureRoleStriker",
	"soldier": "DND4E.CreatureRoleSoldier",
}

/* -------------------------------------------- */

DND4E.creatureRoleSecond = {
	"standard": "DND4E.CreatureRoleSecStandard",
	"elite": "DND4E.CreatureRoleSecElite",
	"solo": "DND4E.CreatureRoleSecSolo",
	"minion": "DND4E.CreatureRoleSecMinion",
	"other": "DND4E.CreatureRoleSecOther",
}

/* -------------------------------------------- */

DND4E.creatureType = {
	"animate": "DND4E.CreatureTypeAnimate",
	"beast": "DND4E.CreatureTypeBeast",
	"humanoid": "DND4E.CreatureTypeHumanoid",
	"magical": "DND4E.CreatureTypeMagicalBeaste",
}

/* -------------------------------------------- */

/**
 * Enumerate the valid consumable types which are recognized by the system
 * @type {Object}
 */
DND4E.consumableTypes = {
  "alchemical": "DND4E.ConsumableAlchemical",
  "ammo": "DND4E.ConsumableAmmunition",
  "potion": "DND4E.ConsumablePotion",
  "poison": "DND4E.ConsumablePoison",
  "food": "DND4E.ConsumableFood",
  "scroll": "DND4E.ConsumableScroll",
  "trinket": "DND4E.ConsumableTrinket"
};

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
  cp: {into: "sp", each: 10},
  sp: {into: "gp", each: 10 },
  gp: {into: "pp", each: 100},
  pp: {into: "ad", each: 100}
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
  // "bludgeoning": "DND4E.DamageBludgeoning",
  // "bludgeon": "DND4E.DamageBludgeoning",
  "cold": "DND4E.DamageCold",
  "fire": "DND4E.DamageFire",
  "force": "DND4E.DamageForce",
  "lightning": "DND4E.DamageLightning",
  "necrotic": "DND4E.DamageNecrotic",
  // "pierce": "DND4E.DamagePiercing",
  // "piercing": "DND4E.DamagePiercing",
  "physical": "DND4E.Damagephysical",
  "poison": "DND4E.DamagePoison",
  "psychic": "DND4E.DamagePsychic",
  "radiant": "DND4E.DamageRadiant",
  // "slashing": "DND4E.DamageSlashing",
  // "slash": "DND4E.DamageSlashing",
  "thunder": "DND4E.DamageThunder"
};


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
  "ac": "DND4E.DefenceAC",
  "fort": "DND4E.DefenceFort",
  "ref": "DND4E.DefenceRef",
  "wil": "DND4E.DefenceWil"
};

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
	
};
DND4E.light = {
	cloth: "DND4E.ArmourProfCloth",
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
 * This Object defines the types of single or area targets which can be applied in D&D4e
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
	"name": "DND4E.ItemName",
	"level": "DND4E.Level",
	"none": "DND4E.None",
};

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
	"usage": "DND4E.Usage",
	"action": "DND4E.Action",
	"actionMod": "DND4E.PowerGroupingModern",
	"type": "DND4E.Type",
	"powerSubtype": "DND4E.PowerSubtype",
};


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
	"name": "DND4E.ItemName",
	"level": "DND4E.Level",
	"actionType": "DND4E.Action",
	"rangeTextShort": "DND4E.Range",
	"useType": "DND4E.Usage",
	"use.value": "DND4E.Used",
	"powerSubtype": "DND4E.PowerSubtype",
	"none": "DND4E.None",
};

DND4E.inventoryTypes = {
	weapon: { label: "DND4E.ItemTypeWeaponPl" },
	equipment: { label: "DND4E.ItemTypeEquipmentPl" },
	consumable: { label: "DND4E.ItemTypeConsumablePl" },
	tool: { label: "DND4E.ItemTypeToolPl" },
	backpack: { label: "DND4E.ItemTypeContainerPl" },
	loot: { label: "DND4E.ItemTypeLootPl" }
};

DND4E.featureTypes = {
	raceFeats: { label: "DND4E.FeatRace" },
	classFeats: { label: "DND4E.FeatClass" },
	pathFeats: { label: "DND4E.FeatPath" },
	destinyFeats: { label: "DND4E.FeatDestiny" },
	feat: { label: "DND4E.FeatLevel" },
	ritual: { label: "DND4E.FeatRitual" }
};


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
	"weapon": "DND4E.rangeWeapon",
	"melee": "DND4E.rangeMelee",
	"reach": "DND4E.rangeReach",
	"range" : "DND4E.rangeRanged",
	"closeBurst": "DND4E.rangeCloseBurst",
	"closeBlast": "DND4E.rangeCloseBlast",
	"rangeBurst": "DND4E.rangeBurst",
	"rangeBlast": "DND4E.rangeBlast",
	"wall": "DND4E.rangeWall",
	"personal": "DND4E.rangePersonal",
	"touch": "DND4E.rangeTouch",
	"special": "DND4E.rangeSpecial",
};

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
	"sleep": "DND4E.Sleep",
	"spirit": "DND4E.Spirit",
	"stance": "DND4E.Stance",
	"summoning": "DND4E.Summoning",
	"teleportation": "DND4E.Teleportation",
	"transmutation": "DND4E.Transmutation",
	"zone": "DND4E.Zone",
};

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
}

/* -------------------------------------------- */

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
 * The available choices for how spell damage scaling may be computed
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
	"other": "DND4E.EquipmentTypeOther",

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
		icon: "systems/dnd4e/icons/statusEffects/mark_1.svg",
		description: "EFFECTDESC.mark"
	},
	{
		id: "mark_2",
		label: "EFFECT.statusMark",
		icon: "systems/dnd4e/icons/statusEffects/mark_2.svg",
		description: "EFFECTDESC.mark"
	},
	{
		id: "mark_3",
		label: "EFFECT.statusMark",
		icon: "systems/dnd4e/icons/statusEffects/mark_3.svg",
		description: "EFFECTDESC.mark"
	},
	{
		id: "mark_4",
		label: "EFFECT.statusMark",
		icon: "systems/dnd4e/icons/statusEffects/mark_4.svg",
		description: "EFFECTDESC.mark"
	},
	{
		id: "mark_5",
		label: "EFFECT.statusMark",
		icon: "systems/dnd4e/icons/statusEffects/mark_5.svg",
		description: "EFFECTDESC.mark"
	},
	{
		id: "mark_6",
		label: "EFFECT.statusMark",
		icon: "systems/dnd4e/icons/statusEffects/mark_6.svg",
		description: "EFFECTDESC.mark"
	},
	{
		id: "mark_7",
		label: "EFFECT.statusMark",
		icon: "systems/dnd4e/icons/statusEffects/mark_7.svg",
		description: "EFFECTDESC.mark"
	},
	//row 2
	{
		id: "bloodied",
		label: "EFFECT.statusBloodied",
		icon: "systems/dnd4e/icons/statusEffects/bloodied.svg",
		description: "EFFECTDESC.bloodied"
	},
	{
		id: "attack_up",
		label: "EFFECT.statusAttackUp",
		icon: "systems/dnd4e/icons/statusEffects/attack_up.svg",
		description: "EFFECTDESC.attackUp"
	},
	{
		id: "attack_down",
		label: "EFFECT.statusAttackDown",
		icon: "systems/dnd4e/icons/statusEffects/attack_down.svg",
		description: "EFFECTDESC.attackDown"
	},
	{
		id: "defUp",
		label: "EFFECT.statusDefUp",
		icon: "systems/dnd4e/icons/statusEffects/def_up.svg",
		description: "EFFECTDESC.defUp"
	},
	{
		id: "defDown",
		label: "EFFECT.statusDefDown",
		icon: "systems/dnd4e/icons/statusEffects/def_down.svg",
		description: "EFFECTDESC.defDown"
	},
	{
		id: "regen",
		label: "EFFECT.statusRegen",
		icon: "systems/dnd4e/icons/statusEffects/regen.svg",
		description: "EFFECTDESC.regen"
	},
	{
		id: "ammo_count",
		label: "EFFECT.statusAmmoCount",
		icon: "systems/dnd4e/icons/statusEffects/ammo_count.svg",
		description: "EFFECTDESC.ammoCount"
	},
	//row 3
	{
		id: "curse",
		label: "EFFECT.statusCurse",
		icon: "systems/dnd4e/icons/statusEffects/curse.svg",
		description: "EFFECTDESC.curse"
	},
	{
		id: "oath",
		label: "EFFECT.statusOath",
		icon: "systems/dnd4e/icons/statusEffects/oath.svg",
		description: "EFFECTDESC.oath"
	},
	{
		id: "hunter_mark",
		label: "EFFECT.statusHunterMark",
		icon: "systems/dnd4e/icons/statusEffects/hunter_mark.svg",
		description: "EFFECTDESC.huntermark"
	},
	{
		id: "target",
		label: "EFFECT.statusTarget",
		icon: "systems/dnd4e/icons/statusEffects/target.svg",
		description: "EFFECTDESC.target"
	},
	{
		id: "ongoing_1",
		label: "EFFECT.statusOngoing1",
		icon: "systems/dnd4e/icons/statusEffects/ongoing_1.svg",
		description: "EFFECTDESC.ongoing"
	},
	{
		id: "ongoing_2",
		label: "EFFECT.statusOngoing2",
		icon: "systems/dnd4e/icons/statusEffects/ongoing_2.svg",
		description: "EFFECTDESC.ongoing"
	},
	{
		id: "ongoing_3",
		label: "EFFECT.statusOngoing3",
		icon: "systems/dnd4e/icons/statusEffects/ongoing_3.svg",
		description: "EFFECTDESC.ongoing"
	},
	//row 4
	{
		id: "blinded",
		label: "EFFECT.statusBlind",
		icon: "systems/dnd4e/icons/statusEffects/blinded.svg",
		description: "EFFECTDESC.blinded"
	},
	{
		id: "concealed",
		label: "EFFECT.statusConceal",
		icon: "systems/dnd4e/icons/statusEffects/concealment.svg",
		description: "EFFECTDESC.concealed"
	},
	{
		id: "concealedfull",
		label: "EFFECT.statusConcealFull",
		icon: "systems/dnd4e/icons/statusEffects/concealment-full.svg",
		description: "EFFECTDESC.concealedfull"
	},
	{
		id: "dazed",
		label: "EFFECT.statusDazed",
		icon: "systems/dnd4e/icons/statusEffects/dazed.svg",
		description: "EFFECTDESC.dazed"
	},
	{
		id: "dead",
		label: "EFFECT.statusDead",
		icon: "icons/svg/skull.svg",
		description: "EFFECTDESC.dead"
	},
	{
		id: "deafened",
		label: "EFFECT.statusDeafened",
		icon: "systems/dnd4e/icons/statusEffects/deafened.svg",
		description: "EFFECTDESC.deafened"
	},
	{
		id: "disarmed",
		label: "EFFECT.statusDisarmed",
		icon: "systems/dnd4e/icons/statusEffects/disarmed.svg",
		description: "EFFECTDESC.disarmed"
	},
	//row 5
	{
		id: "dominated",
		label: "EFFECT.statusDominated",
		icon: "systems/dnd4e/icons/statusEffects/dominated.svg",
		description: "EFFECTDESC.dominated"
	},
	{
		id: "drunk",
		label: "EFFECT.statusDrunk",
		icon: "systems/dnd4e/icons/statusEffects/drunk.svg",
		description: "EFFECTDESC.drunk"
	},	
	{
		id: "dying",
		label: "EFFECT.statusDying",
		icon: "systems/dnd4e/icons/statusEffects/dying.svg",
		description: "EFFECTDESC.dying"
	},
	{
		id: "flying",
		label: "EFFECT.statusFlying",
		icon: "systems/dnd4e/icons/statusEffects/flying.svg",
		description: "EFFECTDESC.flying"
	},
	{
		id: "grabbed",
		label: "EFFECT.statusGrabbed",
		icon: "systems/dnd4e/icons/statusEffects/grabbed.svg",
		description: "EFFECTDESC.grabbed"
	},
	{
		id: "immobilized",
		label: "EFFECT.statusImmobilized",
		icon: "systems/dnd4e/icons/statusEffects/immobilized.svg",
		description: "EFFECTDESC.immobilized"
	},
	{
		id: "insubstantial",
		label: "EFFECT.statusInsubstantial",
		icon: "systems/dnd4e/icons/statusEffects/insubstantial.svg",
		description: "EFFECTDESC.insubstantial"
	},
	//row 6
	{
		id: "invisible",
		label: "EFFECT.statusInvisible",
		icon: "systems/dnd4e/icons/statusEffects/invisible.svg",
		description: "EFFECTDESC.invisible"
	},
	{
		id: "mounted",
		label: "EFFECT.statusMounted",
		icon: "systems/dnd4e/icons/statusEffects/mounted.svg",
		description: "EFFECTDESC.mounted"
	},		

	{
		id: "petrified",
		label: "EFFECT.statusPetrified",
		icon: "systems/dnd4e/icons/statusEffects/petrified.svg",
		description: "EFFECTDESC.petrified"
	},
	{
		id: "prone",
		label: "EFFECT.statusProne",
		icon: "systems/dnd4e/icons/statusEffects/prone.svg",
		description: "EFFECTDESC.prone"
	},
	{
		id: "removed",
		label: "EFFECT.statusRemoved",
		icon: "systems/dnd4e/icons/statusEffects/removed.svg",
		description: "EFFECTDESC.removed"
	},	
	{
		id: "restrained",
		label: "EFFECT.statusRestrained",
		icon: "systems/dnd4e/icons/statusEffects/restrained.svg",
		description: "EFFECTDESC.restrained"
	},	
	{
		id: "sleeping",
		label: "EFFECT.statusSleeping",
		icon: "systems/dnd4e/icons/statusEffects/sleeping.svg",
		description: "EFFECTDESC.sleeping"
	},
	//row 7
	{
		id: "slowed",
		label: "EFFECT.statusSlowed",
		icon: "systems/dnd4e/icons/statusEffects/slowed.svg",
		description: "EFFECTDESC.slowed"
	},
	{
		id: "stunned",
		label: "EFFECT.statusStunned",
		icon: "systems/dnd4e/icons/statusEffects/stunned.svg",
		description: "EFFECTDESC.stunned"
	},
	{
		id: "surprised",
		label: "EFFECT.statusSurprised",
		icon: "systems/dnd4e/icons/statusEffects/surprised.svg",
		description: "EFFECTDESC.surprised"
	},
	{
		id: "unconscious",
		label: "EFFECT.statusUnconscious",
		icon: "systems/dnd4e/icons/statusEffects/unconscious.svg",
		description: "EFFECTDESC.unconscious"
	},
	{
		id: "weakened",
		label: "EFFECT.statusWeakened",
		icon: "systems/dnd4e/icons/statusEffects/weakend.svg",
		description: "EFFECTDESC.weakened"
	},
	{
		id: "hidden",
		label: "EFFECT.statusHidden",
		icon: "systems/dnd4e/icons/statusEffects/hidden.svg",
		description: "EFFECTDESC.hidden"
	},
	{
		id: "sneaking",
		label: "EFFECT.statusSneaking",
		icon: "systems/dnd4e/icons/statusEffects/sneaking.svg",
		description: "EFFECTDESC.sneaking"
	},
	//row 8
	{
		id: "torch",
		label: "EFFECT.statusTorch",
		icon: "systems/dnd4e/icons/statusEffects/torch.svg",
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
DND4E.CHARACTER_EXP_LEVELS =  [
	0, 1000, 2250, 3750, 5500, 7500, 10000, 13000, 16500, 20500,
	26000, 32000, 39000, 47000, 57000, 69000, 83000, 99000, 119000, 143000,
	175000, 210000, 255000, 310000, 375000, 450000, 550000, 675000, 825000, 1000000 
	];

// Configure Optional Character Flags
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

