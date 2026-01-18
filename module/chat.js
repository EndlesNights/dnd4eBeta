import { Helper } from "./helper.js";
import {MultiAttackRoll} from "./roll/multi-attack-roll.js";

/**
 * Highlight critical success or failure on d20 rolls, or recharge rolls
 */
export const highlightCriticalSuccessFailure = function(message, html, data) {

	if ( !message.isRoll || !message.isContentVisible ) return;
	let i = 0;
	for(const roll of message.rolls){
		if ( !roll.dice.length ) continue;
		const d = roll.dice[0];

		// Ensure it is an un-modified d20 roll, or is part of a recharge roll
		const isD20 = (d.faces === 20) && ( d.values.length === 1 );
		if ( !isD20 && !d.options.recharge) return;
		const isModifiedRoll = ("success" in d.results[0]) || d.options.marginSuccess || d.options.marginFailure;
		if ( isModifiedRoll ) return;

		// Highlight successes and failures
		const critical = d.options.critical || 20;
		const fumble = typeof(d.options.fumble) === 'number' ? d.options.fumble : 1;
		if ( d.total >= critical ) {
			html.querySelectorAll(`.dice-total`)[i].classList.add("critical");
		}
		else if ( d.total <= fumble ){ 
			html.querySelectorAll(`.dice-total`)[i].classList.add("fumble");
		}
		else if ( d.options.target ) {
			if ( roll.total >= d.options.target ){
				html.querySelectorAll(`.dice-total`)[i].classList.add("success");
			} else {
				html.querySelectorAll(`.dice-total`)[i].classList.add("failure");
			}
		}

		i++;
	}
};

/* -------------------------------------------- */

/**
 * Optionally hide the display of chat card action buttons which cannot be performed by the user
 */
export const displayChatActionButtons = function(message, html, data) {
	const chatCard = html.querySelector(".DND4E.chat-card");
	if ( chatCard ) {
		const flavor = html.querySelector(".flavor-text");
		if ( flavor?.textContent === html.querySelector(".item-name")?.textContent ) flavor.remove();

		// If the user is the message author or the actor owner, proceed
		let actor = game.actors.get(data.message.speaker.actor);
		if ( actor && actor.owner ) return;
		else if ( game.user.isGM || (data.author.id === game.user.id)) return;

		// Otherwise conceal action buttons except for saving throw
		const buttons = chatCard.querySelectorAll("button[data-action]");
		buttons.forEach((btn) => {
			if ( btn.dataset.action === "save" ) return;
			btn.style.display = "none"
		});
	}
};

export const displayDamageOptionButtons = function(message, html, data) {
	if ( !message.isRoll || !message.isContentVisible ) return;

	// Highlight rolls where the first part is a d20 roll
	const roll = message.rolls[0];
	if ( !roll.dice.length ) return;
	const d = roll.dice[0];
	const isD20 = (d.faces === 20) && ( d.values.length === 1 );
	if ( !isD20 && !d.options.recharge) return;
	const buttons = html.querySelectorAll(".chatDamageButtons");
	buttons.forEach((button) => {
		button.style.display = "none"
	})
};

/* -------------------------------------------- */

/**
 * This function is used to hook into the Chat Log context menu to add additional options to each message
 * These options make it easy to conveniently apply damage to controlled tokens based on the value of a Roll
 *
 * @param {HTMLElement} html    The Chat Message being rendered
 * @param {Array} options       The Array of Context Menu options
 *
 * @return {Array}              The extended options Array including new context choices
 */
