const launchesData = require("./launches.mongo");
const planets = require("./planets.mongo");

const launches = new Map();

const DEFAULT_FLIGHT_NUMBER = 100;

const launch = {
  flightNumber: 100,
  mission: "Kepler Exploration X",
  rocket: "Explore IS1",
  launchDate: new Date("December 27, 2030"),
  target: "Kepler-442 b",
  customers: ["ZTM", "NASA"],
  upcoming: true,
  success: true,
};

saveLaunch(launch);
launches.set(launch.flightNumber, launch);

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
  existLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
};
