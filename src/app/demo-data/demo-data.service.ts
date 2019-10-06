/*
 *     This file is part of ndb-core.
 *
 *     ndb-core is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     ndb-core is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with ndb-core.  If not, see <http://www.gnu.org/licenses/>.
 */

import {
  ClassProvider, FactoryProvider,
  Injectable,
  Injector, ValueProvider,
} from '@angular/core';
import {DemoDataGenerator} from './demo-data-generator';
import {EntityMapperService} from '../entity/entity-mapper.service';
import {AlertService} from '../alerts/alert.service';
import {AlertDisplay} from '../alerts/alert-display';


export class DemoDataServiceConfig {
  dataGeneratorProviders: (ValueProvider|ClassProvider|FactoryProvider)[] = [];
}

/**
 * The DemoDataService is the manager for all provided DemoDataGenerator implementations.
 * It serves as the central service to trigger the demo data generation into the database.
 * To add more demo data generators, edit the DemoDataModule to add your DemoDataGenerator services.
 */
@Injectable()
export class DemoDataService {
  readonly dataGenerators: DemoDataGenerator<any>[] = [];

  constructor(private entityMapper: EntityMapperService,
              private alertService: AlertService,
              private injector: Injector,
              private config: DemoDataServiceConfig,
  ) {
    this.registerAllProvidedDemoDataGenerators();
  }

  private registerAllProvidedDemoDataGenerators() {
    for (const provider of this.config.dataGeneratorProviders) {
      const service = this.injector.get<any>(provider.provide);
      if (service && service instanceof DemoDataGenerator) {
        this.dataGenerators.push(service);
      }
    }
  }


  /**
   * Add all entities generated by the registered DemoDataProviders to the Database.
   */
  async publishDemoData() {
    // completely generate all data (i.e. call every generator) before starting to save the data
    // to allow generators to delete unwanted entities of other generators before they are saved
    // (e.g. the DropoutChildGenerator should be able to delete Attendance records of the Child after its dropout date)
    this.dataGenerators.forEach(generator => generator.entities);

    // save the generated data
    for (const generator of this.dataGenerators) {
      for (const entity of generator.entities) {
        try {
          await this.entityMapper.save(entity);
        } catch (e) {
          this.alertService.addWarning(e, AlertDisplay.NONE);
        }
      }
    }
  }
}
