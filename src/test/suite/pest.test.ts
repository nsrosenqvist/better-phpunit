import * as assert from 'assert';
import { beforeEach, afterEach, before, after } from 'mocha';
import * as path from 'path';
import * as fs from 'fs';

const vscode = require('vscode');
const extension = require('../../../src/extension');

const waitToAssertInSeconds = 5;

// This is a little helper function to promisify setTimeout, so we can "await" setTimeout.
function timeout(seconds: any, callback: any) {
    return new Promise(resolve => {
        setTimeout(() => {
            callback();
            resolve('');
        }, seconds * waitToAssertInSeconds);
    });
}

suite("Better PHPUnit Test Suite", function () {
    before(async () => {
        fs.renameSync(path.join(path.join(vscode.workspace.rootPath, 'composer.json')), path.join(path.join(vscode.workspace.rootPath, 'composer.json.phpunit')));
        fs.renameSync(path.join(path.join(vscode.workspace.rootPath, 'sub-directory', 'composer.json')), path.join(path.join(vscode.workspace.rootPath, 'sub-directory', 'composer.json.phpunit')));

        fs.renameSync(path.join(path.join(vscode.workspace.rootPath, 'composer.json.pest')), path.join(path.join(vscode.workspace.rootPath, 'composer.json')));
        fs.renameSync(path.join(path.join(vscode.workspace.rootPath, 'sub-directory', 'composer.json.pest')), path.join(path.join(vscode.workspace.rootPath, 'sub-directory', 'composer.json')));
    });

    beforeEach(async () => {
        // Reset the test/project-stub/.vscode/settings.json settings for each test.
        // This allows us to test config options in tests and not harm other tests.
        await vscode.workspace.getConfiguration('better-phpunit').update('commandSuffix', null);
        await vscode.workspace.getConfiguration('better-phpunit').update('phpunitBinary', null);
        await vscode.workspace.getConfiguration('better-phpunit').update('pestBinary', null);
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.enable", false);
        await vscode.workspace.getConfiguration("better-phpunit").update("xmlConfigFilepath", null);
        await vscode.workspace.getConfiguration("better-phpunit").update("suiteSuffix", null);
        await vscode.workspace.getConfiguration("better-phpunit").update("docker.enable", false);
    });

    after(async () => {
        fs.renameSync(path.join(path.join(vscode.workspace.rootPath, 'composer.json')), path.join(path.join(vscode.workspace.rootPath, 'composer.json.pest')));
        fs.renameSync(path.join(path.join(vscode.workspace.rootPath, 'sub-directory', 'composer.json')), path.join(path.join(vscode.workspace.rootPath, 'sub-directory', 'composer.json.pest')));

        fs.renameSync(path.join(path.join(vscode.workspace.rootPath, 'composer.json.phpunit')), path.join(path.join(vscode.workspace.rootPath, 'composer.json')));
        fs.renameSync(path.join(path.join(vscode.workspace.rootPath, 'sub-directory', 'composer.json.phpunit')), path.join(path.join(vscode.workspace.rootPath, 'sub-directory', 'composer.json')));
    });

    afterEach(async () => {
        // Reset the test/project-stub/.vscode/settings.json settings for each test.
        // This allows us to test config options in tests and not harm other tests.
        await vscode.workspace.getConfiguration('better-phpunit').update('commandSuffix', null);
        await vscode.workspace.getConfiguration('better-phpunit').update('phpunitBinary', null);
        await vscode.workspace.getConfiguration('better-phpunit').update('pestBinary', null);
        await vscode.workspace.getConfiguration("better-phpunit").update("ssh.enable", false);
        await vscode.workspace.getConfiguration("better-phpunit").update("xmlConfigFilepath", null);
        await vscode.workspace.getConfiguration("better-phpunit").update("suiteSuffix", null);
        await vscode.workspace.getConfiguration("better-phpunit").update("docker.enable", false);
    });

    test("Run file outside of method", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SamplePestTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(0, 0, 0, 0) });
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(extension.getGlobalCommandInstance().method, undefined);
        });
    });

    test("Run file", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SamplePestTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run-file');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().output,
                path.join(vscode.workspace.rootPath, '/vendor/bin/pest') + ' ' + path.join(vscode.workspace.rootPath, '/tests/SamplePestTest.php')
            );
        });
    });

    test("Run from within first method", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SamplePestTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(3, 0, 3, 0) });
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().method,
                "'first'"
            );
        });
    });

    test("Run from within second method", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SamplePestTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().method,
                "'second'"
            );
        });
    });

    test("Detect filename", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SamplePestTest.php'));
        await vscode.window.showTextDocument(document);
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().file,
                path.join(vscode.workspace.rootPath, '/tests/SamplePestTest.php')
            );
        });
    });

    test("Detect filename with a space", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'File With Spaces Test.php'));
        await vscode.window.showTextDocument(document);
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().file.replace(/\\/g, 'XX'),
                path.join(vscode.workspace.rootPath, '/tests/FileXX WithXX SpacesXX Test.php')
            );
        });
    });

    test("Detect executable", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SamplePestTest.php'));
        await vscode.window.showTextDocument(document);
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().binary,
                path.join(vscode.workspace.rootPath, '/vendor/bin/pest')
            );
        });
    });

    test("Fallback to default executable if composer.json not detected", async () => {
        fs.renameSync(path.join(path.join(vscode.workspace.rootPath, 'composer.json')), path.join(path.join(vscode.workspace.rootPath, 'composer.json.pest')));

        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SamplePestTest.php'));
        await vscode.window.showTextDocument(document);
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().binary,
                path.join(vscode.workspace.rootPath, '/vendor/bin/phpunit')
            );
        });

        fs.renameSync(path.join(path.join(vscode.workspace.rootPath, 'composer.json.pest')), path.join(path.join(vscode.workspace.rootPath, 'composer.json')));
    });

    test("Detect executable in sub-directory", async () => {
        fs.renameSync(path.join(path.join(vscode.workspace.rootPath, 'composer.json')), path.join(path.join(vscode.workspace.rootPath, 'composer.json.pest')));
        fs.renameSync(path.join(path.join(vscode.workspace.rootPath, 'composer.json.phpunit')), path.join(path.join(vscode.workspace.rootPath, 'composer.json')));

        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'sub-directory', 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document);
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().binary,
                path.join(vscode.workspace.rootPath, '/sub-directory/vendor/bin/pest')
            );
        });

        fs.renameSync(path.join(path.join(vscode.workspace.rootPath, 'composer.json')), path.join(path.join(vscode.workspace.rootPath, 'composer.json.phpunit')));
        fs.renameSync(path.join(path.join(vscode.workspace.rootPath, 'composer.json.pest')), path.join(path.join(vscode.workspace.rootPath, 'composer.json')));
    });

    test("Detect configuration in sub-directory", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'sub-directory', 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document);
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().configuration,
                ` --configuration ${path.join(vscode.workspace.rootPath, '/sub-directory/phpunit.xml')}`
            );
        });
    });

    test("Uses configuration found in path supplied in settings", async () => {
        await vscode.workspace.getConfiguration('better-phpunit').update('xmlConfigFilepath', '/var/log/phpunit.xml');
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'sub-directory', 'tests', 'SampleTest.php'));
        await vscode.window.showTextDocument(document);
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().configuration,
                ` --configuration /var/log/phpunit.xml`
            );
        });
    });

    test("Check full command", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SamplePestTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().output,
                path.join(vscode.workspace.rootPath, '/vendor/bin/pest ') + path.join(vscode.workspace.rootPath, '/tests/SamplePestTest.php') + " --filter 'second'"
            );
        });
    });

    test("Run previous", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'OtherTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(12, 0, 12, 0) });
        await vscode.commands.executeCommand('better-phpunit.run-previous');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().output,
                path.join(vscode.workspace.rootPath, '/vendor/bin/pest ') + path.join(vscode.workspace.rootPath, '/tests/SamplePestTest.php') + " --filter 'second'"
            );
        });
    });

    test("Run entire suite", async () => {
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SamplePestTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run-suite')

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().output,
                path.join(vscode.workspace.rootPath, '/vendor/bin/pest')
            );
        });
    });

    test("Run entire suite with specified options", async () => {
        await vscode.workspace.getConfiguration('better-phpunit').update('suiteSuffix', '--testsuite unit --coverage');
        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SamplePestTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run-suite');

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().output,
                path.join(vscode.workspace.rootPath, '/vendor/bin/pest') + ' --testsuite unit --coverage'
            );
        });
    });

    test("Run with commandSuffix config", async () => {
        await vscode.workspace.getConfiguration('better-phpunit').update('commandSuffix', '--foo=bar');

        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SamplePestTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run-suite')

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().output,
                path.join(vscode.workspace.rootPath, '/vendor/bin/pest') + ' --foo=bar'
            );
        });
    });

    test("Run with pestBinary config", async () => {
        await vscode.workspace.getConfiguration('better-phpunit').update('pestBinary', 'vendor/foo/bar');

        let document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'tests', 'SamplePestTest.php'));
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(7, 0, 7, 0) });
        await vscode.commands.executeCommand('better-phpunit.run-suite')

        await timeout(waitToAssertInSeconds, () => {
            assert.equal(
                extension.getGlobalCommandInstance().output,
                "vendor/foo/bar"
            );
        });
    });
});
