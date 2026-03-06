import { checkbox, select } from '@inquirer/prompts';
import { Chalk } from 'chalk';
import yaml from 'js-yaml';
import { execSync as exec } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { exit } from 'node:process';

const chalk = new Chalk({
	level: 1,
});

export type MonorepoReleaseParams = {
	/**
	 * The SSH server alias name where the Kubernetes YAML file will be sent.
	 */
	serverName: string;
	/**
	 * The folder inside .kube-yaml in the server
	 */
	yamlFolder:
		| 'core-backend'
		| 'core-frontend'
		| 'veez-backend'
		| 'veez-frontend';
};

export class MonorepoRelease {
	private readonly serverName: string = '';
	private readonly yamlFolder: string = '';
	private readonly projects: string[] = [];

	constructor(params: MonorepoReleaseParams) {
		this.serverName = params.serverName;
		this.yamlFolder = params.yamlFolder;

		// List available projects
		this.projects = readdirSync(`${process.cwd()}/apps/`, 'utf-8');
	}

	/**
	 * Test parameters provided in constructor call
	 */
	private beforeStart() {
		console.info(
			chalk.blue.bold('1. Testing given parameters before releasing app')
		);

		// Test serverName
		console.info(chalk.blue('1.a. Testing ssh connexion...'));
		try {
			exec(`ssh -T ${this.serverName}`);
			console.info(chalk.green('Server is up!\n'));
		} catch (error) {
			console.error(
				chalk.red(`Failed to connect to ${this.serverName}`),
				error
			);
			exit(1);
		}
	}

	async start() {
		this.beforeStart();

		try {
			let releases: ('beta' | 'prod')[] = ['prod'];

			releases = await checkbox({
				message: 'Which type of release you want to do?',
				choices: [
					{ name: 'Beta', value: 'beta', checked: false },
					{ name: 'Production', value: 'prod', checked: false },
				],
				required: true,
			});

			if (releases.length === 0) {
				console.error(
					chalk.red('You need to select a type of release')
				);
				return;
			}

			const appsToDeploy = await checkbox({
				message: 'Which app you want to deploy ?',
				choices: this.projects.map((x) => ({
					name: x,
					value: x,
					checked: false,
				})),
				required: true,
			});

			if (appsToDeploy.length === 0) {
				console.error(chalk.red('You need to select an app to deploy'));
				return;
			}

			let typeVersion: string | undefined;
			if (releases.includes('prod')) {
				typeVersion = await select({
					message:
						'For the prod version, which level of version you want to apply?',
					choices: [
						{ name: 'Patch', value: 'patch' },
						{ name: 'Minor', value: 'minor' },
					],
					default: 'patch',
				});
			}

			for (const app of appsToDeploy) {
				if (releases.includes('prod')) {
					this.release(app, 'prod', typeVersion);
				}

				if (releases.includes('beta')) {
					this.release(app, 'beta');
				}
				console.info(chalk.green.bold(`${app} successfully updated !`));
			}
		} catch (error: any) {
			if (error.constructor.name === 'ExitPromptError') return;
			console.error(error);
			exit(1);
		}

		console.info('Make sure to update main/develop/beta now !');
	}

	/**
	 * Make a release, either for the prod or the beta
	 */
	private release(
		app: string,
		release: 'prod' | 'beta',
		typeVersion?: string
	) {
		console.info(
			chalk.blue.bold(
				`\n${app.toUpperCase()}: releasing ${release} ${typeVersion ? `on ${typeVersion}` : ''}\n`
			)
		);

		// Update the package version if the release is for production
		if (release === 'prod') {
			console.info(
				chalk.blue(`${app.toUpperCase()}: 1. Update package version`)
			);
			exec(
				`cd apps/${app} && npm version --no-git-tag-version ${typeVersion} && cd ../../`,
				{
					stdio: 'inherit',
				}
			);
		}

		const digest = this.docker(app, release);
		this.yaml(app, digest, release);
		this.scp(app, release);
		this.git(app, release);
	}

