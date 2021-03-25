class dnd4eBetaUpdateHandler {
  // Call hooks in the constructor.
  constructor() {
    Hooks.once('init', this.init.bind(this));
    Hooks.once('ready', this.runUpdates.bind(this));
  }

  // Register a hidden setting that we can use to track the version. In this
  // case, the version starts at 1000 and increases by 1 on each update. The
  // first number of the version should match the current major version of the
  // system/module to make it more clear which version the update is for.
  init() {
    game.settings.register('dnd4eBeta', 'schemaVersion', {
      name: 'Current schema version for system updates.',
      hint: 'This schema version is separate from the system version and can be used to run sequential updates.',
      scope: 'world',
      config: false,
      default: 1000,
      type: Number,
    });
  }

  /**
   * Update runner.
   *
   * This method is called once in the ready hook and it gets the current
   * schema version and attempts to run the next one, if it exists.
   */
  async runUpdates() {
    if (game.user.isGM) {
      console.log('Running updates');
      // Retrieve the schema version.
      this.schema = game.settings.get('dnd4eBeta', 'schemaVersion');
      var runUpdates = true;
      var currentUpdate;

      // Re-run for as many updates there are currently.
      while (runUpdates) {
        // Increase the version to fire updates for the next update.
        this.schema++;
        currentUpdate = `update${this.schema}`;

        // If the method exists, we need to run it.
        if (typeof this[currentUpdate] === 'function') {
          // Run the update and wait for its result.
          // eslint-disable-next-line no-console
          console.log(`Performing dnd4eBeta update ${currentUpdate}`);
          let result = await this[currentUpdate]();

          // If the result was anything other than false, bump update the schema
          // version setting with the number we just ran the update for.
          if (result !== false) {
            // eslint-disable-next-line no-console
            console.log(`Completed dnd4eBeta update ${currentUpdate}`);
            game.settings.set('dnd4eBeta', 'schemaVersion', this.schema);
          }
          // Otherwise, note the failure and break from the loop.
          else {
            // eslint-disable-next-line no-console
            console.log(`Unable to complete update ${currentUpdate}`);
            runUpdates = false;
          }
        }
        // Otherwise, break from the loop.
        else {
          runUpdates = false;
        }
      }
    }
  }

  /**
   * Update untyped characters.
   *
   * In this example, we're looping through untyped characters and compendium
   * entries and making sure they have a type.
   */
  async update1001() {
    // This is just an example of how to update actor data that was resolved
    // in a previous version of the system, so let's exit early.
    return true;

    var dnd4eBetaType;
    // Example array of actors to convert into characters.
    let namesArray = [
      'Dumathoin',
      'Hussanma',
      'Respen',
      'Seidhr',
      'Vaghn'
    ];
    // Update active entities.
    for (let a of game.actors.entities) {
      if (!a.data.type) {
        if (namesArray.includes(a.name)) {
          dnd4eBetaType = 'character';
        }
        else {
          dnd4eBetaType = 'npc';
        }
        console.log(`Updating ${a.name} to ${dnd4eBetaType}`);
        await a.update({ "type": dnd4eBetaType });
      }
      else {
        // Some new schema types aren't automatically converted.
        if (a.data.type === 'npc') {
          let update = false;
          if (!a.data.data.details.resistance || !a.data.data.details.resistance.label) {
            await a.update({ 'data.details.resistance.type': 'String' });
            await a.update({ 'data.details.resistance.label': 'Resistance' });
            update = true;
          }

          if (!a.data.data.details.vulnerability || !a.data.data.details.vulnerability.label) {
            update = true;
            await a.update({ 'data.details.vulnerability.type': 'String' });
            await a.update({ 'data.details.vulnerability.label': 'Vulnerability' });
          }

          if (update) {
            console.log(`Updating NPC labels for ${a.name}`);
          }
        }
      }
    }

    // Update compendium entities.
    for (let c of game.packs) {
      if (c.metadata.entity && c.metadata.entity == 'Actor') {
        let entities = await c.getContent();
        for (let a of entities) {
          if (!a.data.type) {
            if (namesArray.includes(a.name)) {
              dnd4eBetaType = 'character';
            }
            else {
              dnd4eBetaType = 'npc';
            }
            a.data.type = dnd4eBetaType;

            console.log(`Updating [compendium] ${a.name} to ${dnd4eBetaType}`);
            await c.updateEntity(a.data);
          }
        }
      }
    }
  }

  /**
   * Update items on actors to have missing object keys.
   *
   * New keys have been added to actor items as of 1.0.6, so this update hook
   * ensures that all active actors have updated items.
   */
  async update1002() {
    // Define merge options.
    // let insertKeys, insertValues, overwrite, inplace;
    // var mergeOptions = {insertKeys=true, insertValues=false, overwrite=false, inplace=false}={};
    // // Update active entities.
    // for (let a of game.actors.entities) {
    //   if (a.data.type == 'character') {
    //     // Update each item with the new model.
    //     let items = [];
    //     items = duplicate(a.data.items);
    //     for (let i = 0; i < items.length; i++) {
    //       if (items[i].type == 'power') {
    //         // Duplicate the item and update it with the template structure.
    //         let item = items[i].data;
    //         let powerTemplate = duplicate(game.system.template.item.power);
    //         items[i].data = mergeObject(powerTemplate, item, mergeOptions);
    //       }
    //     }
    //     // Update the actor entity.
    //     console.log(`Updated items for ${a.name}`)
    //     await a.update({items: items});
    //   }
    // }
  }
}

// Instantiate the class and run updates.
new dnd4eBetaUpdateHandler();
