import { createLink, parseConfig, addDataset } from "./utils.js";

import { d20Roll, damageRoll } from "../dice.js";
import { Helper } from "../helper.js";
import Roll4e from "../dice/Roll.js";

/** @type {TextEditorEnricherConfig["id"]} */
export const id = "DND4E.roll";

/* -------------------------------------------------- */

/** @type {TextEditorEnricherConfig["pattern"]} */
export const pattern = new RegExp("\\[\\[/(?<type>skill|ability|attack|damage|healing)(?<config> .*?)?]](?!])(?:{(?<label>[^}]+)})?", "gi");

/* -------------------------------------------------- */

/**
 * Enricher function.
 * @type {TextEditorEnricher}
 */
export function enricher(match, options) {
	let { type, config, label } = match.groups;
	type = type.toLowerCase();
	const parsedConfig = parseConfig(config);
	parsedConfig._input = match[0];
	parsedConfig.type = type;

	// TODO: Attack and damage rolls probably also will go in here, thus the switch statement that currently leads to only one place.
	switch (type) {
		case "ability":
		case "skill":
			return enrichCheck(parsedConfig, label, options);
		case "attack":
			return enrichAttack(parsedConfig, label, options);
		case "damage":
		case "healing":
			return enrichDamageHealing(parsedConfig, label, options);
	}
}

/* -------------------------------------------------- */

/**
 * Enrich a check link.
 * @param {ParsedConfig} parsedConfig      Configuration data.
 * @param {string} [label]             Optional label to replace default text.
 * @param {EnrichmentOptions} options  Options provided to customize text enrichment.
 * @returns {HTMLElement|null}         An HTML link if the enricher could be built, otherwise null.
 */
export async function enrichCheck(parsedConfig, label, options) {
	const { dc, format, hideDC, type: rollType } = parsedConfig;
	let toRoll;
	if (rollType === "skill") {
		toRoll = parsedConfig.skill?.replaceAll("/", "|").split("|") ?? [];
	} else if (rollType === "ability") {
		toRoll = parsedConfig.ability?.replaceAll("/", "|").split("|") ?? [];
	}
	const linkConfig = {
		rollType,
		skillOrAbility: toRoll,
		dc,
		format,
		hideDC,
	};

	const longSkills = Object.fromEntries(Array.from(Object.entries(CONFIG.DND4E.skills)).map((arr) => [arr[1].label.toLowerCase(), arr[0]]));
	const longAbilities = Object.fromEntries(Array.from(Object.entries(CONFIG.DND4E.abilities)).map((arr) => [arr[1].toLowerCase(), arr[0]]));
	for (const value of parsedConfig.values) {
		let skillOrAbility;
		const normalizedValue = value.toLowerCase();
		if (rollType === "skill") {
			if (normalizedValue in CONFIG.DND4E.skills) skillOrAbility = normalizedValue;
			if (normalizedValue in longSkills) skillOrAbility = longSkills[normalizedValue];
		} else if (rollType === "ability") {
			if (normalizedValue in CONFIG.DND4E.abilities) skillOrAbility = normalizedValue;
			if (normalizedValue in longAbilities) skillOrAbility = longAbilities[normalizedValue];
		}
		if (skillOrAbility) linkConfig.skillOrAbility.push(skillOrAbility);
		if (!isNaN(parseInt(value))) linkConfig.dc = parseInt(value);
	}	

	if (!linkConfig.skillOrAbility.length) return null;

	const complex = linkConfig.skillOrAbility.length > 1;
	if (label && complex) {
		console.warn(`Multiple skills or abilities and a custom label found while enriching ${parsedConfig._input}, which aren't supported together.`);
		return null;
	}
	let rollCheckLink;
	if (complex) {
		const formatter = game.i18n.getListFormatter({ type: "disjunction" });
		const parts = [];
		for (const partSkillOrAbility of linkConfig.skillOrAbility) {
			const partConfig = { ...linkConfig, skillOrAbility: partSkillOrAbility };
			delete partConfig.dc;
			delete partConfig.format;
			const flavor = formatCheckFlavor(partConfig);
			partConfig.flavor = flavor;
			partConfig.type = "check";
			parts.push(createLink(formatCheckLabel(partConfig), partConfig, { icon: "fa-dice-d20" }).outerHTML);
		}

		label = formatter.format(parts);
		if (linkConfig.dc && !linkConfig.hideDC) {
			label = _loc("EDITOR.DND4E.Inline.DC", { dc: linkConfig.dc, check: label });
		}
		label = _loc(`EDITOR.DND4E.Inline.Check${linkConfig.format === "long" ? "Long" : "Short"}`, { check: label });

		const template = document.createElement("template");
		template.innerHTML = label;
		const span = document.createElement("span");
		span.classList.add("roll-link-group");
		addDataset(span, linkConfig);
		span.append(template.content);
		rollCheckLink = span;
	}
	else {
		const partConfig = { ...linkConfig, skillOrAbility: linkConfig.skillOrAbility[0] };
		label ??= formatCheckLabel(partConfig);
		const flavor = formatCheckFlavor(partConfig);
		partConfig.flavor = flavor;

		rollCheckLink = createLink(label,
			{ ...partConfig, type: "check" },
			{ icon: "fa-dice-d20" },
		);
	}
	rollCheckLink.dataset.tooltip = formatTooltip({ ...linkConfig, type: "check" });

	if (game.user.isGM) {
		// foundry checks if the returned html element is enriched-content and wraps if it's not.
		const wrapper = document.createElement("enriched-content");
		wrapper.appendChild(rollCheckLink);
		wrapper.appendChild(createLink("",
			{ ...linkConfig, type: "requestCheck", tooltip: "EDITOR.DND4E.Inline.RequestRoll" },
			{ icon: "fa-comment" },
		));
		return wrapper;
	}
	else return rollCheckLink;
}

