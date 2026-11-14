import { beforeEach, describe, expect, it, vi } from "vitest";
import { asRole, jsonRequest, prismaMock } from "./mocks";
import { GET as listReports, POST as createReport } from "@/app/api/reports/route";
import {
  GET as getReport,
  PATCH as patchReport,
} from "@/app/api/reports/[reportId]/route";
import { GET as getImage } from "@/app/api/reports/[reportId]/image/route";

const params = (reportId: string) => ({ params: Promise.resolve({ reportId }) });
const VALID_ID = "a1b2c3d4e5f60718";

beforeEach(() => vi.clearAllMocks());

describe("POST /api/reports", () => {
  const body = {
    type: "NON_EMERGENCY",
    category: "Theft",
    title: "Bike stolen",
    description: "Lock was cut outside the library.",
    reportId: "attacker-chosen",
    status: "RESOLVED",
  };

  it("creates a report with a server-generated ID and default status", async () => {
    prismaMock.report.create.mockImplementation(async ({ data }) => ({
      reportId: data.reportId,
      status: "PENDING",
      createdAt: new Date(),
    }));

    const response = await createReport(jsonRequest("/api/reports", "POST", body));
    expect(response.status).toBe(201);

    const { data } = prismaMock.report.create.mock.calls[0][0];
    expect(data.reportId).toMatch(/^[a-f0-9]{16}$/);
    expect(data.reportId).not.toBe("attacker-chosen");
    expect(data).not.toHaveProperty("status");
    expect(data.reportType).toBe("Theft");
    expect((await response.json()).reportId).toBe(data.reportId);
  });

  it("returns 422 with field errors for invalid input", async () => {
    const response = await createReport(
      jsonRequest("/api/reports", "POST", { ...body, title: "" }),
    );
    expect(response.status).toBe(422);
    expect((await response.json()).fields.title).toBeDefined();
    expect(prismaMock.report.create).not.toHaveBeenCalled();
  });

  it("returns 500 without leaking internals when the database fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    prismaMock.report.create.mockRejectedValue(
      new Error("connection refused at 10.0.0.5"),
    );
    const response = await createReport(jsonRequest("/api/reports", "POST", body));
    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain("10.0.0.5");
  });
});

describe("GET /api/reports (moderator list)", () => {
  it("requires a session", async () => {
    asRole(null);
    expect((await listReports(jsonRequest("/api/reports", "GET"))).status).toBe(401);
  });

  it("rejects non-staff users", async () => {
    asRole("USER");
    expect((await listReports(jsonRequest("/api/reports", "GET"))).status).toBe(403);
  });

  it("returns reports, image flags and status counts for staff", async () => {
    asRole("MODERATOR");
    prismaMock.report.findMany
      .mockResolvedValueOnce([{ id: "r1", reportId: VALID_ID, status: "PENDING" }])
      .mockResolvedValueOnce([{ id: "r1" }]);
    prismaMock.report.groupBy.mockResolvedValue([
      { status: "PENDING", _count: { _all: 1 } },
    ]);

    const response = await listReports(jsonRequest("/api/reports?status=PENDING", "GET"));
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.reports[0].hasImage).toBe(true);
    expect(json.counts).toEqual({
      PENDING: 1,
      IN_PROGRESS: 0,
      RESOLVED: 0,
      DISMISSED: 0,
    });
    expect(prismaMock.report.findMany.mock.calls[0][0].where).toEqual({
      status: "PENDING",
    });
    expect(prismaMock.report.findMany.mock.calls[0][0].select.image).toBeUndefined();
  });

  it("rejects invalid filters", async () => {
    asRole("ADMIN");
    expect(
      (await listReports(jsonRequest("/api/reports?status=HACKED", "GET"))).status,
    ).toBe(400);
  });
});

describe("GET /api/reports/:reportId (public tracking)", () => {
  it("validates the ID format", async () => {
    expect(
      (await getReport(jsonRequest("/api/reports/x", "GET"), params("x"))).status,
    ).toBe(400);
  });

  it("returns 404 when the report does not exist", async () => {
    prismaMock.report.findUnique.mockResolvedValue(null);
    expect((await getReport(jsonRequest("/", "GET"), params(VALID_ID))).status).toBe(404);
  });

  it("never selects the photo or coordinates", async () => {
    prismaMock.report.findUnique.mockResolvedValue({
      reportId: VALID_ID,
      status: "PENDING",
    });
    const response = await getReport(
      jsonRequest("/", "GET"),
      params(VALID_ID.toUpperCase()),
    );
    expect(response.status).toBe(200);
    const query = prismaMock.report.findUnique.mock.calls[0][0];
    expect(query.where).toEqual({ reportId: VALID_ID });
    expect(query.select.image).toBeUndefined();
    expect(query.select.latitude).toBeUndefined();
  });
});

describe("PATCH /api/reports/:reportId", () => {
  const request = () => jsonRequest("/", "PATCH", { status: "RESOLVED" });

  it("rejects anonymous and non-staff callers", async () => {
    asRole(null);
    expect((await patchReport(request(), params(VALID_ID))).status).toBe(401);
    asRole("USER");
    expect((await patchReport(request(), params(VALID_ID))).status).toBe(403);
    expect(prismaMock.report.update).not.toHaveBeenCalled();
  });

  it("updates the status for moderators", async () => {
    asRole("MODERATOR");
    prismaMock.report.update.mockResolvedValue({
      reportId: VALID_ID,
      status: "RESOLVED",
    });
    const response = await patchReport(request(), params(VALID_ID));
    expect(response.status).toBe(200);
    expect(prismaMock.report.update.mock.calls[0][0]).toMatchObject({
      where: { reportId: VALID_ID },
      data: { status: "RESOLVED" },
    });
  });

  it("rejects unknown statuses", async () => {
    asRole("ADMIN");
    const response = await patchReport(
      jsonRequest("/", "PATCH", { status: "GONE" }),
      params(VALID_ID),
    );
    expect(response.status).toBe(422);
  });
});

describe("GET /api/reports/:reportId/image", () => {
  it("is staff only", async () => {
    asRole(null);
    expect((await getImage(jsonRequest("/", "GET"), params(VALID_ID))).status).toBe(401);
  });

  it("serves the decoded image with its mime type", async () => {
    asRole("ADMIN");
    prismaMock.report.findUnique.mockResolvedValue({
      image: "data:image/png;base64,QUJD",
    });
    const response = await getImage(jsonRequest("/", "GET"), params(VALID_ID));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(await response.text()).toBe("ABC");
  });
});
