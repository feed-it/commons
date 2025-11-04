import { execSync as exec } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { exit } from 'process';
import yaml from 'js-yaml';
import { checkbox, select } from '@inquirer/prompts';
import * as path from 'path';

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

		console.info(`\u001b[32m${this.appName} successfully updated !\u001b[0m`);
		console.info('Make sure to update main/develop now !');
	}

	/**
	 * Test parameters provided in constructor call
	 */
	private beforeStart() {
		console.info('\u001b[34mTesting given parameters before releasing app\u001b[0m');
		// Test serverName
		console.info('\u001b[34m1.Testing ssh connexion...\u001b[0m');
		try {
			exec(`ssh -T ${this.serverName}`);
		} catch (error) {
			console.error(`\u001b[31mFailed to connect to ${this.serverName}\u001b[0m\n`, error);
			exit(1);
		}

		// Test YAML file
		console.info('\u001b[34m2.Check if YAML file exists...\u001b[0m');
		const filePath = path.resolve(process.cwd(), 'release', this.yamlFilename);
		if (!existsSync(filePath)) {
			console.error(`\u001b[31mUnable to find YAML file at: ${filePath}\u001b[0m`);
			exit(1);
		}

		console.info('\u001b[32mAll tests passed!\u001b[0m');
	}

	/**
	 * Make a release, either for the prod or the beta
	 */
	private release(release: 'prod' | 'beta', typeVersion?: string) {
		// Update the package version if the release is for production
		if (release === 'prod') {
			console.info('\u001b[34m1. Update package version\u001b[0m');
			exec(`npm version --no-git-tag-version ${typeVersion}`, {
				stdio: 'inherit',
			});
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
		//* 1. Build Docker image.
		console.info('\u001b[34m3.a Build image...\u001b[0m');
		exec(`docker build -t ${this.dockerImage}:${release} .`, {
			stdio: 'inherit',
		});

		//* 2. Push Docker image to the Docker Hub repository.
		console.info('\u001b[34m3.b Push image...\u001b[0m');
		exec(`docker push ${this.dockerImage}:${release}`, {
			stdio: 'inherit',
		});

		//* 3. Fetch the new Docker image digest.
		const digest = exec(`docker inspect --format="{{index .RepoDigests}}" ${this.dockerImage}:${release}`, {
			encoding: 'utf-8',
		})
			.toString()
			.replace(/(\[|\])/g, '')
			.replace('\n', '')
			.replace(`${this.dockerImage}@`, '');

		if (!digest) {
			throw new Error('Any Docker image digest found.');
		}

		return digest;
	}

	/**
	 * Update the Kubernetes YAML config file with the new Docker image digest.
	 */
	private yaml(digest: string, release: 'prod' | 'beta') {
		const yamlContent = readFileSync(`${process.cwd()}/release/${this.yamlFilename}.yaml`, 'utf-8');
		const data: any[] = yaml.loadAll(yamlContent);

		let newYamlContent = yamlContent;

		for (let i = 0; i < data.length; i++) {
			if (data[i]?.spec?.template?.spec?.containers[0]?.image.includes(`${this.dockerImage}:${release}`)) {
				const oldImage = data[i].spec.template.spec.containers[0].image;
				const newImage = `${this.dockerImage}:${release}@${digest}`;

				console.info('\x1b[31m%s\x1b[0m', 'Old Docker image:', oldImage);
				console.info('\x1b[32m%s\x1b[0m', 'New Docker image:', newImage);

				newYamlContent = newYamlContent.replace(oldImage, newImage);
				break;
			}
		}

		writeFileSync(`${process.cwd()}/release/${this.yamlFilename}.yaml`, newYamlContent, 'utf-8');
	}

	/**
	 * Send the updated Kubernetes YAML config file to the server.
	 */
	private scp() {
		console.info('\u001b[34m4. Update server kubernetes file...\u001b[0m');
		const filePath = `${process.cwd()}/release/${this.yamlFilename}.yaml`;

		exec(`scp -P 91 ${filePath} ${this.serverName}:.kube-yaml/`, {
			stdio: 'inherit',
		});
		console.info('\x1b[36m%s\x1b[0m', `Kubernetes YAML Config sent to ${this.serverName}`);
	}

	/**
	 * Push the modifications (YAML file and package.json) to Git and add a tag version to this commit.
	 */
	private git(release: 'prod' | 'beta') {
		const { version: packageVersion } = JSON.parse(readFileSync(`${process.cwd()}/package.json`, 'utf-8'));

		console.info(`\u001b[34m2. Commit package${release === 'prod' ? ' and create git tag' : ''}\u001b[0m`);

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
	}
}