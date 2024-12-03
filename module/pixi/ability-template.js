import { DND4E } from "../config.js";

/**
 * A helper class for building MeasuredTemplates for 4e spells and abilities
 * @extends {MeasuredTemplate}
 */
export class MeasuredTemplate4e extends MeasuredTemplate {

	static getDistanceCalc(item){

		//use toString() as some older powers formats may still be numerical
		let area = item.system.area?.toString();
		if(!area) return null;
		try{
			area = game.helper.commonReplace(area, item.actor);
			area = Roll.replaceFormulaData(area, item.actor.getRollData(), {missing: 0, warn: true});
			let r = new Roll(area);
			r.evaluateSync();
			return r.total;
		} catch (e) {
			console.error("Problem preparing Area size for ", item.name, e);
			return null;
		}

	}
	/**
	 * A factory method to create an AbilityTemplate instance using provided data from an Item4e instance
	 * @param {Item4e} item                             The Item object for which to construct the template
	 * @return {MeasuredTemplate4e|null}         The template object, or null if the item does not produce a template
	 */
	static fromItem(item) {
		const templateShape = DND4E.areaTargetTypes[item.system.rangeType];
	
		console.log(item);
		let distance = this.getDistanceCalc(item);

		let flags = {dnd4e:{templateType:templateShape, item}};

		if(item.system.rangeType === "closeBlast" || item.system.rangeType === "rangeBlast") {
			distance *= Math.sqrt(2);
		}
		else if(item.system.rangeType === "rangeBurst") {
			flags.dnd4e.templateType = "burst";
			distance += 0.5;
		}
		else if(item.system.rangeType === "closeBurst") {
			flags.dnd4e.templateType = "burst";
			switch(item.parent.system.details.size) {
				case 'tiny':
				case 'sm':
				case 'med':
					flags.dnd4e.closeBurst = 'med';
					distance += 0.5;
					break;
				case 'lg':
					flags.dnd4e.closeBurst = 'lg';
					distance += 1;
					break;
				case  'huge':
					flags.dnd4e.closeBurst = 'huge';
					distance += 1.5;
					break;
				case 'grg':
					flags.dnd4e.closeBurst = 'grg';
					distance += 2;
					break;
				default:
					distance = Math.sqrt(2) * ( 1 + 2*distance);
			}
		}
		// if(item.system.rangeType === "closeBurst" || item.system.rangeType === "rangeBurst") distance = Math.sqrt(2) * ( 1 + 2*distance);
	
		if ( !templateShape ) return null;

		// Prepare template data
		const templateData = {
			t: templateShape,
			user: game.user.id,
			distance: distance,
			direction: 0,
			x: 0,
			y: 0,
			fillColor: game.user.color,
			flags: flags
		};

		// Additional type-specific data
		switch ( templateShape ) {
			case "cone": // 4e cone RAW should be 53.13 degrees
				templateData.angle = 53.13;
				break;
			case "rect": // 4e rectangular AoEs are always cubes
				templateData.direction = 45;
				break;
			case "ray": // 4e rays are most commonly 1 square (5 ft) in width
				templateData.width = canvas.dimensions.distance;
				break;
			default:
				break;
		}

		// Return the template constructed from the item data
		const cls = CONFIG.MeasuredTemplate.documentClass;
		const template = new cls(templateData, {parent: canvas.scene});
		const object = new this(template);
		object.item = item;
		object.actorSheet = item.actor?.sheet || null;
		return object;
	}

	/* -------------------------------------------- */

	/**
	 * Creates a preview of the spell template
	 */
	drawPreview() {
		console.log("DrawPreveiw")
		const initialLayer = canvas.activeLayer;
		this.draw();
		this.layer.activate();
		this.layer.preview.addChild(this);

		// Hide the sheet that originated the preview
		this.actorSheet?.minimize();

		this.activatePreviewListeners(initialLayer);
	}

	/* -------------------------------------------- */

