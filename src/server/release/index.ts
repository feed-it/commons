import { execSync as exec } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { exit } from 'process';
import yaml from 'js-yaml';
import { checkbox, select } from '@inquirer/prompts';
import * as path from 'path';
import { Chalk } from 'chalk';

const chalk = new Chalk({
	level: 1,
});

export type ReleaseScriptParams = {
	/**
	 * App name, used in logs
	 * @default App
	 */
	appName?: string;
	/**
	 * Docker image name, including the repository. e.g., feedit/test.
	 */
	dockerImage: string;
	/**
	 * Kubernetes YAML config filename.
	 *
	 * **Need to be located in `release` folder at the root level of the project**
	 */
	yamlFilename: string;
	/**
	 * The SSH server alias name where the Kubernetes YAML file will be sent.
	 */
	serverName: string;
	/**
	 * @default true
	 */
	haveBeta?: boolean;
};

export class ReleaseScript {
	private readonly appName: string = 'App';
	private readonly dockerImage: string = '';
	private readonly yamlFilename: string = '';
	private readonly serverName: string = '';
	private readonly haveBeta: boolean = true;

	constructor(params: ReleaseScriptParams) {
		this.dockerImage = params.dockerImage;
		this.serverName = params.serverName;
		this.yamlFilename = path.parse(params.yamlFilename).name;

		if (params.appName) this.appName = params.appName;
		if (params.haveBeta) this.haveBeta = params.haveBeta;
	}

	/**
	 * Test parameters provided in constructor call
	 */
	private beforeStart() {
		console.info(chalk.blue.bold('1. Testing given parameters before releasing app'));

		// Test serverName
		console.info(chalk.blue('1.a. Testing ssh connexion...'));
		try {
			exec(`ssh -T ${this.serverName}`);
		} catch (error) {
			console.error(chalk.red(`Failed to connect to ${this.serverName}`), error);
			exit(1);
		}

		// Test YAML file
		console.info(chalk.blue('1.b. Check if YAML file exists...'));
		const filePath = `${process.cwd()}/release/${this.yamlFilename}.yaml`;
		if (!existsSync(filePath)) {
			console.error(chalk.red(`Unable to find YAML file at: ${filePath}`));
			exit(1);
		}

		console.info(chalk.green('All tests passed!\n'));
	}

	async start() {
		this.beforeStart();

		try {
			const choices = [{ name: 'Production', value: 'prod', checked: true }];

			if (this.haveBeta) {
				choices[0].checked = false;
				choices.splice(0, 0, { name: 'Beta', value: 'beta', checked: true });
			}

			const releases = await checkbox({
				message: 'Which type of release you want to do?',
				choices: choices,
			});

			if (releases.includes('prod')) {
				const typeVersion = await select({
					message: 'For the prod version, which level of version you want to apply?',
					choices: [
						{ name: 'Patch', value: 'patch' },
						{ name: 'Minor', value: 'minor' },
						{ name: 'Major', value: 'major' },
					],
					default: 'patch',
				});

				this.release('prod', typeVersion);
			}

			if (releases.includes('beta')) {
				this.release('beta');
			}
		} catch (error: any) {
			if (error.constructor.name === 'ExitPromptError') return;
			console.error(error);
			exit(1);
		}

		console.info(chalk.green.bold(`${this.appName} successfully updated !`));
		console.info('Make sure to update main/develop now !');
	}

	/**
	 * Make a release, either for the prod or the beta
	 */
	private release(release: 'prod' | 'beta', typeVersion?: string) {
		console.info(chalk.blue.bold(`\nReleasing ${release} ${typeVersion ? `on ${typeVersion}` : ''}\n`));

		// Update the package version if the release is for production
		if (release === 'prod') {
			console.info(chalk.blue('1. Update package version'));
			exec(`npm version --no-git-tag-version ${typeVersion}`, {
				stdio: 'inherit',
			});
		} else {
			console.info(chalk.blue('1. Skipping updating package version'));
		}

		const digest = this.docker(release);
		this.yaml(digest, release);
		this.scp();
		this.git(release);
	}