export const addChatMessageContextOptions = function(html, options) {

	let isAttackRoll = li => {
		const message = game.messages.get(li.dataset.messageId);
		return message.isRoll && message.isContentVisible && li.querySelector('.hit-prediction');
	};
	
	let canApplyDamage = li => {
		const message = game.messages.get(li.dataset.messageId);
		return message.isRoll && message.isContentVisible && canvas.tokens.controlled.length;
	};

	// function canApplyEffect(li, type){
	let canApplyEffect = (li, type) => {
		if(!canvas.tokens.controlled.length) return false;
		const message = game.messages.get(li.dataset.messageId);
		if(!message.isContentVisible) return false;

		const itemID = li.querySelector('[data-item-id]')?.dataset.itemId;

		if(!itemID) return false;
		
		const actorID = li.querySelector('[data-actor-id]')?.dataset.actorId;
		const tokenUUID = li.querySelector('[data-token-id]')?.dataset.tokenId.split(".");

		const actor = tokenUUID ? game.scenes.get(tokenUUID[1])?.tokens.get(tokenUUID[3])?.actor : game.actors.get(actorID);
		if(!actor) return false;

		const item = actor.items.get(itemID);
		if(!item) return false;

		if(!item.effects.size) return false;

		for(const effect of item.effects){
			if(effect.flags.dnd4e.effectData.powerEffectTypes === type) return true;
		}

		return false;
	}

	options.push(
		// Token Selection Right-Click Options
		{
			name: game.i18n.localize("DND4E.SeleteAllTargets"),
			icon: '<i class="fa-regular fa-users"></i>',
			condition: isAttackRoll,
			callback: li => selectTargetTokens(li, "all")
		},
		{
			name: game.i18n.localize("DND4E.SeleteHitTargets"),
			icon: '<i class="fa-solid fa-users"></i>',
			condition: isAttackRoll,
			callback: li => selectTargetTokens(li, "hit")
		},
		{
			name: game.i18n.localize("DND4E.SeleteMissedTargets"),
			icon: '<i class="fa-light fa-users"></i>',
			condition: isAttackRoll,
			callback: li => selectTargetTokens(li, "miss")
		},

		// Damage Right-Click Options
		{
			name: game.i18n.localize("DND4E.ChatContextDamage"),
			icon: '<i class="fas fa-user-minus"></i>',
			condition: canApplyDamage,
			callback: li => applyChatCardDamage(li, 1)
		},
		{
			name: game.i18n.localize("DND4E.ChatContextHealing"),
			icon: '<i class="fas fa-user-plus"></i>',
			condition: canApplyDamage,
			callback: li => applyChatCardDamage(li, -1)
		},
		{
			name: game.i18n.localize("DND4E.ChatContextTempHp"),
			icon: '<i class="fas fa-user-clock fa-fw"></i>',
			condition: canApplyDamage,
			callback: li => applyChatCardTempHp(li)
		},
		{
			name: game.i18n.localize("DND4E.ChatContextDoubleDamage"),
			icon: '<i class="fas fa-user-injured"></i>',
			condition: canApplyDamage,
			callback: li => applyChatCardDamage(li, 2)
		},
		{
			name: game.i18n.localize("DND4E.ChatContextHalfDamage"),
			icon: '<i class="fas fa-user-shield"></i>',
			condition: canApplyDamage,
			callback: li => applyChatCardDamage(li, 0.5)
		},
		{
			name: game.i18n.localize("DND4E.ChatContextTrueDamage"),
			icon: '<i class="fa-light fa-user-shield"></i>',
			condition: canApplyDamage,
			callback: li => applyChatCardDamage(li, 1, true)
		},
	);

	// Apply Power Effects to Select Tokens
	for(const [effectType, l] of Object.entries(game.dnd4e.config.powerEffectTypes)){
		options.push({
			name: game.i18n.localize(`DND4E.ChatContextEffect${effectType}`),
			icon: '<i class="fa-regular fas fa-bolt"></i>',
			condition: li => canApplyEffect(li, effectType),
			callback: li => applyEffectToSelectTokens(li, effectType)
		});
	}
	return options;
};