/* -------------------------------------------------- */

/**
 * Enrich an attack link.
 * @param {ParsedConfig} parsedConfig      Configuration data.
 * @param {string} [label]             Optional label to replace default text.
 * @param {EnrichmentOptions} options  Options provided to customize text enrichment.
 * @returns {HTMLElement|null}         An HTML link if the enricher could be built, otherwise null.
 */
export async function enrichAttack(parsedConfig, label, options) {
	let { formula, ability, def, title, flavor } = parsedConfig;

	const longAbilities = Object.fromEntries(Array.from(Object.entries(CONFIG.DND4E.abilities)).map((arr) => [arr[1].toLowerCase(), arr[0]]));
	const longDefenses = Object.fromEntries(Array.from(Object.entries(CONFIG.DND4E.defensives)).map((arr) => [arr[1].labelShort.toLowerCase(), arr[0]]));
	delete longDefenses.ac;
	longDefenses["armor class"] = "ac";
	ability = ability?.toLowerCase();
	if (ability in longAbilities) {
		ability = longAbilities[ability];
	}
	def = def?.toLowerCase();
	if (def in longDefenses) {
		def = longDefenses[def];
	}

	const formulaParts = [];
	for (const value of parsedConfig.values) {
		const normalizedValue = value.includes("@") ? value : value.toLowerCase();
		if (!ability && (normalizedValue in CONFIG.DND4E.abilities)) {
			ability = normalizedValue;
		} else if (!ability && (normalizedValue in longAbilities)) {
			ability = longAbilities[normalizedValue];
		} else if (!def && (normalizedValue in CONFIG.DND4E.defensives)) {
			def = normalizedValue;
		} else if (!def && (normalizedValue in longDefenses)) {
			def = longDefenses[normalizedValue];
		} else {
			formulaParts.push(normalizedValue);
		}
	}

	formula = formula || formulaParts.join(" ");
	const replacedFormula = (typeof formula === "string") ? Roll.replaceFormulaData(formula, options.rollData, { recursive: true }) : formula;

	const linkConfig = {
		formula,
		replacedFormula,
		ability,
		def,
		title,
		flavor,
		itemUuid: options.rollData?.item?.uuid,
		actorUuid: options.rollData?.charaUID,
		messageId: options.rollData?.messageId,
	};

	let item = (options.rollData?.item?.uuid) && fromUuidSync(options.rollData?.item?.uuid);
	if (!item && options.rollData?.messageId) {
		const itemData = game.messages.get(options.rollData?.messageId).flags?.dnd4e?.item;
		if (itemData) {
			item = new CONFIG.Item.documentClass(itemData, { parent: fromUuidSync(options.rollData?.charaUID) });
			item.prepareData();
		}
	}
	const evaluatedFormula = await item?.getAttackBonus() || Helper.evaluateFormula(replacedFormula, options.rollData, { strict: true, suppressError: true });
	let attackString;		
	if (evaluatedFormula && (game.settings.get("dnd4e", "cardAtkDisplay") == "bonus")) {
		attackString = `+${evaluatedFormula}`;
	} else if (ability && evaluatedFormula && (game.settings.get("dnd4e", "cardAtkDisplay") == "both")) {
		attackString = `${CONFIG.DND4E.abilities[ability]} (+${evaluatedFormula})`;
	} else if (ability) {
		attackString = `${CONFIG.DND4E.abilities[ability]}`;
	} else {
		attackString = evaluatedFormula ? `+${evaluatedFormula}` : formula;
	}
	const defString = CONFIG.DND4E.defensives[def]?.labelShort;

	label ??= defString ? `${attackString} ${_loc("DND4E.VS")} ${defString}` : attackString;

	const rollAttackLink = createLink(label,
		{ ...linkConfig, type: "attack" },
		{ icon: "fa-dice-d20" },
	);
	rollAttackLink.dataset.tooltip = formatTooltip({ ...linkConfig, type: "attack" });

	return rollAttackLink;
}

