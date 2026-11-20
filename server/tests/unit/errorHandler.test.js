const errorHandler = require("../../src/middleware/errorHandler");
const AppError = require("../../src/utils/AppError");

// A tiny stand-in for Express's response object that records what was sent.
function fakeRes() {
  const res = { statusCode: undefined, payload: undefined };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.payload = body;
    return res;
  };
  return res;
}

describe("errorHandler", () => {
  let consoleError;
  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => consoleError.mockRestore());

  it("sends the status, message and field errors of an AppError", () => {
    const res = fakeRes();
    errorHandler(new AppError(409, "Already exists", { email: "taken" }), {}, res, () => {});
    expect(res.statusCode).toBe(409);
    expect(res.payload).toEqual({ message: "Already exists", errors: { email: "taken" } });
  });

  it("omits the errors field when there are none", () => {
    const res = fakeRes();
    errorHandler(new AppError(404, "Lead not found"), {}, res, () => {});
    expect(res.payload).toEqual({ message: "Lead not found" });
  });

  it("turns a CastError (bad ObjectId) into a 400", () => {
    const res = fakeRes();
    const error = Object.assign(new Error("Cast to ObjectId failed"), { name: "CastError" });
    errorHandler(error, {}, res, () => {});
    expect(res.statusCode).toBe(400);
    expect(res.payload).toEqual({ message: "Invalid id" });
  });

  it("hides the details of an unexpected error behind a generic 500", () => {
    const res = fakeRes();
    errorHandler(new Error("connection to db-host-42 failed, password=hunter2"), {}, res, () => {});

    expect(res.statusCode).toBe(500);
    expect(res.payload).toEqual({ message: "Something went wrong on our side" });
    expect(JSON.stringify(res.payload)).not.toContain("hunter2");
    // ...but the real error is still logged for the developers.
    expect(consoleError).toHaveBeenCalled();
  });
});
