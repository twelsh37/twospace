// frontend/app/api/assets/route.supertest.test.ts
// SuperTest-based tests for the /api/assets API route

/**
 * @jest-environment node
 */

// Mock the database layer to prevent real DB queries
jest.mock("@/lib/db", () => ({
  db: {
    select: jest.fn(),
    from: jest.fn(),
    where: jest.fn(),
    limit: jest.fn(),
    offset: jest.fn(),
    insert: jest.fn(),
    values: jest.fn(),
    returning: jest.fn(),
    update: jest.fn(),
    set: jest.fn(),
    leftJoin: jest.fn(),
    orderBy: jest.fn(),
  },
  assetsTable: {},
  locationsTable: {},
}));

import request from "supertest";
import app from "./route.supertest";

// Do NOT import db at the top; use require in each test to get the mocked version

describe("/api/assets API route (SuperTest)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /api/assets should return a response (structure only)", async () => {
    const db = require("@/lib/db").db;
    // Mock the chain for GET
    db.select.mockReturnThis();
    db.from.mockReturnThis();
    db.where.mockReturnThis();
    db.leftJoin.mockReturnThis();
    db.orderBy.mockReturnThis();
    db.limit.mockReturnThis();
    db.offset.mockResolvedValueOnce([
      {
        asset: {
          id: 1,
          assetNumber: "ASSET-001",
          type: "laptop",
          state: "active",
          locationId: "mock-location-id",
          serialNumber: "SN123",
          description: "A test laptop",
          purchasePrice: 1000,
          deletedAt: null,
          status: "active",
        },
        location: { name: "HQ" },
      },
    ]);
    db.select.mockResolvedValueOnce([{ count: 1 }]); // For total count
    const res = await request(app).get("/api/assets");
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.body).toHaveProperty("success");
    expect(Array.isArray(res.body.data.assets)).toBe(true);
    expect(res.body.data.assets[0].assetNumber).toBe("ASSET-001");
    expect(res.body.data.assets[0].location).toBe("HQ");
  });

  it("POST /api/assets should return a response (structure only)", async () => {
    const db = require("@/lib/db").db;
    // Chainable mock for location validation: select().from().where().limit() returns a promise resolving to an array
    db.select.mockImplementation(() => ({
      from: () => ({
        where: () => ({
          limit: () =>
            Promise.resolve([{ id: "mock-location-id", name: "HQ" }]),
        }),
      }),
    }));
    // Chainable mock for asset creation: insert().values().returning()
    const returningMock = jest.fn().mockResolvedValueOnce([
      {
        asset: {
          id: 1,
          assetNumber: "ASSET-001",
          type: "laptop",
          state: "active",
          locationId: "mock-location-id",
          serialNumber: "SN123",
          description: "A test laptop",
          purchasePrice: 1000,
          deletedAt: null,
          status: "active",
        },
        location: { name: "HQ" },
      },
    ]);
    const valuesMock = jest.fn(() => ({ returning: returningMock }));
    db.insert.mockImplementation(() => ({ values: valuesMock }));
    const res = await request(app).post("/api/assets").send({
      type: "laptop",
      state: "active",
      locationId: "mock-location-id",
      serialNumber: "SN123",
      description: "A test laptop",
      purchasePrice: 1000,
    });
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.body).toHaveProperty("success");
    expect(res.body.data.assetNumber).toBe("ASSET-001");
    expect(res.body.data.location).toBe("HQ");
  });

  it("PUT /api/assets should return a response (structure only)", async () => {
    const db = require("@/lib/db").db;
    // Chainable mock for location validation: select().from().where().limit() returns a promise resolving to an array
    db.select.mockImplementation(() => ({
      from: () => ({
        where: () => ({
          limit: () =>
            Promise.resolve([{ id: "mock-location-id", name: "HQ" }]),
        }),
      }),
    }));
    // Chainable mock for asset update: update().set().where().returning()
    const returningMock = jest.fn().mockResolvedValueOnce([
      {
        asset: {
          id: 1,
          assetNumber: "ASSET-001",
          state: "inactive",
          deletedAt: null,
          status: "inactive",
        },
        location: { name: "HQ" },
      },
    ]);
    const whereMock = jest.fn(() => ({ returning: returningMock }));
    const setMock = jest.fn(() => ({ where: whereMock }));
    db.update.mockImplementation(() => ({ set: setMock }));
    const res = await request(app).put("/api/assets").send({
      id: "mock-asset-id",
      state: "inactive",
    });
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.body).toHaveProperty("success");
    expect(res.body.data.state).toBe("inactive");
    expect(res.body.data.location).toBe("HQ");
  });

  afterAll(() => {
    // If you start any servers or open DB connections, close them here
    // (Not needed for SuperTest with in-memory Express app)
  });
});
