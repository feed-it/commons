interface Model {
	[key: string]: any;
}

type BasicObject = {
	[key: string]: any;
};

export const misspelled = {
	/* MAIN FUNCTION */ check(json: BasicObject[], model: Model) {
		//* ------------------------------------------------------------------------------------------
		//*
		//* Purpose : Detect the "mouflades" for props compared to a given sql model
		//* Input : json (can be an array of objects)
		//* Output : {input(jsonInput) : {}, correction(corrected json) : {}, missingFromSqlModel(missingProps):[] }
		//*
		//* ------------------------------------------------------------------------------------------

		const jsonCopy = [structuredClone(json[0])];
		const finalCorrection = [];
		const doubtKeys = [];

		//* 1. Correction à faible tolérance
		const resultLow = this.makeComparison(jsonCopy, model, 1.5);
		//* 2. Correction à haute tolérance
		const resultHigh = this.makeComparison(jsonCopy, model, 3);

		//* 3. Extraction des clés nouvellement apparues à forte tolérance

		for (const prop in resultHigh.correctedJsonOutput) {
			if (!Object.keys(resultLow.correctedJsonOutput).includes(prop)) {
				doubtKeys.push(prop);
			}
		}

		//*4. pour chacune de ces clefs, extraire sa distance avec le model
		for (const key of doubtKeys) {
			for (const lowToleranceWrongProp of Object.keys(resultLow.wrongProps)) {
				const distance = misspelled.levenshteinDistance(key, lowToleranceWrongProp);

				if (distance <= 5) {
					resultLow.correctedJsonOutput[key] = json[0][lowToleranceWrongProp];
				}
			}
		}

		finalCorrection.push(resultLow.correctedJsonOutput);

		const missingFromSqlModel = this.extractMissingPropsFromSqlModel(finalCorrection, model);
		return { input: json[0], correction: finalCorrection[0], missingFromSqlModel };
	},
	extractMissingPropsFromSqlModel(correctedJson: BasicObject[], model: Model) {
		const modelKeys = Object.keys(model);
		const correctedJsonKeys = Object.keys(correctedJson[0]);
		const missingFromSqlModel = [];

		for (const key of modelKeys) {
			if (!correctedJsonKeys.includes(key)) {
				missingFromSqlModel.push(key);
			}
		}
		return missingFromSqlModel;
	},
	makeComparison(json: BasicObject[], model: Model, tolerance: number) {
		//* 0.compare json input first elt with given sql Model
		const output = this.compareInputWithSqlModel(json, model, tolerance);

		//* 1. return corrected json 1st elt + wrong props found
		const { outputToReturn, wrongProps } = this.makeCorrectedOutputOnly(output, model);

		return { correctedJsonOutput: outputToReturn, wrongProps };
	},
	compareInputWithSqlModel(json: BasicObject[], model: Model, tolerance: number) {
		let columnsModel = Object.keys(model);
		const firstElt = json[0];

		for (let key in firstElt) {
			let stopResearchHere = false;

			//* 0. Look for exact match -----------------------------------------------------------
			if (columnsModel.includes(key)) {
				columnsModel = columnsModel.filter((col) => col !== key);
				continue;
			}

			//* 1. Fuzzy match with Levenshtein Algo (fuse uses it) ---------------------------------
			let bestMatch = null;
			let bestScore = Infinity;

			for (const col of columnsModel) {
				// avoid matching with 2 very similar columns like 'site' and 'siteId'
				if (col in firstElt) continue;

				const score = this.levenshteinDistance(key.toLowerCase(), col.toLowerCase());

				if (score < bestScore) {
					bestScore = score;
					bestMatch = col;
				}
			}

			const maxToleratedDistance = tolerance; // 0 is minimal tolerance, 5 is max
			if (bestMatch && bestScore <= maxToleratedDistance) {
				for (const jsonElt of json) {
					jsonElt[bestMatch] = jsonElt[key];
					delete jsonElt[key];
				}

				columnsModel = columnsModel.filter((col) => col !== bestMatch);
				stopResearchHere = true;
			}

			if (!stopResearchHere) {
				columnsModel = columnsModel.filter((col) => col !== key);
			}
		}

		return json;
	},
	makeCorrectedOutputOnly(output: BasicObject[], model: Model) {
		let outputToReturn: BasicObject = {};
		let columnsModel = Object.keys(model);
		let wrongProps: BasicObject = {};

		for (const elt of output.slice(0, 1)) {
			for (const prop in elt) {
				if (columnsModel.includes(prop)) {
					outputToReturn[prop] = elt[prop];
				} else {
					wrongProps[prop] = elt[prop];
				}
			}
		}

		return { outputToReturn, wrongProps };
	},
	levenshteinDistance(a: string, b: string) {
		const matrix = Array.from({ length: b.length + 1 }, () => Array(a.length + 1).fill(0));

		for (let i = 0; i <= b.length; i++) matrix[i][0] = i;
		for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

		for (let i = 1; i <= b.length; i++) {
			for (let j = 1; j <= a.length; j++) {
				const cost = b[i - 1] === a[j - 1] ? 0 : 1;
				matrix[i][j] = Math.min(
					matrix[i - 1][j] + 1, // suppression
					matrix[i][j - 1] + 1, // insertion
					matrix[i - 1][j - 1] + cost // substitution
				);
			}
		}
		return matrix[b.length][a.length];
	},
};