	/**
	 * Build the image, push it to the Docker Hub repository and return the new image digest.
	 */
	private docker(release: 'prod' | 'beta') {
		console.info(chalk.blue.bold('\n2. Build Docker image and send it to Docker Hub repository'));

		//* 1. Build Docker image.
		console.info(chalk.blue('2.a Build image'));
		exec(`docker build -t ${this.dockerImage}:${release} .`, {
			stdio: 'inherit',
		});

		//* 2. Push Docker image to the Docker Hub repository.
		console.info(chalk.blue('2.b Push image'));
		exec(`docker push ${this.dockerImage}:${release}`, {
			stdio: 'inherit',
		});

		//* 3. Fetch the new Docker image digest.
		console.info(chalk.blue('2.c Fetch docker image digest'));
		const digest = exec(`docker inspect --format="{{index .RepoDigests}}" ${this.dockerImage}:${release}`, {
			encoding: 'utf-8',
		})
			.toString()
			.replace(/(\[|\])/g, '')
			.replace('\n', '')
			.replace(`${this.dockerImage}@`, '');

		if (!digest) {
			console.error(chalk.red('Any Docker image digest found.'));
			exit(1);
		}

		console.info(chalk.green('Docker image successfully built and sent to Docker Hub repository'));
		return digest;
	}

	/**
	 * Update the Kubernetes YAML config file with the new Docker image digest.
	 */
	private yaml(digest: string, release: 'prod' | 'beta') {
		console.info(chalk.blue.bold('\n3. Updating Kubernetes YAML config file'));

		const yamlContent = readFileSync(`${process.cwd()}/release/${this.yamlFilename}.yaml`, 'utf-8');
		const data: any[] = yaml.loadAll(yamlContent);

		let newYamlContent = yamlContent;

		for (let i = 0; i < data.length; i++) {
			if (data[i]?.spec?.template?.spec?.containers[0]?.image.includes(`${this.dockerImage}:${release}`)) {
				const oldImage = data[i].spec.template.spec.containers[0].image;
				const newImage = `${this.dockerImage}:${release}@${digest}`;

				console.info(chalk.red('Old Docker image: '), oldImage);
				console.info(chalk.green('New Docker image: '), newImage);

				newYamlContent = newYamlContent.replace(oldImage, newImage);
				break;
			}
		}

		writeFileSync(`${process.cwd()}/release/${this.yamlFilename}.yaml`, newYamlContent, 'utf-8');

		console.info(chalk.green('Kubernetes YAML config file updated'));
	}

	/**
	 * Send the updated Kubernetes YAML config file to the server.
	 */
	private scp() {
		console.info(chalk.blue.bold('\n4. Send Kubernetes YAML config file to the server'));

		const filePath = `${process.cwd()}/release/${this.yamlFilename}.yaml`;

		exec(`scp -P 91 ${filePath} ${this.serverName}:.kube-yaml/`, {
			stdio: 'inherit',
		});

		console.info(chalk.green(`Kubernetes YAML Config sent to ${this.serverName}`));
	}

	/**
	 * Push the modifications (YAML file and package.json) to Git and add a tag version to this commit.
	 */
	private git(release: 'prod' | 'beta') {
		const { version: packageVersion } = JSON.parse(readFileSync(`${process.cwd()}/package.json`, 'utf-8'));

		console.info(chalk.blue.bold(`5. Commit package${release === 'prod' ? ' and create git tag' : ''}`));

		// Push new package.json version
		let commitMessage = `chore(release): ${packageVersion}`;
		if (release !== 'prod') {
			commitMessage = 'chore(release): updated beta';
		}

		exec(`git add . && git commit -m "${commitMessage}" && git push`, {
			stdio: 'inherit',
		});

		// Add a tag to this new commit
		if (release === 'prod') {
			exec(`git tag ${packageVersion} && git push origin ${packageVersion}`, {
				stdio: 'inherit',
			});
		}

		console.info(chalk.green(`Commit pushed ${release === 'prod' ? 'and git tag created' : ''}`));
	}
}