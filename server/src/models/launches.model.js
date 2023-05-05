const launchesData = require("./launches.mongo");
const planets = require("./planets.mongo");
const axios = require('axios');

const DEFAULT_FLIGHT_NUMBER = 100;

const launch = {
	flightNumber: 100, //flight_number
	mission: "Kepler Exploration X",//name
	rocket: "Explore IS1", // rocket.name
	launchDate: new Date("December 27, 2030"),//date_local
	target: "Kepler-442 b",// not applicable
	customers: ["ZTM", "NASA"], // payload.customers for each payload
	upcoming: true,// upcoming
	success: true,// success
};

saveLaunch(launch);

const SPACEX_API_URL = 'https://api.spacexdata.com/v5/launches/query';

async function loadLaunchesData() {
	console.log('Downloading launch data...');
	const response = await axios.post(SPACEX_API_URL, {
		query: {},
		options: {
			populate: [
				{ path: "rocket", select: { name: 1 } },
				{ path: "payloads", select: { customers: 1 } },
			]
		}
	});


}

async function existLaunchWithId(launchId) {
	return await launchesData.findOne({ flightNumber: launchId });
}

async function getLatestFlightNumber() {
	const latestLaunch = await launchesData.findOne({}).sort("-flightNumber");

	if (!latestLaunch) {
		return DEFAULT_FLIGHT_NUMBER;
	}

	return latestLaunch.flightNumber;
}

async function getAllLaunches() {
	return await launchesData.find({}, { __v: 0, _id: 0 });
}

async function saveLaunch(launch) {
	const planet = await planets.findOne({ keplerName: launch.target });

	if (!planet) {
		throw new Error("No matching planet found !");
	}

	await launchesData.findOneAndUpdate(
		{ flightNumber: launch.flightNumber },
		launch,
		{
			upsert: true,
		}
	);
}
async function scheduleNewLaunch(launch) {
	const newFlightNumber = (await getLatestFlightNumber()) + 1;
	const newLaunch = Object.assign(launch, {
		flightNumber: newFlightNumber,
		customers: ["ZTM", "NASA"],
		upcoming: true,
		success: true,
	});

	await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
	const aborted = await launchesData.updateOne(
		{ flightNumber: launchId },
		{ upcoming: false, success: false }
	);
	console.log(aborted);
	return aborted.modifiedCount === 1;
}

module.exports = {
	loadLaunchesData,
	existLaunchWithId,
	getAllLaunches,
	scheduleNewLaunch,
	abortLaunchById,
};