/* -------------------------------------------------- */

/**
 * Enrich a damage or healing link.
 * @param {ParsedConfig} parsedConfig      Configuration data.
 * @param {string} [label]             Optional label to replace default text.
 * @param {EnrichmentOptions} options  Options provided to customize text enrichment.
 * @returns {HTMLElement|null}         An HTML link if the enricher could be built, otherwise null.
 */
export async function enrichDamageHealing(parsedConfig, label, options) {
	let { type, formula, critFormula, damageType, healingType, title, flavor } = parsedConfig;
	damageType = damageType || "";
	healingType = healingType || "healing";

	const damageTypes = { ...CONFIG.DND4E.damageTypes };
	const healingTypes = CONFIG.DND4E.healingTypes;
	delete damageTypes.damage;
	delete damageTypes.ongoing;
	if (type === "damage") damageType = damageType.split(",").map((t) => t.toLowerCase().trim()).filter((t) => (t in damageTypes));
	if (type === "healing") damageType = healingType.split(",").map((t) => t.toLowerCase().trim()).filter((t) => (t in healingTypes));

	const formulaParts = [];
	for (const value of parsedConfig.values) {
		const normalizedValue = value.includes("@") ? value : value.toLowerCase();
		if ((type === "damage") && (normalizedValue in damageTypes)) damageType.push(normalizedValue);
		else if ((type === "healing") && (normalizedValue in healingTypes)) damageType.push(normalizedValue);
		else formulaParts.push(normalizedValue);
	}

	formula = formula || formulaParts.join(" ");

	const replacedFormula = (typeof formula === "string") ? Roll.replaceFormulaData(formula, options.rollData, { recursive: true }) : formula;
	const replacedCritFormula = (typeof critFormula === "string") ? Roll.replaceFormulaData(critFormula, options.rollData, { recursive: true }) : critFormula;

	damageType = [...new Set(damageType)];

	const linkConfig = {
		type,
		formula,
		critFormula,
		replacedFormula,
		replacedCritFormula,
		title,
		flavor,
		itemUuid: options.rollData?.item?.uuid,
		actorUuid: options.rollData?.charaUID,
		messageId: options.rollData?.messageId,
	};

	let item = (options.rollData?.item?.uuid) && fromUuidSync(options.rollData?.item?.uuid);
	if (!item && options.rollData?.messageId) {
		const itemData = game.messages.get(options.rollData?.messageId).flags?.dnd4e?.item;
		if (itemData) {
			item = new CONFIG.Item.documentClass(itemData, { parent: fromUuidSync(options.rollData?.charaUID) });
			item.prepareData();
		}
	}
	const evaluatedFormula = Helper.evaluateFormula(replacedFormula, options.rollData, { strict: true, suppressError: true }) || replacedFormula;
	const typedFormula = damageType.length ? `(${evaluatedFormula})[${damageType.join(",")}]` : evaluatedFormula;
	const formatter = game.i18n.getListFormatter();
	let damageString = evaluatedFormula;
	if (type === "damage") {
		const typeString = damageType.length ? _loc("DND4E.TypeDamage", { type: formatter.format(damageType) }) : _loc("DND4E.Damage");
		damageString = `${damageString} ${typeString}`;
	} else if (type === "healing") {
		let localizedHealingTypes = [];
		if (damageType.includes("healing")) {
			localizedHealingTypes.push(_loc("DND4E.Healing"));
		}
		if (damageType.includes("temphp")) {
			localizedHealingTypes.push(_loc("DND4E.TempHPTip"));
		}
		damageString = `${damageString} ${formatter.format(localizedHealingTypes)}`;
	}

	label ??= damageString;

	const rollDamageLink = createLink(label,
		{ ...linkConfig, damageType: damageType.join(","), type },
		{ icon: "fa-dice-d20" },
	);
	rollDamageLink.dataset.tooltip = formatTooltip({ ...linkConfig, type });

	return rollDamageLink;
}

