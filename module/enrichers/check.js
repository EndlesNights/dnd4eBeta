import { Helper } from "../helper.js";
import { createLink, parseConfig, addDataset } from "./utils.js";

/** @type {TextEditorEnricherConfig["id"]} */
export const id = "DND4E.check";

/* -------------------------------------------------- */

/** @type {TextEditorEnricherConfig["pattern"]} */
export const pattern = new RegExp("\\[\\[/(?<type>skill|ability)(?<config> .*?)?]](?!])(?:{(?<label>[^}]+)})?", "gi");

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

	switch (type) {
		case "ability":
		case "skill":
			return enrichCheck(parsedConfig, label, options);
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
	const rollType = parsedConfig.type;
	let toRoll;
	if (rollType === "skill") {
		toRoll = parsedConfig.skill?.replaceAll("/", "|").split("|") ?? [];
	} else if (rollType === "ability") {
		toRoll = parsedConfig.ability?.replaceAll("/", "|").split("|") ?? [];
	}
	const linkConfig = {
		rollType,
		skillOrAbility: toRoll,
		dc: parsedConfig.dc,
		format: parsedConfig.format,
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
			case "check": return await rollCheck(dataset, event);
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
	const displayChallenge = game.user.isGM || !dataset.hideDC;
	const baseDataset = { ...dataset };
	baseDataset.type = "check";
	return {
		buttonLabel: formatCheckLabel(dataset),
		hiddenLabel: formatCheckLabel({ ...dataset, hideDC: true }),
		dataset: { ...baseDataset, action: "checkRequest", visibility: "all", displayChallenge },
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
					return handleRoll(link, ev.target);
				case "requestCheck":
					return requestCheck(link, ev);
			}
		});
	}
}
