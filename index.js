// Require the IOTA libraries
const Iota = require('@iota/core');
const Converter = require('@iota/converter');

// Create a new instance of the IOTA object
// Use the `provider` field to specify which IRI node to connect to
const iota = Iota.composeAPI({
provider: 'https://nodes.thetangle.org:443'
});

// TODO: retrieve it from Google Cloud Keyring or other cloud based secure elements
const seed =
'PFWMBZJNSKGOSP9WEVNEUWHWLZHBPAWC9JLKXKGHODYM9URCYKIUORUVLSPWWQDBUXTSHSUEACATJRFXS';
// TODO: configure and retrievde it from an address repèository
const recipientAddress = "BDFVOEUKDARRHWGG9OZVUHHIZTBKZFIHTEC9WXONZGJIFUDMMKFYYATJMV9O9XDGZJFXYYYPSQLEVHHVD9SCRLDVLW";

exports.sendMessage = (req, res) => {
	console.log('Body:  ' + JSON.stringify(req.body));

	var propertyCounter = req.body.values.length;
	req.body.values.map((t, i, a) => {
		// Select all the properties with a name starting with IOTA_
		if (t.name.substring(0, 5) === "IOTA_") {
			// Prepare transactions
			var paylaod = {
				thing_id: req.body.thing_id,
				property_id: t.id,
				value: t.value,
				timestamp: t.updated_at
			};
			var stringPayload = JSON.stringify(paylaod);
			console.log('Payload:  ' + stringPayload);
			var transfer = {
				'address': recipientAddress,
				'value': 0,
				'message': Converter.asciiToTrytes(stringPayload),
				'tag': 'SENDABUNDLEOFTRANSACTIONS'
				};
				// Create bundle and return the trytes of the prepared transactions
			iota.prepareTransfers(seed, [transfer])
			.then(function(trytes){
				// Finalize and broadcast the bundle to the IRI node
				return iota.sendTrytes(trytes, 3 /*depth*/, 14 /*minimum weight magnitude*/);
			})
			.then((results) =>  {
				console.log(JSON.stringify(results, ['hash', 'currentIndex', 'lastIndex', 'bundle', 'trunkTransaction', 'branchTransaction'], 1));
				propertyCounter--;
				if (propertyCounter == 0)
					res.send("OK");
			});
		} else {
			propertyCounter--;
		}
	});
};