/* -------------------------------------------- */

/**
 * Create the combined dataset for the target button and any parent groups.
 * @param {HTMLElement} target  Button that was clicked.
 * @returns {object}
 */
function getRollActionDataset(target) {
	return {
		...((target.closest(".roll-link-group") ?? target)?.dataset ?? {}),
		...(target.closest(".roll-link")?.dataset ?? {}),
	};
}

/* -------------------------------------------- */

/**
 * Handle performing a roll.
 * @param {Event} event         Triggering click event.
 * @param {HTMLElement} target  Button that was clicked.
 * @returns {Promise}
 */
export async function handleRoll(event, target) {
	target = target ?? event.target;
	const dataset = getRollActionDataset(target);
	const link = target.closest("a") ?? target;
	link.disabled = true;
	window.getSelection().empty();
	try {
		switch (dataset.type) {
			case "attack": return rollAttack(dataset, event);
			case "check": return rollCheck(dataset, event);
			case "damage":
			case "healing": return rollDamageHealing(dataset, event);
		}
	} finally {
		link.disabled = false;
	}
}

/* -------------------------------------------------- */

/**
 * Helper function that constructs the check roll.
 * @param {object} config
 * @param {PointerEvent} event
 */
async function rollCheck(config, event) {
	let { skillOrAbility, dc, flavor } = config;

	if (!skillOrAbility) throw new Error("Check enricher must provide an ability or skill");

	const actors = Helper.tokensToActors();

	if (!actors.size) {
		ui.notifications.warn("EDITOR.DND4E.Inline.Warning.NoActor", { localize: true });
		return;
	}

	for (const actor of actors) {
		if (config.rollType === "skill") {
			await actor.rollSkill(skillOrAbility, { targetValue: dc, flavor });
		} else if (config.rollType === "ability") {
			await actor.rollAbility(skillOrAbility, { targetValue: dc, flavor });
		}
	}
}

/* -------------------------------------------------- */

/**
 * Helper function that constructs the attack roll.
 * @param {object} config
 * @param {PointerEvent} event
 */