export function chatMessageListener(html) {
	//html.on('click', '.chat-damage-button', this.clickRollMessageDamageButtons.bind(this));
	html.addEventListener("click", (event) => {
		if (!event.target) return;
		const el = event.target.closest(".chat-damage-button");
		if (el) this.clickRollMessageDamageButtons.call(this, event);
	});

	//html.on('click', '.target', this.clickTokenActorName.bind(this));
	html.addEventListener("click", (event) => {
		if (!event.target) return;
		const el = event.target.closest(".target");
		if (el) this.clickTokenActorName.call(this, event);
	});
	
	//html.on('mouseenter', '.target', this.hoverTokenActorName.bind(this)).on('mouseleave', '.target', this.hoverTokenActorName.bind(this));
	html.addEventListener("mouseenter", (event) => {
		if (!event.target) return;
		const el = event.target.closest(".target");
		if (el) this.hoverTokenActorName.call(this, event);
	});
	html.addEventListener("mouseleave", (event) => {
		if (!event.target) return;
		const el = event.target.closest(".target");
		if (el) this.hoverTokenActorName.call(this, event);
	});

	html.querySelectorAll(".description.collapsible").forEach((el) => {
		el.classList.add("collapsed");
		el.querySelector(".details").style.height = "0";
	});
}

//When clicking on the name of a taget in a chat messages from attack rolls, will select and pan to the highlighted token
export const clickTokenActorName = function(event){
		event.preventDefault();

		const tokenID = event.currentTarget.getAttribute('data-target-id') || event.currentTarget.getAttribute('target-id'); //second one was for legasy where improper typing is used, will get rid of in a month or so
		if(!tokenID) return;

		const token = canvas.tokens.get(tokenID);

		if(!token) return console.log(`Token ID: ${tokenID} does not exist in this scene.`);
		if ( !token.actor?.testUserPermission(game.user, "OBSERVER") ) return;

		if(!event.shiftKey){
			canvas.tokens.selectObjects();
		}

		token.control({releaseOthers: false});
		return canvas.animatePan(token.center);
}

//When hover over chat messages with "Target" from attack rolls, will highlight the token who's have is being hovered
export const hoverTokenActorName = function(event){
	event.preventDefault();

	if ( !canvas.ready ) return;

	if(event.type === "mouseenter"){
		const tokenID = event.currentTarget.getAttribute('data-target-id') || event.currentTarget.getAttribute('target-id'); //second one was for legasy where improper typing is used, will get rid of in a month or so
		const token = canvas.tokens.get(tokenID);
		if ( token?.isVisible ) {
		  if ( !token.controlled ) token._onHoverIn(event, {hoverOutOthers: true});
		  event.currentTarget._highlighted = token;
		}
	} else if(event.type === "mouseleave"){
		return event.currentTarget._highlighted?._onHoverOut(event);
	}
}

export const clickRollMessageDamageButtons = function(event) {
	event.preventDefault();
	if (canvas.tokens.controlled.length < 1) {
		ui.notifications.error(game.i18n.localize("DND4E.NeedTokenSelected"))
	}

	// Extract card data
	const button = event.target;
	const messageId = button.closest(".message").dataset.messageId;
	const message = game.messages.get(messageId);
	const roll = message.rolls[0];
	const action = button.dataset.action;
	const divisor = roll.options.divisors[roll.options.hitType].value;

	// Apply
	if (action === "Damage") {
		applyChatCardDamageInner(roll, 1 / divisor, false)
	}
	else if (action === "HalfDamage") {
		applyChatCardDamageInner(roll, 0.5, false)
	}
	else if (action === "Heal") {
		applyChatCardDamageInner(roll, -1, false)
	}
	else if (action === "TempHeal") {
		applyChatCardTempHpInner(roll)
	}
}


/* -------------------------------------------- */
/**
 *
 * @param {HTMLElement} li    	The list item clicked, the power card chat message in this case
 * @param {string} effectType   The Effect Type that is being applied so it can pass through to the apply effect
 * @return {Promise}
 */
