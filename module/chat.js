import {MultiAttackRoll} from "./roll/multi-attack-roll.js";

/**
 * Highlight critical success or failure on d20 rolls, or recharge rolls
 */
export const highlightCriticalSuccessFailure = function(message, html, data) {
	if ( !message.isRoll || !message.isContentVisible ) return;

	// Highlight rolls where the first part is a d20 roll
	const roll = message.roll;
	if ( !roll.dice.length ) return;
	const d = roll.dice[0];
	// Has its own check
	if(roll instanceof MultiAttackRoll){ return; }

	// Ensure it is an un-modified d20 roll, or is part of a recharge roll
	const isD20 = (d.faces === 20) && ( d.values.length === 1 );
	if ( !isD20 && !d.options.recharge) return;
	const isModifiedRoll = ("success" in d.results[0]) || d.options.marginSuccess || d.options.marginFailure;
	if ( isModifiedRoll ) return;

	// Highlight successes and failures
	const critical = d.options.critical || 20;
	const fumble = d.options.fumble || 1;
	if ( d.total >= critical ) html.find(".dice-total").addClass("critical");
	else if ( d.total <= fumble ) html.find(".dice-total").addClass("fumble");
	else if ( d.options.target ) {
		if ( roll.total >= d.options.target ) html.find(".dice-total").addClass("success");
		else html.find(".dice-total").addClass("failure");
	}
};

/* -------------------------------------------- */

/**
 * Optionally hide the display of chat card action buttons which cannot be performed by the user
 */
export const displayChatActionButtons = function(message, html, data) {
	const chatCard = html.find(".DND4EBETA.chat-card");
	if ( chatCard.length > 0 ) {
		const flavor = html.find(".flavor-text");
		if ( flavor.text() === html.find(".item-name").text() ) flavor.remove();

		// If the user is the message author or the actor owner, proceed
		let actor = game.actors.get(data.message.speaker.actor);
		if ( actor && actor.owner ) return;
		else if ( game.user.isGM || (data.author.id === game.user.id)) return;

		// Otherwise conceal action buttons except for saving throw
		const buttons = chatCard.find("button[data-action]");
		buttons.each((i, btn) => {
			if ( btn.dataset.action === "save" ) return;
			btn.style.display = "none"
		});
	}
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
	let canApply = li => {
		const message = game.messages.get(li.data("messageId"));
		return message.isRoll && message.isContentVisible && canvas.tokens.controlled.length;
	};
	options.push(
		{
			name: game.i18n.localize("DND4EBETA.ChatContextDamage"),
			icon: '<i class="fas fa-user-minus"></i>',
			condition: canApply,
			callback: li => applyChatCardDamage(li, 1)
		},
		{
			name: game.i18n.localize("DND4EBETA.ChatContextHealing"),
			icon: '<i class="fas fa-user-plus"></i>',
			condition: canApply,
			callback: li => applyChatCardDamage(li, -1)
		},
		{
			name: game.i18n.localize("DND4EBETA.ChatContextTempHp"),
			icon: '<i class="fas fa-user-plus"></i>',
			condition: canApply,
			callback: li => applyChatCardTempHp(li)
		},
		{
			name: game.i18n.localize("DND4EBETA.ChatContextDoubleDamage"),
			icon: '<i class="fas fa-user-injured"></i>',
			condition: canApply,
			callback: li => applyChatCardDamage(li, 2)
		},
		{
			name: game.i18n.localize("DND4EBETA.ChatContextHalfDamage"),
			icon: '<i class="fas fa-user-shield"></i>',
			condition: canApply,
			callback: li => applyChatCardDamage(li, 0.5)
		},
		{
			name: game.i18n.localize("DND4EBETA.ChatContextTrueDamage"),
			icon: '<i class="fas fa-user-shield"></i>',
			condition: canApply,
			callback: li => applyChatCardDamage(li, 1, true)
		}
	);
	return options;
};

/* -------------------------------------------- */

/**
 * Apply rolled dice damage to the token or tokens which are currently controlled.
 * This allows for damage to be scaled by a multiplier to account for healing, critical hits, or resistance
 *
 * @param {HTMLElement} roll    The chat entry which contains the roll data
 * @param {Number} multiplier   A damage multiplier to apply to the rolled damage.
 * @return {Promise}
 */
function applyChatCardDamage(li, multiplier, trueDamage=false) {
	const message = game.messages.get(li.data("messageId"));
	const roll = message.roll;

	console.log(roll.terms)
	let damage = {};

	if(!trueDamage){
		roll.terms.forEach(e => {
			if(e.number){
				let damageTypesArray = e.flavor.replace(/ /g,'').split(',');
				let total = e.total;
				let divider = damageTypesArray.length;
	
				damageTypesArray.forEach(f => {
					let val = Math.ceil(total / divider)
	
					if(damage[f]){
						damage[f] += val;
					} else {
						damage[f] = val;
					}
	
					total -= val;
					divider --;
				});
			}
		});	
	}


	console.log(damage)
	return Promise.all(canvas.tokens.controlled.map(t => {
		const a = t.actor;
		if(multiplier < 0 || trueDamage){ //if it's healing or true damage just heal directly
			console.log( multiplier < 0 ? `Amount Healed for: ${roll.total}` : `True Damage Dealth: ${roll.total}`)
			return a.applyDamage(roll.total, multiplier);
		} else {
			return a.calcDamage(damage, multiplier);
		}
		
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
	const message = game.messages.get(li.data("messageId"));
	const roll = message.roll;
	return Promise.all(canvas.tokens.controlled.map(t => {
		const a = t.actor;
		return a.applyTempHpChange(roll.total)
	}));
}

// decimal total = 143.13m;
// int divider = 5;
// while (divider > 0) {
//   decimal amount = Math.Round(total / divider, 2);
//   Console.WriteLine(amount);
//   total -= amount;
//   divider--;
// }

/* -------------------------------------------- */