async function rollAttack(config, event) {
	const { formula, replacedFormula, ability, def, title, itemUuid, actorUuid, messageId } = config;
	let flavor = config.flavor;
	if (!formula) throw new Error("Attack enricher must provide a formula");

	const parts = [replacedFormula];
	const partsExpressionReplacements = [{ value: formula, target: replacedFormula }];

	let actor = fromUuidSync(actorUuid);
	if (!actor) {
		const actors = Helper.tokensToActors();
		if (actors.size > 1) {
			ui.notifications.warn("EDITOR.DND4E.Inline.Warning.TooManyActors", { localize: true });
			return;
		}
		if (actors.size) {		
			actor = Array.from(actors)[0];
		}
	}

	let item = fromUuidSync(itemUuid);
	if (!item && messageId) {
		const itemData = game.messages.get(messageId).flags?.dnd4e?.item;
		if (itemData) {
			item = new CONFIG.Item.documentClass(itemData, { parent: actor });
			item.prepareData();
		}
	}

	const rollData = item?.getRollData() || actor?.getRollData() || {};

	const options = {};
	options.bonuses = foundry.utils.deepClone(Roll4e.DEFAULT_OPTIONS.bonuses);
	options.rollData = { ...rollData, isAttackRoll: true, commonAttackBonuses: rollData?.commonAttackBonuses ?? {} };
	if (ability && options.rollData.item?.attack) options.rollData.item.attack.ability = ability;
	options.attackedDef = def;
	options.formulaInnerData = { ...Helper.getDataObject(formula, rollData) };

	const powerData = rollData.item;
	const weaponData = Helper.getWeaponUse(powerData, actor)?.getRollData().item;
	await Helper.applyEffects(rollData, actor, powerData, weaponData, "attack", null, null, options);

	if (!flavor && item) {
		flavor = `${_loc("DND4E.AttackRoll")}: ${item.name}`;
		if (weaponData) flavor += `<br />${weaponData.name}`;
	} else if (!flavor) {
		flavor = _loc("DND4E.AttackRoll");
		if (def) flavor += ` ${_loc("DND4E.VS")} ${CONFIG.DND4E.defensives[def]?.labelShort}`;
	}

	// Compose roll options
	const rollConfig = {
		parts,
		partsExpressionReplacements,
		actor,
		item: item,
		data: options.rollData,
		title: title ?? _loc("DND4E.AttackRoll"),
		flavor,
		event: options.event,
		speaker: ChatMessage.getSpeaker({ actor }),
		dialogOptions: {
			width: 400,
			top: options.event ? options.event.clientY - 80 : null,
			left: window.innerWidth - 710,
		},
		isAttackRoll: true,
		messageData: { "flags.dnd4e.roll": { type: "attack" } },
		options,
	};

	return d20Roll(rollConfig);
}

/* -------------------------------------------------- */

/**
 * Helper function that constructs the attack roll.
 * @param {object} config
 * @param {PointerEvent} event
 */
