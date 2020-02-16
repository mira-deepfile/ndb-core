import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotesComponent } from './notes.component';
import { ChildrenService } from '../../children/children.service';
import { UiHelperModule } from '../../../core/ui-helper/ui-helper.module';
import { ActivatedRoute } from '@angular/router';
import { Child } from '../../children/model/child';
import { SessionService } from '../../../core/session/session.service';
import { User } from '../../../core/user/user';
import { EntityMapperService } from '../../../core/entity/entity-mapper.service';
import { MockDatabase } from '../../../core/database/mock-database';
import { DatePipe } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { Database } from '../../../core/database/database';
import { EntitySchemaService } from '../../../core/entity/schema/entity-schema.service';
import { AlertService } from 'app/core/alerts/alert.service';

describe('NotesComponent', () => {
  let component: NotesComponent;
  let fixture: ComponentFixture<NotesComponent>;

  const mockChildrenService = {
    getChild: (id) => {
      return of([new Child('22')]);
    },
    getNotesOfChild: (id) => {
      return of([]);
    },
  };
  let testUser;


  beforeEach(async(() => {
    testUser = new User('tester');
    testUser.name = 'tester';

    TestBed.configureTestingModule({
      declarations: [ NotesComponent ],
      imports: [UiHelperModule, NoopAnimationsModule],
      providers: [
        DatePipe,
        { provide: ActivatedRoute, useValue: {paramMap: of({get: () => '22'}) } },
        { provide: ChildrenService, useValue: mockChildrenService },
        EntityMapperService,
        EntitySchemaService,
        { provide: Database, useClass: MockDatabase },
        { provide: SessionService, useValue: { getCurrentUser() { return testUser; }} },
        AlertService,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});