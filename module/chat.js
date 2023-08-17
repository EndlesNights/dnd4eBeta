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
		const fumble = d.options.fumble || 1;
		if ( d.total >= critical ) {
			html.find(`.dice-total`)[i].classList.add("critical");
		}
		else if ( d.total <= fumble ){ 
			html.find(`.dice-total`)[i].classList.add("fumble");
		}
		else if ( d.options.target ) {
			if ( roll.total >= d.options.target ){
				html.find(`.dice-total`)[i].classList.add("success");
			} else {
				html.find(`.dice-total`)[i].classList.add("failure");
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

export const displayDamageOptionButtons = function(message, html, data) {
	if ( !message.isRoll || !message.isContentVisible ) return;

	// Highlight rolls where the first part is a d20 roll
	const roll = message.rolls[0];
	if ( !roll.dice.length ) return;
	const d = roll.dice[0];
	const isD20 = (d.faces === 20) && ( d.values.length === 1 );
	if ( !isD20 && !d.options.recharge) return;
	const buttons = html.find(".chatDamageButtons");
	buttons.each((i, button) => {
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
		const message = game.messages.get(li.data("messageId"));
		return message.isRoll && message.isContentVisible && li[0].querySelector('.hit-prediction');
	};
	
	let canApplyDamage = li => {
		const message = game.messages.get(li.data("messageId"));
		return message.isRoll && message.isContentVisible && canvas.tokens.controlled.length;
	};

	options.push(
		{
			name: game.i18n.localize("DND4EBETA.SeleteAllTargets"),
			icon: '<i class="fa-regular fa-users"></i>',
			condition: isAttackRoll,
			callback: li => selectTargetTokens(li, "all")
		},
		{
			name: game.i18n.localize("DND4EBETA.SeleteHitTargets"),
			icon: '<i class="fa-solid fa-users"></i>',
			condition: isAttackRoll,
			callback: li => selectTargetTokens(li, "hit")
		},
		{
			name: game.i18n.localize("DND4EBETA.SeleteMissedTargets"),
			icon: '<i class="fa-light fa-users"></i>',
			condition: isAttackRoll,
			callback: li => selectTargetTokens(li, "miss")
		},

		{
			name: game.i18n.localize("DND4EBETA.ChatContextDamage"),
			icon: '<i class="fas fa-user-minus"></i>',
			condition: canApplyDamage,
			callback: li => applyChatCardDamage(li, 1)
		},
		{
			name: game.i18n.localize("DND4EBETA.ChatContextHealing"),
			icon: '<i class="fas fa-user-plus"></i>',
			condition: canApplyDamage,
			callback: li => applyChatCardDamage(li, -1)
		},
		{
			name: game.i18n.localize("DND4EBETA.ChatContextTempHp"),
			icon: '<i class="fas fa-user-clock fa-fw"></i>',
			condition: canApplyDamage,
			callback: li => applyChatCardTempHp(li)
		},
		{
			name: game.i18n.localize("DND4EBETA.ChatContextDoubleDamage"),
			icon: '<i class="fas fa-user-injured"></i>',
			condition: canApplyDamage,
			callback: li => applyChatCardDamage(li, 2)
		},
		{
			name: game.i18n.localize("DND4EBETA.ChatContextHalfDamage"),
			icon: '<i class="fas fa-user-shield"></i>',
			condition: canApplyDamage,
			callback: li => applyChatCardDamage(li, 0.5)
		},
		{
			name: game.i18n.localize("DND4EBETA.ChatContextTrueDamage"),
			icon: '<i class="fa-light fa-user-shield"></i>',
			condition: canApplyDamage,
			callback: li => applyChatCardDamage(li, 1, true)
		}
	);
	return options;
};

export function chatMessageListener(html) {
	html.on('click', '.chat-damage-button', this.clickRollMessageDamageButtons.bind(this));

	html.on('click', '.target', this.clickTokenActorName.bind(this));
	html.on('mouseenter', '.target', this.hoverTokenActorName.bind(this)).on('mouseleave', '.target', this.hoverTokenActorName.bind(this));
}

//When clicking on the name of a taget in a chat messages from attack rolls, will select and pan to the highlighted token
export const clickTokenActorName = function(event){
		event.preventDefault();

		const tokenID = event.currentTarget.getAttribute('target-id');
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
		const tokenID = event.currentTarget.getAttribute('target-id');
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
		ui.notifications.error(game.i18n.localize("DND4EBETA.NeedTokenSelected"))
	}

	// Extract card data
	const button = event.currentTarget;
	const messageId = button.closest(".message").dataset.messageId;
	const message = game.messages.get(messageId);
	const roll = message.rolls[0];
	const action = button.dataset.action;

	// Apply
	if (action === "Damage") {
		applyChatCardDamageInner(roll, 1, false)
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
 * @param {HTMLElement} li    	The list item clicked
 * @param {string} targetType   Target Type between "hit", "miss", and "all". But I just use else for all soooo what ever
 * @return {Promise}
 */
function selectTargetTokens(li, targetType){
	const message = game.messages.get(li.data("messageId"));

	if(!event.shiftKey){
		canvas.tokens.selectObjects();
	}

	if(targetType === "hit"){
		console.log("hit")
		for(const roll of message.rolls){
			if([game.i18n.localize("DND4EBETA.AttackRollHit"), game.i18n.localize("DND4EBETA.AttackRollHitCrit")].includes(roll.options.multirollData.hitstate)){
				canvas.tokens.get(roll.options.multirollData.targetID).control({releaseOthers: false});
			}
		}
	}
	else if(targetType === "miss"){
		console.log("miss")
		for(const roll of message.rolls){
			if([game.i18n.localize("DND4EBETA.AttackRollMiss"), game.i18n.localize("DND4EBETA.AttackRollMissCrit")].includes(roll.options.multirollData.hitstate)){
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
	const message = game.messages.get(li.data("messageId"));
	const roll = message.rolls[0];
	console.log(message)
	applyChatCardDamageInner(roll, multiplier, trueDamage)
}

function applyChatCardDamageInner(roll, multiplier, trueDamage=false) {
	let damageDealt = [];
	let rollTotalRemain = roll.total;
	let surgeAmount = 0;
	let surgeValueAmount = 0;

	//count surges used, shouldn't be more than 1, but you never know....
	if(multiplier < 0 ){
		roll.terms.forEach(e => {
			if(e.flavor.includes("surgeValue")){
				surgeValueAmount++;
			}
			else if(e.flavor.includes("surge")){
				surgeAmount++;
			}
		});
	}

	if(multiplier < 0 || trueDamage){
		return Promise.all(canvas.tokens.controlled.map(t => {
			const a = t.actor;
			console.log( multiplier < 0 ? `Amount Healed for: ${roll.total}` : `True Damage Dealth: ${roll.total}`)
			return a.applyDamage(roll.total, multiplier, {surgeAmount, surgeValueAmount});
		}));
	}

	//Sort damage and damage type from roll terms into simpler array
	roll.terms.forEach(e => {
		if(typeof e.number === "number"){
			if(e.flavor){
				damageDealt.push([e.total,e.flavor]);
				rollTotalRemain -= e.total;
			}
		}
	});

	//evenly split up the untyped damage into typed damage
	if(rollTotalRemain){
		const length = damageDealt.length;
		if(length === 0){
			damageDealt.push([rollTotalRemain, 'damage'])
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
	const message = game.messages.get(li.data("messageId"));
	const roll = message.rolls[0];
	applyChatCardTempHpInner(roll);
}

function applyChatCardTempHpInner(roll){
	return Promise.all(canvas.tokens.controlled.map(t => {
		const a = t.actor;
		return a.applyTempHpChange(roll.total)
	}));
}

export function _onDiceRollClick(wrapper, event){
	//stop roll from opening up when clicking the .target 
	if(event.target.classList.contains("target") || (event.target.tagName.toLowerCase() === 'b' && event.target.parentElement.classList.contains("target"))){
		return;
	}

	return wrapper(event);
}

  /* -------------------------------------------- */

  /**
   * Process messages which are posted using a dice-roll command
   * @param {string} command          The chat command type
   * @param {RegExpMatchArray[]} matches Multi-line matched roll expressions
   * @param {Object} chatData         The initial chat data
   * @param {Object} createOptions    Options used to create the message
   * @private
   * 
   *  Overrides the core class allowing custom 4e system helper functions to be used
   */

export async function _processDiceCommand(wrapper, ...args){
	let [command, matches, chatData, createOptions] = args;

	const actor = ChatMessage.getSpeakerActor(chatData.speaker) || game.user.character;
	const rollData = actor ? actor.getRollData() : {};
	const rolls = [];
	for ( const match of matches ) {
		if ( !match ) continue;
		const [formula, flavor] = match.slice(2, 4);
		if ( flavor && !chatData.flavor ) chatData.flavor = flavor;
		// const roll = Roll.create(formula, rollData);
		const roll = Roll.create(actor? game.helper.commonReplace(formula,actor) : formula, rollData);
		await roll.evaluate({async: true});
		rolls.push(roll);
	}
	chatData.type = CONST.CHAT_MESSAGE_TYPES.ROLL;
	chatData.rolls = rolls;
	chatData.sound = CONFIG.sounds.dice;
	chatData.content = rolls.reduce((t, r) => t + r.total, 0);
	createOptions.rollMode = command;
}