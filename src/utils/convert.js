const { letters } = require("./letters.js");

function georgian(sentence) {
	const GeorgianLetters = letters.Georgian;

	function LatinToGeorgian(sentence) {
		sentence = sentence.toLowerCase();
		let convertedSentence = "";
		for (let i = 0; i < sentence.length; i++) {
			let letter = sentence[i];

			switch (true) {
				case letter + sentence[i + 1] + sentence[i + 2] in GeorgianLetters:
					convertedSentence += GeorgianLetters[letter + sentence[i + 1] + sentence[i + 2]];
					break;
				case letter + sentence[i + 1] in GeorgianLetters:
					convertedSentence += GeorgianLetters[letter + sentence[i + 1]];
					break;
				case letter in GeorgianLetters:
					convertedSentence += GeorgianLetters[letter];
			}
		}
		return convertedSentence;
	}

	function SeperateStrings(sentence) {
		sentence = sentence.toLowerCase();
		const words = sentence.split(" ");
		const convertedWords = words.map(word => LatinToGeorgian(word));

		let NewConverted = [];
		convertedWords.forEach(word => {
			console.log(word);
			const newWord = word.split(" ").join("");
			NewConverted.push(newWord);
		});
		
		return NewConverted.join(" ");
	}
	return SeperateStrings(sentence);
}

function japanese(sentence) {
	const JapaneseLetters = letters.Japanese;

	sentence = sentence.toLowerCase();
	let convertedSentence = "";
	for (let i = 0; i < sentence.length; i++) {
		let letter = sentence[i];

		switch (true) {
			case letter + sentence[i + 1] + sentence[i + 2] in JapaneseLetters:
				convertedSentence += JapaneseLetters[letter + sentence[i + 1] + sentence[i + 2]];
				break;
			case letter + sentence[i + 1] in JapaneseLetters:
				convertedSentence += JapaneseLetters[letter + sentence[i + 1]];
				break;
			case letter in JapaneseLetters:
				convertedSentence += JapaneseLetters[letter];
		}
	}
	return convertedSentence;
}

module.exports = { convert: { georgian, japanese } };