function applyEffectToSelectTokens(li, effectType){
	const itemID = li.querySelector('[data-item-id]')?.dataset.itemId;

	if(!itemID) return false;
	
	const actorID = li.querySelector('[data-actor-id]')?.dataset.actorId;
	const tokenUUID = li.querySelector('[data-token-id]')?.dataset.tokenId.split(".");

	const actor = tokenUUID ? game.scenes.get(tokenUUID[1])?.tokens.get(tokenUUID[3])?.actor : game.actors.get(actorID);
	if(!actor) return;

	const item = actor.items.get(itemID);
	if(!item) return;

	const effectTargets = canvas.tokens.controlled // Array

	Helper.applyEffectsToTokens(item.effects, effectTargets, effectType, actor);
}

/* -------------------------------------------- */
/**
 *
 * @param {HTMLElement} li    	The list item clicked
 * @param {string} targetType   Target Type between "hit", "miss", and "all". But I just use else for all soooo what ever
 * @return {Promise}
 */
function selectTargetTokens(li, targetType){
	const message = game.messages.get(li.dataset.messageId);

	if(!event.shiftKey){
		canvas.tokens.selectObjects();
	}

	if(targetType === "hit"){
		console.log("hit")
		for(const roll of message.rolls){
			if(['hit','critical'].includes(roll.options.multirollData.hitstate)){
				canvas.tokens.get(roll.options.multirollData.targetID).control({releaseOthers: false});
			}
		}
	}
	else if(targetType === "miss"){
		console.log("miss")
		for(const roll of message.rolls){
			if(['miss','fumble','immune'].includes(roll.options.multirollData.hitstate)){
				canvas.tokens.get(roll.options.multirollData.targetID).control({releaseOthers: false});
			}
		}
	} else {
		for(const roll of message.rolls){
			canvas.tokens.get(roll.options.multirollData.targetID).control({releaseOthers: false});
		}
	}
}

/* -------------------------------------------- */

/**
 * Apply rolled dice damage to the token or tokens which are currently controlled.
 * This allows for damage to be scaled by a multiplier to account for healing, critical hits, or resistance
 *
 * @param {HTMLElement} li    	The list item clicked
 * @param {Number} multiplier   A damage multiplier to apply to the rolled damage.
 * @param {Boolean} trueDamage	Bypass damage resistance or not (default false)
 * @return {Promise}
 */
function applyChatCardDamage(li, multiplier, trueDamage=false) {
	const message = game.messages.get(li.dataset.messageId);
	const roll = message.rolls[0];
	applyChatCardDamageInner(roll, multiplier, trueDamage);
}

function applyChatCardDamageInner(roll, multiplier, trueDamage=false) {
	let damageDealt = [];
	let rollTotalRemain = roll.total;
	let surgeAmount = 0; //how many healing surges spent
	let surgeValueAmount = 0; //how many healing surges of healing

	//count surges used, shouldn't be more than 1, but you never know....
	// flavor can be null
	if(multiplier < 0 ){
		roll.terms.forEach(e => {
			if(e.flavor?.includes("surgeValue")){
				surgeValueAmount++;
			}
			else if(e.flavor?.includes("surgeCost")){
				surgeAmount++;
			}
			else if(e.flavor?.includes("surge")){
				surgeAmount++;
				surgeValueAmount++;
			}
		});
	}

	if(multiplier < 0 || trueDamage){
		return Promise.all(canvas.tokens.controlled.map(t => {
			const a = t.actor;
			console.log( multiplier < 0 ? `Amount Healed for: ${roll.total}` : `True Damage Dealt: ${roll.total}`)
			return a.applyDamage(roll.total, multiplier, {surgeAmount, surgeValueAmount});
		}));
	}

	//Sort damage and damage type from roll terms into simpler array
	//there can be multiple different term types, the most common are Die (e.g. 2d10), operator (e.g. +) or numeric (e.g. 10).
	//They all have a total property which is a numeric in the case of dice and numeric.  See https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html
	roll.terms.forEach(e => {
		if(typeof e.total === "number"){
			if(e.flavor){
				//console.log(`Damage type found: ${e.options.flavor}`);
				damageDealt.push([e.total,e.options.flavor]);
				rollTotalRemain -= e.total;
			}
		}
	});

	//evenly split up the untyped damage into typed damage
	if(rollTotalRemain){
		const length = damageDealt.length;
		if(length === 0){
			damageDealt.push([rollTotalRemain, 'physical'])
		} else {
			for(let i = 0; i < length; i++){
				damageDealt[i][0] += 0|rollTotalRemain/length+(i<rollTotalRemain%length);
			}
		}
	}

	return Promise.all(canvas.tokens.controlled.map(t => {
		const a = t.actor;
		return a.calcDamage(damageDealt, multiplier);
	}));

}

