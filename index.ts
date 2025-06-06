import '@logseq/libs';

/**
 * Main entry point for the plugin.
 */
async function main() {
  // Show a "Hello World" message to the user
  logseq.App.showMsg('Hello World');

  console.log('Logseq Hello World Plugin loaded');
}

// bootstrap
logseq.ready(main).catch(console.error);
