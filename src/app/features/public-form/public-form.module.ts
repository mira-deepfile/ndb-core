import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterService } from "../../core/config/dynamic-routing/router.service";
import { ViewConfig } from "../../core/config/dynamic-routing/view-config.interface";
import { EntityDetailsConfig } from "../../core/entity-details/EntityDetailsConfig";
import { EntityListConfig } from "../../core/entity-list/EntityListConfig";
import { AdminOverviewService } from "../../core/admin/admin-overview/admin-overview.service";
import { PublicFormConfig } from "./public-form-config";

/**
 * Manage template files with placeholders that can be used to render files for export of entities.
 */
@NgModule({
  declarations: [],
  imports: [CommonModule],
})
export class PubliFormModule {
  static databaseEntities = [PublicFormConfig];

  constructor(
    routerService: RouterService,
    adminOverviewService: AdminOverviewService,
  ) {
    routerService.addRoutes(viewConfigs);
    adminOverviewService.menuItems.push({
      label: $localize`:admin menu item:Manage Public forms`,
      link: PublicFormConfig.route,
    });
  }
}

const viewConfigs: ViewConfig[] = [
  // List View
  {
    _id: "view:" + PublicFormConfig.route,
    component: "EntityList",
    config: {
      entityType: PublicFormConfig.ENTITY_TYPE,
      columns: ["title", "description", "entity", "columns"],
      filters: [{ id: "entity" }],
    } as EntityListConfig,
  },

  // Details View
  {
    _id: "view:" + PublicFormConfig.route + "/:id",
    component: "EntityDetails",
    config: {
      entityType: PublicFormConfig.ENTITY_TYPE,
      panels: [
        {
          components: [
            {
              component: "Form",
              config: {
                fieldGroups: [
                  {
                    fields: ["title", "description", "entity", "columns"],
                  },
                ],
              },
            },
          ],
        },
      ],
    } as EntityDetailsConfig,
  },
];