async function rollDamageHealing(config, event) {
	let { type, formula, replacedFormula, critFormula, replacedCritFormula, damageType, title, itemUuid, actorUuid, messageId } = config;
	damageType = damageType?.split(",") || [];
	let flavor = config.flavor;
	if (!formula) throw new Error("Attack enricher must provide a formula");

	const parts = [formula];
	const partsExpressionReplacement = [{ value: formula, target: replacedFormula }];
	const partsCrit = critFormula ? [critFormula] : null;
	const partsCritExpressionReplacement = critFormula ? [{ value: critFormula, target: replacedCritFormula }] : null;

	let actor = fromUuidSync(actorUuid);
	if (!actor) {
		const actors = Helper.tokensToActors();
		if (actors.size > 1) {
			ui.notifications.warn("EDITOR.DND4E.Inline.Warning.TooManyActors", { localize: true });
			return;
		}
		if (actors.size) {		
			actor = Array.from(actors)[0];
		}
	}

	let item = fromUuidSync(itemUuid);
	if (!item && messageId) {
		const itemData = game.messages.get(messageId).flags?.dnd4e?.item;
		if (itemData) {
			item = new CONFIG.Item.documentClass(itemData, { parent: actor });
			item.prepareData();
		}
	}

	const rollData = item?.getRollData() || actor?.getRollData() || {};

	const options = { formulaInnerData: { ...Helper.getDataObject(formula, rollData), ...Helper.getDataObject(critFormula, rollData) }, divisors: { normal: { value: 1, reason: [] }, miss: { value: 1, reason: [] }, crit: { value: 1, reason: [] } }, bonuses: foundry.utils.deepClone(Roll4e.DEFAULT_OPTIONS.bonuses) };
	options.rollData = { ...rollData, isAttackRoll: false };

	const powerData = rollData.item;
	const weaponData = Helper.getWeaponUse(powerData, actor)?.getRollData().item;
	let extraDamageParts = [];
	await Helper.applyEffects(rollData, actor, powerData, weaponData, "damage", extraDamageParts, null, options);
	// Extra damage
	if (extraDamageParts.length) {
		for (const part of extraDamageParts) {
			parts.push(part);
			partsExpressionReplacement.unshift({ target: part, value: "@extraDamage" });
			if (partsCrit) {
				let critDamage = new Roll("part").evaluateSync({ maximize: true });
				partsCrit.push(critDamage.total);
				partsCritExpressionReplacement.unshift({ target: critDamage, value: "@extraDamage" });
			}
		}
	}

	const formatter = game.i18n.getListFormatter();
	const damageString = type === "damage" ? "DND4E.DamageRoll" : (type === "healing" ? "DND4E.HealingRoll" : "");
	if (!flavor && item) {
		flavor = `${item.name} - ${_loc(damageString)}`;
		if (damageType.length) flavor += ` (${formatter.format(damageType)})`;
		if (weaponData) flavor += ` with ${weaponData.name}`;
	} else if (!flavor) {
		flavor = _loc(damageString);
	}

	if (damageType.length) {
		for (let i = 0; i < parts.length; i++) {
			parts[i] = `(${parts[i]})[${damageType.join(",")}]`;
		}
		for (let i = 0; i < partsCrit?.length; i++) {
			partsCrit[i] = `(${partsCrit[i]})[${damageType.join(",")}]`;
		}  
	}

	// Compose roll options
	const rollConfig = {
		parts,
		partsExpressionReplacement,
		partsCrit,
		partsCritExpressionReplacement,
		actor,
		data: options.rollData,
		title: title ?? _loc(damageString),
		flavor,
		event: options.event,
		speaker: ChatMessage.getSpeaker({ actor }),
		dialogOptions: {
			width: 400,
			top: options.event ? options.event.clientY - 80 : null,
			left: window.innerWidth - 710,
		},
		messageData: { "flags.dnd4e.roll": { type: "damage" } },
		healingRoll: type === "healing",
		options,
		allowCritical: !!partsCrit?.length,
	};

	return damageRoll(rollConfig);
}

/* -------------------------------------------------- */

/**
 * Create a test request chat message.
 * @param {HTMLAnchorElement} link
 * @param {PointerEvent} event
 */
async function requestCheck(link, event) {
	let buttons = createCheckRequestButtons(link.dataset);

	await ChatMessage.create({
		user: game.user.id,
		content: await foundry.applications.handlebars.renderTemplate(
			"systems/dnd4e/templates/chat/roll-request-card.hbs", { buttons },
		),
		flavor: _loc("EDITOR.DND4E.Inline.RollRequest"),
		speaker: ChatMessage.getSpeaker({ user: game.user }),
	});
}

/* -------------------------------------------------- */

/**
 * Create a label for a roll message.
 * @param {object} config  Configuration data.
 * @returns {string}
 */