	/**
	 * Build the image, push it to the Docker Hub repository and return the new image digest.
	 */
	private docker(app: string, release: 'prod' | 'beta') {
		console.info(
			chalk.blue.bold(
				`\n${app.toUpperCase()}: 2. Build Docker image and send it to Docker Hub repository`
			)
		);

		//* 1. Build Docker image.
		console.info(chalk.blue(`${app.toUpperCase()}: 2.a Build image`));
		exec(
			`docker buildx create --name attest-builder --driver docker-container --use || docker buildx use attest-builder`,
			{
				stdio: 'inherit',
			}
		);

		exec(
			`docker buildx build --provenance=true --sbom=true --build-arg APP=${app} -t feedit/${app}:${release} .`,
			{
				stdio: 'inherit',
			}
		);

		//* 2. Push Docker image to the Docker Hub repository.
		console.info(chalk.blue`${app.toUpperCase()}: 2.b Push image`);
		exec(`docker push feedit/${app}:${release}`, {
			stdio: 'inherit',
		});

		//* 3. Fetch the new Docker image digest.
		console.info(
			chalk.blue(`${app.toUpperCase()}: 2.c Fetch docker image digest`)
		);
		const digest = exec(
			`docker inspect --format="{{index .RepoDigests}}" feedit/${app}:${release}`,
			{
				encoding: 'utf-8',
			}
		)
			.toString()
			.replace(/(\[|\])/g, '')
			.replace('\n', '')
			.replace(`feedit/${app}@`, '');

		if (!digest) {
			console.error(
				chalk.red(
					`${app.toUpperCase()}: Any Docker image digest found.`
				)
			);
			exit(1);
		}

		console.info(
			chalk.green(
				`${app.toUpperCase()}: Docker image successfully built and sent to Docker Hub repository`
			)
		);
		return digest;
	}

	/**
	 * Update the Kubernetes YAML config file with the new Docker image digest.
	 */
	private yaml(app: string, digest: string, release: 'prod' | 'beta') {
		console.info(
			chalk.blue.bold(
				`\n${app.toUpperCase()}: 3. Updating Kubernetes YAML config file`
			)
		);

		const file = `${app}${release === 'beta' ? '-beta' : ''}.yaml`;

		const yamlContent = readFileSync(
			`${process.cwd()}/release/yamlFiles/${file}`,
			'utf-8'
		);
		const data: any[] = yaml.loadAll(yamlContent);

		let newYamlContent = yamlContent;

		for (let i = 0; i < data.length; i++) {
			if (
				data[i]?.spec?.template?.spec?.containers[0]?.image.includes(
					`feedit/${app}:${release}`
				)
			) {
				const oldImage = data[i].spec.template.spec.containers[0].image;
				const newImage = `feedit/${app}:${release}@${digest}`;

				console.info(
					chalk.red(`${app.toUpperCase()}: Old Docker image: `),
					oldImage
				);
				console.info(
					chalk.green(`${app.toUpperCase()}: New Docker image: `),
					newImage
				);

				newYamlContent = newYamlContent.replace(oldImage, newImage);
				break;
			}
		}

		writeFileSync(
			`${process.cwd()}/release/yamlFiles/${file}`,
			newYamlContent,
			'utf-8'
		);

		console.info(
			chalk.green(
				`${app.toUpperCase()}: Kubernetes YAML config file updated`
			)
		);
	}

	/**
	 * Send the updated Kubernetes YAML config file to the server.
	 */
	private scp(app: string, release: 'prod' | 'beta') {
		console.info(
			chalk.blue.bold(
				`\n${app.toUpperCase()}: 4. Send Kubernetes YAML config file to the server`
			)
		);

		const file = `${app}${release === 'beta' ? '-beta' : ''}.yaml`;
		const filePath = `${process.cwd()}/release/yamlFiles/${file}`;

		exec(
			`scp -P 91 ${filePath} ${this.serverName}:.kube-yaml/${this.yamlFolder}`,
			{
				stdio: 'inherit',
			}
		);

		console.info(
			chalk.green(
				`${app.toUpperCase()}: Kubernetes YAML Config sent to ${this.serverName}`
			)
		);
	}

	/**
	 * Push the modifications (YAML file and package.json) to Git and add a tag version to this commit.
	 */
	private git(app: string, release: 'prod' | 'beta') {
		const { version: packageVersion } = JSON.parse(
			readFileSync(`${process.cwd()}/apps/${app}/package.json`, 'utf-8')
		);

		console.info(
			chalk.blue.bold(`${app.toUpperCase()}: 5. Commit package`)
		);

		// Push new package.json version
		let commitMessage = `release(${app}): ${packageVersion} version`;
		if (release !== 'prod') {
			commitMessage = `release(${app}): update beta version`;
		}

		exec(`git add . && git commit -m "${commitMessage}" && git push`, {
			stdio: 'inherit',
		});

		console.info(chalk.green(`${app.toUpperCase()}: Commit pushed`));
	}
}
