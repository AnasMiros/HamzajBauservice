// eslint-disable-next-line no-undef
const { wpCommand } = require( '@wp-dev/playwright-test-helpers' );

const useLocalConfig = process.argv.includes('--local');

if (useLocalConfig) {
    wpCommand('config set IONOS_ASSISTANT_CONFIG_URL http://localhost/wp-content/plugins/wizard/example-config.json');
    console.log('Using local config. To use default config, run "node set-config.js"');
} else {
    wpCommand('config set IONOS_ASSISTANT_CONFIG_URL foo');
    wpCommand('config delete IONOS_ASSISTANT_CONFIG_URL');
    console.log('Using default config. To use local config, run "node set-config.js --local"');
}

wpCommand('transient delete ionos_assistant_config');
wpCommand('option set ionos_assistant_completed 0')