/**
 * Apply Temporary hit points based on a roll.
 *
 * Gaining temp HP separated from main damage calculation as that set of functions was relatively complex already,
 * so making them more complex to deal with additions of temp HP and the logic behind it seemed like a bad plan from a maintenance perspective
 * @param {HTMLElement} roll  The chat entry which contains the roll data
 * @return {Promise}
 */
function applyChatCardTempHp(li) {
	const message = game.messages.get(li.dataset.messageId);
	const roll = message.rolls[0];
	applyChatCardTempHpInner(roll);
}

function applyChatCardTempHpInner(roll){
	return Promise.all(canvas.tokens.controlled.map(t => {
		const a = t.actor;
		return a.applyTempHpChange(roll.total)
	}));
}

export function _onClickDiceRoll(event){
	event.preventDefault();

	// Toggle the message flag
	let roll = event.currentTarget;
	const message = game.messages.get(roll.closest(".message").dataset.messageId);
	message._rollExpanded = !message._rollExpanded;

	// Expand or collapse tooltips
	const tooltips = roll.querySelectorAll(".dice-tooltip");
	for ( let tip of tooltips ) {
		if ( message._rollExpanded ) $(tip).slideDown(200);
		else $(tip).slideUp(200);
		tip.classList.toggle("expanded", message._rollExpanded);
	}
}

  /* -------------------------------------------- */

Hooks.on("renderChatMessageHTML", (message, html) => {
	//updateApplyEffectsTooltips(html);

	const spans = html.querySelectorAll("span.roll-expression");
	spans.forEach(el => {
		const trueId = el.id.slice(3);
		const otherEl = html.querySelector(`#form${trueId}`);
		el.addEventListener("mouseenter", (event) => {
			el.classList.toggle("roll-highlight");
			otherEl?.classList.toggle("roll-highlight");
		});
		el.addEventListener("mouseleave", (event) => {
			el.classList.toggle("roll-highlight");
			otherEl?.classList.toggle("roll-highlight");
		});
	})

	html.querySelectorAll(".dice-roll").forEach(el => el.addEventListener("click", _onClickDiceRoll.bind(this)));
});

//Function for changing the tooltip of the apply effect button of power cards based on the applyEffectsToSelection functions
export function updateApplyEffectsTooltips(html={}) {

	const settingValue = game.settings.get("dnd4e", "applyEffectsToSelection");
	// True -> Selected
	// False -> Targeted
	const targetKey = settingValue ? "DND4E.EffectsApplyTokensSelected" : "DND4E.EffectsApplyTokensTargeted";

	const localizedTarget = game.i18n.localize(targetKey);
	const baseText = game.i18n.localize("DND4E.EffectsApplyTokens");
	const finalTooltip = baseText.replace("{target}", localizedTarget);

	if(html){
		html.querySelectorAll("*[data-action=\"applyEffect\"]").forEach(el => el.setAttribute("data-tooltip", finalTooltip));
	} else {
		document.querySelectorAll("[data-action=\"applyEffect\"").forEach(el => el.setAttribute("data-tooltip", finalTooltip));
	}
}
