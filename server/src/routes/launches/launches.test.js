const request = require("supertest");
const app = require("../../app");
const { mongoConnect } = require("../../services/mongo");

describe("Launches API", () => {
	beforeAll(async () => {
		await mongoConnect();
	});

	describe("Test GET /launches", () => {
		test("It should respond with 200 success", async () => {
			const response = await request(app)
				.get("/v1/launches")
				.expect("Content-Type", /json/)
				.expect(200);
		});
	});

	describe("Test POST /launch", () => {
		const completeLaunchData = {
			mission: "Test Enterprise",
			rocket: "Test to save Node API",
			target: "Kepler-1410 b",
			launchDate: "December 5, 2028",
		};

		const launchDataWithoutDate = {
			mission: "Test Enterprise",
			rocket: "Test to save Node API",
			target: "Kepler-1410 b",
		};

		const launchDataWithInvalidDate = {
			mission: "Test Enterprise",
			rocket: "Test to save Node API",
			target: "Kepler-1410 b",
			launchDate: "hello",
		};

		test("It should respond with 201 created", async () => {
			const response = await request(app)
				.post("/v1/launches")
				.send(completeLaunchData)
				.expect("Content-Type", /json/)
				.expect(201);

			const requestDate = new Date(completeLaunchData.launchDate).valueOf();
			const reponseDate = new Date(response.body.launchDate).valueOf();
			expect(reponseDate).toBe(requestDate);

			expect(response.body).toMatchObject(launchDataWithoutDate);
		});
		test("It should catch missing required properties", async () => {
			const response = await request(app)
				.post("/v1/launches")
				.send(launchDataWithoutDate)
				.expect("Content-Type", /json/)
				.expect(400);

			expect(response.body).toStrictEqual({
				error: "Missing required launch property",
			});
		});
		test("It should catch invalid dates", async () => {
			const response = await request(app)
				.post("/v1/launches")
				.send(launchDataWithInvalidDate)
				.expect("Content-Type", /json/)
				.expect(400);

			expect(response.body).toStrictEqual({
				error: "Launch Date is not valid",
			});
		});
	});
});
