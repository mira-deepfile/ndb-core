import { TestBed } from "@angular/core/testing";

import { AttendanceService } from "./attendance.service";
import { EntityMapperService } from "../../core/entity/entity-mapper.service";
import { EntitySchemaService } from "../../core/entity/schema/entity-schema.service";
import { Database } from "../../core/database/database";
import { MockDatabase } from "../../core/database/mock-database";
import { Note } from "../notes/model/note";
import { RecurringActivity } from "./model/recurring-activity";
import moment from "moment";

describe("AttendanceService", () => {
  let service: AttendanceService;

  let mockDatabase: MockDatabase;
  function addEventToDatabase(date: Date, activityIdWithPrefix: string) {
    const event = Note.create(date, "generated event");
    event.relatesTo = activityIdWithPrefix;
    mockDatabase.put(event);
  }

  beforeEach(() => {
    mockDatabase = MockDatabase.createWithData([]);

    TestBed.configureTestingModule({
      providers: [
        AttendanceService,
        EntityMapperService,
        EntitySchemaService,
        { provide: Database, useValue: mockDatabase },
      ],
    });
    service = TestBed.inject(AttendanceService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("creates a ActivityAttendance for each month when there is an event", async () => {
    const activity = RecurringActivity.create("activity 1");
    addEventToDatabase(new Date("2020-01-01"), activity._id);
    addEventToDatabase(new Date("2020-01-30"), activity._id);
    addEventToDatabase(new Date("2020-02-02"), activity._id);
    addEventToDatabase(new Date("2020-03-02"), "another id");

    const actualAttendences = await service.getActivityAttendances(activity);

    expect(actualAttendences.length).toBe(2);
    expect(
      moment(actualAttendences[0].periodFrom).isSame(
        moment("2020-01-01"),
        "day"
      )
    ).toBeTrue();
    expect(
      moment(actualAttendences[1].periodFrom).isSame(
        moment("2020-02-01"),
        "day"
      )
    ).toBeTrue();
  });
});