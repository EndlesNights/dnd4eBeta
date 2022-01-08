<template>
<div class="dnd4eAltus-v2-vue flexcol">
TEST
</div>
</template>


<script>
export default {
  props: ['actor', 'owner'],
  data: function () {
    return {
      actorData: {},
      tabs: {
        primary: {
          details: {active: false},
          powers: {active: true},
          inventory: {active: false},
          // effects: {active: false},
          settings: {active: false, icon: 'fa-cogs', hideLabel: true}
        }
      }
    }
  },
  methods: {},
  computed: {},
  watch: {
    // actor: {
    //   deep: true,
    //   handler() {
    //     console.log('Vue Sheet Updated')
    //     // This method abstracts the prepare data call that the actor class
    //     // itself would normally call.
    //     game.dnd4eAltus.ActorHelpersV2.prepareData(this.actor);
    //   }
    // }
  },
  async created() {
    console.log("Creating Sheet");
    for (let [k,v] of Object.entries(window.dnd4eAltusVueMethods.methods)) {
      this[k] = v;
    }
  },
  async mounted() {
    console.log("Sheet Mounted");
  },
};
</script>