	/**
	 * Activate listeners for the template preview
	 * @param {CanvasLayer} initialLayer    The initially active CanvasLayer to re-activate after the workflow is complete
	 */
	 activatePreviewListeners(initialLayer) {
		const handlers = {};
		let moveTime = 0;

		// Update placement (mouse-move)
		handlers.mm = event => {
			event.stopPropagation();
			let now = Date.now(); // Apply a 20ms throttle
			if ( now - moveTime <= 20 ) return;
			const center = event.data.getLocalPosition(this.layer);
			const snapped = canvas.grid.getSnappedPosition(center.x, center.y, 2);
			this.document.updateSource({x: snapped.x, y: snapped.y});
			this.refresh();
			moveTime = now;
		};

		// Cancel the workflow (right-click)
		handlers.rc = event => {
			this.layer._onDragLeftCancel(event);
			canvas.stage.off("mousemove", handlers.mm);
			canvas.stage.off("mousedown", handlers.lc);
			canvas.app.view.oncontextmenu = null;
			canvas.app.view.onwheel = null;
			initialLayer.activate();
			this.actorSheet?.maximize();
		};

		// Confirm the workflow (left-click)
		handlers.lc = event => {
			handlers.rc(event);
			const destination = canvas.grid.getSnappedPosition(this.document.x, this.document.y, 2);
			this.document.updateSource(destination);
			canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [this.document.toObject()]);
		};

		// Rotate the template by 3 degree increments (mouse-wheel)
		handlers.mw = event => {
			if ( event.ctrlKey ) event.preventDefault(); // Avoid zooming the browser window
			event.stopPropagation();
			let delta = canvas.grid.type > CONST.GRID_TYPES.SQUARE ? 30 : 15;
			let snap = event.shiftKey ? delta : 5;
			this.document.updateSource({direction: this.document.direction + (snap * Math.sign(event.deltaY))});
			this.refresh();
		};

		// Activate listeners
		canvas.stage.on("mousemove", handlers.mm);
		canvas.stage.on("mousedown", handlers.lc);
		canvas.app.view.oncontextmenu = handlers.rc;
		canvas.app.view.onwheel = handlers.mw;
	}

	/* -------------------------------------------- */
	
	/**
	 * Wrapped computeShape as MeasuredTemplate.#getCircleShape is now private,
	 * Overrides the method to allow for 4e Burst shapes allowing drawing square template from the center.
	 * @param {wrapper} wrapper    refrence to the original core method
	 */
	static _computeShape(wrapper){

		if(this.document.flags.dnd4e?.templateType === "burst"
		|| (this.document.t === "circle" && ui.controls.activeControl === "measure" && ui.controls.activeTool === "burst" && !this.document.flags.dnd4e?.templateType)) {
			
			const {t, distance, direction, angle, width} = this.document;
			return new PIXI.Polygon(canvas.grid.getCircle({x: 0, y: 0}, distance));

		}
		else if (this.document.flags.dnd4e?.templateType === "blast"
			|| (this.document.t === "circle" && ui.controls.activeControl === "measure" && ui.controls.activeTool === "blast" && !this.document.flags.dnd4e?.templateType)) {
			const {t, distance, direction, angle, width} = this.document;

			return new PIXI.Polygon(canvas.grid.getCone({x: 0, y: 0}, distance, direction, angle));
		}
		
		return wrapper();
	}
	
	/* -------------------------------------------- */

	/**
	 * Update the displayed ruler tooltip text
	 * @protected
	 */
	static _refreshRulerText(wrapper){
		if( (this.document.flags.dnd4e?.templateType === "burst"  && this.document.t === "circle")
			|| (this.document.t === "circle" && ui.controls.activeControl === "measure" && ui.controls.activeTool === "burst" && !this.document.flags.dnd4e?.templateType)) {
				let d;
				let text;
	
				if(this.document.flags.dnd4e?.closeBurst){
					switch(this.document.flags.dnd4e?.closeBurst){
						case 'lg':
							d = Math.max(Math.round((this.document.distance -1.0 )* 10) / 10, 0);
							text = `${game.i18n.localize('DND4E.rangeCloseBurst')} ${d} \n(${DND4E.actorSizes[this.document.flags.dnd4e.closeBurst].label})`;
							break;
						case 'huge':
							d = Math.max(Math.round((this.document.distance -1.5 )* 10) / 10, 0);
							text = `${game.i18n.localize('DND4E.rangeCloseBurst')} ${d} \n(${DND4E.actorSizes[this.document.flags.dnd4e.closeBurst].label})`;
							break;
						case 'grg':
							d = Math.max(Math.round((this.document.distance -2.0 )* 10) / 10, 0);
							text = `${game.i18n.localize('DND4E.rangeCloseBurst')} ${d} \n(${DND4E.actorSizes[this.document.flags.dnd4e.closeBurst].label})`;
							break;
						default:
							d = Math.max(Math.round((this.document.distance -0.5 )* 10) / 10, 0);
							text = `${game.i18n.localize('DND4E.rangeCloseBurst')} ${d}`;
					}
				} else {
					d = Math.max(Math.round((this.document.distance -0.5 )* 10) / 10, 0);
					text = `Burst ${d}`;
				}

				this.ruler.text = text;
				this.ruler.position.set(this.ray.dx + 10, this.ray.dy + 5);
		} else {
			return wrapper();
		}
	}

	  /**
   * Refresh the underlying geometric shape of the MeasuredTemplate.
   * @protected
   */
	static _refreshShape(wrapper) {
		
		if(!this.document.getFlag("dnd4e", "templateType")){
			return wrapper();
		}

		// anchors the point along the edge of the burst/blast
		let {x, y, direction, distance} = this.document;
		this.ray = new Ray({x, y}, canvas.grid.getTranslatedPoint({x, y}, direction, distance));
		this.shape = this._computeShape();
	}
}