function formatCheckLabel(config) {
	const longSuffix = config.format === "long" ? "Long" : "Short";
	const showDC = config.dc && !config.hideDC;

	let label;
	if (config.rollType === "skill") {
		label = CONFIG.DND4E.skills[config.skillOrAbility]?.label;
	} else if (config.rollType === "ability") {
		label = CONFIG.DND4E.abilities[config.skillOrAbility];
	}

	if (showDC) label = _loc("EDITOR.DND4E.Inline.DC", { dc: config.dc, check: label });
	label = _loc(`EDITOR.DND4E.Inline.Check${longSuffix}`, { check: label });

	return label;
}

/* -------------------------------------------------- */

/**
 * Create a tooltip for a roll message.
 * @param {object} config  Configuration data.
 * @returns {string}
 */
function formatTooltip(config) {
	let label;
	switch (config.type) {
		case "check":
			if (config.rollType === "skill") {
				label = CONFIG.DND4E.skills[config.skillOrAbility]?.label;
			} else if (config.rollType === "ability") {
				label = CONFIG.DND4E.abilities[config.skillOrAbility];
			}
			label = _loc("EDITOR.DND4E.Inline.CheckLong", { check: label });
			break;
		case "attack":
			label = _loc("DND4E.Attack");
			break;
		case "damage":
			label = _loc("DND4E.Damage");
			break;
		case "healing":
			label = _loc("DND4E.Healing");
			break;
	}

	return _loc("DND4E.RollThing", { thing: label });
}

/* -------------------------------------------------- */

/**
 * Create a label for a roll message.
 * @param {object} config  Configuration data.
 * @returns {string}
 */
function formatCheckFlavor(config) {
	const showDC = config.dc && !config.hideDC;

	let flavor;
	if (config.rollType === "skill") {
		flavor = CONFIG.DND4E.skills[config.skillOrAbility]?.label;
	} else if (config.rollType === "ability") {
		flavor = CONFIG.DND4E.abilities[config.skillOrAbility];
	}
	if (showDC) {
		flavor = _loc("EDITOR.DND4E.Inline.DCFlavor", { check: flavor, dc: config.dc });
	} else {
		flavor = _loc("EDITOR.DND4E.Inline.CheckLong", { check: flavor });
	}

	return flavor;
}

/* -------------------------------------------- */

/**
 * Create the buttons for a check requested in chat.
 * @param {object} dataset
 * @returns {object[]}
 */
function createCheckRequestButtons(dataset) {
	const skillsOrAbilities = dataset.skillOrAbility.split(",");
	if (skillsOrAbilities.length <= 1) return [createRequestButton(dataset)];
	const baseDataset = { ...dataset };
	delete baseDataset.skillOrAbility;
	baseDataset.type = "check";
	let buttons;
	if (dataset.rollType === "skill") {
		buttons = [
			...skillsOrAbilities.map(skill => createRequestButton({
				skillOrAbility: skill, ...baseDataset, format: "short",
			})),
		];
	} else if (dataset.rollType === "ability") {
		buttons = [
			...skillsOrAbilities.map(ability => createRequestButton({
				skillOrAbility: ability, ...baseDataset, format: "short",
			})),
		];
	}
	return buttons;
}

/* -------------------------------------------- */

/**
 * Create a button for a chat request.
 * @param {object} dataset
 * @returns {object}
 */
function createRequestButton(dataset) {
	const baseDataset = { ...dataset };
	baseDataset.type = "check";
	return {
		buttonLabel: formatCheckLabel({ ...dataset, hideDC: false }),
		hiddenLabel: formatCheckLabel({ ...dataset, hideDC: true }),
		dataset: { ...baseDataset, action: "checkRequest", visibility: "all" },
	};
}

/* -------------------------------------------------- */

/**
 * Called when the enriched content is added to the DOM.
 * @param {HTMLEnrichedContentElement} element
 */
export async function onRender(element) {
	for (const link of element.querySelectorAll("a")) {
		link.addEventListener("click", (ev) => {
			switch (link.dataset.type) {
				case "check":
				case "attack":
				case "damage":
					return handleRoll(link, ev.target);
				case "requestCheck":
					return requestCheck(link, ev);
			}
		});
	}
}
