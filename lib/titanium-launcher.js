'use strict';

var which = require('which');

function resolveBinaryPath(command) {
	// Don't run these checks on win32
	if (process.platform === 'win32') {
		return null;
	}

	return which.sync(command, {nothrow: true});
}

function TitaniumLauncher(baseBrowserDecorator, projectManager, loggerFactory, config, args) {
	baseBrowserDecorator(this);

	const platform = args.platform;
	const commandArgs = ['build', '-p', platform];
	const flags = args && args.flags || config && config.flags || [];
	const logger = loggerFactory.create('titanium');

	this.name = 'Titanium Test Runner';

	this._start = url => {
		logger.info('Preparing project for Karma test run execution');

		projectManager.prepareProject({
			platform,
			tempPath: this._tempDir,
			client: {
				url
			}
		}).then(() => {
			logger.info('Project preparation done, starting Karma unit test runner');
			commandArgs.push(
				'-d', projectManager.projectPath,
				'--no-prompt',
				'--no-colors',
				'--no-progress-bars'
			);
			this._execCommand(this._getCommand(), commandArgs.concat(flags));
		}, err => {
			logger.error('Failed to prepare project.\n  %s', err.message);
			logger.trace()
			this._done('failure');
		});
	};
}

const resolvedTitaniumBinaryPath = resolveBinaryPath('titanium');

TitaniumLauncher.prototype = {
	name: 'Titanium',

	DEFAULT_CMD: {
		linux: resolvedTitaniumBinaryPath,
		darwin: resolvedTitaniumBinaryPath,
		win32: resolvedTitaniumBinaryPath
	},
	ENV_CMD: 'APPC_BIN'
}

TitaniumLauncher.$inject = ['baseBrowserDecorator', 'projectManager', 'logger', 'config', 'args'];

module.exports = TitaniumLauncher;