export class TemplateLayer4e extends TemplateLayer {

	/** @inheritdoc */
	static _onDragLeftStart(wrapper, event){
		const tool = game.activeTool;

		//unsett this flag, as it is used only for the system spesfic custom messure templates _onDragLeftMove
		if(event.dnd4e){
			event.dnd4e.templateType = null;
		}

		if(!(tool == "blast" || tool == "burst")){
			return wrapper(event);
		}

		const interaction = event.interactionData;

		// Snap the origin to the grid
		if ( !event.shiftKey ) interaction.origin = this.getSnappedPoint(interaction.origin);

		console.log(event)
		console.log(interaction)
		const previewData = {
			user: game.user.id,
			t: tool == 'burst' ? 'circle' : 'cone',
			angle: tool == 'burst' ? 0 : 90, //blast will be a 90 degree angle cone
			x: interaction.origin.x,
			y: interaction.origin.y,
			sort: Math.max(this.getMaxSort() + 1, 0),
			distance: 1,
			direction: 0,
			fillColor: game.user.color || "#FF0000",
			hidden: event.altKey,

			flags: {dnd4e:{templateType: tool}}
		};
		
		//set event flag for other meths to see custom hackery
		if(event.dnd4e){
			event.dnd4e.templateType = tool
		} else {
			event.dnd4e = {templateType: tool}
		}
		
		const cls = getDocumentClass("MeasuredTemplate");
		const doc = new cls(previewData, {parent: canvas.scene});
	
		// Create a preview MeasuredTemplate object
		const template = new this.constructor.placeableClass(doc);
		interaction.preview = this.preview.addChild(template);
		return template.draw();
	}

	/** @inheritdoc */
	static _onDragLeftMove(wrapper, event) {
		//!event.target.documentCollection[0]?.value.flags.dnd4e.templateType
		if(!event.dnd4e?.templateType){
			return wrapper(event);
		}

		const interaction = event.interactionData;

		// Snap the destination to the grid
		if ( !event.shiftKey ) interaction.destination = this.getSnappedPoint(interaction.destination);
	
		// Compute the ray
		const {origin, destination, preview} = interaction;
		const ray = new Ray(origin, destination);
		let distance;
		distance = canvas.grid.measurePath([origin, destination]).distance;

		// Update the preview object
		preview.document.direction = Math.normalizeDegrees(Math.toDegrees(ray.angle));
		preview.document.distance = distance;
		preview.renderFlags.set({refreshShape: true});
	}
}
